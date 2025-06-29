document.addEventListener("DOMContentLoaded", function () {

    // === PESQUISA DE IMAGEM ===
    const formImagem = document.getElementById("formImagem");
    const imagensDiv = document.getElementById("imagens");

    formImagem.addEventListener("submit", async function (event) {
        event.preventDefault();

        const conceito = document.getElementById("imagem").value;
        imagensDiv.innerHTML = "";

        try {
            const resposta = await fetch(`/pesquisa?conceito=${encodeURIComponent(conceito)}`);
            const dados = await resposta.json();

            if (dados.length === 0) {
                imagensDiv.innerHTML = "<p>Nenhuma imagem encontrada.</p>";
                return;
            }

            dados.forEach(imagem => {
                const img = document.createElement("img");
                img.src = imagem.webformatURL;
                img.alt = `Imagem ${imagem.id}`;
                img.style.maxWidth = "200px";
                img.style.margin = "10px";
                imagensDiv.appendChild(img);
            });
        } catch (error) {
            imagensDiv.innerHTML = "<p>Erro ao carregar imagens.</p>";
            console.error("Erro:", error);
        }
    });

    // === PESQUISA DE TEMPO ===
    const formTempo = document.getElementById("formTempo");
    const resultadoTempo = document.getElementById("resultadoTempo");

   formTempo.addEventListener("submit", async function (event) {
    event.preventDefault();

    const cidade = document.getElementById("cidade").value;
    resultadoTempo.style.display = "none"; // Oculta enquanto limpa
    resultadoTempo.innerHTML = "";

    try {
        const resposta = await fetch(`/weather?cidade=${encodeURIComponent(cidade)}`);
        const dados = await resposta.json();
       

        if (dados.error) {
            resultadoTempo.style.display = "block";
            resultadoTempo.innerHTML = `<p>Erro: ${dados.error}</p>`;
            return;
        }

        const div = document.createElement("div");
        div.innerHTML = `
            <p>Temperatura: ${dados.temperatura}°C</p>
            <p>Descrição: ${dados.descricao}</p>
            <img src="${dados.icone}" alt="Ícone do tempo">
        `;
        resultadoTempo.appendChild(div);
        resultadoTempo.style.display = "block"; // Agora sim, mostra
    } catch (error) {
        resultadoTempo.style.display = "block";
        resultadoTempo.innerHTML = "<p>Erro ao obter dados do tempo.</p>";
        console.error("Erro:", error);
    }
});
});



 