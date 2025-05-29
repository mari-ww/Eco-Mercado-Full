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

fastify.register(cors, {
  origin: '* ', // ou '*' para liberar tudo em dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});


// Middleware de autenticação
fastify.addHook('onRequest', async (request, reply) => {
  if (request.method === 'POST' && request.url === '/auth/login') return;

  
  const token = request.headers['authorization'];
  if (!token) {
    return reply.code(401).send({ error: 'Token não fornecido' });
  }
});


// Adicionando auth_service
const authService = async ({ method = 'GET', path = '', headers = {}, data = {} }) => {
  const url = `${AUTH_SERVICE}${path || '/auth'}`;
  fastify.log.info(`➡️ AUTH URL ${method} ${url}`);
  const response = await axios({ method, url, headers, data });
  return response.data;
};
const authBreaker = new CircuitBreaker(authService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
authBreaker.fallback(() => ({ error: 'Serviço de auth indisponível' }));


fastify.get('/auth', async (request, reply) => {
  try {
    const data = await authBreaker.fire({
      method: 'GET',
      path: '',
      headers: request.headers
    });
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar /auth', details: err.message });
  }
});

fastify.get('/auth*', async (request, reply) => {
  try {
    const path = request.url.replace('/auth', '');
    const data = await authBreaker.fire({
      method: 'GET',
      path,
      headers: request.headers
    });
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth! LASCOU DOIDO', details: err.message });
  }
});
fastify.post('/auth*', async (request, reply) => {
  try {
    const path = request.url.replace('/auth', '');
    const data = await authBreaker.fire({
      method: 'POST',
      path,
      headers: request.headers,
      data: request.body
    });
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth (POST)', details: err.message });
  }
});


// produtos_service
const produtosService = async (path = '', headers) => {
  const url = `${PRODUTOS_SERVICE}${path || '/produtos'}`
  fastify.log.info('➡️ PRODUTOS URL ' + url)
  const response = await axios.get(url, { headers });
  return response.data;
}
const produtosBreaker = new CircuitBreaker(produtosService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
produtosBreaker.fallback(() => ({ error: 'Serviço de produtos indisponível' }));

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
    const path = request.raw.url.replace('/produtos', '');
    const data = await produtosBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço produtos', details: err.message });
  }
});


// carrinho_service
const carrinhoService = async (path = '', headers) => {
  const url = `${CARRINHO_SERVICE}${path || '/carrinho'}`
  fastify.log.info('➡️ CARRINHO URL ' + url)
  const response = await axios.get(url, { headers });
  return response.data;
}
const carrinhoBreaker = new CircuitBreaker(carrinhoService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
carrinhoBreaker.fallback(() => ({ error: 'Serviço de carrinho indisponível' }));

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
    const path = request.raw.url.replace('/carrinho', '');
    const data = await carrinhoBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço carrinho', details: err.message });
  }
});


// pedidos_service
const pedidosService = async (path = '', headers) => {
  const url = `${PEDIDOS_SERVICE}${path || '/pedidos'}`
  fastify.log.info('➡️ PEDIDOS URL ' + url)
  const response = await axios.get(url, { headers });
  return response.data;
}
const pedidosBreaker = new CircuitBreaker(pedidosService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
pedidosBreaker.fallback(() => ({ error: 'Serviço de pedidos indisponível' }));

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
    const path = request.raw.url.replace('/pedidos', '');
    const data = await pedidosBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço pedidos', details: err.message });
  }
});


fastify.listen({ port: PORT , host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Gateway rodando em ${address}`);
});

// Adicionar após as outras rotas de produtos:
fastify.get('/produtos*', async (request, reply) => {
  try {
    const path = request.url.replace('/produtos', '');
    const data = await produtosBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro no serviço de produtos' });
  }
});