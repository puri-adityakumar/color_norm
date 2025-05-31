import asyncio
import shutil
import logging
from pathlib import Path
from typing import Optional
import threading
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CleanupService:
    """Service to handle automatic file cleanup"""
    
    def __init__(self):
        self.upload_dir = Path("static/images/uploads")
        self.result_dir = Path("static/images/results")
        self.cleanup_interval = 12 * 60 * 60  # 12 hours in seconds
        self.cleanup_thread: Optional[threading.Thread] = None
        self.stop_cleanup = threading.Event()
    
    def cleanup_files(self) -> dict:
        """Clean up all temporary files and directories"""
        count = 0
        
        def remove_dir_contents(directory: Path):
            count = 0
            if directory.exists():
                # First remove all files and subdirectories
                for item in directory.glob('**/*'):
                    if item.is_file():
                        try:
                            item.unlink()
                            count += 1
                        except Exception as e:
                            logger.warning(f"Could not remove file {item}: {e}")
                    elif item.is_dir():
                        try:
                            shutil.rmtree(item)
                            count += 1  # Count removed directory as one item
                        except Exception as e:
                            logger.warning(f"Could not remove directory {item}: {e}")
            return count

        try:
            # Clean up uploads directory
            count += remove_dir_contents(self.upload_dir)
            
            # Clean up results directory
            count += remove_dir_contents(self.result_dir)
            
            logger.info(f"Cleanup completed: {count} files/directories removed")
            return {
                "success": True,
                "message": "All temporary files and directories deleted",
                "files_removed": count
            }
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
            return {
                "success": False,
                "message": f"Error during cleanup: {str(e)}",
                "files_removed": 0
            }
    
    def start_automatic_cleanup(self):
        """Start the automatic cleanup background task"""
        if self.cleanup_thread and self.cleanup_thread.is_alive():
            logger.warning("Cleanup thread is already running")
            return
        
        # Perform initial cleanup on startup
        logger.info("Performing initial cleanup on server startup...")
        result = self.cleanup_files()
        logger.info(f"Initial cleanup result: {result}")
        
        # Start background thread for periodic cleanup
        self.stop_cleanup.clear()
        self.cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self.cleanup_thread.start()
        logger.info(f"Started automatic cleanup service (every {self.cleanup_interval/3600} hours)")
    
    def stop_automatic_cleanup(self):
        """Stop the automatic cleanup background task"""
        if self.cleanup_thread and self.cleanup_thread.is_alive():
            logger.info("Stopping automatic cleanup service...")
            self.stop_cleanup.set()
            self.cleanup_thread.join(timeout=5)
            logger.info("Automatic cleanup service stopped")
    
    def _cleanup_worker(self):
        """Background worker that performs cleanup every 12 hours"""
        while not self.stop_cleanup.is_set():
            # Wait for 12 hours or until stop signal
            if self.stop_cleanup.wait(timeout=self.cleanup_interval):
                break  # Stop signal received
            
            # Perform cleanup
            logger.info("Performing scheduled cleanup...")
            result = self.cleanup_files()
            logger.info(f"Scheduled cleanup result: {result}")

# Global cleanup service instance
cleanup_service = CleanupService() 