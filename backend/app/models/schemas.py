from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class NormalizationMethod(BaseModel):
    """Schema for a normalization method"""
    id: str
    name: str
    requires_reference: bool
    description: Optional[str] = None

class MethodsResponse(BaseModel):
    """Response schema for the methods endpoint"""
    methods: List[NormalizationMethod]
    
class NormalizationRequest(BaseModel):
    """Request schema for normalization - not directly used since we're using form data"""
    method: str
    
class ImageInfo(BaseModel):
    filename: str
    path: str
    url: str
    download_url: str
    
class NormalizationResponse(BaseModel):
    """Response schema for the normalization endpoint"""
    success: bool
    message: str
    method: str
    source_image: ImageInfo
    result_image: ImageInfo
    reference_image: Optional[ImageInfo] = None
    plot: ImageInfo
    
class ErrorResponse(BaseModel):
    """Schema for error responses"""
    success: bool = False
    message: str
    error: Optional[str] = None
    
class CleanupResponse(BaseModel):
    """Response schema for the cleanup endpoint"""
    success: bool
    message: str
    files_removed: int

class MethodInfo(BaseModel):
    id: int
    name: str
    requires_reference: bool
    description: str

class MethodsResponse(BaseModel):
    methods: List[MethodInfo]