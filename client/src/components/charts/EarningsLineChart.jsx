import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

function EarningsLineChart({ labels = [], cash = [], razorpay = [] }) {
  const data = {
    labels,
    datasets: [
      {
        label: "Cash Payments",
        data: cash,
        tension: 0.4, // Smoother curves
        fill: true,
        borderColor: "#3b82f6", // Modern Blue
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
        pointRadius: 0, // Hide points by default
        pointHoverRadius: 6,
        pointBackgroundColor: "#3b82f6",
        borderWidth: 3,
      },
      {
        label: "Online (Razorpay)",
        data: razorpay,
        tension: 0.4,
        fill: true,
        borderColor: "#10b981", // Modern Emerald
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
          return gradient;
        },
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#10b981",
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
          font: { size: 12, weight: "600", family: "Inter" },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        cornerRadius: 12,
        usePointStyle: true,
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
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "600" },
          padding: 10,
          callback: (value) => "₹" + value, // Format as currency
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default EarningsLineChart;
