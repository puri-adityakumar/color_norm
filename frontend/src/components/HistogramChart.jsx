import React, { useRef, useEffect } from 'react';

const HistogramChart = ({ data, title = "Histogram Analysis", imageType = "source" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !data[imageType] || !data[imageType].histograms) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
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
    
    // Draw histogram lines for each channel
    const colors = isGrayscale ? 
      { gray: '#333333' } : 
      { red: '#ef4444', green: '#22c55e', blue: '#3b82f6' };
    
    Object.entries(channels).forEach(([channelName, channelData]) => {
      if (channelData.length === 0) return;
      
      ctx.strokeStyle = colors[channelName];
      ctx.lineWidth = 2;
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
    
    // Legend
    const legendY = margin.top + 10;
    const legendLabels = isGrayscale ? 
      { gray: 'Grayscale' } : 
      { red: 'Red', green: 'Green', blue: 'Blue' };
    
    Object.entries(colors).forEach(([channel, color], index) => {
      const legendX = width - margin.right - 150 + (index * 80);
      
      // Color line
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(legendLabels[channel], legendX + 25, legendY + 4);
    });
    
  }, [data, imageType]);

  if (!data || !data[imageType] || !data[imageType].histograms) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chart data available for {imageType}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="text-lg font-semibold text-gray-700 mb-4">
        {title} - {imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image
      </h4>
      <canvas
        ref={canvasRef}
        className="w-full border rounded"
        style={{ maxWidth: '800px', height: 'auto' }}
      />
    </div>
  );
};

export default HistogramChart; 