import { Fragment, useEffect, useState } from "react";

import Section from "../components/Section";
import SliderHome from "../components/Slider";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { listarProdutos } from "../service/produtoService";

const Home = () => {
  const [produtos, setProdutos] = useState([]);

  useWindowScrollToTop();

  useEffect(() => {
    listarProdutos()
      .then((produtos) => {
        console.table(produtos);
        setProdutos(produtos);
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos do backend:", err);
      });
  }, []);

  return (
    <Fragment>
      <SliderHome />

      <Section
        title="Itens"
        bgColor="#f6f9fc"
        productItems={produtos}
      />
    </Fragment>
  );
};

export default Home;
