const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
app.use(express.json());

// Lista de usuários na memória
let users = [];

// Rota GET /users - Retorna a lista de usuários
app.get('/users', (req, res) => {
    res.json(users);
});

// Rota POST /users - Adiciona um novo usuário
app.post('/users', (req, res) => {
    const { nome, email } = req.body;
    if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    const newUser = { id: uuidv4(), nome, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Rota PUT /users/:id - Atualiza os dados de um usuário pelo ID
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    users[userIndex] = { ...users[userIndex], nome, email };
    res.json(users[userIndex]);
});

// Rota DELETE /users/:id - Remove um usuário pelo ID
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    users.splice(userIndex, 1);
    res.status(204).send();
});

// Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
