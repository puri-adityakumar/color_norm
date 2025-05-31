# app/api/routes/normalization.py
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Query, Body
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional, Union
import os
import shutil
from pathlib import Path

from app.services.normalization_service import NormalizationService
from app.models.schemas import (
    MethodsResponse, 
    NormalizationResponse,
    ErrorResponse,
    CleanupResponse
)

# Create router
router = APIRouter(
    prefix="/api/normalization",
    tags=["normalization"]
)

# Define paths for uploads and results
UPLOAD_DIR = Path("static/images/uploads")
RESULT_DIR = Path("static/images/results")

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
RESULT_DIR.mkdir(exist_ok=True, parents=True)

@router.get("/methods", response_model=MethodsResponse)
async def get_methods():
    """Get available normalization methods"""
    methods = [
        {
            "id": 1,
            "name": "Histogram Equalization",
            "requires_reference": False,
            "description": "Enhances contrast by equalizing the image histogram"
        },
        {
            "id": 2,
            "name": "Histogram Matching",
            "requires_reference": True,
            "description": "Matches histogram of source image to reference image"
        },
        {
            "id": 3,
            "name": "Reinhard",
            "requires_reference": True,
            "description": "Color normalization using Reinhard's method"
        },
        {
            "id": 4,
            "name": "Macenko",
            "requires_reference": True,
            "description": "Stain normalization using Macenko's method"
        },
        {
            "id": 5,
            "name": "Vahadane",
            "requires_reference": True,
            "description": "Stain normalization using Vahadane's method"
        }
    ]
    return {"methods": methods}

async def save_upload_file(upload_file: UploadFile) -> Path:
    """Save an uploaded file and return its path"""
    try:
        if not upload_file or not hasattr(upload_file, 'filename'):
            raise ValueError("Invalid file upload")
            
        # Generate a unique filename
        file_extension = os.path.splitext(upload_file.filename)[1].lower()
        if not file_extension:
            file_extension = ".jpg"  # Default extension
            
        # Use a safe filename
        safe_filename = f"{os.path.basename(upload_file.filename).replace(' ', '_')}"
        filename = f"{os.path.splitext(safe_filename)[0]}_{os.urandom(4).hex()}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save the file
        try:
            with open(file_path, "wb") as buffer:
                await upload_file.seek(0)
                content = await upload_file.read()
                buffer.write(content)
        except Exception as e:
            if file_path.exists():
                file_path.unlink()  # Clean up if file was partially written
            raise ValueError(f"Failed to save file: {str(e)}")
            
        return file_path
    except Exception as e:
        raise ValueError(f"Error saving file: {str(e)}")

@router.post("/process", response_model=NormalizationResponse, responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def process_image(
    source_image: UploadFile = File(..., description="Source image to process"),
    method: int = Form(..., description="Normalization method (1-5): 1=Histogram Equalization, 2=Histogram Matching, 3=Reinhard, 4=Macenko, 5=Vahadane"),
    reference_image: Optional[UploadFile] = File(None, description="Reference image (required for methods 2-5, not used for method 1)")
):
    """Process image with selected normalization method"""
    try:
        # Map method number to method name
        method_mapping = {
            1: "histogram_equalization",
            2: "histogram_matching",
            3: "reinhard",
            4: "macenko",
            5: "vahadane"
        }
        
        if method not in method_mapping:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid method number. Please choose from 1-5"
            )
        
        method_name = method_mapping[method]
        
        # Save uploaded files
        source_path = await save_upload_file(source_image)
        reference_path = None
        if reference_image:
            reference_path = await save_upload_file(reference_image)
        
        # Process the image using our service
        result = await NormalizationService.normalize_image(
            source_path, 
            method_name,
            reference_path
        )
        
        # Create response with image information
        response = {
            "success": True,
            "message": f"Image processed with {method_name} method",
            "method": method_name,
            "source_image": {
                "filename": source_image.filename,
                "path": str(source_path),
                "url": f"/{source_path}",
                "download_url": f"/api/normalization/download/{os.path.basename(source_path)}"
            },
            "result_image": {
                "filename": os.path.basename(result['result_image']),
                "path": str(result['result_image']),
                "url": f"/{result['result_image']}",
                "download_url": f"/api/normalization/download/{os.path.basename(result['result_image'])}"
            },
            "plot": {
                "filename": os.path.basename(result['plot']),
                "path": str(result['plot']),
                "url": f"/{result['plot']}",
                "download_url": f"/api/normalization/download/{os.path.basename(result['plot'])}"
            }
        }
        
        # Add reference image info if provided
        if reference_path:
            response["reference_image"] = {
                "filename": reference_image.filename,
                "path": str(reference_path),
                "url": f"/{reference_path}",
                "download_url": f"/api/normalization/download/{os.path.basename(reference_path)}"
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cleanup", response_model=CleanupResponse)
async def cleanup_files():
    """Clean up temporary files and directories (for development/testing)"""
    count = 0
    
    # Function to remove directory and its contents
    def remove_dir_contents(directory: Path):
        count = 0
        if directory.exists():
            # First remove all files and subdirectories
            for item in directory.glob('**/*'):
                if item.is_file():
                    item.unlink()
                    count += 1
                elif item.is_dir():
                    try:
                        shutil.rmtree(item)
                        count += 1  # Count removed directory as one item
                    except Exception as e:
                        print(f"Error removing directory {item}: {e}")
        return count

    try:
        # Clean up uploads directory
        count += remove_dir_contents(UPLOAD_DIR)
        
        # Clean up results directory
        count += remove_dir_contents(RESULT_DIR)
            
        return {
            "success": True,
            "message": "All temporary files and directories deleted",
            "files_removed": count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during cleanup: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download a processed image file"""
    try:
        # Check in results directory first (normalized images)
        result_file_path = RESULT_DIR / filename
        if result_file_path.exists() and result_file_path.is_file():
            return FileResponse(
                path=str(result_file_path),
                filename=filename,
                media_type='application/octet-stream',
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
        # If not found in results, check uploads directory
        upload_file_path = UPLOAD_DIR / filename
        if upload_file_path.exists() and upload_file_path.is_file():
            return FileResponse(
                path=str(upload_file_path),
                filename=filename,
                media_type='application/octet-stream',
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
        # If not found in either directory, check subdirectories in results
        for subdir in RESULT_DIR.iterdir():
            if subdir.is_dir():
                file_path = subdir / filename
                if file_path.exists() and file_path.is_file():
                    return FileResponse(
                        path=str(file_path),
                        filename=filename,
                        media_type='application/octet-stream',
                        headers={"Content-Disposition": f"attachment; filename={filename}"}
                    )
        
        raise HTTPException(status_code=404, detail="File not found")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")