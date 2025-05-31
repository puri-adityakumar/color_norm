"""
Uses the spams package:

http://spams-devel.gforge.inria.fr/index.html

Use with python via e.g https://anaconda.org/conda-forge/python-spams
"""

from __future__ import division

import numpy as np
import cv2 as cv
import spams
# from sklearn.linear_model import MultiTaskLasso
import matplotlib.pyplot as plt
from skimage import exposure


##########################################

def read_image(path):
    """
    Read an image to RGB uint8
    :param path:
    :return:
    """
    im = cv.imread(path)
    im = cv.cvtColor(im, cv.COLOR_BGR2RGB)
    return im


def show_colors(C):
    """
    Shows rows of C as colors (RGB)
    :param C:
    :return:
    """
    n = C.shape[0]
    for i in range(n):
        if C[i].max() > 1.0:
            plt.plot([0, 1], [n - 1 - i, n - 1 - i], c=C[i] / 255, linewidth=20)
        else:
            plt.plot([0, 1], [n - 1 - i, n - 1 - i], c=C[i], linewidth=20)
        plt.axis('off')
        plt.axis([0, 1, -1, n])


def show(image, now=True, fig_size=(10, 10)):
    """
    Show an image (np.array).
    Caution! Rescales image to be in range [0,1].
    :param image:
    :param now:
    :param fig_size:
    :return:
    """
    image = image.astype(np.float32)
    m, M = image.min(), image.max()
    if fig_size != None:
        plt.rcParams['figure.figsize'] = (fig_size[0], fig_size[1])
    plt.imshow((image - m) / (M - m), cmap='gray')
    plt.axis('off')
    if now == True:
        plt.show()


# def build_stack(tup):
#     """
#     Build a stack of images from a tuple of images
#     :param tup:
#     :return:
#     """
#     N = len(tup)
#     if len(tup[0].shape) == 3:
#         h, w, c = tup[0].shape
#         stack = np.zeros((N, h, w, c))
#     if len(tup[0].shape) == 2:
#         h, w = tup[0].shape
#         stack = np.zeros((N, h, w))
#     for i in range(N):
#         stack[i] = tup[i]
#     return stack

def build_stack(tup, target_height=512, target_width=512):
    """
    Build a stack of images from a tuple of images with resizing
    :param tup: Tuple of images
    :param target_height: Target height for resizing
    :param target_width: Target width for resizing
    :return: Numpy array stack of images
    """
    N = len(tup)
    if len(tup[0].shape) == 3:
        c = tup[0].shape[2]
        stack = np.zeros((N, target_height, target_width, c))
    else:
        stack = np.zeros((N, target_height, target_width))
        
    for i in range(N):
        resized = cv.resize(tup[i], (target_width, target_height), interpolation=cv.INTER_AREA)
        stack[i] = resized
    return stack


def patch_grid(ims, width=5, sub_sample=None, rand=False, save_name=None, labels=None):
    """
    Display a grid of patches with optional labels
    :param ims: array of images
    :param width: number of images per row
    :param sub_sample: number of images to display (None for all)
    :param rand: random subsampling
    :param save_name: optional filename to save
    :param labels: optional list of labels for each image
    """
    N0 = np.shape(ims)[0]
    if sub_sample == None:
        N = N0
        stack = ims
        if labels is not None:
            labels = labels[:N]
    elif sub_sample != None and rand == False:
        N = sub_sample
        stack = ims[:N]
        if labels is not None:
            labels = labels[:N]
    elif sub_sample != None and rand == True:
        N = sub_sample
        idx = np.random.choice(range(N), sub_sample, replace=False)
        stack = ims[idx]
        if labels is not None:
            labels = [labels[i] for i in idx]
    
    height = np.ceil(float(N) / width).astype(np.uint16)
    plt.rcParams['figure.figsize'] = (18, (18 / width) * height + 4)  # +2 for label space
    plt.figure()
    
    for i in range(N):
        plt.subplot(height, width, i + 1)
        im = stack[i]
        show(im, now=False, fig_size=None)
        if labels is not None and i < len(labels):
            plt.text(0.5, -0.15, labels[i], 
                    ha='center', va='top', 
                    transform=plt.gca().transAxes,
                    color='black', fontsize=20)
    
    plt.tight_layout()
    if save_name != None:
        plt.savefig(save_name, bbox_inches='tight')
    plt.show()


######################################

