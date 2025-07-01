import React from "react";
import { ScatterChart } from "@mui/x-charts/ScatterChart";

const ScatterPlotChart = ({
  data,
  title = "RGB Scatter Plot",
  imageType = "source",
}) => {
  if (!data || !data[imageType] || !data[imageType].scatter_plots) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <div className="max-w-md mx-auto">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-gray-600 font-medium">Color Space Analysis</p>
          <p className="text-sm text-gray-500 mt-1">No scatter plot data available for {imageType} visualization</p>
        </div>
      </div>
    );
  }

  // Get scatter plot data
  const scatterData = data[imageType].scatter_plots;

  // Group data by color/channel
  const redPoints = scatterData.filter((point) => point.color === "red");
  const greenPoints = scatterData.filter((point) => point.color === "green");
  const bluePoints = scatterData.filter((point) => point.color === "blue");

  // Scientific color palette (colorblind-friendly and publication-ready)
  const series = [
    {
      label: "Red Channel Distribution",
      data: redPoints.map((point) => ({
        x: point.x,
        y: point.y,
        id: Math.random(),
      })),
      color: "#dc2626", // Scientific red (accessible)
    },
    {
      label: "Green Channel Distribution", 
      data: greenPoints.map((point) => ({
        x: point.x,
        y: point.y,
        id: Math.random(),
      })),
      color: "#059669", // Scientific green (accessible)
    },
    {
      label: "Blue Channel Distribution",
      data: bluePoints.map((point) => ({
        x: point.x,
        y: point.y,
        id: Math.random(),
      })),
      color: "#2563eb", // Scientific blue (accessible)
    },
  ];
  return (
    <div className="bg-white rounded-lg">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Scientific Color Space Analysis
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            RGB channel correlation and distribution patterns for {imageType.charAt(0).toUpperCase() + imageType.slice(1)} image
          </p>
        </div>
      )}
      <div className="p-6">
        <div style={{ width: "100%", height: "480px" }} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <ScatterChart
            series={series}
            width={undefined} // Let it use container width
            height={460}
            xAxis={[
              {
                min: -150,
                max: 150,
                label: "Red Channel Intensity (Centered)",
                tickInterval: 50,
                labelStyle: { fontSize: '12px', fontFamily: 'system-ui' },
              },
            ]}
            yAxis={[
              {
                min: -150,
                max: 150,
                label: "Green Channel Intensity (Centered)", 
                tickInterval: 50,
                labelStyle: { fontSize: '12px', fontFamily: 'system-ui' },
              },
            ]}
            grid={{ 
              vertical: true, 
              horizontal: true,
              stroke: '#f3f4f6',
              strokeWidth: 1
            }}
            margin={{
              left: 90,
              right: 50,
              top: 60,
              bottom: 90,
            }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "center" },
                labelStyle: { fontSize: '11px', fontFamily: 'system-ui' },
              },
            }}
          />
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>
            <strong>Note:</strong> This 2D projection of the 3D color space reveals correlations between RGB channels. 
            Clustering patterns indicate color consistency and normalization effectiveness. 
            Visualization follows scientific standards for colorblind accessibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScatterPlotChart;
