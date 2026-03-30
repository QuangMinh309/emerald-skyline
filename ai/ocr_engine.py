import sys
from importlib.util import find_spec

def check_env():
    print(f"Python version: {sys.version}")
    if find_spec("fastapi") is not None:
        print("FastAPI đã sẵn sàng!")
    else:
        print("Vẫn chưa thấy FastAPI đâu...")

if __name__ == "__main__":
    check_env()