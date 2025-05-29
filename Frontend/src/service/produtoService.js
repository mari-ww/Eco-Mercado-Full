import axios from 'axios';

const API_URL = 'http://localhost:8080/produtos';

export const listarProdutos = () => {
  return axios.get(API_URL)
    .then(response => response.data)
    .catch(error => {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    });
};
