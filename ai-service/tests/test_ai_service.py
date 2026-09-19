import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app

client = TestClient(app)

def create_test_image(format="JPEG", size=(250, 250), color=(34, 139, 34)):
    """Creates an in-memory JPEG/PNG image bytes object for testing."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Tomato" in data["supportedCrops"]

def test_supported_crops():
    response = client.get("/supported-crops")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["crops"]) >= 5

def test_predict_valid_jpeg():
    img_bytes = create_test_image(format="JPEG")
    files = {"image": ("leaf.jpg", img_bytes, "image/jpeg")}
    data = {"crop_hint": "Tomato"}
    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200
    result = response.json()
    assert result["crop"] == "Tomato"
    assert "disease" in result
    assert result["confidence"] > 0.0
    assert "severity" in result
    assert "findings" in result

def test_predict_valid_png():
    img_bytes = create_test_image(format="PNG")
    files = {"image": ("leaf.png", img_bytes, "image/png")}
    response = client.post("/predict", files=files)
    assert response.status_code == 200
    result = response.json()
    assert result["confidence"] > 0.0

def test_predict_invalid_file_rejected():
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"
    files = {"image": ("malicious.exe", fake_exe, "application/octet-stream")}
    response = client.post("/predict", files=files)
    assert response.status_code == 415
    data = response.json()
    assert data["success"] is False
    assert "Invalid image format" in data["message"]

def test_predict_empty_file():
    files = {"image": ("empty.jpg", b"", "image/jpeg")}
    response = client.post("/predict", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
