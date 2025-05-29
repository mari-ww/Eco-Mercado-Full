import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css";

// Registro dos módulos do Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Dashboard = () => {
  const cartList = useSelector((state) => state.cart?.cartList ?? []);
  const [chartData, setChartData] = useState(null); // null inicialmente

  useEffect(() => {
    if (!Array.isArray(cartList)) return;

    const productNames = cartList.map((item) => item.productName);
    const productQuantities = cartList.map((item) => item.qty);

    setChartData({
      labels: productNames,
      datasets: [
        {
          label: "Quantidade por produto",
          data: productQuantities,
          backgroundColor: "rgba(75,192,192,0.6)",
        },
      ],
    });
  }, [cartList]);

  // Verificação de carregamento
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return <p>Carregando dados do gráfico...</p>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="chart-wrapper">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Produtos no Carrinho",
              },
            },
          }}
        />
      </div>
    </div>
  );
  
};

export default Dashboard;
