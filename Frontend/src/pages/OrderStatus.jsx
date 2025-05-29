import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASES from "../apiConfig";

const OrderStatus = () => {
  const location = useLocation();
  const { orderId } = location.state || {}; 
  const [status, setStatus] = useState("Processando...");

  useEffect(() => {
    if (!orderId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASES.rastreamento}/${orderId}`);
        const data = await response.json();
        setStatus(data.status);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
        setStatus("Erro ao consultar status.");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Status do Pedido</h1>
      <p>ID do Pedido: {orderId || "N/A"}</p>
      <p>Status Atual: <strong>{status}</strong></p>
    </div>
  );
};

export default OrderStatus;
