"""
Normalize an image's stain to a target image using histogram matching.

This module adapts the histogram matching technique from skimage.exposure to normalize
the intensity distribution of source images to match a reference image across all channels.
"""

from __future__ import division

import numpy as np
from skimage.exposure import match_histograms

class Normalizer(object):
    """
    A histogram matching normalization object.

    This class normalizes source images to match the histogram of a reference image,
    suitable for stain normalization of RGB images.
    """

    def __init__(self):
        """
        Initialize the normalizer with no reference image set.
        """
        self.reference = None

    def fit(self, target):
        """
        Set the reference image for histogram matching.

        Args:
            target (numpy.ndarray): Reference image (RGB uint8) to which other images
                                   will be normalized.
        """
        if not isinstance(target, np.ndarray) or target.dtype != np.uint8:
            raise ValueError("Target image must be a uint8 numpy array.")
        self.reference = target

    def transform(self, I):
        """
        Transform the input image to match the histogram of the reference image.

        Args:
            I (numpy.ndarray): Input image (RGB uint8) to be normalized.

        Returns:
            numpy.ndarray: Normalized image with histogram matched to the reference.

        Raises:
            ValueError: If the normalizer has not been fitted yet or if the input
                        image is not a uint8 numpy array.
        """
        if self.reference is None:
            raise ValueError("Normalizer has not been fitted yet. Call fit() first.")
        if not isinstance(I, np.ndarray) or I.dtype != np.uint8:
            raise ValueError("Input image must be a uint8 numpy array.")
        return match_histograms(I, self.reference, channel_axis=-1)