const hoje = new Date();

const mes = hoje.toLocaleString('pt-BR', {month :'long',});

const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

document.getElementById("Data").textContent = dataFormatada;

document.getElementById("MesData").textContent = mes;