# Projeto de Pesquisa de Imagens com Autenticação

## Nome: Hélito de Jesus Mendes de Horta

## Nº: 32440

## Tecnologias e APIs Utilizadas

- Node.js + Express (Servidor Web)
- MongoDB (Base de Dados NoSQL)
- API Pixabay (Pesquisa de imagens)
- dotenv (Variáveis de ambiente)
- bcrypt (Hash de passwords)
- express-session (Gestão de sessões)

## Instalação e Configuração

### Pré-requisitos

- Node.js instalado ([https://nodejs.org](https://nodejs.org))
- MongoDB Atlas ou MongoDB local instalado e configurado ([https://www.mongodb.com](https://www.mongodb.com))
- Conta e API Key da Pixabay ([https://pixabay.com/api/docs/](https://pixabay.com/api/docs/))

### Passos

1. Clonar o repositório:
   
   ```bash
   git clone https://github.com/teu-usuario/teu-repositorio.git
   cd teu-repositorio
   ```

2. Instalar dependencias

`npm install`

3. Criar o ficheiro `.env` na raiz com as variáveis:
   
   `SECRET_KEY=sua_chave_secreta_aqui
   MONGODB_URI=sua_uri_mongodb_aqui
   PIXABAYKEY=sua_api_key_pixabay_aqui`
   
   1. Configurar MongoDB: Criar as coleções `users` e `historico` na tua base de dados.
      
      - Executar localmente
        
            `node app.js`
        
        A aplicação estará disponível em: `http://localhost:3000`
