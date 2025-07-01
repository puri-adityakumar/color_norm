import React, { useRef, useEffect } from 'react';

const HistogramChart = ({ data, title = "Histogram Analysis", imageType = "source" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !data[imageType] || !data[imageType].histograms) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Enhanced canvas size for better clarity (following scientific visualization principles)
    const width = 900;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas with scientific white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Get histogram data
    const histogramData = data[imageType].histograms;
    
    // Check if this is grayscale (histogram equalization) or RGB data
    const isGrayscale = histogramData.length > 0 && histogramData[0].channel === 'gray';
    
    // Group data by channel
    let channels = {};
    if (isGrayscale) {
      channels = {
        gray: histogramData.filter(d => d.channel === 'gray')
      };
    } else {
      channels = {
        red: histogramData.filter(d => d.channel === 'red'),
        green: histogramData.filter(d => d.channel === 'green'),
        blue: histogramData.filter(d => d.channel === 'blue')
      };
    }
    
    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = margin.left + (chartWidth * i / 10);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (chartHeight * i / 5);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
    }
    
    // Scientific color palette (following colorblind-friendly and publication standards)
    const colors = isGrayscale ? 
      { gray: '#2d3748' } : // Professional dark gray for grayscale
      { 
        red: '#dc2626',     // Scientific red (accessible)
        green: '#059669',   // Scientific green (accessible) 
        blue: '#2563eb'     // Scientific blue (accessible)
      };
    
    Object.entries(channels).forEach(([channelName, channelData]) => {
      if (channelData.length === 0) return;
      
      ctx.strokeStyle = colors[channelName];
      ctx.lineWidth = 2.5; // Slightly thicker for better visibility
      ctx.beginPath();
      
      channelData.forEach((point, index) => {
        // For grayscale, bin values are 0-1, for RGB they are 0-255
        const normalizedBin = isGrayscale ? point.bin : point.bin / 255;
        const x = margin.left + normalizedBin * chartWidth;
        const y = height - margin.bottom - (point.normalized_count * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    
    // X-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = isGrayscale ? (i / 5).toFixed(1) : (255 * i / 5).toFixed(0);
      const x = margin.left + (chartWidth * i / 5);
      ctx.textAlign = 'center';
      ctx.fillText(value, x, height - margin.bottom + 20);
    }
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = (i / 5).toFixed(1);
      const y = height - margin.bottom - (chartHeight * i / 5);
      ctx.textAlign = 'right';
      ctx.fillText(value, margin.left - 10, y + 4);
    }
    
    // Axis titles
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    const xAxisLabel = isGrayscale ? 'Pixel Intensity (0-1)' : 'Pixel Intensity (0-255)';
    ctx.fillText(xAxisLabel, width / 2, height - 5);
    
    // Y-axis title (rotated)
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Normalized Count', 0, 0);
    ctx.restore();
    
    // Enhanced Scientific Legend
    const legendY = margin.top + 15;
    const legendLabels = isGrayscale ? 
      { gray: 'Grayscale Intensity' } : 
      { red: 'Red Channel', green: 'Green Channel', blue: 'Blue Channel' };
    
    // Legend background for better readability
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(width - margin.right - 180, margin.top + 5, 175, 35);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(width - margin.right - 180, margin.top + 5, 175, 35);
    
    Object.entries(colors).forEach(([channel, color], index) => {
      const legendX = width - margin.right - 170 + (index * 85);
      
      // Color line with enhanced visibility
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 25, legendY);
      ctx.stroke();
      
      // Scientific label with better typography
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(legendLabels[channel], legendX + 30, legendY + 4);
    });
    
  }, [data, imageType]);

  if (!data || !data[imageType] || !data[imageType].histograms) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <div className="max-w-md mx-auto">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600 font-medium">Statistical Data Processing</p>
          <p className="text-sm text-gray-500 mt-1">No visualization data available for {imageType} analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Scientific Histogram Analysis
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Quantitative pixel intensity distribution for {imageType.charAt(0).toUpperCase() + imageType.slice(1)} image
          </p>
        </div>
      )}
      <div className="p-6">
        <canvas
          ref={canvasRef}
          className="w-full shadow-sm border border-gray-200 rounded-lg bg-white"
          style={{ maxWidth: '900px', height: 'auto' }}
          role="img"
          aria-label={`Histogram chart showing pixel intensity distribution for ${imageType} image`}
        />
        <div className="mt-4 text-xs text-gray-500">
          <p>
            <strong>Note:</strong> This visualization follows scientific publication standards for effective data presentation. 
            Colors are optimized for accessibility and print reproduction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistogramChart; 