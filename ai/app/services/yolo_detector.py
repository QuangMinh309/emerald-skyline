# app/services/yolo_detector.py
"""
YOLO-based Region Detection for Vietnamese ID Card (CCCD)
Uses YOLOv8 to detect and locate specific fields on CCCD
"""

import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional
from ultralytics import YOLO
import os

# Class mapping from data.yaml
CCCD_CLASSES = {
    0: "current_place",      # Nơi thường trú
    1: "dob",                # Ngày sinh
    2: "expire_date",        # Ngày hết hạn
    3: "gender",             # Giới tính
    4: "id",                 # Số CCCD
    5: "name",               # Họ tên
    6: "nationality",        # Quốc tịch
    7: "origin_place"        # Quê quán / Nơi sinh
}

REVERSE_CLASS_MAP = {v: k for k, v in CCCD_CLASSES.items()}


class YOLOCCCDDetector:
    """
    Detect and extract regions from CCCD image using YOLOv8
    """
    
    def __init__(self, model_path: str = "best.pt"):
        """
        Initialize YOLO detector with trained model
        
        Args:
            model_path: Path to best.pt file
        """
        self.model_path = model_path
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load YOLO model"""
        try:
            # Check if model exists
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            self.model = YOLO(self.model_path)
            print(f"✅ YOLO model loaded: {self.model_path}")
        except Exception as e:
            print(f"❌ Failed to load YOLO model: {e}")
            raise
    
    def detect_regions(self, image: np.ndarray, conf_threshold: float = 0.5) -> Dict[str, Dict]:
        """
        Detect all regions in CCCD image
        
        Args:
            image: Numpy array of image
            conf_threshold: Confidence threshold for detections
        
        Returns:
            Dict mapping class names to detection info:
            {
                "name": {
                    "bbox": (x1, y1, x2, y2),
                    "confidence": 0.95,
                    "class_id": 5,
                    "region_image": cropped_image_array
                },
                ...
            }
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Run inference
        results = self.model(image, conf=conf_threshold, verbose=False)
        
        detections = {}
        
        # Process results
        for result in results:
            boxes = result.boxes
            
            if boxes is None or len(boxes) == 0:
                print("⚠️ No regions detected in image")
                return detections
            
            # Get image dimensions
            h, w = image.shape[:2]
            
            # First pass: collect all detections
            all_detections = {}  # {class_name: [detection1, detection2, ...]}
            
            # Process each detection
            for box in boxes:
                # Extract box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                
                # Ensure coordinates are within bounds
                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w, x2)
                y2 = min(h, y2)
                
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = CCCD_CLASSES.get(class_id, f"unknown_{class_id}")
                
                # Crop region
                region_image = image[y1:y2, x1:x2].copy()
                
                detection = {
                    "bbox": (x1, y1, x2, y2),
                    "confidence": confidence,
                    "class_id": class_id,
                    "region_image": region_image,
                    "dimensions": (x2 - x1, y2 - y1)
                }
                
                # Store in list
                if class_name not in all_detections:
                    all_detections[class_name] = []
                all_detections[class_name].append(detection)
                
                print(f"✓ Detected: {class_name} (conf: {confidence:.2f})")
        
        # Second pass: merge multiple detections of same field
        detections = self._merge_regions(all_detections, image)
        return detections
    
    def _merge_regions(self, all_detections: Dict[str, list], image: np.ndarray) -> Dict[str, Dict]:
        """
        Merge multiple detections of same field (e.g., multi-line address)
        Adds padding between regions to improve OCR quality
        """
        merged_detections = {}
        h, w = image.shape[:2]
        
        for class_name, detections_list in all_detections.items():
            if len(detections_list) == 1:
                # Single detection
                detection = detections_list[0]
                merged_detections[class_name] = {
                    **detection,
                    "multi_region": False
                }
            else:
                # Multiple detections - merge them
                print(f"⚠️  {class_name}: Merging {len(detections_list)} regions...")
                
                # Sort by Y position (top to bottom)
                sorted_dets = sorted(detections_list, key=lambda d: d["bbox"][1])
                
                # Create merged bounding box with padding
                padding = 10  # Add padding between regions for better OCR
                x1_min = max(0, min(d["bbox"][0] for d in sorted_dets) - padding)
                y1_min = max(0, min(d["bbox"][1] for d in sorted_dets) - padding)
                x2_max = min(w, max(d["bbox"][2] for d in sorted_dets) + padding)
                y2_max = min(h, max(d["bbox"][3] for d in sorted_dets) + padding)
                
                merged_bbox = (x1_min, y1_min, x2_max, y2_max)
                
                # Crop merged region with padding for better spacing
                merged_image = image[y1_min:y2_max, x1_min:x2_max].copy()
                
                # Average confidence
                avg_confidence = sum(d["confidence"] for d in sorted_dets) / len(sorted_dets)
                
                merged_detections[class_name] = {
                    "bbox": merged_bbox,
                    "confidence": avg_confidence,
                    "class_id": sorted_dets[0]["class_id"],
                    "region_image": merged_image,
                    "dimensions": (x2_max - x1_min, y2_max - y1_min),
                    "multi_region": True,
                    "num_regions_merged": len(sorted_dets),
                    "original_bboxes": [d["bbox"] for d in sorted_dets]
                }
        
        return merged_detections
    
    def get_sorted_regions(self, detections: Dict[str, Dict]) -> Dict[str, Dict]:
        """
        Sort detections by position (top-to-bottom, left-to-right)
        Useful for sequential reading
        """
        sorted_detections = {}
        
        # Sort by Y position (top to bottom), then X position (left to right)
        sorted_items = sorted(
            detections.items(),
            key=lambda item: (item[1]["bbox"][1], item[1]["bbox"][0])
        )
        
        for name, data in sorted_items:
            sorted_detections[name] = data
        
        return sorted_detections
    
    def draw_detections(self, image: np.ndarray, detections: Dict[str, Dict], 
                       thickness: int = 2, show_labels: bool = True) -> np.ndarray:
        """
        Draw bounding boxes on image for visualization
        
        Args:
            image: Original image
            detections: Detection results from detect_regions()
            thickness: Line thickness
            show_labels: Whether to show class names
        
        Returns:
            Image with drawn boxes
        """
        img_copy = image.copy()
        
        # Define color map for different classes
        colors = {
            "name": (0, 255, 0),           # Green
            "dob": (255, 0, 0),            # Blue
            "id": (0, 0, 255),             # Red
            "gender": (255, 255, 0),       # Cyan
            "nationality": (255, 0, 255), # Magenta
            "origin_place": (0, 255, 255), # Yellow
            "current_place": (128, 0, 255), # Purple
            "expire_date": (255, 128, 0)    # Orange
        }
        
        for class_name, detection in detections.items():
            x1, y1, x2, y2 = detection["bbox"]
            color = colors.get(class_name, (255, 255, 255))
            
            # Draw rectangle
            cv2.rectangle(img_copy, (x1, y1), (x2, y2), color, thickness)
            
            # Draw label
            if show_labels:
                conf = detection["confidence"]
                label = f"{class_name} ({conf:.2f})"
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.5
                thickness_text = 1
                
                # Background for text
                text_size = cv2.getTextSize(label, font, font_scale, thickness_text)[0]
                cv2.rectangle(img_copy, 
                            (x1, y1 - text_size[1] - 4),
                            (x1 + text_size[0], y1),
                            color, -1)
                
                # Draw text
                cv2.putText(img_copy, label, (x1, y1 - 2),
                          font, font_scale, (0, 0, 0), thickness_text)
        
        return img_copy
    
    def validate_detections(self, detections: Dict[str, Dict]) -> Dict[str, any]:
        """
        Validate if all critical CCCD fields are detected
        
        Returns:
            {
                "is_valid": bool,
                "missing_fields": List[str],
                "low_confidence_fields": List[str],
                "warning_messages": List[str]
            }
        """
        critical_fields = ["name", "dob", "id", "gender", "nationality"]
        optional_fields = ["origin_place", "current_place", "expire_date"]
        
        detected_fields = set(detections.keys())
        missing_fields = [f for f in critical_fields if f not in detected_fields]
        low_confidence = [
            name for name, data in detections.items()
            if data["confidence"] < 0.6
        ]
        
        warnings = []
        
        if missing_fields:
            warnings.append(f"Missing critical fields: {missing_fields}")
        
        if low_confidence:
            warnings.append(f"Low confidence detections: {low_confidence}")
        
        is_valid = len(missing_fields) == 0
        
        return {
            "is_valid": is_valid,
            "missing_fields": missing_fields,
            "low_confidence_fields": low_confidence,
            "warning_messages": warnings,
            "detected_count": len(detected_fields),
            "critical_count": len([f for f in critical_fields if f in detected_fields])
        }


# Global detector instance (singleton)
_detector_instance = None


def get_cccd_detector(model_path: str = "best.pt") -> YOLOCCCDDetector:
    """
    Get or create global YOLO detector instance
    
    Args:
        model_path: Path to best.pt model file
    
    Returns:
        YOLOCCCDDetector instance
    """
    global _detector_instance
    
    if _detector_instance is None:
        _detector_instance = YOLOCCCDDetector(model_path)
    
    return _detector_instance
