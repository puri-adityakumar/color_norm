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

class ResultImageInfo(BaseModel):
    """Schema for result image with additional metadata"""
    name: str
    filename: str
    path: str
    url: str
    download_url: str
    key: str

class HistogramData(BaseModel):
    """Schema for histogram data point"""
    bin: float
    count: float
    normalized_count: float
    channel: str

class CDFData(BaseModel):
    """Schema for CDF data point"""
    bin: float
    cdf: float
    channel: str

class ImageChartData(BaseModel):
    """Schema for chart data of a single image"""
    histograms: List[HistogramData]
    cdfs: List[CDFData]

class ChartData(BaseModel):
    """Schema for complete chart data - flexible to handle different method types"""
    # Use Dict to handle both:
    # - Standard methods: source, reference, result
    # - Histogram equalization: original, rescale, equalize, adaptive_equalize
    images: Dict[str, ImageChartData]
    
class NormalizationResponse(BaseModel):
    """Response schema for the normalization endpoint"""
    success: bool
    message: str
    method: str
    source_image: ImageInfo
    result_image: Optional[ImageInfo] = None  # For single result (other methods)
    result_images: Optional[List[ResultImageInfo]] = None  # For multiple results (histogram equalization)
    reference_image: Optional[ImageInfo] = None
    chart_data: Optional[ChartData] = None  # Interactive charts replace static plots
    
class ErrorResponse(BaseModel):
    """Schema for error responses"""
    success: bool = False
    message: str
    error: Optional[str] = None

class MethodInfo(BaseModel):
    id: int
    name: str
    requires_reference: bool
    description: str

class MethodsResponse(BaseModel):
    methods: List[MethodInfo]