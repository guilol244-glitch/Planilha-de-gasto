const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
    host : 'localhost',
    user :process.env.DB_USER ||'root',
    password : process.env.DB_PASS || '23/06/2008',
    database : 'planilha',
    waitForConnections : true,
    connectionLimit : 10
});
db.connect(err => {
    if (err) throw err;
    console.log('conectado ao MySQL!');
});

//Metodo de salvar
app.post('/salvar', (req, res) => {
    const  valores  = req.body.valores;
    if (!Array.isArray(valores))
        return res.status(400).send({error : 'valores must be array'});

    const mes = new Date().getMonth() + 1;
    const ano = new Date().getFullYear();

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
    }

//Limpar os dados do mês anterior antes de inserir
await conn.query('DELETE FROM entradas WHERE mes = ? AND ano = ?', [mes, ano]);

//Inserir valores novos
const sql = 'INSERT INTO entradas (valor, mes, ano) VALUES ?';
const valoresFormatados = valores.map(v => [v, mes, ano]);
db.query(sql, [valoresFormatados], err2 => {
    if (err2) throw err2;
    res.send({message : 'Dados salvo com sucesso!'});
});
});
});

//Metodo de carregar

app.get('/carregar', (req, res) => {
    const mes = new Date().getMonth() + 1;
    const ano = new Date().getFullYear();

    db.query('SELECT valor FROM entradas WHERE mes = ? AND ano = ?', [mes, ano], (err, resultados) => {
    if (err) throw err;
    res.send(resultados.map(r => r.valor))
});
});
app.listen(3000, () => console.log('servidor rodando em http://localhost:3000'));
