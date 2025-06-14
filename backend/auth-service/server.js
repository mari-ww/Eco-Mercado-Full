const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const prometheus = require('prom-client');

const app = express();

// Configuração do CORS
// const corsOptions = {
//   origin: 'http://localhost:3005',
//   credentials: true,
// };

// ========== CONFIGURAÇÃO PROMETHEUS ==========
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
});

const loginCounter = new prometheus.Counter({
  name: 'auth_login_attempts_total',
  help: 'Total de tentativas de login',
  labelNames: ['status']
});

// Coletar métricas padrão
prometheus.collectDefaultMetrics();

// Middleware para medir tempo das requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Endpoint para métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
// ========== FIM CONFIGURAÇÃO PROMETHEUS ==========

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

// Verifica variáveis de ambiente obrigatórias
if (!process.env.JWT_SECRET) {
  console.error('🛑 ERRO: JWT_SECRET não está definido!');
  process.exit(1);
}

// Mock de usuários
const users = [
  { 
    id: "123", 
    email: "user@teste.com", 
    password: bcrypt.hashSync("senha123", 8) // Mantenha igual
  }
];

// Endpoint de registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios!' });
  }

  // Verifica se o usuário já existe
  const userExists = users.some(u => u.email === email);
  if (userExists) {
    return res.status(409).json({ erro: 'Email já cadastrado!' });
  }

  try {
    // Criptografa a senha
    const hashedPassword = bcrypt.hashSync(password, 8);
    
    // Cria novo usuário
    const newUser = {
      id: Date.now().toString(), // ID simples
      email,
      password: hashedPassword
    };

    users.push(newUser);
    console.log('Novo usuário registrado:', newUser.email);

    res.status(201).json({ 
      mensagem: 'Usuário registrado com sucesso!',
      id: newUser.id
    });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// Endpoint de login
app.post('/login', (req, res) => {
  console.log('Recebido login:', req.body); // LOG PRA DEBUG

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erro: 'Credenciais obrigatórias!' });
  }

  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ erro: 'Credenciais inválidas!' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'segredo',
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Endpoint único de validação
app.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ valido: false, erro: 'Token ausente' });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ valido: false, erro: 'Formato inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      valido: true,
      usuario: {
        id: decoded.id,
        email: decoded.email,
        expiracao: new Date(decoded.exp * 1000)
      }
    });
  } catch (err) {
    res.status(403).json({ 
      valido: false,
      erro: 'Token inválido',
      detalhes: err.message
    });
  }
});


// Middleware de autenticação reutilizável
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return res.status(401).json({ erro: 'Token ausente' });

  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.user = decoded;
    next();
  });
};

// Rota protegida de exemplo
app.get('/protegido', authenticateToken, (req, res) => {
  res.json({
    mensagem: 'Acesso autorizado',
    usuario: req.user
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check executado');
  res.status(200).json({ status: 'online' });
});

// Supondo que você esteja usando Express
app.get('/test', (req, res) => {
  res.json({ message: 'Serviço de autenticação está funcionando!' });
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado no auth-service:', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});


// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔐 Auth service rodando na porta ${PORT}`);
});