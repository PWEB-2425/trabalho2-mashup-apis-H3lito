async function pesquisar() {
    const termo = document.getElementById('termo').value;

    if (!termo.trim()) {
        alert('Por favor, insere um termo para pesquisar.');
        return;
    }

    try {
        const res = await fetch(`/pesquisa/${encodeURIComponent(termo)}`);
        const imagens = await res.json();

        const div = document.getElementById('imagens');
        div.innerHTML = '';

        if (imagens.length === 0) {
            div.innerHTML = '<p>Nenhuma imagem encontrada.</p>';
            return;
        }

        imagens.forEach(img => {
            const imageElement = document.createElement('img');
            imageElement.src = img.webformatURL;
            imageElement.alt = "Imagem da pesquisa";
            imageElement.style.width = '200px';
            imageElement.style.margin = '10px';
            div.appendChild(imageElement);
        });
    } catch (error) {
        console.error('Erro ao obter imagens:', error);
        document.getElementById('imagens').innerHTML = '<p>Erro ao carregar imagens.</p>';
    }
}

async function pesquisarTempo() {
    const cidade = document.getElementById('cidade').value;

    if (!cidade.trim()) {
        alert('Por favor, insere o nome de uma cidade.');
        return;
    }

    try {
        const res = await fetch(`/weather?cidade=${encodeURIComponent(cidade)}`);
        const dados = await res.json();

        if (dados.error) {
            document.getElementById('resultadoTempo').innerHTML = `<p>${dados.error}</p>`;
            return;
        }

        const html = `
            <h3>Tempo em ${dados.cidade}</h3>
            <p>Temperatura: ${dados.temperatura}°C</p>
            <p>Descrição: ${dados.descricao}</p>
            <img src="${dados.icone}" alt="Ícone do tempo">
        `;
        document.getElementById('resultadoTempo').innerHTML = html;

    } catch (error) {
        console.error('Erro ao obter dados do tempo:', error);
        document.getElementById('resultadoTempo').innerHTML = '<p>Erro ao carregar dados do tempo.</p>';
    }
}