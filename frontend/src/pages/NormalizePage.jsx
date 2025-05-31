import React, { useState, useEffect } from 'react';
import { processImage, getMethods, cleanupFiles } from '../services/api';

const NormalizePage = () => {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(1);
  const [sourceImage, setSourceImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [referencePreview, setReferencePreview] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedProcessedImage, setSelectedProcessedImage] = useState(null);
  const [plotImage, setPlotImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cleanupStatus, setCleanupStatus] = useState(null);
  const [apiResponse, setApiResponse] = useState(null); // Store full API response for download URLs

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const methodsData = await getMethods();
        setMethods(methodsData);
      } catch (err) {
        setError('Failed to load normalization methods');
        console.error(err);
      }
    };
    fetchMethods();
  }, []);

  const handleSourceImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSourceImage(file);
      setSourcePreview(URL.createObjectURL(file));
      setProcessedImages([]);
      setSelectedProcessedImage(null);
      setPlotImage(null);
      setError(null);
      setApiResponse(null);
    }
  };

  const handleReferenceImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReferenceImage(file);
      setReferencePreview(URL.createObjectURL(file));
      setProcessedImages([]);
      setSelectedProcessedImage(null);
      setPlotImage(null);
      setError(null);
      setApiResponse(null);
    }
  };

  const handleMethodChange = (event) => {
    const methodId = parseInt(event.target.value);
    setSelectedMethod(methodId);
    setProcessedImages([]);
    setSelectedProcessedImage(null);
    setPlotImage(null);
    setError(null);
    setApiResponse(null);
  };

  const handleProcessedImageChange = (event) => {
    const imageUrl = event.target.value;
    setSelectedProcessedImage(imageUrl);
  };

  const handleUpload = async () => {
    if (!sourceImage) {
      setError('Please select a source image first');
      return;
    }

    const selectedMethodData = methods.find(m => m.id === selectedMethod);
    if (selectedMethodData.requires_reference && !referenceImage) {
      setError('This method requires a reference image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await processImage(sourceImage, selectedMethod, referenceImage);
      if (response.success) {
        // Handle multiple output images for Histogram Equalization
        if (selectedMethod === 1 && response.result_images) {
          const imageUrls = await Promise.all(
            response.result_images.map(async (image) => {
              const imageResponse = await fetch(`${import.meta.env.VITE_API_URL}${image.url}`);
              const imageBlob = await imageResponse.blob();
              return {
                url: URL.createObjectURL(imageBlob),
                name: image.name || 'Processed Image'
              };
            })
          );
          setProcessedImages(imageUrls);
          setSelectedProcessedImage(imageUrls[0].url);
        } else {
          // Handle single output image for other methods
          const imageResponse = await fetch(`${import.meta.env.VITE_API_URL}${response.result_image.url}`);
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setProcessedImages([{ url: imageUrl, name: 'Processed Image' }]);
          setSelectedProcessedImage(imageUrl);
        }

        // Fetch the plot image
        if (response.plot) {
          const plotResponse = await fetch(`${import.meta.env.VITE_API_URL}${response.plot.url}`);
          const plotBlob = await plotResponse.blob();
          const plotUrl = URL.createObjectURL(plotBlob);
          setPlotImage(plotUrl);
        }

        setApiResponse(response);
      } else {
        setError(response.message || 'Error processing image');
      }
    } catch (err) {
      setError('Error processing image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cleanupFiles();
      if (response.success) {
        setCleanupStatus(`Successfully cleaned up ${response.files_removed} files`);
        // Clear all images and previews
        setSourceImage(null);
        setReferenceImage(null);
        setSourcePreview(null);
        setReferencePreview(null);
        setProcessedImages([]);
        setSelectedProcessedImage(null);
        setPlotImage(null);
        setApiResponse(null);
      } else {
        setError(response.message || 'Error during cleanup');
      }
    } catch (err) {
      setError('Error during cleanup. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (downloadUrl, filename) => {
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    // Use the download URL directly since the proxy should handle the API routing
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    if (!apiResponse) return;
    
    // Download all available images with a small delay between downloads
    const downloadQueue = [];
    
    if (apiResponse.result_image?.download_url) {
      downloadQueue.push({
        url: apiResponse.result_image.download_url,
        filename: apiResponse.result_image.filename
      });
    }
    
    if (apiResponse.plot?.download_url) {
      downloadQueue.push({
        url: apiResponse.plot.download_url,
        filename: apiResponse.plot.filename
      });
    }
    
    if (apiResponse.source_image?.download_url) {
      downloadQueue.push({
        url: apiResponse.source_image.download_url,
        filename: apiResponse.source_image.filename
      });
    }
    
    if (apiResponse.reference_image?.download_url) {
      downloadQueue.push({
        url: apiResponse.reference_image.download_url,
        filename: apiResponse.reference_image.filename
      });
    }
    
    // Download each file with a delay to avoid overwhelming the browser
    downloadQueue.forEach((item, index) => {
      setTimeout(() => {
        handleDownload(item.url, item.filename);
      }, index * 500); // 500ms delay between downloads
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Image <span className="text-primary-600">Normalization</span>
        </h2>

        <div className="card">
          <div className="space-y-6">
            {/* Method Selection */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Normalization Method
              </label>
              <select
                value={selectedMethod}
                onChange={handleMethodChange}
                className="input"
              >
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              {methods.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {methods.find(m => m.id === selectedMethod)?.description}
                </p>
              )}
            </div>

            {/* Source Image Upload */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Source Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSourceImageChange}
                className="input"
              />
            </div>

            {/* Reference Image Upload (if required) */}
            {methods.find(m => m.id === selectedMethod)?.requires_reference && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Reference Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageChange}
                  className="input"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {cleanupStatus && (
              <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                {cleanupStatus}
              </div>
            )}

            {/* Image Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sourcePreview && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">Source Image</h3>
                    {apiResponse?.source_image?.download_url && (
                      <button
                        onClick={() => handleDownload(apiResponse.source_image.download_url, apiResponse.source_image.filename)}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                        title="Download source image"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={sourcePreview}
                      alt="Source"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {referencePreview && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">Reference Image</h3>
                    {apiResponse?.reference_image?.download_url && (
                      <button
                        onClick={() => handleDownload(apiResponse.reference_image.download_url, apiResponse.reference_image.filename)}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                        title="Download reference image"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={referencePreview}
                      alt="Reference"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleUpload}
                disabled={loading || !sourceImage || (methods.find(m => m.id === selectedMethod)?.requires_reference && !referenceImage)}
                className={`btn ${
                  loading || !sourceImage || (methods.find(m => m.id === selectedMethod)?.requires_reference && !referenceImage)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                } text-lg px-8 py-3`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Process Image'
                )}
              </button>

              <button
                onClick={handleCleanup}
                disabled={loading}
                className="btn btn-secondary text-lg px-8 py-3"
              >
                Clean Up Files
              </button>
            </div>

            {/* Results */}
            {(processedImages.length > 0 || plotImage) && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Results</h3>
                  {apiResponse && (
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                      title="Download all images"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download All</span>
                    </button>
                  )}
                </div>
                
                {/* Processed Image Selection (for Histogram Equalization) */}
                {selectedMethod === 1 && processedImages.length > 1 && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Select Output Image
                    </label>
                    <select
                      value={selectedProcessedImage}
                      onChange={handleProcessedImageChange}
                      className="input"
                    >
                      {processedImages.map((image, index) => (
                        <option key={index} value={image.url}>
                          {image.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {selectedProcessedImage && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-700">Processed Image</h4>
                        {apiResponse?.result_image?.download_url && (
                          <button
                            onClick={() => handleDownload(apiResponse.result_image.download_url, apiResponse.result_image.filename)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            title="Download processed image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={selectedProcessedImage}
                          alt="Processed"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  {plotImage && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-700">Histogram Plot</h4>
                        {apiResponse?.plot?.download_url && (
                          <button
                            onClick={() => handleDownload(apiResponse.plot.download_url, apiResponse.plot.filename)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            title="Download histogram plot"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={plotImage}
                          alt="Histogram Plot"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NormalizePage; 