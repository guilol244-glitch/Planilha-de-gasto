// Seleciona o botão de login
const loginButton = document.getElementById('LoginJs');

// Quando clicar no botão, vai para a página de Login
loginButton.addEventListener('click', () => {
  window.location.href = './login.html';
});

// Seleciona o botão de cadastro
const cadastroButton = document.getElementById('CadastroJs');

// Quando clicar no botão, vai para a página de Cadastro
cadastroButton.addEventListener('click', () => {
  window.location.href = './cadastro.html';
});