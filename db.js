const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco de dados SQLite
const dbPath = path.resolve(__dirname, 'testebanco.db');

// Cria ou abre a conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conexão bem-sucedida com o banco de dados');
  }
});

// Função para criar a tabela de usuários (execute apenas uma vez)
const createTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nome TEXT,
      email TEXT,
      senha TEXT,
      telefones TEXT,
      dataCriacao TEXT,
      dataAtualizacao TEXT,
      ultimoLogin TEXT,
      token TEXT
    );
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela de usuários:', err.message);
    } else {
      console.log('Tabela de usuários criada com sucesso');
    }
  });
};

// Executa a função para criar a tabela (chame apenas uma vez)
createTable();

// Exporta a instância do banco de dados para ser usada em outros arquivos
module.exports = db;


