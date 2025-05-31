import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQty,
  deleteProduct,
  clearCart,
} from "../app/features/cart/cartSlice";
import { criarPagamento } from "../service/PagamentoService"; // Corrigido import
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';


const Cart = () => {
  const { cartList } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const totalPrice = cartList.reduce(
    (price, item) => price + item.qty * item.preco,
    0
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  const handlePurchase = async () => {
    const fakeOrderId = `ORDER-${Math.floor(Math.random() * 100000)}`;
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
  
    const newOrder = {
      id: fakeOrderId,
      products: cartList.map((item) => ({
        ...item,
        status: "Pendente",
      })),
      total: totalPrice,
    };
  
    try {
      const response = await criarPagamento({
        pedidoId: fakeOrderId,
        valor: totalPrice,
        status: "pendente",
      });
  
      // SweetAlert de sucesso
      await Swal.fire({
        title: 'Compra realizada com sucesso!',
        html: `ID do Pedido: <strong>${fakeOrderId}</strong>`,
        icon: 'success',
        confirmButtonText: 'Ver Status do Pedido',
      });
  
      // Salvar localmente e navegar
      localStorage.setItem("orders", JSON.stringify([...savedOrders, newOrder]));
      dispatch(clearCart());
      navigate("/meus-pedidos", { state: { orderId: fakeOrderId } });
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      if (error.response) {
        Swal.fire("Erro", error.response.data.error || "Erro ao processar pagamento. Tente novamente.", "error");
      } else {
        Swal.fire("Erro", "Erro de rede ou backend indisponível.", "error");
      }
    }
  };
  
  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            {cartList.length === 0 && (
              <h1 className="no-items product">Nenhum item adicionado ao carrinho</h1>
            )}
            {cartList.map((item) => {
              const productQty = item.preco * item.qty;
              return (
                <div className="cart-list" key={item.id}>
                  <Row>
                    <Col className="image-holder" sm={4} md={3}>
                    <img
  loading="lazy"
  src={item.imagem ? `http://localhost:3001/img/${item.imagem.replace(/^\/img\//, '')}` : "/default-img.png"}
  alt={item.nome}
/>

                    </Col>
                    <Col sm={8} md={9}>
                      <Row className="cart-content justify-content-center">
                        <Col xs={12} sm={9} className="cart-details">
                          <h3>{item.nome}</h3>
                          <h4>
                            R${item.preco}.00 × {item.qty}
                            <span> = R${productQty}.00</span>
                          </h4>
                        </Col>
                        <Col xs={12} sm={3} className="cartControl">
                          <button
                            className="incCart"
                            onClick={() =>
                              dispatch(addToCart({ product: item, num: 1 }))
                            }
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button
                            className="desCart"
                            onClick={() => dispatch(decreaseQty(item))}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        </Col>
                      </Row>
                    </Col>
                    <button
                      className="delete"
                      onClick={() => dispatch(deleteProduct(item))}
                    >
                      <ion-icon name="close"></ion-icon>
                    </button>
                  </Row>
                </div>
              );
            })}
          </Col>

          <Col md={4}>
            <div className="cart-total">
              <h2>Resumo da Compra</h2>
              <div className="d_flex">
                <h4>Preço Total:</h4>
                <h3>R${totalPrice}.00</h3>
              </div>
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={handlePurchase}
                disabled={cartList.length === 0}
              >
                Comprar Produto
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
