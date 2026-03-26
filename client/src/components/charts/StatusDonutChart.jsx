import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDonutChart({ completed = 0, pending = 0, cancelled = 0 }) {
  const total = completed + pending + cancelled;
  console.log(total);

  const data = {
    labels: ["Completed", "Pending", "Cancelled"],
    datasets: [
      {
        data: [completed, pending, cancelled],
        borderWidth: 2,
        borderColor: "#ffffff", // Creates a small gap between segments
        backgroundColor: [
          "#3b82f6", // Modern Blue (Completed)
          "#f59e0b", // Modern Amber (Pending)
          "#ef4444", // Modern Red (Cancelled)
        ],
        hoverOffset: 15,
        borderRadius: 5, // Slightly rounded edges on segments
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%", // Thinner ring for a cleaner look
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#64748b",
          font: {
            size: 12,
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
        titleFont: { weight: "bold" },
      },
    },
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const { top, bottom, left, right } = chart.chartArea;

      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      ctx.save();

      const fontSize = Math.min((bottom - top) / 5, 40);
      ctx.font = `bold ${fontSize}px Inter`;
      ctx.fillStyle = "#1e3a8a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 16px Inter";
      ctx.fillStyle = "#1e3a8a";
      ctx.fillText(total.toString(), centerX, centerY - 10);

      ctx.font = `500 12px Inter`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("TOTAL", centerX, centerY + 10);

      ctx.restore();
    },
  };

  return (
    <div className="relative h-full w-full">
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

export default StatusDonutChart;
