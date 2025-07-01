import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Download, 
  Zap, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
  Eye,
  TrendingUp
} from "lucide-react";
import { processImage, getMethods } from "../services/api";
import HistogramChart from "../components/HistogramChart";
import ScatterPlotChart from "../components/ScatterPlotChart";

const NormalizePage = () => {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(1);
  const [sourceImage, setSourceImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [referencePreview, setReferencePreview] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedProcessedImage, setSelectedProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const methodsData = await getMethods();
        setMethods(methodsData);
      } catch (err) {
        setError("Failed to load normalization methods");
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
      setError(null);
      setApiResponse(null);
      setChartData(null);
      resetChartIndex();
    }
  };

  const handleReferenceImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReferenceImage(file);
      setReferencePreview(URL.createObjectURL(file));
      setProcessedImages([]);
      setSelectedProcessedImage(null);
      setError(null);
      setApiResponse(null);
      setChartData(null);
      resetChartIndex();
    }
  };

  const handleMethodChange = (event) => {
    const methodId = parseInt(event.target.value);
    setSelectedMethod(methodId);
    setProcessedImages([]);
    setSelectedProcessedImage(null);
    setError(null);
    setApiResponse(null);
    setChartData(null);
    resetChartIndex();
  };

  const handleProcessedImageChange = (event) => {
    const imageUrl = event.target.value;
    setSelectedProcessedImage(imageUrl);
  };

  const handleUpload = async () => {
    console.log("=== PROCESS BUTTON CLICKED ===");
    console.log("Source image:", sourceImage);
    console.log("Selected method:", selectedMethod);
    console.log("Reference image:", referenceImage);
    console.log("Methods array:", methods);
    
    if (!sourceImage) {
      setError("Please select a source image first");
      return;
    }

    const selectedMethodData = methods.find((m) => m.id === selectedMethod);
    if (selectedMethodData?.requires_reference && !referenceImage) {
      setError("This method requires a reference image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Starting API call...");
      const response = await processImage(
        sourceImage,
        selectedMethod,
        referenceImage
      );

      console.log("API Response:", response);

      if (response.success) {
        if (selectedMethod === 1 && response.result_images) {
          const imageUrls = await Promise.all(
            response.result_images.map(async (image) => {
              const imageResponse = await fetch(
                `${import.meta.env.VITE_API_URL}${image.url}`
              );
              const imageBlob = await imageResponse.blob();
              return {
                url: URL.createObjectURL(imageBlob),
                name: image.name || "Processed Image",
              };
            })
          );
          setProcessedImages(imageUrls);
          setSelectedProcessedImage(imageUrls[0].url);
        } else {
          const imageResponse = await fetch(
            `${import.meta.env.VITE_API_URL}${response.result_image.url}`
          );
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setProcessedImages([{ url: imageUrl, name: "Processed Image" }]);
          setSelectedProcessedImage(imageUrl);
        }

        if (response.chart_data) {
          console.log("Setting chart data:", response.chart_data);
          setChartData(response.chart_data);
          resetChartIndex();
        } else {
          console.log("No chart data in response");
          setChartData(null);
        }

        setApiResponse(response);
      } else {
        setError(response.message || "Error processing image");
      }
    } catch (err) {
      console.error("Error during processing:", err);
      if (err.response) {
        setError(`Server error: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        setError("Network error: Unable to reach the server. Please check your connection.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (downloadUrl, filename) => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAvailableCharts = () => {
    console.log("Getting available charts - chartData:", chartData, "selectedMethod:", selectedMethod);
    if (!chartData || !chartData.images) return [];

    if (selectedMethod === 1) {
      const charts = [
        { key: "original", title: "Original Image", description: "Before enhancement" },
        { key: "rescale", title: "Contrast Stretching", description: "Rescale intensity range" },
        { key: "equalize", title: "Histogram Equalization", description: "Uniform distribution" },
        { key: "adaptive_equalize", title: "Adaptive Equalization", description: "Local histogram equalization" },
      ];
      console.log("Histogram equalization charts:", charts);
      return charts;
    } else {
      const charts = [
        { key: "source", title: "Source Image Histogram", description: "Original image distribution" },
      ];

      if (chartData.images.reference) {
        charts.push({
          key: "reference",
          title: "Reference Image Histogram",
          description: "Target distribution",
        });
      }

      charts.push({
        key: "result",
        title: "Result Image Histogram",
        description: "Normalized distribution",
      });

      return charts;
    }
  };

  const nextChart = () => {
    const charts = getAvailableCharts();
    setCurrentChartIndex((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    const charts = getAvailableCharts();
    setCurrentChartIndex((prev) => (prev - 1 + charts.length) % charts.length);
  };

  const resetChartIndex = () => {
    setCurrentChartIndex(0);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const selectedMethodData = methods.find((m) => m.id === selectedMethod);
  const hasResults = processedImages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div className="container-custom section-padding">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Color Normalization
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-accent-900 mb-4">
              Image <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Normalization</span> Tool
            </h1>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              Transform your medical images with state-of-the-art color normalization techniques for enhanced analysis and classification.
            </p>
          </motion.div>

          {/* Step 1: Configuration */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="card p-8 bg-white/80 backdrop-blur-sm border border-amber-100">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full mr-3">
                  <span className="text-amber-600 font-semibold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-bold text-accent-900 flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-amber-600" />
                  Configuration & Setup
        </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Method Selection */}
            <div>
                  <label className="block text-sm font-medium text-accent-700 mb-3">
                Normalization Method
              </label>
              <select
                value={selectedMethod}
                onChange={handleMethodChange}
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              {methods.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-accent-700 font-medium">Method Description:</p>
                      <p className="text-sm text-accent-600 mt-1">
                  {methods.find((m) => m.id === selectedMethod)?.description}
                </p>
                    </div>
              )}
            </div>

                {/* Method Requirements */}
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-3">
                    Requirements
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-amber-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-accent-900">Source Image</p>
                        <p className="text-xs text-accent-600">Required for all methods</p>
                      </div>
                      {sourceImage && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                    </div>
                    
                    {methods.find((m) => m.id === selectedMethod)?.requires_reference && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileImage className="w-5 h-5 text-amber-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-accent-900">Reference Image</p>
                          <p className="text-xs text-accent-600">Required for this method</p>
                        </div>
                        {referenceImage && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Image Upload */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="card p-8 bg-white border border-amber-100">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full mr-3">
                  <span className="text-amber-600 font-semibold text-sm">2</span>
                </div>
                <h2 className="text-2xl font-bold text-accent-900 flex items-center">
                  <Upload className="w-6 h-6 mr-2 text-amber-600" />
                  Upload Images
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Source Image Upload */}
            <div>
                  <label className="block text-sm font-medium text-accent-700 mb-3">
                    Source Image *
              </label>
                  <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleSourceImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="source-upload"
                    />
                    <label 
                      htmlFor="source-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-400 hover:bg-amber-50/50 transition-colors cursor-pointer"
                    >
                                             {sourcePreview ? (
                         <div className="w-full h-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                           <img
                             src={sourcePreview}
                             alt="Source Preview"
                             className="max-w-full max-h-full object-contain"
                           />
                         </div>
                       ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-accent-700">Upload Source Image</p>
                          <p className="text-xs text-accent-500 mt-1">Click to browse files</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {sourceImage && (
                    <p className="text-xs text-accent-600 mt-2">✓ {sourceImage.name}</p>
                  )}
            </div>

                {/* Reference Image Upload */}
              <div>
                  <label className="block text-sm font-medium text-accent-700 mb-3">
                    Reference Image {methods.find((m) => m.id === selectedMethod)?.requires_reference ? '*' : '(Optional)'}
                </label>
                  <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="reference-upload"
                      disabled={!methods.find((m) => m.id === selectedMethod)?.requires_reference}
                    />
                    <label 
                      htmlFor="reference-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                        methods.find((m) => m.id === selectedMethod)?.requires_reference
                          ? 'border-amber-300 hover:border-amber-400 hover:bg-amber-50/50'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                                             {referencePreview ? (
                         <div className="w-full h-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                           <img
                             src={referencePreview}
                             alt="Reference Preview"
                             className="max-w-full max-h-full object-contain"
                />
              </div>
                       ) : (
                        <div className="text-center">
                          <Upload className={`w-12 h-12 mx-auto mb-3 ${
                            methods.find((m) => m.id === selectedMethod)?.requires_reference 
                              ? 'text-amber-500' 
                              : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            methods.find((m) => m.id === selectedMethod)?.requires_reference 
                              ? 'text-accent-700' 
                              : 'text-gray-400'
                          }`}>
                            {methods.find((m) => m.id === selectedMethod)?.requires_reference 
                              ? 'Upload Reference Image' 
                              : 'Not Required for This Method'
                            }
                          </p>
                          {methods.find((m) => m.id === selectedMethod)?.requires_reference && (
                            <p className="text-xs text-accent-500 mt-1">Click to browse files</p>
                          )}
              </div>
            )}
                    </label>
                  </div>
                  {referenceImage && (
                    <p className="text-xs text-accent-600 mt-2">✓ {referenceImage.name}</p>
                  )}
                </div>
                  </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Process Button */}
              <div className="mt-8 text-center relative z-10">
                <button
                  onClick={handleUpload}
                  disabled={
                    loading ||
                    !sourceImage ||
                    (methods.find((m) => m.id === selectedMethod)?.requires_reference && !referenceImage)
                  }
                  className={`relative z-20 px-8 py-3 text-lg font-semibold rounded-lg transition-colors duration-200 ${
                    loading ||
                    !sourceImage ||
                    (methods.find((m) => m.id === selectedMethod)?.requires_reference && !referenceImage)
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing Image...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Zap className="w-5 h-5 mr-3" />
                      Process Image
                    </span>
                  )}
                </button>
                {!loading && (!sourceImage || (methods.find((m) => m.id === selectedMethod)?.requires_reference && !referenceImage)) && (
                  <div className="mt-4">
                    <p className="text-sm text-amber-800 bg-amber-100 rounded-full px-4 py-2 inline-flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Please select a source image
                      {methods.find((m) => m.id === selectedMethod)?.requires_reference &&
                        " and a reference image"}{" "}
                      to proceed.
                    </p>
                  </div>
                )}
              </div>

              {/* Debug Info */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-8">
                  <p className="text-xs text-gray-500">
                    Debug: Source: {sourceImage ? 'Yes' : 'No'} | 
                    Method requires reference: {selectedMethodData?.requires_reference ? 'Yes' : 'No'} | 
                    Reference: {referenceImage ? 'Yes' : 'No'} | 
                    Button enabled: {!loading && sourceImage && (!methods.find((m) => m.id === selectedMethod)?.requires_reference || referenceImage) ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Step 3: Results */}
          {hasResults && (
            <motion.div 
              variants={fadeInUp} 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="card p-8 bg-white/80 backdrop-blur-sm border border-amber-100">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-accent-900 flex items-center">
                    <Eye className="w-6 h-6 mr-2 text-amber-600" />
                    Processing Results
                  </h2>
                </div>

                {/* Success Message */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-700 font-medium">
                    Image processed successfully! Results are ready for analysis and download.
                  </p>
                </div>

                {/* Output Selection */}
                {selectedMethod === 1 && processedImages.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-accent-700 mb-3">
                      Select Output Variation
                    </label>
                    <select
                      value={selectedProcessedImage}
                      onChange={handleProcessedImageChange}
                      className="w-full max-w-md px-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    >
                      {processedImages.map((image, index) => (
                        <option key={index} value={image.url}>
                          {image.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Processed Image */}
                  {selectedProcessedImage && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-accent-900">
                          Processed Result
                        </h3>
                        
                        {/* Download Button */}
                        {(() => {
                          if (selectedMethod === 1 && apiResponse?.result_images) {
                            const selectedImageInfo = apiResponse.result_images.find((img) => {
                                const currentImageName = processedImages.find(
                                  (pImg) => pImg.url === selectedProcessedImage
                                )?.name;
                                return img.name === currentImageName;
                              });

                            if (selectedImageInfo?.download_url) {
                              return (
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      selectedImageInfo.download_url,
                                      selectedImageInfo.filename
                                    )
                                  }
                                  className="btn btn-secondary"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </button>
                              );
                            }
                          } else if (apiResponse?.result_image?.download_url) {
                            return (
                              <button
                                onClick={() =>
                                  handleDownload(
                                    apiResponse.result_image.download_url,
                                    apiResponse.result_image.filename
                                  )
                                }
                                className="btn btn-secondary"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-amber-200">
                        <img
                          src={selectedProcessedImage}
                          alt="Processed"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Original Comparison */}
                  <div>
                    <h3 className="text-lg font-semibold text-accent-900 mb-4">
                      Original Image
                    </h3>
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-amber-200">
                      <img
                        src={sourcePreview}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Statistical Analysis & Visualization */}
                  {chartData && chartData.images && (
            <motion.div 
              variants={fadeInUp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="card p-8 bg-white border border-amber-100">
                <div className="flex items-center mb-8">
                  <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full mr-3">
                    <span className="text-amber-600 font-semibold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-accent-900 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-amber-600" />
                    Statistical Analysis & Data Visualization
                  </h2>
                </div>

                {/* Analysis Overview */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Quantitative Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Histogram Analysis</h4>
                      <p className="text-sm text-blue-700">
                        Histogram visualization reveals pixel intensity distributions, showing how normalization 
                        affects the spread and central tendency of image data. This analysis follows established 
                        principles for effective scientific visualization.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Color Space Distribution</h4>
                      <p className="text-sm text-blue-700">
                        RGB scatter plots demonstrate color space transformations and channel correlations, 
                        providing insights into the normalization's impact on color balance and image consistency.
                      </p>
                    </div>
                  </div>
                </div>

                      {(() => {
                        const availableCharts = getAvailableCharts();
                        const currentChart = availableCharts[currentChartIndex];

                        if (!currentChart) return null;

                        return (
                    <div className="space-y-8">
                      {/* Enhanced Chart Navigation */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-accent-900 mb-2">
                            {currentChart.title}
                                </h3>
                          <p className="text-accent-600">
                            {currentChart.description} 
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-full mr-2">
                              Visualization {currentChartIndex + 1} of {availableCharts.length}
                            </span>
                            <span>Based on scientific visualization principles</span>
                          </div>
                              </div>

                        {/* Chart Controls */}
                        <div className="flex items-center space-x-4">
                        {availableCharts.length > 1 && (
                            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
                                <button
                                  onClick={prevChart}
                                disabled={currentChartIndex === 0}
                                className="btn btn-ghost text-accent-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                </button>
                              <span className="text-sm text-accent-600 px-2 font-medium">
                              {currentChartIndex + 1} / {availableCharts.length}
                            </span>
                                <button
                                  onClick={nextChart}
                                disabled={currentChartIndex === availableCharts.length - 1}
                                className="btn btn-ghost text-accent-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                        )}
                          
                          {/* Export Button */}
                          <button className="btn btn-secondary text-sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export Chart
                          </button>
                        </div>
                            </div>

                      {/* Statistical Insights Panel */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                          <div className="bg-gradient-to-b from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
                            <h4 className="font-semibold text-amber-800 mb-4 flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Key Insights
                            </h4>
                            <div className="space-y-4">
                              {selectedMethod === 1 ? (
                                <div className="space-y-3">
                                  <div className="text-sm">
                                    <div className="font-medium text-amber-700">Enhancement Type:</div>
                                    <div className="text-amber-600">{currentChart.title}</div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium text-amber-700">Technique:</div>
                                    <div className="text-amber-600">Histogram Equalization</div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium text-amber-700">Effect:</div>
                                    <div className="text-amber-600">Improved contrast and brightness distribution</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="text-sm">
                                    <div className="font-medium text-amber-700">Analysis Phase:</div>
                                    <div className="text-amber-600">{currentChart.title}</div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium text-amber-700">Color Channels:</div>
                                    <div className="text-amber-600">RGB Analysis</div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium text-amber-700">Normalization:</div>
                                    <div className="text-amber-600">{methods.find(m => m.id === selectedMethod)?.name}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Chart Display */}
                        <div className="lg:col-span-3">
                      <div className="space-y-6">
                              {selectedMethod === 1 ? (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                  <h5 className="font-medium text-gray-900">Intensity Distribution Analysis</h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Grayscale histogram showing pixel intensity distribution changes
                                  </p>
                                </div>
                                <div className="p-6">
                                  <HistogramChart
                                    data={chartData.images}
                                    imageType={currentChart.key}
                                    title=""
                                  />
                                </div>
                                </div>
                              ) : (
                          <>
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h5 className="font-medium text-gray-900">Color Intensity Distribution</h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      RGB channel histograms revealing color balance and normalization effects
                                    </p>
                                  </div>
                                  <div className="p-6">
                                    <HistogramChart
                                      data={chartData.images}
                                      imageType={currentChart.key}
                                      title=""
                                    />
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h5 className="font-medium text-gray-900">Color Space Visualization</h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      3D color space projection showing channel correlations and distribution patterns
                                    </p>
                                  </div>
                                  <div className="p-6">
                                    <ScatterPlotChart
                                      data={chartData.images}
                                      imageType={currentChart.key}
                                      title=""
                                    />
                                  </div>
                                  </div>
                          </>
                              )}
                          </div>
                        </div>
                            </div>

                      {/* Enhanced Chart Navigation Indicators */}
                      {availableCharts.length > 1 && (
                        <div className="flex justify-center">
                          <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-6 py-3">
                          {availableCharts.map((chart, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentChartIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                    index === currentChartIndex
                                    ? "bg-amber-600 scale-125"
                                    : "bg-gray-300 hover:bg-amber-300"
                              }`}
                              title={chart.title}
                              />
                              ))}
                          </div>
                            </div>
                      )}

                      {/* Scientific Interpretation */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-blue-600" />
                          Scientific Interpretation
                        </h4>
                        <div className="text-sm text-gray-700 space-y-2">
                          {selectedMethod === 1 ? (
                            <div>
                              <p>
                                <strong>Current View:</strong> {currentChart.description}. 
                                Histogram equalization enhances image contrast by redistributing pixel intensities 
                                across the full dynamic range. This technique is particularly effective for improving 
                                visual quality in medical and scientific imaging applications.
                              </p>
                              <p className="mt-2">
                                <strong>Clinical Significance:</strong> Enhanced contrast facilitates better feature 
                                identification and analysis in biomedical images, supporting more accurate diagnostic 
                                and research outcomes.
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p>
                                <strong>Current View:</strong> {currentChart.description}. 
                                The {methods.find(m => m.id === selectedMethod)?.name} method provides standardized 
                                color normalization for consistent analysis across different imaging conditions and equipment.
                              </p>
                              <p className="mt-2">
                                <strong>Research Applications:</strong> Standardized color normalization reduces 
                                inter-laboratory variability and improves reproducibility in quantitative image analysis 
                                workflows, particularly important for multi-center studies.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                          </div>
                        );
                      })()}
              </div>
            </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default NormalizePage;
