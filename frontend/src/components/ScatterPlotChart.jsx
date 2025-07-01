import React from "react";
import { ScatterChart } from "@mui/x-charts/ScatterChart";

const ScatterPlotChart = ({
  data,
  title = "RGB Scatter Plot",
  imageType = "source",
}) => {
  if (!data || !data[imageType] || !data[imageType].scatter_plots) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          No scatter plot data available for {imageType}
        </p>
      </div>
    );
  }

  // Get scatter plot data
  const scatterData = data[imageType].scatter_plots;

  // Group data by color/channel
  const redPoints = scatterData.filter((point) => point.color === "red");
  const greenPoints = scatterData.filter((point) => point.color === "green");
  const bluePoints = scatterData.filter((point) => point.color === "blue");

  // Prepare series data for MUI X Charts
  const series = [
    {
      label: "Red Channel",
      data: redPoints.map((point) => ({
        x: point.x,
        y: point.y,
        id: Math.random(),
      })),
      color: "#ef4444",
    },
    {
      label: "Green Channel",
      data: greenPoints.map((point) => ({
        x: point.x,
        y: point.y,
        id: Math.random(),
      })),
      color: "#22c55e",
    },
    {
      label: "Blue Channel",
      data: bluePoints.map((point) => ({
        x: point.x,
        y: point.y,
        id: Math.random(),
      })),
      color: "#3b82f6",
    },
  ];
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="text-lg font-semibold text-gray-700 mb-4">
        {title} - {imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image
      </h4>
      <div style={{ width: "100%", height: "450px" }}>
        <ScatterChart
          series={series}
          width={undefined} // Let it use container width
          height={400}
          xAxis={[
            {
              min: -150,
              max: 150,
              label: "Red Channel (Centered)",
              tickInterval: 50,
            },
          ]}
          yAxis={[
            {
              min: -150,
              max: 150,
              label: "Green Channel (Centered)",
              tickInterval: 50,
            },
          ]}
          grid={{ vertical: true, horizontal: true }}
          margin={{
            left: 80,
            right: 40,
            top: 40,
            bottom: 80,
          }}
          slotProps={{
            legend: {
              direction: "row",
              position: { vertical: "top", horizontal: "right" },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ScatterPlotChart;
