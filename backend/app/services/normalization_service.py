import os
import cv2
import numpy as np
from pathlib import Path
import sys
import importlib.util
import base64
from skimage import exposure

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
            dict: Dictionary containing paths to the processed image, histogram matching plot, and chart data
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
            # ============= HISTOGRAM EQUALIZATION (SEPARATE WORKFLOW) =============
            if method == "histogram_equalization":
                # Call histogram equalization function (without plot generation)
                result = histogram_equalization(source_img, save_dir=method_dir, generate_plot=False)
                  # Return all 4 processed images for histogram equalization
                result_images = []
                image_names = {
                    'original': 'Original Grayscale',
                    'rescale': 'Contrast Stretching', 
                    'equalize': 'Histogram Equalization',
                    'adaptive_equalize': 'Adaptive Equalization'  # Match the key from histogram_equalization function
                }
                
                for img_key, display_name in image_names.items():
                    if img_key in result['paths']:
                        result_images.append({
                            'name': display_name,
                            'path': result['paths'][img_key],
                            'key': img_key
                        })
                
                # Extract chart data for histogram equalization (4 images)
                chart_data = NormalizationService.extract_histogram_equalization_data(result['images'])
                
                return {
                    'result_images': result_images,  # Multiple images for histogram equalization
                    'chart_data': chart_data
                }
            
            # ============= OTHER METHODS (RGB WORKFLOW) =============
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
                else:
                    raise ValueError(f"Unknown method: {method}")
                
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

                # Extract chart data for RGB methods (3 images)
                chart_data = NormalizationService.extract_rgb_chart_data(source_img, reference_img, result_img)

                return {
                    'result_image': result_path,
                    'chart_data': chart_data
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

    @staticmethod
    def extract_histogram_equalization_data(images):
        """
        Extract histogram data for histogram equalization (grayscale images)
        
        Args:
            images: Dictionary of images generated by histogram_equalization
            
        Returns:
            dict: Dictionary containing histogram and CDF data for all histogram equalization images
        """
        chart_data = {
            "original": {"histograms": [], "cdfs": []},
            "rescale": {"histograms": [], "cdfs": []},
            "equalize": {"histograms": [], "cdfs": []},
            "adaptive_equalize": {"histograms": [], "cdfs": []}
        }
        
        # Use same parameters as matplotlib function
        nbins = 256
        
        # For histogram equalization, we work with grayscale images
        for img_key, img in images.items():
            # Ensure image is float and 2D (grayscale)
            if img.ndim == 3:
                from skimage.color import rgb2gray
                img = rgb2gray(img)
            
            # Get histogram and CDF data
            from skimage import exposure
            img_hist, bins = exposure.histogram(img, nbins=nbins, source_range='dtype')
            img_cdf, cdf_bins = exposure.cumulative_distribution(img, nbins=nbins)
            
            # Normalize histogram 
            normalized_hist = (img_hist / img_hist.max()) if img_hist.max() > 0 else img_hist
            
            # Store histogram data (single channel for grayscale)
            for j in range(len(bins)):
                chart_data[img_key]["histograms"].append({
                    "bin": float(bins[j]),
                    "count": float(img_hist[j]),
                    "normalized_count": float(normalized_hist[j]),
                    "channel": "gray"  # Single grayscale channel
                })
              # Store CDF data
            for j in range(len(cdf_bins)):
                chart_data[img_key]["cdfs"].append({
                    "bin": float(cdf_bins[j]),
                    "cdf": float(img_cdf[j]),
                    "channel": "gray"
                })
        
        return {"images": chart_data}
    
    @staticmethod
    def extract_rgb_chart_data(source_img, reference_img, result_img):
        """
        Extract histogram and scatter plot data for RGB methods (color images)
        
        Args:
            source_img: Original source image (before normalization)
            reference_img: Reference image used for matching  
            result_img: Result image after normalization
            
        Returns:
            dict: Dictionary containing histogram, CDF, and scatter plot data for RGB images
        """
        chart_data = {
            "source": {"histograms": [], "cdfs": [], "scatter_plots": []},
            "reference": {"histograms": [], "cdfs": [], "scatter_plots": []}, 
            "result": {"histograms": [], "cdfs": [], "scatter_plots": []}
        }
        
        # Use same parameters as matplotlib function
        nbins = 256
        images = [source_img, reference_img, result_img]
        image_keys = ["source", "reference", "result"]
        colors = ['red', 'green', 'blue']
        
        for img_idx, (img, img_key) in enumerate(zip(images, image_keys)):
            for c, color in enumerate(colors):
                # Get histogram and bins (same as matplotlib)
                img_hist, bins = exposure.histogram(img[..., c], nbins=nbins, source_range='dtype')
                
                # Get CDF (same as matplotlib)
                img_cdf, cdf_bins = exposure.cumulative_distribution(img[..., c], nbins=nbins)
                
                # Normalize histogram (same as matplotlib: img_hist / img_hist.max())
                normalized_hist = (img_hist / img_hist.max()) if img_hist.max() > 0 else img_hist
                
                # Store histogram data
                for j in range(len(bins)):
                    chart_data[img_key]["histograms"].append({
                        "bin": float(bins[j]),
                        "count": float(img_hist[j]),
                        "normalized_count": float(normalized_hist[j]),
                        "channel": color                    })
                
                # Store CDF data  
                for j in range(len(cdf_bins)):
                    chart_data[img_key]["cdfs"].append({
                        "bin": float(cdf_bins[j]),
                        "cdf": float(img_cdf[j]),
                        "channel": color
                    })
            
            # Generate scatter plot data for this image
            NormalizationService._generate_scatter_plot_data(img, chart_data[img_key])
        
        return {"images": chart_data}
    
    @staticmethod
    def _generate_scatter_plot_data(img, chart_data_entry, sample_size=2000):
        """
        Generate scatter plot data for RGB channels based on the provided Python function
        
        Args:
            img: RGB image array
            chart_data_entry: Dictionary entry to add scatter plot data to
            sample_size: Number of pixels to sample for scatter plot (default 2000)
        """
        import numpy as np
        
        # Ensure the image is RGB
        if len(img.shape) == 2:
            img = np.stack((img,) * 3, axis=-1)
        
        # Extract RGB channels and flatten them
        R = img[:, :, 0].flatten().astype(float)
        G = img[:, :, 1].flatten().astype(float)
        B = img[:, :, 2].flatten().astype(float)
        
        # Sample pixels to avoid overwhelming the frontend with too much data
        total_pixels = len(R)
        if total_pixels > sample_size:
            # Random sampling
            indices = np.random.choice(total_pixels, sample_size, replace=False)
            R = R[indices]
            G = G[indices]
            B = B[indices]
        
        # Center the values for axis positions (assuming 0-255 range)
        R_centered = R - 127.5
        G_centered = G - 127.5
        
        # Determine dominant channel for each pixel
        dominant = np.argmax(np.stack((R, G, B), axis=1), axis=1)
        
        # Convert dominant channel to color strings
        color_map = {0: 'red', 1: 'green', 2: 'blue'}
        colors = [color_map[d] for d in dominant]
        
        # Store scatter plot data
        for i in range(len(R_centered)):
            chart_data_entry["scatter_plots"].append({
                "x": float(R_centered[i]),
                "y": float(G_centered[i]),
                "color": colors[i],
                "channel": colors[i]  # For compatibility
            })