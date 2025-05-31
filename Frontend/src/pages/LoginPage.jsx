// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react"; // Corrigido aqui
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate, Link  } from "react-router-dom";
import LoginService from '../service/LoginService';  // <- aqui o import
import "./login.css";
import Swal from 'sweetalert2';


const BACKEND_URL = "http://localhost:3004" // ou outra URL do seu backend

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

    // Redireciona se já estiver logado
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
  
    const resultado = await LoginService.login(email, password, BACKEND_URL);
  
    if (resultado.sucesso) {
      localStorage.setItem('isLoggedIn', 'true');
      window.dispatchEvent(new Event('storage'));
        Swal.fire({
        title: 'Login realizado!',
        text: `Bem-vindo, ${email}!`,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate("/home");
      });
  
    } else {
      setErrorMsg(resultado.erro);
    }
  };

  return (
    <Container className="login-container">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="login-form">
            <h2>Login</h2>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Entrar
              </Button>

              <div className="text-center mt-3">
                <Link to="/register">Não tem conta? Registre-se</Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
