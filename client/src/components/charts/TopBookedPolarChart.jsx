import {
  Chart as ChartJS,
  Legend,
  PolarAreaController,
  RadialLinearScale,
  ArcElement,
  Tooltip,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";

ChartJS.register(
  PolarAreaController,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
);

function TopBookedPolarChart({ labels = [], values = [] }) {
  return (
    <PolarArea
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              "rgba(20, 158, 130, 0.75)",
              "rgba(58, 184, 154, 0.72)",
              "rgba(108, 205, 182, 0.7)",
              "rgba(157, 224, 208, 0.68)",
              "rgba(191, 235, 224, 0.66)",
            ],
            borderWidth: 1,
            borderColor: "#cdeee6",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#2a4f88",
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 10,
            },
          },
        },
        scales: {
          r: {
            ticks: { color: "#6f8bbc", backdropColor: "transparent" },
            grid: { color: "#dde8ff" },
            angleLines: { color: "#e4edff" },
          },
        },
      }}
    />
  );
}

export default TopBookedPolarChart;
