require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const axios = require('axios');
const CircuitBreaker = require('opossum');
const cors = require('@fastify/cors')

const AUTH_SERVICE = process.env.AUTH_SERVICE?.trim()
const PRODUTOS_SERVICE = process.env.PRODUTOS_SERVICE?.trim()
const CARRINHO_SERVICE = process.env.CARRINHO_SERVICE?.trim()
const PEDIDOS_SERVICE = process.env.PEDIDOS_SERVICE?.trim()
const PORT = process.env.PORT?.trim()

if (!AUTH_SERVICE || !PRODUTOS_SERVICE || !CARRINHO_SERVICE || !PEDIDOS_SERVICE || !PORT) {
  console.error('❌ Variáveis de ambiente faltando!');
  process.exit(1);
}

fastify.log.info('🔍 AUTH_SERVICE = ' + AUTH_SERVICE);

fastify.register(cors, {
  origin: '*', // Permitir tudo em dev, ajuste em produção
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Rotas públicas do auth que NÃO precisam de token
const rotasPublicasAuth = [
  '/auth/login',
  '/auth/test',
  '/auth/health',
];

// Middleware de autenticação para o gateway
fastify.addHook('onRequest', async (request, reply) => {
  // Ignorar rotas públicas do serviço de autenticação
  if (rotasPublicasAuth.includes(request.url)) {
    return;
  }

  const token = request.headers['authorization'];
  if (!token) {
    return reply.code(401).send({ error: 'Token não fornecido' });
  }

  // Aqui você poderia validar o token se quiser, ou apenas repassar
  // Para deixar a verificação para o serviço de auth, só garante que tenha o token
});

// Função genérica para chamar os serviços com circuit breaker
const callServiceWithBreaker = (urlBase, breaker) => async (path = '', headers = {}, method = 'GET', data = null) => {
  const url = `${urlBase}${path || ''}`;
  fastify.log.info(`➡️ Chamando ${url} com método ${method}`);

  const options = {
    method,
    url,
    headers,
    data,
  };
  const response = await axios(options);
  return response.data;
};

// Setup circuit breakers para cada serviço
const authService = callServiceWithBreaker(AUTH_SERVICE, null); // breaker não usado aqui diretamente, criaremos abaixo
const authBreaker = new CircuitBreaker(authService, {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
authBreaker.fallback((error) => {
  console.error('⚠️ Circuit breaker fallback acionado!');
  console.error('Detalhes do erro:', error.message || error);

  return {
    error: 'Serviço de auth indisponível',
    details: error.message || 'Erro desconhecido no fallback'
  };
});

const produtosService = callServiceWithBreaker(PRODUTOS_SERVICE);
const produtosBreaker = new CircuitBreaker(produtosService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
produtosBreaker.fallback(() => ({ error: 'Serviço de produtos indisponível' }));

const carrinhoService = callServiceWithBreaker(CARRINHO_SERVICE);
const carrinhoBreaker = new CircuitBreaker(carrinhoService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
carrinhoBreaker.fallback(() => ({ error: 'Serviço de carrinho indisponível' }));

const pedidosService = callServiceWithBreaker(PEDIDOS_SERVICE);
const pedidosBreaker = new CircuitBreaker(pedidosService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
pedidosBreaker.fallback(() => ({ error: 'Serviço de pedidos indisponível' }));

// Rotas para o serviço de auth

fastify.get('/auth', async (request, reply) => {
  try {
    const data = await authBreaker.fire('', request.headers);
    reply.send(data);
  } catch (err) {
    fastify.log.error('❌ Erro no GET /auth:', err);
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth (GET)', details: err.message });
  }
});

// /auth* GET
fastify.get('/auth*', async (request, reply) => {
  try {
    const path = request.url.replace('/auth', '') || '/';
    const data = await authBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth (GET *)', details: err.message });
  }
});

// /auth* POST
// Rota de login
fastify.post('/auth/login', async (request, reply) => {
  try {
    const { body } = request; // ✅ Fastify já faz o parsing do body
    console.log('➡️ Redirecionando para o auth-service com body:', body);

    const response = await axios.post('http://auth-service:3000/login', body);
    reply.send(response.data);
  } catch (error) {
    console.error('❌ Erro no proxy para o auth-service:', error.message);
    reply.status(503).send({
      error: 'Serviço de auth indisponível',
      details: error.message,
    });
  }
});

// Rotas para produtos
fastify.get('/produtos', async (request, reply) => {
  try {
    const data = await produtosBreaker.fire('', request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar /produtos', details: err.message });
  }
});

fastify.get('/produtos*', async (request, reply) => {
  try {
    const path = request.url.replace('/produtos', '') || '/';
    const data = await produtosBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro no serviço de produtos' });
  }
});

// Rotas para carrinho
fastify.get('/carrinho', async (request, reply) => {
  try {
    const data = await carrinhoBreaker.fire('', request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar /carrinho', details: err.message });
  }
});

fastify.get('/carrinho*', async (request, reply) => {
  try {
    const path = request.url.replace('/carrinho', '') || '/';
    const data = await carrinhoBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço carrinho', details: err.message });
  }
});

// Rotas para pedidos
fastify.get('/pedidos', async (request, reply) => {
  try {
    const data = await pedidosBreaker.fire('', request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar /pedidos', details: err.message });
  }
});

fastify.get('/pedidos*', async (request, reply) => {
  try {
    const path = request.url.replace('/pedidos', '') || '/';
    const data = await pedidosBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço pedidos', details: err.message });
  }
});

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Gateway rodando em ${address}`);
});
