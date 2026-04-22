"""Tests for configuration"""

import pytest
from app.core.config import settings


def test_settings_loaded():
    """Test that settings are loaded"""
    assert settings is not None
    assert hasattr(settings, 'GROQ_API_KEY')
    assert hasattr(settings, 'PORT')


def test_port_setting():
    """Test that port setting exists"""
    assert settings.PORT == 8000 or settings.PORT is not None


def test_groq_api_key_setting():
    """Test that GROQ API key is configured"""
    # API key should be set (from .env)
    assert settings.GROQ_API_KEY is not None
    assert len(settings.GROQ_API_KEY) > 0
