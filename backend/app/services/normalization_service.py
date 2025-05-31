import os
import cv2
import numpy as np
from pathlib import Path
import sys
import importlib.util
import base64
from app.utils.utils import plot_histogram_matching
import matplotlib.pyplot as plt

# Add the src directory to Python path for importing modules
src_path = Path("src").absolute()
if src_path.exists() and src_path not in sys.path:
    sys.path.append(str(src_path))

# Import normalization methods
from app.normalization_methods.histogram_equalization import histogram_equalization
from app.normalization_methods.histogram_matching import Normalizer as HistogramMatchingNormalizer
from app.normalization_methods.reinhard import Normalizer as ReinhardNormalizer
from app.normalization_methods.macenko import Normalizer as MacenkoNormalizer
from app.normalization_methods.vahadane import Normalizer as VahadaneNormalizer


class NormalizationService:
    """Service to handle different image normalization methods"""
    
    @staticmethod
    async def normalize_image(source_path, method, reference_path=None):
        """
        Normalize an image using the specified method and generate histogram matching plots
        
        Args:
            source_path (Path): Path to the source image file
            method (str): Normalization method to use
            reference_path (Path, optional): Path to the reference image if required
            
        Returns:
            dict: Dictionary containing paths to the processed image and histogram matching plot
        """
        # Read source image
        source_img = cv2.imread(str(source_path))
        if source_img is None:
            raise ValueError(f"Could not read source image: {source_path}")
        source_img = cv2.cvtColor(source_img, cv2.COLOR_BGR2RGB)
        
        # Create results directory if it doesn't exist
        results_dir = Path("static/images/results")
        results_dir.mkdir(parents=True, exist_ok=True)
        
        # Create method-specific directory
        method_dir = results_dir / f"{method}_{os.path.basename(source_path).split('.')[0]}"
        method_dir.mkdir(parents=True, exist_ok=True)

        try:
            # Process based on selected method
            if method == "histogram_equalization":
                # For histogram equalization
                result = histogram_equalization(source_img)
                result_img = result['images']['equalize']
                # Use original as reference for plotting
                reference_img = source_img
                
            else:
                # For other methods that require reference image
                if not reference_path:
                    raise ValueError(f"Method '{method}' requires a reference image")
                
                # Read reference image
                reference_img = cv2.imread(str(reference_path))
                if reference_img is None:
                    raise ValueError(f"Could not read reference image: {reference_path}")
                reference_img = cv2.cvtColor(reference_img, cv2.COLOR_BGR2RGB)
                
                # Apply normalization based on method
                if method == "histogram_matching":
                    normalizer = HistogramMatchingNormalizer()
                elif method == "reinhard":
                    normalizer = ReinhardNormalizer()
                elif method == "macenko":
                    normalizer = MacenkoNormalizer()
                elif method == "vahadane":
                    normalizer = VahadaneNormalizer()
                
                normalizer.fit(reference_img)
                result_img = normalizer.transform(source_img)

            # Convert result_img to uint8 before saving
            if result_img.dtype != np.uint8:
                if result_img.max() <= 1.0:
                    result_img = (result_img * 255).astype(np.uint8)
                else:
                    result_img = result_img.astype(np.uint8)

            # Save the normalized result image
            result_path = method_dir / f"{method}_result.png"
            cv2.imwrite(str(result_path), cv2.cvtColor(result_img, cv2.COLOR_RGB2BGR))

            # Generate and save histogram matching plot
            plot_path = method_dir / f"{method}_plot.png"
            plot_histogram_matching(source_img, reference_img, result_img, save_name=str(plot_path))
            plt.close()  # Close the plot to free memory

            return {
                'result_image': result_path,
                'plot': plot_path
            }

        except Exception as e:
            # Clean up the directory if there's an error
            if method_dir.exists():
                import shutil
                shutil.rmtree(method_dir)
            raise e

    @staticmethod
    def get_available_methods():
        """Get information about available normalization methods"""
        return [
            {
                "id": "histogram_equalization",
                "name": "Histogram Equalization",
                "requires_reference": False,
                "description": "Enhances contrast by equalizing the image histogram"
            },
            {
                "id": "histogram_matching",
                "name": "Histogram Matching",
                "requires_reference": True,
                "description": "Matches histogram of source image to reference image"
            },
            {
                "id": "reinhard",
                "name": "Reinhard",
                "requires_reference": True,
                "description": "Color normalization using Reinhard's method"
            },
            {
                "id": "macenko",
                "name": "Macenko",
                "requires_reference": True,
                "description": "Stain normalization using Macenko's method"
            },
            {
                "id": "vahadane",
                "name": "Vahadane",
                "requires_reference": True,
                "description": "Stain normalization using Vahadane's method"
            }
        ]