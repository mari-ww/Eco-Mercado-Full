import { Col } from "react-bootstrap";
import "./product-card.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../app/features/cart/cartSlice";
import banner1 from "../../Images/banner1.jpg";
import React, { useState } from "react";
const ProductCard = ({ title, productItem }) => {
  const productsStockRaw = localStorage.getItem("productsStock");
  const productsStock = productsStockRaw ? JSON.parse(productsStockRaw) : {};
  const initialQtde = productsStock[productItem.id] !== undefined
    ? productsStock[productItem.id]
    : (productItem.qtde !== undefined ? productItem.qtde : 30);

  const [qtdeDisponivel, setQtdeDisponivel] = React.useState(initialQtde);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const updatedStockRaw = localStorage.getItem("productsStock");
    const updatedStock = updatedStockRaw ? JSON.parse(updatedStockRaw) : {};
    if (updatedStock[productItem.id] !== undefined) {
      setQtdeDisponivel(updatedStock[productItem.id]);
    }
  }, [productItem.id]);

  const handleAdd = (productItem) => {
    if (qtdeDisponivel > 0) {
      dispatch(addToCart({ product: productItem, num: 1 }));
      toast.success("Produto adicionado ao carrinho!");
      // NÃO diminui estoque aqui — só no momento da compra
    } else {
      toast.warn("Produto esgotado!");
    }
  };
  const imagePath = productItem.imagem ? productItem.imagem.replace(/^\/img\//, '') : null;

  return (
    <Col md={3} sm={5} xs={10} className="product-card mtop">
      <div className="product-card-inner">
        <div className="product-image">
          <img
            loading="lazy"
            src={imagePath ? `http://localhost:3001/img/${imagePath}` : banner1}
            alt={productItem.nome}
          />
        </div>
        <h3 className="product-title">{productItem.nome}</h3>
        <p className="product-qtde">Disponível: {qtdeDisponivel}</p>

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
