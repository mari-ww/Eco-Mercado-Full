require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const { request } = require('undici');
const CircuitBreaker = require('opossum');
const cors = require('@fastify/cors');

const AUTH_SERVICE = process.env.AUTH_SERVICE?.replace(/[^\x20-\x7E]/g, '').trim();
const PRODUTOS_SERVICE = process.env.PRODUTOS_SERVICE?.trim();
const CARRINHO_SERVICE = process.env.CARRINHO_SERVICE?.trim();
const PEDIDOS_SERVICE = process.env.PEDIDOS_SERVICE?.trim();
const PORT = process.env.PORT?.trim();

if (!AUTH_SERVICE || !PRODUTOS_SERVICE || !CARRINHO_SERVICE || !PEDIDOS_SERVICE || !PORT) {
  console.error('❌ Variáveis de ambiente faltando!');
  process.exit(1);
}

fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

const rotasPublicasAuth = [
  '/auth/login',
  '/auth/test',
  '/health',
  '/auth/health',
];

fastify.addHook('onRequest', async (request, reply) => {
  if (rotasPublicasAuth.includes(request.url)) {
    return;
  }

  const token = request.headers['authorization'];
  if (!token) {
    return reply.code(401).send({ error: 'Token não fornecido' });
  }
});


async function callService(baseURL, path = '', method = 'GET', headers = {}, data = null) {
  const url = `${baseURL}${path || ''}`;
  const options = {
    method,
    headers: { ...headers },
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    const bodyString = JSON.stringify(data);
    options.body = bodyString;

    options.headers['content-type'] = 'application/json';
    // NÃO DEFINA content-length manualmente!
    // undici cuida disso automaticamente
  }

  const { body, statusCode } = await request(url, options);
  const responseText = await body.text();

  if (statusCode >= 400) {
    throw new Error(`Erro ${statusCode}: ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { raw: responseText };
  }
}


function createServiceBreaker(baseURL, fallbackMessage) {
  const serviceFn = async (path, headers = {}, method = 'GET', data = null) => {
    fastify.log.info({
      message: '⚙️ Params recebidos pelo breaker',
      path,
      method,
      headers,
      data
    });

    const url = `${baseURL}${path || ''}`;
    fastify.log.info(`➡️ Chamando ${url} com método ${method}`);

    return await callService(baseURL, path, method, headers, data);
  };

  const breaker = new CircuitBreaker(serviceFn, {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
  });

  breaker.fallback((error) => {
    fastify.log.warn(`🔌 Fallback ativado: ${fallbackMessage} - ${error?.message}`);
    return {
      error: fallbackMessage,
      details: error?.message || 'Erro desconhecido',
    };
  });

  return breaker;
}

// Criar breakers para todos os serviços
const authBreaker = createServiceBreaker(AUTH_SERVICE, 'Serviço de auth indisponível');
const produtosBreaker = createServiceBreaker(PRODUTOS_SERVICE, 'Serviço de produtos indisponível');
const carrinhoBreaker = createServiceBreaker(CARRINHO_SERVICE, 'Serviço de carrinho indisponível');
const pedidosBreaker = createServiceBreaker(PEDIDOS_SERVICE, 'Serviço de pedidos indisponível');

// Rotas de Auth
fastify.get('/health', async (request, reply) => {
  reply.send({ status: 'ok' });
});



fastify.get('/auth', async (request, reply) => {
  try {
    const data = await authBreaker.fire({
  path: '/login',
  headers: request.headers,
  method: 'POST',
  data: request.body
});

    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth (GET)', details: err.message });
  }
});

fastify.get('/auth*', async (request, reply) => {
  try {
    const path = request.url.replace('/auth', '') || '/';
    const data = await authBreaker.fire(path, request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth (GET *)', details: err.message });
  }
});

fastify.post('/auth/register', async (request, reply) => {
  try {
    const response = await authBreaker.fire('/register', {
      'Content-Type': 'application/json',
    }, 'POST', 
      request.body
    );
    reply.send(response);
  } catch (err) {
    reply.code(503).send({ 
      error: 'Erro ao registrar usuário', 
      details: err.message 
    });
  }
});

fastify.post('/auth/login', async (request, reply) => {
  
  fastify.log.info({ body: request.body });
  try {
    const response = await authBreaker.fire('/login', {
      'Content-Type': 'application/json',
    }, 'POST', 
      request.body
    );
    // http://auth-service:3000/login
    reply.send(response);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar o serviço auth (POST /login)', details: err.message });
  }
});

fastify.get('/produtos', async (request, reply) => {
  try {
    // Chamar /produtos no serviço produtos
    const data = await produtosBreaker.fire('/produtos', request.headers);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro ao acessar /produtos', details: err.message });
  }
});

// fastify.get('/produtos*', async (request, reply) => {
//   try {
//     let path = request.url.replace('/produtos', '');
//     if (!path) path = '/produtos'; // Garantir path válido

//     const data = await produtosBreaker.fire(path, request.headers);
//     reply.send(data);
//   } catch (err) {
//     reply.code(503).send({ error: 'Erro no serviço de produtos', details: err.message });
//   }
// });

fastify.get('/produtos*', async (request, reply) => {
  try {
    const path = request.url.replace('/produtos', '') || '/    produtos';
    const data = await produtosBreaker.fire(path, request.headers);

    reply.send(data);
  } catch (err) {
    reply.code(503).send({ error: 'Erro no serviço de produtos', details: err.message });
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
