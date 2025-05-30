import axios from 'axios';

const register = async (email, password) => {
  try {
    const response = await axios.post('http://localhost/auth/register', {
      email,
      password
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.erro || 'Erro ao registrar' 
    };
  }
};

export default { register };