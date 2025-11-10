const inputs = document.querySelectorAll('.EntradasInput');
const resultado = document.getElementById('resultado');

function somarTudo(){
    let soma = 0;
    inputs.forEach(input => {
        soma += parseFloat(input.value) || 0;
    });
    resultado.textContent =`Resultado: R$ ${soma}`;
} //atualiza em tempo real
    inputs.forEach(input => {
        input.addEventListener('input', somarTudo);
    }); 