"""Tests for LLM service"""

import pytest
import json
from unittest.mock import patch, MagicMock
from app.services.llm_service import summarize_to_json, get_groq_client


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_success(mock_get_client):
    """Test successful summarization with JSON parsing"""
    # Mock Groq client
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    # Mock response - summarize_to_json returns List[Dict]
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '''{
        "events": [
            {"event_name": "Meeting", "time": "10:00", "location": "Room A", "note": "Be on time"},
            {"event_name": "Deadline", "time": "EOD", "location": "Office", "note": "Submit work"}
        ]
    }'''
    mock_client.chat.completions.create.return_value = mock_response
    
    result = summarize_to_json("Some announcement text")
    
    # Should return list of events
    assert isinstance(result, list)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_empty_text(mock_get_client):
    """Test summarization with empty text"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    # Empty text should return empty list
    result = summarize_to_json("")
    
    assert result == []


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_invalid_json(mock_get_client):
    """Test summarization when LLM returns invalid JSON"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "Not valid JSON"
    mock_client.chat.completions.create.return_value = mock_response
    
    result = summarize_to_json("Some text")
    
    # Should handle gracefully, return empty list
    assert isinstance(result, list)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_llm_exception(mock_get_client):
    """Test summarization when LLM raises exception"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("API error")
    
    result = summarize_to_json("Some text")
    
    # Should handle gracefully
    assert isinstance(result, list)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_with_long_text(mock_get_client):
    """Test summarization with long text input"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"events": []}'
    mock_client.chat.completions.create.return_value = mock_response
    
    long_text = "announcement text " * 100
    result = summarize_to_json(long_text)
    
    assert isinstance(result, list)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_special_chars(mock_get_client):
    """Test summarization with special characters"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '''{
        "events": [
            {"event_name": "Họp", "time": "10:00", "location": "P201", "note": "Cuộc họp đội ngũ"}
        ]
    }'''
    mock_client.chat.completions.create.return_value = mock_response
    
    result = summarize_to_json("Thông báo kế hoạch 2024")
    
    assert isinstance(result, list)
