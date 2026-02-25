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

function EarningsLineChart({ labels = [], values = [] }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Earnings",
            data: values,
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: "#2e7df2",
            borderColor: "#2e7df2",
            backgroundColor: "rgba(46, 125, 242, 0.12)",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
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
