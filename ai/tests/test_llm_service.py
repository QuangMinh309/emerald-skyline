"""Tests for LLM service"""

import pytest
import json
from unittest.mock import patch, MagicMock
from app.services.llm_service import summarize_to_json, get_groq_client


def test_get_groq_client():
    """Test Groq client lazy initialization"""
    client = get_groq_client()
    
    assert client is not None
    # Should be a Groq client instance
    assert hasattr(client, 'messages')


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_success(mock_get_client):
    """Test successful summarization with JSON parsing"""
    # Mock Groq client
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    # Mock response
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '''{
        "events": [
            {"title": "Meeting", "description": "Team standup"},
            {"title": "Deadline", "description": "Project submission"}
        ]
    }'''
    mock_client.messages.create.return_value = mock_response
    
    result = summarize_to_json("Some announcement text")
    
    assert isinstance(result, dict)
    assert "events" in result
    assert len(result["events"]) == 2


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_empty_text(mock_get_client):
    """Test summarization with empty text"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    result = summarize_to_json("")
    
    assert isinstance(result, dict)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_invalid_json(mock_get_client):
    """Test summarization when LLM returns invalid JSON"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "Not valid JSON"
    mock_client.messages.create.return_value = mock_response
    
    result = summarize_to_json("Some text")
    
    # Should handle gracefully, return dict with empty events
    assert isinstance(result, dict)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_llm_exception(mock_get_client):
    """Test summarization when LLM raises exception"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    mock_client.messages.create.side_effect = Exception("API error")
    
    result = summarize_to_json("Some text")
    
    # Should handle gracefully
    assert isinstance(result, dict)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_with_long_text(mock_get_client):
    """Test summarization with long text input"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"events": []}'
    mock_client.messages.create.return_value = mock_response
    
    long_text = "announcement text " * 100
    result = summarize_to_json(long_text)
    
    assert isinstance(result, dict)


@patch('app.services.llm_service.get_groq_client')
def test_summarize_to_json_special_chars(mock_get_client):
    """Test summarization with special characters"""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '''{
        "events": [
            {"title": "Họp", "description": "Cuộc họp đội ngũ"}
        ]
    }'''
    mock_client.messages.create.return_value = mock_response
    
    result = summarize_to_json("Thông báo kế hoạch 2024")
    
    assert isinstance(result, dict)
    assert "events" in result
