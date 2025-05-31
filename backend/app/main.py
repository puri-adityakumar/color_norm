from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.services.cleanup_service import cleanup_service

# This will create dir if does not exist
os.makedirs("static/images/uploads", exist_ok=True)
os.makedirs("static/images/results", exist_ok=True)

# initialize FastApi app
app = FastAPI(
    title="Color Norm",
        description="API for normalizing colors in images using various methods",
    version="1.0.0"
)

# Startup event - start automatic cleanup
@app.on_event("startup")
async def startup_event():
    cleanup_service.start_automatic_cleanup()

# Shutdown event - stop automatic cleanup
@app.on_event("shutdown")
async def shutdown_event():
    cleanup_service.stop_automatic_cleanup()
  
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Import and include API routers
from app.api.routes.normalization import router as normalization_router
app.include_router(normalization_router)

@app.get("/")
async def root():
    return {
        "message": "Color Normalization API is running",
        "docs": "/docs",
        "methods_endpoint": "/api/normalization/methods",
        "cleanup": "Automatic cleanup runs every 12 hours"
    }      