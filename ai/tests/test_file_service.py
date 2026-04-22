"""Tests for file service"""

import pytest
import io
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import UploadFile, HTTPException
from app.services.file_service import parse_file_to_text
import numpy as np


@pytest.mark.asyncio
@patch('app.services.file_service.PdfReader')
async def test_parse_file_pdf(mock_pdf_reader):
    """Test parsing PDF file"""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "PDF content here"
    mock_pdf_reader.return_value.pages = [mock_page]
    
    file = UploadFile(
        filename="test.pdf",
        file=io.BytesIO(b"fake pdf content")
    )
    
    result = await parse_file_to_text(file)
    assert "PDF content" in result


@pytest.mark.asyncio
@patch('app.services.file_service.Document')
async def test_parse_file_docx(mock_doc):
    """Test parsing DOCX file"""
    mock_para = MagicMock()
    mock_para.text = "Word document content"
    mock_doc.return_value.paragraphs = [mock_para]
    
    file = UploadFile(
        filename="test.docx",
        file=io.BytesIO(b"fake docx content")
    )
    
    result = await parse_file_to_text(file)
    assert "Word document" in result


@pytest.mark.asyncio
@patch('app.services.file_service.decode_image')
@patch('app.services.file_service.extract_text_from_image')
async def test_parse_file_image(mock_extract_text, mock_decode):
    """Test parsing image file"""
    mock_decode.return_value = np.ones((100, 100, 3), dtype=np.uint8)
    mock_extract_text.return_value = "Image text content"
    
    file = UploadFile(
        filename="test.jpg",
        file=io.BytesIO(b"fake image")
    )
    
    result = await parse_file_to_text(file)
    assert "Image text" in result


@pytest.mark.asyncio
async def test_parse_file_txt():
    """Test parsing text file"""
    text_content = "Plain text file content"
    
    file = UploadFile(
        filename="test.txt",
        file=io.BytesIO(text_content.encode('utf-8'))
    )
    
    result = await parse_file_to_text(file)
    assert "Plain text" in result


@pytest.mark.asyncio
async def test_parse_file_unsupported_format():
    """Test parsing unsupported file format"""
    file = UploadFile(
        filename="test.exe",
        file=io.BytesIO(b"unsupported")
    )
    
    with pytest.raises(HTTPException) as exc_info:
        await parse_file_to_text(file)
    
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
@patch('app.services.file_service.PdfReader')
async def test_parse_file_pdf_error(mock_pdf_reader):
    """Test PDF parsing with error"""
    mock_pdf_reader.side_effect = Exception("PDF corrupt")
    
    file = UploadFile(
        filename="test.pdf",
        file=io.BytesIO(b"corrupt pdf")
    )
    
    result = await parse_file_to_text(file)
    # Should return empty string on error
    assert isinstance(result, str)


@pytest.mark.asyncio
@patch('app.services.file_service.Document')
async def test_parse_file_docx_error(mock_doc):
    """Test DOCX parsing with error"""
    mock_doc.side_effect = Exception("DOCX error")
    
    file = UploadFile(
        filename="test.docx",
        file=io.BytesIO(b"corrupt docx")
    )
    
    result = await parse_file_to_text(file)
    assert isinstance(result, str)


@pytest.mark.asyncio
@patch('app.services.file_service.decode_image')
async def test_parse_file_image_error(mock_decode):
    """Test image parsing with error"""
    mock_decode.side_effect = Exception("Image decode error")
    
    file = UploadFile(
        filename="test.png",
        file=io.BytesIO(b"corrupt image")
    )
    
    result = await parse_file_to_text(file)
    assert isinstance(result, str)
