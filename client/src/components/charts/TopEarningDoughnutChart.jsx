import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { formatMoney } from "../../lib/format";

ChartJS.register(ArcElement, Tooltip, Legend);

function TopEarningDoughnutChart({ labels = [], values = [] }) {
  // Calculate total for the center display
  const totalRevenue = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderWidth: 2,
        borderColor: "#ffffff",
        backgroundColor: [
          "#2563eb", // Primary Blue
          "#3b82f6", // Blue 500
          "#60a5fa", // Blue 400
          "#93c5fd", // Blue 300
          "#bfdbfe", // Blue 200
        ],
        hoverOffset: 12,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "78%", // Sleeker, professional thinness
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b",
          font: {
            size: 11,
            weight: "600",
            family: "Inter",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` ${context.label}: ${formatMoney(context.raw)}`,
        },
      },
    },
  };

  // Custom plugin to show Total Revenue in the center
  const centerTextPlugin = {
    id: "centerTextEarnings",
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      ctx.save();
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      // Label: "Revenue"
      ctx.font = "bold 10px Inter";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText("TOTAL EARNED", centerX, centerY - 10);

      // Value: Total Money
      ctx.font = "bold 16px Inter";
      ctx.fillStyle = "#1e3a8a";
      ctx.fillText(formatMoney(totalRevenue), centerX, centerY + 10);
      ctx.restore();
    },
  };

  return (
    <div className="relative h-full w-full">
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

export default TopEarningDoughnutChart;
