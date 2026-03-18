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
  const data = {
    labels,
    datasets: [
      {
        label: "Appointments",
        data: values,
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)", // Emerald 500
          "rgba(20, 184, 166, 0.7)", // Teal 500
          "rgba(5, 150, 105, 0.6)", // Emerald 600
          "rgba(45, 212, 191, 0.5)", // Teal 400
          "rgba(110, 231, 183, 0.4)", // Emerald 300
        ],
        borderWidth: 2,
        borderColor: "#ffffff", // Clean white separation
        hoverBorderWidth: 4,
        hoverBorderColor: "rgba(16, 185, 129, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b", // Slate 500
          usePointStyle: true,
          pointStyle: "circle",
          padding: 25,
          font: {
            size: 11,
            weight: "600",
            family: "Inter",
          },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      r: {
        grid: {
          color: "#f1f5f9", // Very light slate
        },
        angleLines: {
          display: true,
          color: "#f1f5f9",
        },
        ticks: {
          display: false, // Hide numeric scales for a cleaner visual
        },
        pointLabels: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="relative h-full w-full">
      <PolarArea data={data} options={options} />
    </div>
  );
}

export default TopBookedPolarChart;
