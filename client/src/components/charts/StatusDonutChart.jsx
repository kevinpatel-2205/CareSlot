import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDonutChart({ completed = 0, pending = 0, cancelled = 0 }) {
  return (
    <Doughnut
      data={{
        labels: ["Completed", "Pending", "Cancelled"],
        datasets: [
          {
            data: [completed, pending, cancelled],
            borderWidth: 0,
            backgroundColor: ["#2E7DF2", "#F2B34C", "#E9636D"],
            hoverOffset: 8,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#26497f",
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
        },
      }}
    />
  );
}

export default StatusDonutChart;
