import axios from 'axios';

const API_URL = 'http://localhost:3000/pedidos'; // URL do pedidos-service

// Lista todos os pedidos de um usuário
export const listarPedidosPorUsuario = (usuarioId) => {
  return axios.get(`${API_URL}/${usuarioId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Erro ao listar pedidos:', error);
      throw error;
    });
};

// Atualiza o status de um pedido
export const atualizarStatusPedido = (pedidoId, novoStatus) => {
  return axios.put(`${API_URL}/${pedidoId}/status`, { status: novoStatus })
    .then(response => response.data)
    .catch(error => {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    });
};

// Confirma pagamento de um pedido
export const pagarPedido = (pedidoId) => {
  return axios.post(`${API_URL}/${pedidoId}/pagar`)
    .then(response => response.data)
    .catch(error => {
      console.error('Erro ao pagar pedido:', error);
      throw error;
    });
};

// Apaga pedidos pendentes de um usuário
export const apagarPedidosPendentes = (usuarioId) => {
  return axios.delete(`${API_URL}/pendentes/${usuarioId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Erro ao apagar pedidos pendentes:', error);
      throw error;
    });
};
