import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDonutChart({ completed = 0, pending = 0, cancelled = 0 }) {
  const total = completed + pending + cancelled;

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

  // Custom plugin to show text in the center
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.restore();
      const fontSize = (height / 160).toFixed(2);
      ctx.font = `bold ${fontSize}em Inter`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1e3a8a"; // Deep Blue

      const text = total.toString();
      const textX = Math.round(
        (chart.chartArea.left + chart.chartArea.right) / 2 -
          ctx.measureText(text).width / 2,
      );
      const textY = Math.round(
        (chart.chartArea.top + chart.chartArea.bottom) / 2,
      );

      ctx.fillText(text, textX, textY);

      // Subtext "Total"
      ctx.font = `500 ${(height / 350).toFixed(2)}em Inter`;
      ctx.fillStyle = "#94a3b8";
      const subText = "TOTAL";
      const subX = Math.round(
        (chart.chartArea.left + chart.chartArea.right) / 2 -
          ctx.measureText(subText).width / 2,
      );
      ctx.fillText(subText, subX, textY + 20);

      ctx.save();
    },
  };

  return (
    <div className="relative h-full w-full">
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

export default StatusDonutChart;
