// src/services/PagamentoService.js
import axios from 'axios';

const API_URL = 'http://localhost:4001/api/pagamento'; // URL do pagamento-service

export const criarPagamento = ({ pedidoId, valor, status }) => {
  return axios.post(API_URL, { pedidoId, valor, status })
    .then(response => response.data)
    .catch(error => {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    });
};

