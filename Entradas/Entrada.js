const inputs = document.querySelectorAll('.EntradasInput');
const resultado = document.getElementById('resultado');

function somarTudo(){
    let soma = 0;
    inputs.forEach(input => {
        soma += parseFloat(input.value) || 0;
    });
    resultado.textContent =`Resultado: ${soma}`;
} //atualiza em tempo real
    inputs.forEach(input => {
        input.addEventListener('input', somarTudo);
    });
    async function salvarDados() {
        const valores = Array.from(inputs).map(i => parseFloat(i.value) || 0);

        await fetch('http://localhost:3000/salvar', {
            method : 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({valores})    
            });
    }
    //Carregar dados salvos

    async function carregarDados() {
        const resp = await fetch('http://localhost:3000/carregar');
        const valores = await resp.json();

        inputs.forEach((input, i) => {
            input.value = valores [i] ?? '';
        });
        somarTudo();
    } //Carregar ao abrir
    window.addEventListener('DOMContentLoaded', carregarDados);

    //Salvar ao alterar

    inputs.forEach(input => {
        input.addEventListener('change', salvarDados);
    });