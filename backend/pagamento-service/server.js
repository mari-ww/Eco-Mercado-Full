const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa o cors
const { publicarPagamento } = require('./publisher'); // Importa a função do publisher.js
const prometheus = require('prom-client');

const app = express();

// Habilitar CORS para permitir chamadas do frontend (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// ========== CONFIGURAÇÃO PROMETHEUS ==========
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
});

const paymentCounter = new prometheus.Counter({
  name: 'payment_operations_total',
  help: 'Total de operações de pagamento',
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

// Rota para receber o pedido do frontend
app.post('/api/pagamento', async (req, res) => {
    const { pedidoId, valor, status } = req.body;
    try {
        await publicarPagamento({ pedidoId, valor, status }); // Publica na fila RabbitMQ
        res.status(200).json({ message: 'Pagamento enviado para processamento!' });
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});

// Inicia o servidor
app.listen(4001, () => {
    console.log('Servidor do pagamento rodando na porta 4001');
});
