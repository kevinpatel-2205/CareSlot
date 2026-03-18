import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function AppointmentsBarChart({ labels = [], values = [] }) {
  // Config for the visual style
  const data = {
    labels,
    datasets: [
      {
        label: "Appointments",
        data: values,
        borderRadius: 12, // More rounded for the modern look
        borderSkipped: false,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          // Create a vertical gradient
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top,
          );
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)"); // Light blue at bottom
          gradient.addColorStop(1, "rgba(37, 99, 235, 0.9)"); // Strong blue at top
          return gradient;
        },
        hoverBackgroundColor: "#2563eb",
        barThickness: 20, // Keep bars elegant
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14, weight: "bold", family: "Inter" },
        bodyFont: { size: 13, family: "Inter" },
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${context.raw} Appointments`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "600" },
          padding: 10,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false, dash: [4, 4] },
        grid: {
          color: "#f1f5f9",
          drawTicks: false,
        },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "600" },
          precision: 0,
          padding: 10,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default AppointmentsBarChart;
