import { Col } from "react-bootstrap";
import "./product-card.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../app/features/cart/cartSlice";
import banner1 from "../../Images/banner1.jpg";

const ProductCard = ({ title, productItem }) => {
  const dispatch = useDispatch();
  const router = useNavigate();
  const cartList = useSelector((state) => state.cart.cartList);

  // const handleClick = () => {
  //   router(`/shop/${productItem.id}`);
  // };

  const handleAdd = (productItem) => {
    const productInCart = cartList.find((item) => item.id === productItem.id);

    if (productInCart) {
      toast.error("Produto já está no carrinho!");
    } else {
      dispatch(addToCart({ product: productItem, num: 1 }));
      toast.success("Produto adicionado ao carrinho!");
    }
  };

  return (
    <Col md={3} sm={5} xs={10} className="product-card mtop">
  <div className="product-card-inner">
    <div className="product-image">
      <img
        loading="lazy"
        src={productItem.imgUrl || banner1}
        alt={productItem.nome}
      />
    </div>
    <h3 className="product-title">{productItem.nome}</h3>
    <div className="product-price">
      <span>R$ {Number(productItem.preco).toFixed(2)}</span>
      <button
        aria-label="Adicionar"
        type="button"
        className="product-add"
        onClick={() => handleAdd(productItem)}
      >
        <ion-icon name="add"></ion-icon>
      </button>
    </div>
  </div>
</Col>

  );
};

export default ProductCard;
