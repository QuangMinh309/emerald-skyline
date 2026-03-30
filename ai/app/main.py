from fastapi import FastAPI

app = FastAPI(title="Emerald Skyline AI Service")

@app.get("/")
def read_root():
    return {
        "message": "Emerald AI Service is Running",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}