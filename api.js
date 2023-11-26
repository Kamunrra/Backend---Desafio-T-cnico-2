require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./db'); // Caminho para o arquivo db.js
const cors = require('cors'); // Adicionando o middleware CORS

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// Configurar o middleware CORS
app.use(cors());

// Middleware para verificar a autenticação por token
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token ausente');
    return res.status(401).json({ mensagem: 'Não autorizado' });
  }

  jwt.verify(token, 'abc123', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Token expirado:', err.message);
        return res.status(403).json({ mensagem: 'Sessão inválida' });
      } else if (err.name === 'JsonWebTokenError') {
        console.log('Token inválido:', err.message);
        return res.status(401).json({ mensagem: 'Não autorizado' });
      }
    }
    req.user = user;
    next();
  });
};



// Endpoint para cadastro de usuário (Sign Up)
app.post('/signup', async (req, res) => {
  try {
    const { nome, email, senha, telefones = [{ numero: '', ddd: '' }] } = req.body;

    // Verificar se todas as informações necessárias foram fornecidas
    if (!nome || !email || !senha || telefones.some(t => !t.numero || !t.ddd)) {
      console.log('Dados insuficientes para o cadastro');
      return res.status(400).json({ mensagem: 'Dados insuficientes para o cadastro' });
    }

    // Verificar se o e-mail já está cadastrado
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
          console.error('Erro ao verificar e-mail:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (existingUser) {
      console.log('E-mail já existente:', email);
      return res.status(400).json({ mensagem: 'E-mail já existente' });
    }

    const id = uuidv4();
    const dataCriacao = new Date().toISOString();
    const dataAtualizacao = new Date().toISOString();
    const ultimoLogin = new Date().toISOString();

    // Criptografar a senha usando bcryptjs
    const hashedPassword = await bcrypt.hash(senha, 10);
    const token = jwt.sign({ id, email }, 'abc123', { expiresIn: '30m' });

    const newUser = {
      id,
      nome,
      email,
      senha: hashedPassword,
      telefones: JSON.stringify(telefones),
      dataCriacao,
      dataAtualizacao,
      ultimoLogin,
      token,
    };

    // Inserir novo usuário no banco de dados
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        Object.values(newUser),
        (err) => {
          if (err) {
            console.error('Erro ao inserir usuário no banco de dados:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Saída (sucesso) do cadastro
    const cadastroSucesso = {
      id: newUser.id,
      data_criacao: newUser.dataCriacao,
      data_atualizacao: newUser.dataAtualizacao,
      ultimo_login: newUser.ultimoLogin,
      token: newUser.token,
    };

    console.log('Novo usuário cadastrado:', cadastroSucesso);
    return res.json(cadastroSucesso);
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ mensagem: `Erro interno do servidor: ${error.message}` });
  }
});

// Endpoint para autenticação de usuário (Sign In)
app.post('/signin', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se todos os dados necessários foram fornecidos
    if (!email || !senha) {
      console.log('Dados insuficientes para a autenticação');
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    // Encontrar o usuário pelo e-mail
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
          console.error('Erro ao verificar e-mail:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (!existingUser || !(await bcrypt.compare(senha, existingUser.senha))) {
      console.log('Usuário e/ou senha inválidos:', email);
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    existingUser.ultimoLogin = new Date();

   
    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      'abc123',
      { expiresIn: '30m' }
    );

    existingUser.token = token;

    // Saída (sucesso) da autenticação
    const autenticacaoSucesso = {
      id: existingUser.id,
      data_criacao: existingUser.dataCriacao,
      data_atualizacao: existingUser.dataAtualizacao,
      ultimo_login: existingUser.ultimoLogin,
      token: existingUser.token,
    };

    // Exibindo o token no console
    console.log('Token JWT:', autenticacaoSucesso.token);

    res.json(autenticacaoSucesso);
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});

// Endpoint para buscar informações do usuário (requer autenticação)
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar usuário diretamente do banco de dados usando o módulo db
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
          console.error('Erro ao buscar usuário no banco de dados:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (!user) {
      console.log('Usuário não encontrado:', userId);
      res.status(404).json({ mensagem: "Usuário não encontrado" });
      return;
    }

    // Exibir o token no console
    console.log('Token:', JSON.stringify(req.user));

    res.json(user);
  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});


// Adicione o novo endpoint GET para a raiz do servidor
app.get('/', (req, res) => {
  res.send('Bem-vindo à minha API!');
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
