// Importando pacotes necessários
const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const request = require('supertest');

const app = express();
app.use(express.json());

const SECRET_KEY = "secreto123";
let users = [];

// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API com JWT e Swagger",
            version: "1.0.0",
            description: "API para gerenciar usuários com autenticação JWT.",
        },
        servers: [{ url: "http://localhost:3000" }]
    },
    apis: ["./server.js"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Acesso negado! Token não fornecido." });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido." });
        req.user = user;
        next();
    });
}

// Rota para gerar token
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Gera um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "123456") {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ error: "Credenciais inválidas" });
});

// Rota GET - Listar usuários (Protegida por JWT)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna a lista de usuários cadastrados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});

// Rota POST - Criar usuário
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
app.post('/users', (req, res) => {
    const { nome, email } = req.body;
    const id = users.length + 1;
    const newUser = { id, nome, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Rota PUT - Atualizar usuário
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;
    const user = users.find(u => u.id == id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    user.nome = nome;
    user.email = email;
    res.json(user);
});

// Rota DELETE - Remover usuário
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuário removido com sucesso
 */
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    users = users.filter(u => u.id != id);
    res.status(204).send();
});

// Iniciando o servidor
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));

module.exports = app;
