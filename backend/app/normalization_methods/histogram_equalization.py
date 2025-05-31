import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from skimage import exposure, img_as_float
from skimage.color import rgb2gray
import os
from pathlib import Path

# Set font size for plots
matplotlib.rcParams['font.size'] = 8

def plot_img_and_hist(image, axes, bins=256):
    """Plot an image along with its histogram and cumulative histogram."""
    image = img_as_float(image)
    ax_img, ax_hist = axes
    ax_cdf = ax_hist.twinx()

    # Display image
    ax_img.imshow(image, cmap=plt.cm.gray)
    ax_img.set_axis_off()

    # Display histogram
    ax_hist.hist(image.ravel(), bins=bins, histtype='step', color='black')
    ax_hist.ticklabel_format(axis='y', style='scientific', scilimits=(0, 0))
    ax_hist.set_xlabel('Pixel intensity')
    ax_hist.set_xlim(0, 1)
    ax_hist.set_yticks([])

    # Display cumulative distribution
    img_cdf, bins = exposure.cumulative_distribution(image, bins)
    ax_cdf.plot(bins, img_cdf, 'r')
    ax_cdf.set_yticks([])

    return ax_img, ax_hist, ax_cdf

def histogram_equalization(img, save_dir=None, grayscale=True, generate_plot=True):
    """Apply histogram equalization techniques to a single image and optionally plot the results.
    
    Args:
        img: Input image
        save_dir: Directory to save the resulting images (default: None)
        grayscale: Whether to convert color images to grayscale (default: True)
        generate_plot: Whether to generate and save matplotlib plot (default: True)
        
    Returns:
        dict: Dictionary containing processed images and paths
    """
    # Make a copy of the image to avoid modifying the original
    img_processed = img.copy()
    
    # If the image is color (RGB) and grayscale is True, convert it to grayscale
    if grayscale and img_processed.ndim == 3 and img_processed.shape[2] == 3:
        img_processed = rgb2gray(img_processed)
    
    # Convert image to float for processing
    img_processed = img_as_float(img_processed)
    
    # Contrast stretching
    p2, p98 = np.percentile(img_processed, (2, 98))
    img_rescale = exposure.rescale_intensity(img_processed, in_range=(p2, p98))
    
    # Histogram equalization
    img_eq = exposure.equalize_hist(img_processed)
    
    # Adaptive histogram equalization
    img_adapteq = exposure.equalize_adapthist(img_processed, clip_limit=0.03)
    
    result_paths = {}
    
    # Only generate plot if requested
    if generate_plot:
        # Create plot
        fig = plt.figure(figsize=(8, 5))
        axes = np.zeros((2, 4), dtype=object)
        
        axes[0, 0] = fig.add_subplot(2, 4, 1)
        for i in range(1, 4):
            axes[0, i] = fig.add_subplot(2, 4, 1 + i, sharex=axes[0, 0], sharey=axes[0, 0])
        for i in range(0, 4):
            axes[1, i] = fig.add_subplot(2, 4, 5 + i)
        
        # Plot images and histograms
        ax_img, ax_hist, ax_cdf = plot_img_and_hist(img_processed, axes[:, 0])
        ax_img.set_title('Original')
        y_min, y_max = ax_hist.get_ylim()
        ax_hist.set_ylabel('Number of pixels')
        ax_hist.set_yticks(np.linspace(0, y_max, 5))
        
        ax_img, ax_hist, ax_cdf = plot_img_and_hist(img_rescale, axes[:, 1])
        ax_img.set_title('Contrast stretching')
        
        ax_img, ax_hist, ax_cdf = plot_img_and_hist(img_eq, axes[:, 2])
        ax_img.set_title('Histogram equalization')
        
        ax_img, ax_hist, ax_cdf = plot_img_and_hist(img_adapteq, axes[:, 3])
        ax_img.set_title('Adaptive equalization')
        ax_cdf.set_ylabel('Fraction of total intensity')
        ax_cdf.set_yticks(np.linspace(0, 1, 5))
        
        # Adjust layout
        fig.tight_layout()
        
        if save_dir:
            # Ensure save directory exists
            save_dir = Path(save_dir)
            save_dir.mkdir(parents=True, exist_ok=True)
            
            # Save plot
            plot_path = save_dir / "histogram_plot.png"
            plt.savefig(plot_path, bbox_inches='tight')
            result_paths['plot'] = plot_path
        
        plt.close()
    
    # Save processed images if save_dir is provided
    if save_dir:
        # Ensure save directory exists
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # Save processed images
        for name, img_data in [
            ('original', img_processed),
            ('rescale', img_rescale),
            ('equalize', img_eq),
            ('adaptive', img_adapteq)
        ]:
            img_path = save_dir / f"histogram_{name}.png"
            plt.imsave(img_path, img_data, cmap='gray')
            result_paths[name] = img_path
    
    return {
        'images': {
            'original': img_processed,
            'rescale': img_rescale,
            'equalize': img_eq,
            'adaptive_equalize': img_adapteq
        },
        'paths': result_paths
    }

# Example usage in your main.ipynb (assuming i1 is already loaded):
# histogram_equalization(i1)