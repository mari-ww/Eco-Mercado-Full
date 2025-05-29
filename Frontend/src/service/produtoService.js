// CORREÇÃO FINAL:
import axios from 'axios';

export const listarProdutos = () => {
  const token = localStorage.getItem('authToken'); // Obtenha o token do login
  
  return axios.get('http://localhost/produtos', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  .then(response => response.data)
  .catch(error => {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  });
};