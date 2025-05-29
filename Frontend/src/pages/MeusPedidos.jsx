import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const MeusPedidos = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulando múltiplos pedidos
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
    window.scrollTo(0, 0);
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
              {order.products.map((product) => (
                <Row
                  key={product.id}
                  className="align-items-center border-bottom py-3"
                >
                  <Col md={2}>
                    <img
                      src={product.imgUrl}
                      alt={product.productName}
                      className="img-fluid"
                    />
                  </Col>
                  <Col md={6}>
                    <h6>{product.productName}</h6>
                    <p className="mb-0">ID do Produto: {product.id}</p>
                  </Col>
                  <Col md={4}>
                    <p>Status de entrega: <strong>{product.status}</strong></p>
                  </Col>
                </Row>
              ))}
            </div>
          ))
        )}
      </Container>
    </section>
  );
};

export default MeusPedidos;