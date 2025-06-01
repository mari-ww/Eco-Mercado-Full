import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const MeusPedidos = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Pega os pedidos do localStorage
    const userEmail = localStorage.getItem("userEmail");
    const allOrders = JSON.parse(localStorage.getItem("ordersByUser")) || {};
    const storedOrders = allOrders[userEmail] || [];
    
    // Clona os pedidos para manipular localmente o status
    const ordersClone = storedOrders.map(order => ({
      ...order,
      products: order.products.map(product => ({
        ...product,
        status: product.status || "pendente"
      }))
    }));

    setOrders(ordersClone);
    window.scrollTo(0, 0);

    // Timer para atualizar o status de todos os produtos para "Saiu para a entrega" após 5 segundos
    const timer = setTimeout(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          products: order.products.map(product => ({
            ...product,
            status: "Saiu para a entrega"
          }))
        }))
      );
    }, 5000);

    // Cleanup para evitar memory leak caso o componente seja desmontado
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="meus-pedidos">
      <Container>
        <h2 className="mb-4">Meus Pedidos</h2>
        {orders.length === 0 ? (
          <h4>Você ainda não fez nenhum pedido.</h4>
        ) : (
          orders.map((order, index) => (
            <div className="pedido mb-5" key={index}>
              <h5>ID do Pedido: {order.id}</h5>
              {order.products.map((product) => {
  console.log(product);
  return (
    <Row key={product.id} className="align-items-center border-bottom py-3">
      <Col md={2}>
        <img
          src={product.imagem ? `http://localhost:3001/img/${product.imagem}` : '/default-img.png'}
          alt={product.nome}
          className="img-fluid"
        />
      </Col>
      <Col md={6}>
        <h6>{product.nome}</h6>
        <p className="mb-0">ID do Produto: {product.id}</p>
      </Col>
      <Col md={4}>
        <p>Status de entrega: <strong>{product.status}</strong></p>
      </Col>
    </Row>
  );
})}

            </div>
          ))
        )}
      </Container>
    </section>
  );
};

export default MeusPedidos;
