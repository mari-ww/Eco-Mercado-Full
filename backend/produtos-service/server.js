const express = require('express');
const cors = require('cors');    // importar cors

const path = require('path');

const app = express();

app.use(cors());                // habilitar CORS para todas origens
app.use('/img', express.static(path.join(__dirname, 'img')))
app.options('*', cors());
app.use(express.json());

// Mock de produtos (conforme o frontend)
const produtos = [
  { id: 1, nome: "Escova de dentes", preco: 25, imagem: "/img/escova.jpg" },
  { id: 2, nome: "Sabonete", preco: 80, imagem: "/img/sabonete.jpg" },
  { id: 3, nome: "Kit Skincare", preco: 130, imagem: "/img/maquiagem.jpg" },
  { id: 4, nome: "Esfoliante", preco: 112, imagem: "/img/esfoliante.webp" },
  { id: 5, nome: "Vasilha biodegradavel", preco: 45, imagem: "/img/vasilha.jpg" },
  { id: 6, nome: "Locao", preco: 100, imagem: "/img/locao.jpg" }
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