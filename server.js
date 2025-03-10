require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Lista de usuários (simulação de banco de dados)
let users = [];

// Usuário fictício para login
const adminUser = {
    id: "1",
    username: "admin",
    password: "123456"
};

// Middleware para verificar autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Acesso negado! Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token inválido ou expirado." });
    }
};

// Rota de login (gera um token JWT)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== adminUser.username || password !== adminUser.password) {
        return res.status(401).json({ error: "Credenciais inválidas!" });
    }

    const token = jwt.sign({ id: adminUser.id, username: adminUser.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// Rota protegida: GET /users (apenas usuários autenticados podem acessar)
app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});

// Rota POST /users - Adiciona um novo usuário
app.post('/users', (req, res) => {
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    }

    const newUser = { id: uuidv4(), nome, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Rota PUT /users/:id - Atualiza os dados de um usuário pelo ID
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;

    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
    }

    user.nome = nome || user.nome;
    user.email = email || user.email;

    res.json(user);
});

// Rota DELETE /users/:id - Remove um usuário pelo ID
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Usuário não encontrado." });
    }

    users.splice(index, 1);
    res.status(204).send();
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
