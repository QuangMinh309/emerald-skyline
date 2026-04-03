import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    PROJECT_NAME = "Emerald AI Service"
    API_V1_STR = "/api/v1"

settings = Settings()