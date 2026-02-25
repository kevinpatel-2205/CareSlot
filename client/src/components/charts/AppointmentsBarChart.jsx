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
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Appointments",
            data: values,
            borderRadius: 8,
            backgroundColor: "rgba(46, 125, 242, 0.72)",
            hoverBackgroundColor: "rgba(46, 125, 242, 0.95)",
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
            ticks: { color: "#6783b5", precision: 0 },
            grid: { color: "#dde8ff" },
          },
        },
      }}
    />
  );
}

export default AppointmentsBarChart;
