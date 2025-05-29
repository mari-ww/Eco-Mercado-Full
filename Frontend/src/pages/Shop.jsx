import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { listarProdutos } from "../service/produtoService"; // pra buscar produto no backend

const Shop = () => {
  const { id } = useParams(); // pega o id da URL
  const [produto, setProduto] = useState(null);

  useEffect(() => {
    // Buscar todos produtos e filtrar pelo id
    listarProdutos()
      .then((produtos) => {
        const produtoSelecionado = produtos.find(p => p.id === Number(id));
        setProduto(produtoSelecionado);
      })
      .catch((err) => console.error("Erro ao buscar produto:", err));
  }, [id]);

  if (!produto) {
    return <p>Carregando produto...</p>;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <img
            src={produto.imgUrl}
            alt={produto.nome}
            style={{ width: "100%", objectFit: "cover" }}
          />
        </Col>
        <Col md={6}>
          <h1>{produto.nome}</h1>
          <h3>Preço: R$ {produto.preco}</h3>
          {/* Aqui você pode adicionar mais detalhes do produto */}
        </Col>
      </Row>
    </Container>
  );
};

export default Shop;
