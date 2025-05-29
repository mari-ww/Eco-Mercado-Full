const express = require('express');
const cors = require('cors');    // importar cors
const app = express();

app.use(cors());                // habilitar CORS para todas origens
app.options('*', cors());
app.use(express.json());

// Mock de produtos (conforme o frontend)
const produtos = [
  { id: 1, nome: "Escova de dentes", preco: 25 },
  { id: 2, nome: "Ecobag", preco: 80 },
  { id: 3, nome: "Kit Skincare", preco: 130 },
  { id: 4, nome: "Esova de cabelo", preco: 112 },
  { id: 5, nome: "Vasilha biodegradavel", preco: 45 },
  { id: 6, nome: "Kit beleza", preco: 100 }
];

// Endpoint para listar produtos
app.get('/produtos', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.setHeader('Vary', 'Authorization'); // Isso é essencial!
  res.json(produtos);
});

app.get('/teste', (req,res)=>{
  res.send("Produtos - Teste!")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {  // Adicione '0.0.0.0'
  console.log(`Serviço de produtos rodando na porta ${PORT}`);
});

// Health Check Simples
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online', service: 'produtos' });
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));