import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code chạy KHI SERVER KHỞI ĐỘNG
    print("\n" + "="*60)
    print(f"🚀  Swagger UI: http://localhost:8000/docs")
    print(f"📚  Redoc     : http://localhost:8000/redoc")
    print("="*60 + "\n")
    yield
    # Code chạy KHI SERVER TẮT (nếu cần dọn dẹp gì đó)
    print("Shutting down...")


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Cấu hình CORS để NestJS gọi được (Quan trọng!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong môi trường dev để * cho tiện, production nên fix IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to Emerald AI Service running on FastAPI"}

if __name__ == "__main__":
    import uvicorn
    HOST = "0.0.0.0"
    PORT = 8000
    print(f"INFO:     Documentation is available at -> http://localhost:{PORT}/docs")
    print(f"INFO:     Redoc is available at         -> http://localhost:{PORT}/redoc")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)