def plot_histogram_matching(source, reference, matched, figsize=(8, 8), save_name=None):
    """
    Plot histogram matching results for RGB channels
    :param source: Original source image (before normalization)
    :param reference: Reference image used for matching
    :param matched: Result image after histogram matching
    """
    fig, axes = plt.subplots(nrows=3, ncols=3, figsize=figsize)
    
    # Use fixed number of bins for consistent shapes
    nbins = 256
    
    for i, img in enumerate((source, reference, matched)):
        for c, c_color in enumerate(('red', 'green', 'blue')):
            # Get histogram and bins with fixed size
            img_hist, bins = exposure.histogram(img[..., c], nbins=nbins, source_range='dtype')
            axes[c, i].plot(bins, img_hist / img_hist.max(), color=c_color)
            
            # Get CDF using same bins
            img_cdf, bins = exposure.cumulative_distribution(img[..., c], nbins=nbins)
            axes[c, i].plot(bins, img_cdf, '--', color='black')
            
            axes[c, 0].set_ylabel(c_color)

    axes[0, 0].set_title('Source')
    axes[0, 1].set_title('Reference')
    axes[0, 2].set_title('Matched')
    
    plt.tight_layout()
    if save_name:
        plt.savefig(save_name, bbox_inches='tight')
    #plt.show()


def plot_graph(transforms_dict, figsize=(15, 8), save_name=None):
    """
    Plot RGB histogram comparisons for single/multiple transformed images
    """
    # Number of transforms
    n_images = len(transforms_dict)
    
    # Create figure with proper axes handling
    if n_images == 1:
        fig, axes = plt.subplots(nrows=1, ncols=3, figsize=figsize)
        axes = axes.reshape(1, -1)  # Ensure 2D array structure
    else:
        fig, axes = plt.subplots(nrows=n_images, ncols=3, figsize=figsize)
    
    # Use fixed number of bins for consistent histograms
    nbins = 256
    
    # Get images and labels
    images = list(transforms_dict.values())
    labels = list(transforms_dict.keys())
    
    # Calculate y-axis limits for consistent scale across all plots
    y_max_per_channel = [0, 0, 0]
    
    # First pass to find max y values
    for img in images:
        for c in range(3):
            img_hist, _ = exposure.histogram(img[..., c], nbins=nbins, source_range='dtype')
            y_max_per_channel[c] = max(y_max_per_channel[c], np.max(img_hist))
    
    # Plot each image's RGB channels
    for i, (label, img) in enumerate(zip(labels, images)):
        for c, c_color in enumerate(['red', 'green', 'blue']):
            ax = axes[i, c]
            
            # Get histogram and bins
            img_hist, bins = exposure.histogram(img[..., c], nbins=nbins, source_range='dtype')
            
            # Plot histogram
            ax.plot(bins, img_hist, color=c_color)
            ax.set_xlim(0, 255)
            ax.set_ylim(0, y_max_per_channel[c] * 1.1)
            
            # Set labels
            if i == 0:  # Only for first row
                ax.set_title(f"{c_color.capitalize()} Channel")
            if c == 0:  # Only for first column
                ax.set_ylabel(label, rotation=90, labelpad=15)
            if i == n_images - 1:  # Only for last row
                ax.set_xlabel('Pixel Intensity (0-255)')

    plt.tight_layout()
    if save_name:
        plt.savefig(save_name, bbox_inches='tight')
    return fig
    


######################################

def standardize_brightness(I):
    """

    :param I:
    :return:
    """
    p = np.percentile(I, 90)
    return np.clip(I * 255.0 / p, 0, 255).astype(np.uint8)


def remove_zeros(I):
    """
    Remove zeros, replace with 1's.
    :param I: uint8 array
    :return:
    """
    mask = (I == 0)
    I[mask] = 1
    return I


def RGB_to_OD(I):
    """
    Convert from RGB to optical density
    :param I:
    :return:
    """
    I = remove_zeros(I)
    return -1 * np.log(I / 255)


def OD_to_RGB(OD):
    """
    Convert from optical density to RGB
    :param OD:
    :return:
    """
    return (255 * np.exp(-1 * OD)).astype(np.uint8)


def normalize_rows(A):
    """
    Normalize rows of an array
    :param A:
    :return:
    """
    return A / np.linalg.norm(A, axis=1)[:, None]


def notwhite_mask(I, thresh=0.8):
    """
    Get a binary mask where true denotes 'not white'
    :param I:
    :param thresh:
    :return:
    """
    I_LAB = cv.cvtColor(I, cv.COLOR_RGB2LAB)
    L = I_LAB[:, :, 0] / 255.0
    return (L < thresh)


def sign(x):
    """
    Returns the sign of x
    :param x:
    :return:
    """
    if x > 0:
        return +1
    elif x < 0:
        return -1
    elif x == 0:
        return 0


def get_concentrations(I, stain_matrix, lamda=0.01):
    """
    Get concentrations, a npix x 2 matrix
    :param I:
    :param stain_matrix: a 2x3 stain matrix
    :return:
    """
    OD = RGB_to_OD(I).reshape((-1, 3))
    return spams.lasso(OD.T, D=stain_matrix.T, mode=2, lambda1=lamda, pos=True).toarray().T

