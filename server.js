// Import necessary modules
const express = require('express');
const session = require('express-session');
const dotenv= require('dotenv');
const {MongoClient}= require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Load environment variable .env
dotenv.config();

console.log(process.env.SECRET_KEY); // Show secret key in console

// Create an Express application
const app= express();

//Session configuration for save dates user between requests

app.use(session({
    secret: process.env.SECRET_KEY || "helitoMnbZ00", // Secret key for assigning the session ID cookie
    resave: false,  // Don't save session if unmodified
    
    saveUninitialized: false,  // Don't create session until something stored

    cookie:{secure: false} //only if  https is used
}));

//permit read datas sends in forms(POST)

app.use(express.urlencoded({extended: true}));

app.use(express.static('public')); // Serve static files from the 'public' directory

let usersCollection;
let db;

//Middleware to verify if user is logged in

function isAuthenticated(req, res, next){
    if(req.session.username){
        next();
    }else{
        res.redirect('/login.html');
    
    }
}


//Principal route
app.get('/',(req, res)=>{
    res.send("Welcome to the server!");
});

//Protected route

app.get('/protegido', isAuthenticated,(req, res)=>{
    res.send("This is a protected route. You are logged in as " + req.session.username);
});

//Login route

app.post('/login', async (req, res)=>{
    const username= req.body.username;
    const password= req.body.password;
    try {
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(401).send("Credenciais inválidas.");
        }

        // Compara a password fornecida com o hash guardado
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            req.session.username = username;
            res.redirect('/pesquisa.html');
        } else {
            res.status(401).send("Credenciais inválidas.");
        }
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).send("Erro no login.");
    }
});

// Register route
// Rota para exibir a página de registo (GET)
app.get('/register.html', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Rota para processar o registo (POST)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username e password são obrigatórios.");
    }

    try {
        // Verifica se o utilizador já existe
        const userExists = await usersCollection.findOne({ username: username.toLowerCase() });
        if (userExists) {
            return res.status(400).send("Username já em uso.");
        }

        // Hash da password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insere o utilizador na base de dados
        await usersCollection.insertOne({
            username: username.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date()
        });

        res.redirect('/login.html'); // Redireciona para o login após registo
    } catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).send("Erro no servidor.");
    }
});

// Rota para pesquisa de imagens (usa API do Pixabay)
// Só acessível a utilizadores autenticados
app.get('/pesquisa', isAuthenticated, async (req, res) => {
    let conceito = req.query.conceito;
    console.log(conceito);
    if (!conceito) {
        return res.status(400).json({ error: 'parâmetro "conceito" é obrigatório.' });
    }
    // Monta o URL para a API do Pixabay
    const url = `https://pixabay.com/api/?key=${process.env.PIXABAYKEY}&q=${encodeURIComponent(conceito)}&image_type=photo&per_page=4`;
    try {
        const resultado = await fetch(url);
        const dados = await resultado.json();
        // Extrai apenas os dados relevantes das imagens
        const photos = dados.hits.map(hit => ({
            id: hit.id,
            webformatURL: hit.webformatURL,
            largeImageURL: hit.largeImageURL
        }));
        res.json(photos); // Envia as imagens para o frontend
    } catch (err) {
        res.status(500).json({ error: 'Erro ao obter imagens.' });
    }
});

app.get('/pesquisa', async (req, res) => {
    const conceito = req.query.conceito;
    const username = req.session.username; // obtém o utilizador logado

    if (!username) {
        return res.status(401).send("Não autorizado");
    }

    try {
        const url = `https://pixabay.com/api/?key=${process.env.PIXABYKEY}&q=${encodeURIComponent(conceito)}&image_type=photo`;
        const resposta = await fetch(url);
        const dados = await resposta.json();

        // Guardar no histórico
        await historico.insertOne({
            username: username,
            conceito: conceito,
            data: new Date()
        });

        res.json(dados.hits);
    } catch (error) {
        console.error("Erro na pesquisa:", error);
        res.status(500).send("Erro ao fazer a pesquisa.");
    }
});

// Rota histórico de pesquisas

app.get('/historico', async (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.status(401).send("Não autorizado");
    }

    const historico = await pesquisasCollection
        .find({ username })
        .sort({ data: -1 })
        .toArray();

    res.json(historico);
});



    //URL API do OpenWeatherMap

    app.get('/weather', isAuthenticated, async (req, res) => {
        const cidade= req.query.cidade;
        if(!cidade){
            return res.status(400).json({error:"parameter cidade is required"});
        }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${process.env.OPENWEATHERMAPKEY}&units=metric&lang=pt`;
    try{
        const resultado= await fetch(url);
        if(!resultado.ok){
            return res.status(500).json({error: 'Erro ao obter dados do tempo'});
        }
        const dados= await resultado.json();
        const weatherData = {
            cidade: dados.nome,
            temperatura: dados.main.temp,
            descricao: dados.weather[0].description,
                       icone: `http://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png` 

        };
    res.json(weatherData);
    } catch(err){
        res.status(500).json({error: 'Erro ao obter dados do tempo'});
    }
});

    //Exemplo rota protegida

    app.get('/secret', isAuthenticated, (req, res) => {
        res.send("Anything you want to protect");
    });

    app.get('/pesquisa.html', isAuthenticated, (req, res) => {
        res.sendFile(__dirname + '/public/pesquisa.html');
    });

    // Connect to MongoDB and start the server

    const client = new MongoClient(process.env.MONGODB_URI);

    async function startServer() {
        try{
            await client.connect();
            db=client.db('API_externo');
            usersCollection= db.collection('users');

            app.listen(3000, () => 
                console.log('Server is running on port'+(process.env.PORT || 3000))
            );

            } catch (error){
                console.log("Erro ao ligar à base de dados: ", + error);
            }
            }
            startServer();
