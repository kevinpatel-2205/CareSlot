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
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Cash",
            data: cash,
            tension: 0.35,
            fill: false,
            pointRadius: 4,
            borderColor: "#2e7df2",
            backgroundColor: "#2e7df2",
          },
          {
            label: "Razorpay",
            data: razorpay,
            tension: 0.35,
            fill: false,
            pointRadius: 4,
            borderColor: "#22c55e",
            backgroundColor: "#22c55e",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#6783b5" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#6783b5" },
            grid: { color: "#dde8ff" },
          },
        },
      }}
    />
  );
}

export default EarningsLineChart;
