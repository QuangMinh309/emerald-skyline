# Development

## Local Setup

1. Create and activate virtual environment:

   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/macOS
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the service:
   ```bash
   python app/main.py
   ```

## Testing

Access the API documentation at: http://localhost:8000/docs

## Project Structure

- `app/main.py` - FastAPI application entry point
- `app/services/ocr_service.py` - OCR processing logic
- `requirements.txt` - Python dependencies

## Performance Notes

- First OCR request will download PaddleOCR models (~100MB)
- Subsequent requests will be faster as models are cached
- Set `use_angle_cls=True` in PaddleOCR for better accuracy with rotated text

## Future Enhancements

- [ ] Add unit tests
- [ ] Add Docker support
- [ ] Add database integration
- [ ] Add authentication
- [ ] Add rate limiting
- [ ] Add logging system
