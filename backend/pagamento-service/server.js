const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa o cors
const { publicarPagamento } = require('./publisher'); // Importa a função do publisher.js

const app = express();

// Habilitar CORS para permitir chamadas do frontend (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

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
