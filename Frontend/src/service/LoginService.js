import axios from 'axios';

const login = async (email, senha, baseUrl) => {
  try {
    const response = await axios.post(`${baseUrl}/login`, {
      email,
      password: senha
    });

    const { token } = response.data;

    localStorage.setItem('token', token);

    return { sucesso: true };
  } catch (error) {
    const msg =
      error.response?.data?.erro || 'Erro ao fazer login. Verifique suas credenciais.';
    return { sucesso: false, erro: msg };
  }
};

export default {
  login
};
