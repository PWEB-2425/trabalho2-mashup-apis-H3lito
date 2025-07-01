// script.js
// Este script lida com a pesquisa de imagens e de tempo, utilizando APIs externas.
// Ele é responsável por capturar os eventos de submit dos formulários, fazer as requisições
// e atualizar a interface do utilizador com os resultados.
// === script.js ===
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formPesquisa");
    const resultadosDiv = document.getElementById("resultadoPesquisa");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const termo = document.getElementById("termo").value;
        resultadosDiv.innerHTML = "<p>A carregar...</p>";

        try {
            const resposta = await fetch(`/api/search?q=${encodeURIComponent(termo)}`);
            const dados = await resposta.json();

            if (dados.error) {
                resultadosDiv.innerHTML = `<p>${dados.error}</p>`;
                return;
            }

            const tempo = dados.weather;
            const imagens = dados.images;

            resultadosDiv.innerHTML = `
                <h3>Clima em ${tempo.cidade}</h3>
                <p>Temperatura: ${tempo.temperatura}°C</p>
                <p>Descrição: ${tempo.descricao}</p>
                <img src="${tempo.icone}" alt="Ícone do tempo">
                <h3>Imagens relacionadas</h3>
            `;

            imagens.forEach(img => {
                const el = document.createElement("img");
                el.src = img.webformatURL;
                el.style.maxWidth = "200px";
                el.style.margin = "10px";
                resultadosDiv.appendChild(el);
            });

        } catch (error) {
            console.error("Erro:", error);
            resultadosDiv.innerHTML = "<p>Erro ao obter resultados.</p>";
        }
    });
    });