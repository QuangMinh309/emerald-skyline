# app/services/cccd_service.py
"""
CCCD OCR Service - Advanced Pipeline
Phase 1: YOLO region detection
Phase 2: Region-specific OCR
Phase 3: LLM parsing & validation
"""

import json
import re
from typing import Optional, Dict, Any
from paddleocr import PaddleOCR
from groq import Groq
from app.core.config import settings
from app.services.yolo_detector import get_cccd_detector, CCCD_CLASSES
import numpy as np

# Initialize OCR model (singleton)
ocr_model = PaddleOCR(use_angle_cls=True, lang='en')
groq_client = Groq(api_key=settings.GROQ_API_KEY)


def decode_image(file_bytes: bytes):
    """
    Convert bytes from file upload to numpy array for processing
    """
    import cv2
    
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def extract_text_from_region(region_image: np.ndarray, field_type: str = "general") -> str:
    """
    Extract text from a specific region using PaddleOCR
    Preserves Vietnamese diacritics and proper spacing
    
    Args:
        region_image: Cropped image of the region
        field_type: Type of field (name, date, id, etc.) for context-aware OCR
    
    Returns:
        Extracted text with Vietnamese diacritics preserved
    """
    try:
        import unicodedata
        
        # OCR the region
        result = ocr_model.ocr(region_image, cls=True)
        
        if not result or result[0] is None:
            return ""
        
        # For address fields (address spans multiple lines), preserve line structure
        text_lines = []
        for line in result[0]:
            text = line[1][0].strip()
            if text:
                text_lines.append(text)
        
        # Join text appropriately:
        # - For address fields: keep line breaks or use space
        # - For other fields: use single space
        if field_type in ['origin_place', 'current_place']:
            # Address fields: join with space to reconstruct complete address
            extracted_text = " ".join(text_lines)
        else:
            # Other fields: join with single space
            extracted_text = " ".join(text_lines)
        
        # CRITICAL: Normalize to NFC to preserve Vietnamese diacritics
        # This ensures combining marks are properly composed
        extracted_text = unicodedata.normalize('NFC', extracted_text)
        
        # Additional diacritics verification - ensure no simplification
        # Python unicodedata should handle this, but be explicit
        if field_type in ['name', 'origin_place', 'current_place']:
            # These fields require diacritics - verify they're present
            if extracted_text and any(c in extracted_text for c in 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ'):
                # Good - diacritics preserved
                pass
        
        return extracted_text
    
    except Exception as e:
        print(f"Error in OCR region extraction ({field_type}): {e}")
        return ""


def extract_cccd_regions_with_yolo(image_array: np.ndarray) -> Dict[str, Dict]:
    """
    Phase 1: Use YOLO to detect and extract regions from CCCD
    
    Args:
        image_array: Input image
    
    Returns:
        Dictionary mapping field names to region data with OCR results
        {
            "name": {
                "raw_text": "NGÔ MINH TRÍ",
                "bbox": (x1, y1, x2, y2),
                "confidence": 0.95,
                "region_image": ...
            },
            ...
        }
    """
    print("[CCCD Phase 1] Detecting regions with YOLO...")
    
    try:
        detector = get_cccd_detector("best.pt")
        detections = detector.detect_regions(image_array, conf_threshold=0.5)
        
        # Validate detections
        validation = detector.validate_detections(detections)
        print(f"[CCCD Phase 1] Validation: {validation}")
        
        # Extract text from each detected region
        extracted_regions = {}
        
        for field_name, detection in detections.items():
            region_image = detection["region_image"]
            raw_text = extract_text_from_region(region_image, field_type=field_name)
            
            extracted_regions[field_name] = {
                "raw_text": raw_text,
                "bbox": detection["bbox"],
                "yolo_confidence": detection["confidence"],
                "region_image": region_image
            }
            
            print(f"  ✓ {field_name}: '{raw_text}' (YOLO conf: {detection['confidence']:.2f})")
        
        return {
            "success": len(extracted_regions) > 0,
            "regions": extracted_regions,
            "validation": validation
        }
    
    except Exception as e:
        print(f"Error in YOLO detection: {e}")
        return {
            "success": False,
            "regions": {},
            "validation": {"is_valid": False, "error": str(e)}
        }


def extract_raw_text_from_cccd(image_array) -> str:
    """
    Phase 1: Use PaddleOCR to extract all raw text from CCCD image
    Returns the concatenated text with line breaks preserved
    """
    try:
        result = ocr_model.ocr(image_array, cls=True)
        
        if not result or result[0] is None:
            return ""

        # Collect all detected text with position info
        text_blocks = []
        for line in result[0]:
            box = line[0]           # Coordinates [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            text = line[1][0]       # Text content
            conf = line[1][1]       # Confidence score
            
            # Store with Y-position for ordering (top to bottom)
            text_blocks.append({
                "text": text.strip(),
                "conf": conf,
                "y_pos": box[0][1]
            })
        
        # Sort by vertical position (top to bottom)
        text_blocks.sort(key=lambda x: x['y_pos'])
        
        # Concatenate text preserving order
        raw_text = "\n".join([block['text'] for block in text_blocks if block['text']])
        
        return raw_text

    except Exception as e:
        print(f"Error in PaddleOCR extraction: {e}")
        return ""


def parse_cccd_with_llm(regions_data: Dict[str, Dict]) -> Dict[str, Any]:
    """
    Phase 2-3: Use Groq LLM to parse extracted region texts into structured CCCD fields
    
    Args:
        regions_data: Output from extract_cccd_regions_with_yolo()
            Contains OCR results from YOLO-detected regions
    
    Returns:
        Parsed CCCD data with validation
    """
    
    print("[CCCD Phase 2-3] Parsing regions with LLM...")
    
    if not regions_data or not regions_data.get("regions"):
        return {
            "success": False,
            "error": "No regions to parse",
            "data": None
        }
    
    # Build context from detected regions with field names
    region_context = ""
    region_mapping = {
        'name': 'Họ tên (Full Name)',
        'dob': 'Ngày sinh (Date of Birth)',
        'gender': 'Giới tính (Gender)',
        'nationality': 'Quốc tịch (Nationality)',
        'id': 'Số CCCD (ID Number)',
        'origin_place': 'Quê quán / Nơi sinh (Native Place)',
        'current_place': 'Nơi thường trú (Place of Residence)',
        'expire_date': 'Ngày hết hạn (Expiration Date)'
    }
    
    for field_name, data in sorted(regions_data.get("regions", {}).items()):
        field_label = region_mapping.get(field_name, field_name)
        raw_text = data['raw_text']
        
        # Mark if this is a merged region (from multiple YOLO detections)
        merge_info = ""
        if data.get('yolo_confidence', 0) < 0.7:
            merge_info = " [LOW_CONFIDENCE]"
        
        region_context += f"{field_label}: {raw_text}{merge_info}\n"
    
    system_prompt = """
You are an expert Vietnamese ID Card (CCCD) data extraction expert.

You receive OCR text extracted from YOLO-detected regions of a CCCD.
Your task is to parse and structure this information into standardized fields.

CRITICAL: Some regions are MERGED from multiple detections (marked with [MERGED])
This is normal and expected for address fields that span multiple lines.
Always RECONSTRUCT the COMPLETE ADDRESS by combining all detected text.

IMPORTANT FIELD MAPPING (from YOLO detection - these are the ONLY fields to extract):
- name: Họ tên (Full Name in UPPERCASE)
- dob: Ngày sinh → date_of_birth (DD/MM/YYYY format)
- gender: Giới tính → gender (Nam or Nữ)
- nationality: Quốc tịch → nationality (Usually Việt Nam)
- id: Số CCCD → id_number (12 or 9 continuous digits, no spaces/hyphens)
- origin_place: Quê quán → native_place (Complete province-level address)
- current_place: Nơi thường trú → place_of_residence (Full complete street address)
- expire_date: Ngày hết hạn → date_expiration (DD/MM/YYYY format)

CRITICAL PARSING RULES:
1. NAME: Preserve spaces and Vietnamese diacritics EXACTLY
   Example: "NGÔMINH TRÍ" → "NGÔ MINH TRÍ"
   
2. ID: Must be 12 or 9 continuous digits (remove ALL non-digit characters)

3. DATES: Must be DD/MM/YYYY format exactly
   Example: "31/07/2005"

4. GENDER: Only "Nam" or "Nữ"

5. ADDRESSES (MOST CRITICAL):
   - native_place and current_place MUST be COMPLETE with all details
   - For MERGED regions: Combine text from all detected regions into one complete address
   - DO NOT TRUNCATE or shorten addresses
   - Include street number, street name, ward, district, city/province
   - Normalize spacing: separate components with ", " (comma + space)
   - PRESERVE all Vietnamese diacritics (á, à, ả, ã, ạ, ă, â, ê, ô, ơ, ư, etc.)
   
   EXAMPLES:
   - "78/1, ấp Thạnh Hòa A, TT. Thạnh Phú, Thạnh Phú, Bến Tre"
   - "Phú Khánh, Thạnh Phú, Bến Tre"
   - "135/25/8A Phạm Đ.Giảng, Bình Hưng Hòa, Bình Tân, TP. HCM"
   
   DO NOT return:
   - "78/1, Ấp Thanh" (INCOMPLETE - missing Hòa A, TT. Thạnh Phú, Thạnh Phú, Bến Tre)
   - "Phú Khánh, Thanh Phú, Bến Tre" (WRONG DIACRITICS - should be "Thạnh" not "Thanh")

DIACRITICS PRESERVATION:
- Vietnamese uses combining marks and special characters: á, à, ả, ã, ạ, ă, â, ê, ô, ơ, ư, đ
- NEVER remove or simplify diacritics
- If OCR shows "Thanh" but context suggests address, check for "Thạnh"
- Preserve Ấp, TT., TP., all special abbreviations exactly

CONFIDENCE SCORING RULES:
- 1.0 = perfect OCR, completely certain
- 0.9+ = very good OCR, minor uncertainty
- 0.8-0.9 = decent OCR, some errors but clear meaning
- 0.7-0.8 = moderate OCR quality, multiple interpretations
- < 0.7 = poor OCR, unreliable
- For merged regions: Average confidence of all regions involved

RESPONSE FORMAT (STRICT JSON ONLY):
{
    "name": "NGÔ MINH TRÍ",
    "id_number": "083205005215",
    "date_of_birth": "31/07/2005",
    "date_expiration": "31/07/2030",
    "gender": "Nam",
    "nationality": "Việt Nam",
    "native_place": "Phú Khánh, Thạnh Phú, Bến Tre",
    "place_of_residence": "78/1, Ấp Thạnh Hòa A, TT. Thạnh Phú, Thạnh Phú, Bến Tre",
    "field_confidence": {
        "name": 0.95,
        "id_number": 0.99,
        "date_of_birth": 0.98,
        "date_expiration": 0.95,
        "gender": 0.99,
        "nationality": 0.99,
        "native_place": 0.90,
        "place_of_residence": 0.90
    },
    "overall_confidence": 0.94,
    "notes": "Any issues or clarifications"
}

VALIDATION CHECKLIST:
□ All field names match the required 8 fields exactly
□ Name has proper spacing (not concatenated)
□ ID has exactly 9 or 12 digits
□ Dates are DD/MM/YYYY format
□ Addresses are COMPLETE (not truncated)
□ All Vietnamese diacritics preserved
□ No markdown or explanations outside JSON

IMPORTANT NOTES:
- Only extract the 8 fields listed above (no extra fields)
- If a field cannot be read with confidence >= 0.6, set confidence to that value
- Always return valid JSON only. No markdown or explanations outside JSON.
- For merged regions: DO NOT discard parts, include ALL detected text
- For address fields: If text seems incomplete, it's likely because OCR missed it - be thorough
- Preserve Vietnamese diacritical marks in ALL fields without exception
    """

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"YOLO Detected Regions (OCR results):\n\n{region_context}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw_content = chat_completion.choices[0].message.content
        parsed_data = json.loads(raw_content)
        
        # Post-process the data
        parsed_data = post_process_cccd_data(parsed_data)
        
        return {
            "success": True,
            "data": parsed_data,
            "error": None
        }
    
    except json.JSONDecodeError as e:
        print(f"Error: LLM response is not valid JSON: {e}")
        return {
            "success": False,
            "error": f"Failed to parse LLM response: {str(e)}",
            "data": None
        }
    except Exception as e:
        print(f"Error in LLM parsing: {e}")
        return {
            "success": False,
            "error": f"System error during parsing: {str(e)}",
            "data": None
        }


def extract_cccd_info(image_array) -> Dict[str, Any]:
    """
    Main function: Complete CCCD extraction pipeline with YOLO
    
    Phase 1: YOLO detects regions (name, dob, id, etc.)
    Phase 2: Region-specific OCR extracts text from each region
    Phase 3: Groq LLM parses extracted texts into structured CCCD data
    
    Returns:
    {
        "success": bool,
        "data": {
            "name": str,
            "id_number": str,
            "date_of_birth": str,
            "date_issued": Optional[str],
            "date_expiration": str,
            "gender": str,
            "nationality": str,
            "place_of_birth": Optional[str],
            "native_place": str,
            "place_of_residence": str,
            "overall_confidence": float,
            "field_confidence": dict,
            "notes": Optional[str]
        },
        "detection_info": {...},  # YOLO detection validation info
        "error": Optional[str]
    }
    """
    
    print("\n" + "="*60)
    print("🆔  CCCD EXTRACTION PIPELINE (YOLO + OCR + LLM)")
    print("="*60)
    
    # Phase 1: YOLO Region Detection
    print("\n[Phase 1/3] YOLO Region Detection...")
    yolo_result = extract_cccd_regions_with_yolo(image_array)
    
    if not yolo_result["success"]:
        return {
            "success": False,
            "data": None,
            "detection_info": yolo_result.get("validation", {}),
            "error": "YOLO detection failed - cannot detect CCCD regions"
        }
    
    # Phase 2-3: LLM Parsing
    print("\n[Phase 2-3/3] LLM Parsing & Validation...")
    llm_result = parse_cccd_with_llm(yolo_result)
    
    if not llm_result["success"]:
        return {
            "success": False,
            "data": None,
            "detection_info": yolo_result.get("validation", {}),
            "error": llm_result["error"]
        }
    
    print("\n" + "="*60)
    print("✅  CCCD EXTRACTION COMPLETED SUCCESSFULLY")
    print("="*60 + "\n")
    
    return {
        "success": True,
        "data": llm_result["data"],
        "detection_info": yolo_result.get("validation", {}),
        "error": None
    }


def ensure_complete_field_confidence(field_confidence: Dict[str, float]) -> Dict[str, float]:
    """
    Ensure all required confidence fields are present
    Fill missing fields with default values
    """
    required_fields = {
        'name': 0.8,
        'id_number': 0.8,
        'date_of_birth': 0.8,
        'date_expiration': 0.8,
        'gender': 0.8,
        'nationality': 0.8,
        'native_place': 0.8,
        'place_of_residence': 0.8
    }
    
    # Ensure all required fields exist
    for field, default in required_fields.items():
        if field not in field_confidence:
            field_confidence[field] = default
    
    return field_confidence


def post_process_cccd_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Post-process LLM output to ensure data quality
    - Validate formats
    - Normalize spacing
    - Fix common OCR errors
    - Ensure all field_confidence fields are present
    - Validate address completeness
    """
    
    if not data:
        return data
    
    # Ensure field_confidence is present and complete
    if 'field_confidence' not in data:
        data['field_confidence'] = {}
    
    data['field_confidence'] = ensure_complete_field_confidence(data['field_confidence'])
    
    # Clean up name - ensure proper spacing and diacritics
    if 'name' in data and data['name']:
        # Remove extra spaces but preserve diacritics
        data['name'] = re.sub(r'\s+', ' ', data['name']).strip()
    
    # Clean up ID - remove non-digits
    if 'id_number' in data and data['id_number']:
        data['id_number'] = re.sub(r'\D', '', str(data['id_number']))
        if len(data['id_number']) not in [9, 12]:
            data['field_confidence']['id_number'] = min(0.6, data['field_confidence'].get('id_number', 0.8))
    
    # Normalize addresses - keep full details and validate completeness
    for addr_field in ['native_place', 'place_of_residence']:
        if addr_field in data and data[addr_field]:
            # Normalize spacing around punctuation but preserve full content
            addr = data[addr_field]
            addr = re.sub(r'\s*,\s*', ', ', addr)  # Fix comma spacing
            addr = re.sub(r'\s+', ' ', addr)       # Remove extra spaces
            addr = addr.strip()
            
            # Check for address completeness (basic validation)
            # Vietnamese addresses typically have 3+ components
            components = [c.strip() for c in addr.split(',') if c.strip()]
            if len(components) < 2:  # Less than 2 components means likely incomplete
                # Mark as lower confidence
                if addr_field in data.get('field_confidence', {}):
                    current_conf = data['field_confidence'].get(addr_field, 0.8)
                    if isinstance(current_conf, (int, float)):
                        data['field_confidence'][addr_field] = min(0.65, current_conf)
            
            data[addr_field] = addr
    
    # Validate dates format
    date_fields = ['date_of_birth', 'date_expiration']
    for field in date_fields:
        if field in data and data[field]:
            if not re.match(r'^\d{2}/\d{2}/\d{4}$', str(data[field])):
                if field in data.get('field_confidence', {}):
                    data['field_confidence'][field] = min(0.5, data['field_confidence'][field]) if data['field_confidence'][field] else 0.5
    
    # Ensure overall_confidence exists
    if 'overall_confidence' not in data:
        if 'field_confidence' in data:
            confidences = [v for v in data['field_confidence'].values() if v is not None and isinstance(v, (int, float))]
            if confidences:
                data['overall_confidence'] = sum(confidences) / len(confidences)
            else:
                data['overall_confidence'] = 0.8
        else:
            data['overall_confidence'] = 0.8
    else:
        # Recalculate overall confidence from all fields
        if 'field_confidence' in data:
            confidences = [v for v in data['field_confidence'].values() if v is not None and isinstance(v, (int, float))]
            if confidences:
                data['overall_confidence'] = sum(confidences) / len(confidences)
    
    return data
