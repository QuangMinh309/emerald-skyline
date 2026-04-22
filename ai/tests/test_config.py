"""Tests for configuration"""

import pytest
from app.core.config import settings


def test_settings_loaded():
    """Test that settings are loaded"""
    assert settings is not None
    assert hasattr(settings, 'GROQ_API_KEY')
    assert hasattr(settings, 'PROJECT_NAME')


def test_project_name():
    """Test that project name setting exists"""
    assert settings.PROJECT_NAME is not None
    assert settings.PROJECT_NAME == "Emerald AI Service"


def test_groq_api_key_setting():
    """Test that GROQ API key is configured"""
    # API key should be set (from .env in tests)
    assert settings.GROQ_API_KEY is not None
    assert len(settings.GROQ_API_KEY) > 0
