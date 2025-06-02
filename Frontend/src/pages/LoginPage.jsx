// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import LoginService from "../service/LoginService";
import bannerImage from "../Images/logologin.jpg"; // Caminho da imagem
import Swal from "sweetalert2";
import "./login.css";


const BACKEND_URL = "http://localhost:3004";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

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
      localStorage.setItem('userEmail', email);
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
    <div className="login-page-wrapper">
      <div
        className="login-left"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
      
      </div>

      <div className="login-right">
        <h2>Bem-vindo!</h2>
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

          <Button variant="success" type="submit" className="w-100">
          Entrar
          </Button>

          <div className="text-center mt-3">
          <Link to="/register">Não tem conta? Registre-se</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
