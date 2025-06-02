// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import RegisterService from "../service/RegisterService";
import "./login.css";
import bannerImage from "../Images/logologin.jpg"; // mesmo banner da tela de login

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem!");
      return;
    }

    const result = await RegisterService.register(email, password);

    if (result.success) {
      setSuccessMsg("Conta criada com sucesso! Redirecionando para login...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setErrorMsg(result.error);
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
        <h2>Criar Conta</h2>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <Form onSubmit={handleRegister}>
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

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirme a Senha</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100">
            Registrar
          </Button>

          <div className="text-center mt-3">
            <Link to="/login">Já tem uma conta? Faça login</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
