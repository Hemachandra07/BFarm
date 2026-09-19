import io
from PIL import Image, ImageFile
from fastapi import HTTPException, UploadFile, status

# Allow loading of images with non-standard EXIF/truncated buffers from mobile cameras
ImageFile.LOAD_TRUNCATED_IMAGES = True

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Known image magic byte signatures
MAGIC_NUMBERS = {
    b"\xff\xd8\xff": "jpeg",
    b"\x89PNG\r\n\x1a\n": "png",
}

def validate_image_file(file: UploadFile, contents: bytes) -> Image.Image:
    """
    Validates uploaded file against security constraints:
    - Non-empty
    - Size <= 5MB
    - Valid image magic number (prevents renamed executables / scripts)
    - Valid readable PIL image
    """
    if not contents or len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 5 MB ({len(contents)} bytes received)."
        )

    # Magic byte check
    is_valid_magic = False
    for signature in MAGIC_NUMBERS:
        if contents.startswith(signature):
            is_valid_magic = True
            break
    
    if not is_valid_magic:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Invalid image format. Only JPEG and PNG images are supported."
        )

    try:
        image = Image.open(io.BytesIO(contents))
        image.load()  # Force load pixel data safely with LOAD_TRUNCATED_IMAGES=True
        if image.mode != "RGB":
            image = image.convert("RGB")
        return image
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to process image data: {str(exc)}"
        )

def transform_image_tensor(image: Image.Image):
    """
    Converts PIL image to standard PyTorch format if PyTorch/torchvision are installed.
    Resize 224x224, normalize with ImageNet parameters.
    """
    try:
        from torchvision import transforms
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], 
                std=[0.229, 0.224, 0.225]
            )
        ])
        return preprocess(image).unsqueeze(0)
    except ImportError:
        return None
