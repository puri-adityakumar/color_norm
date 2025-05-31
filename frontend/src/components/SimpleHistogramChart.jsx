import React, { useRef, useEffect } from 'react';

const SimpleHistogramChart = ({ data, title = "Histogram Analysis" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !data.source_histogram || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Group data by channel
    const channels = {
      red: data.source_histogram.filter(d => d.channel === 'red'),
      green: data.source_histogram.filter(d => d.channel === 'green'),
      blue: data.source_histogram.filter(d => d.channel === 'blue')
    };

    // Find max count for scaling
    const maxCount = Math.max(
      ...data.source_histogram.map(d => d.normalized_count)
    );

    // Chart dimensions
    const chartWidth = width - 80;
    const chartHeight = height - 80;
    const startX = 60;
    const startY = 20;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + chartHeight);
    ctx.lineTo(startX + chartWidth, startY + chartHeight);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pixel Intensity', startX + chartWidth / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, startY + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Count', 0, 0);
    ctx.restore();

    // Draw histogram lines
    const colors = {
      red: '#ef4444',
      green: '#22c55e',
      blue: '#3b82f6'
    };

    Object.entries(channels).forEach(([channel, channelData]) => {
      ctx.strokeStyle = colors[channel];
      ctx.lineWidth = 2;
      ctx.beginPath();

      channelData.forEach((point, index) => {
        const x = startX + (point.bin / 255) * chartWidth;
        const y = startY + chartHeight - (point.normalized_count / maxCount) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    // Draw legend
    const legendY = startY + 10;
    Object.entries(colors).forEach(([channel, color], index) => {
      const legendX = startX + chartWidth - 150 + index * 45;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(channel.charAt(0).toUpperCase() + channel.slice(1), legendX + 25, legendY + 4);
    });

  }, [data]);

  if (!data || !data.source_histogram) {
    return (
      <div className="p-6 text-center border rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <canvas 
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full border"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default SimpleHistogramChart; 