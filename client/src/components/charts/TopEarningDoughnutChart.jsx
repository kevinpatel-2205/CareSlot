import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function TopEarningDoughnutChart({ labels = [], values = [] }) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            borderWidth: 0,
            backgroundColor: ["#2E7DF2", "#4FA3FF", "#7DC2FF", "#9CD4FF", "#BEDFFF"],
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
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
      }}
    />
  );
}

export default TopEarningDoughnutChart;
