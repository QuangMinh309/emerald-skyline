from fastapi import APIRouter
from app.api.v1.endpoints import summarize
from app.api.v1.endpoints import ocr
from app.api.v1.endpoints import cccd

api_router = APIRouter()
api_router.include_router(summarize.router, prefix="/ai", tags=["AI Summarization"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR Engine"])
api_router.include_router(cccd.router, prefix="/ocr", tags=["CCCD Recognition"])