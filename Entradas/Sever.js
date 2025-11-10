// Adiciona os requerimentos do servidor
const express = require('express');  //Framework web, criar o servidor HTTP
const mysql = require('mysql2/promise'); //banco de dados, conecta ao mysql usando async/await
const cors = require('cors'); //Segurança, libera o acesso entre dominios
const bcrypt = require('bcrypt');  //Segurança, criptografa senhas
const jwt = require('jsonwebtoken'); //Autenticação, gera e valida tokens de login

const app = express(); //Servidor, inicializa o Express
app.use(express.json()); //Middleware, lê requisições em JSON
app.use(cors()); //Middleware, libera o acesso entre dominios
const SECRET = 'chave_super_segura'; //Segurança, chave assinatura JWT

const pool = mysql.createPool({  //conecção geral com o Banco de dados
  host: 'localhost', //onde o banco está hospedado
  user: 'root', //o Usuario do banco
  password: '23/06/2008', //A senha do banco
  database: 'planilha', //O nome do banco
});

app.post('/cadastro', async (req, res) => {  //cria um post para cadastro de usuario || Req = requisição || Res = resposta 
  const { email, senha} = req.body; //pega email e senha do corpo da requisição

  if (!email || !senha) return res.status(400).send({error : 'Preencha o email e sennha'}); //Se email ou senha vazio, retorna erro 400

  const hash = await bcrypt.hash(senha,10);  //criptografa a senha com bcrypt (basicamente embaralha a senha, nao sendo possivel identificar)

  try {
    const conn = await pool.getConnection(); //cria a conexão com o banco
    await conn.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hash]);  //insere email e senha criptografada ( no caso o hash) no banco
    conn.release(); //libera a conexão com o banco
    res.send({ message : 'usuario cadastrado com sucesso!' }); //retorna mensagem de sucesso
  } 
  catch (error) {  //se der erro, retorna erro 400
    res.status(400).send({ error : 'Email ja cadastrado ou erro no servidor'}); //mensagem de erro
  }
});

app.post('/login', async (req, res) => { //Cria um post de login, onde ira pegar informações do Banco de dado e entregar ao HTML
  const { email, senha } = req.body;

  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]); //Ele faz um consulta no my sql, se o email digitado existe no DB, o "?" evita ataques no mysql, o Await espera a consultar terminar antes de continuar e o resultado ve, em rows que é a lista de resultados
  if (rows.length === 0) return res.status(400).send({error : 'Usuario não encontrado'}); //caso o email digitado não estaja correto

  const user = rows[0]; //Caso encontre o usuario, ele mudara para primeira posição do array
  const senhaCorreta = await bcrypt.compare(senha, user.senha); //compara se a senha esta correta, utilizando o has

  if (!senhaCorreta) return res.status(401).send({error : 'Senha incorreta'}); //se a senha não estiver correta

  const token = jwt.sign({ id : user.id, email : user.email }, SECRET, {expiresIn : '24h'});  //se a senha estiver correta, o sever gera um token, é um "passe digital" que identifica o usuário, ele é identificado como uma variável SECRET e o expiresIn : 24h caso passe 24 horas o usuario tera que fazer login novamente

  res.send({message : 'Login realizado com sucesso', token });   //Envia a mensagem de login
});

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization; //Quado o Front-end fazer um requisição, envia o token no cabeçalho do ip
  if (!authHeader) return res.status(401).send({error : 'Token não fornecido'}); //Se nao existe o cabeçalho Authorization, o sever entende que ninguem esta logado

  const [, token] = authHeader.split(' ');  //O cabeçalho vem no formato:"Bearer <token>" O método .split(' ') divide a string em duas partes
       
  try {  //começa o processo de verificação do token
    const decoded = jwt.verify(token, SECRET); //confere se o token foi gerado com a mesma chave secreta
    req.userId = decoded.id; //Guarda o id do usário
    next(); //quer dizer que esta ok, e pode avançar para a proxima etapa
  } catch (err) {
    res.status(401).send({error : 'Token invalido ou expirado'}); //caso seja falso, houve alguma infração
  }
}
app.post('/salvar', autenticar, async (req, res) => { //Cria um post com o metodo salvar
  const { valores } = req.body; //ira pegar valores escritos
  const userId = req.userId; // vem do token JWT
  const mes = new Date().getMonth() + 1; //ira pegar o mes mas como começa com 0 coloca mais 1 no array
  const ano = new Date().getFullYear(); //ira pegar o ano

  const conn = await pool.getConnection();  //ira criar uma conexão com o DB
  try {
    await conn.beginTransaction(); //inicia uma transação, ira garantir que todas operação são salvas ou não
    await conn.query('DELETE FROM entradas WHERE mes = ? AND ano = ? AND user_id = ?', [mes, ano, userId]); //ira deletar os dados antigos

    const rows = valores.map((v, i) => [userId, v, mes, ano, i + 1]);  //Aqui cria um matriz com os dados que serão inseridos
    await conn.query('INSERT INTO entradas (user_id, valor, mes, ano, posicao) VALUES ?', [rows]); //ira colocar dados novos
    await conn.commit(); //confirma a transação
    res.send({ message: 'Dados salvos!' });
  } catch (err) {  //caso de erro
    await conn.rollback(); //Ele ira desfazer tudo
    res.status(500).send({ error: 'Erro ao salvar' });
  } finally {
    conn.release();  //libera a conexão e volta pra o pool
  }
});

 app.get('/carregar', autenticar, async (req, res) => {  //cria um metodo get cara carregar os dados
  const userId = req.userId;  //cria uma constante do usuario, que requer o id do usuario
  const mes = new Date().getMonth() + 1; //ira pegar o mes mas como começa com 0 coloca mais 1 no array
  const ano = new Date().getFullYear(); //ira pegar o ano

  const [rows] = await pool.query( //ira criar um array
    'SELECT valor FROM entradas WHERE user_id = ? AND mes = ? AND ano = ? ORDER BY posicao ASC',
    [userId, mes, ano] //com essas informações
  );

  res.json(rows.map(r => r.valor));
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
