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
    const username = req.body.username.toLowerCase();
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
    const username = req.body.username.toLowerCase();
    const password = req.body.password;

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

// Rota mashup combinada
app.get('/api/search', isAuthenticated, async (req, res) => {
    const termo = req.query.q;
    const username = req.session.username;

    if (!termo) return res.status(400).json({ error: "Parâmetro 'q' é obrigatório." });

    try {
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(termo)}&appid=${process.env.OPENWEATHERMAPKEY}&units=metric&lang=pt`;
        const imageURL = `https://pixabay.com/api/?key=${process.env.PIXABAYKEY}&q=${encodeURIComponent(termo)}&image_type=photo&per_page=20`;

        const [weatherRes, imageRes] = await Promise.all([
            fetch(weatherURL),
            fetch(imageURL)
        ]);

        const weatherData = await weatherRes.json();
        const imageData = await imageRes.json();

        await pesquisasCollection.insertOne({ username, termo, data: new Date() });

        res.json({
            weather: {
                cidade: weatherData.name,
                temperatura: weatherData.main.temp,
                descricao: weatherData.weather[0].description,
                icone: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
            },
            images: imageData.hits.map(hit => ({
                id: hit.id,
                webformatURL: hit.webformatURL,
                largeImageURL: hit.largeImageURL
            }))
        });

    } catch (error) {
        console.error("Erro mashup:", error);
        res.status(500).json({ error: "Erro ao obter dados." });
    }
});

// Histórico
app.get('/historico', isAuthenticated, async (req, res) => {
    const historico = await pesquisasCollection.find({ username: req.session.username }).sort({ data: -1 }).toArray();
    res.json(historico);
});

// Iniciar servidor e ligar à BD
const client = new MongoClient(process.env.MONGODB_URI);
async function startServer() {
    try {
        await client.connect();
        db = client.db('API_externo');
        usersCollection = db.collection('users');
        pesquisasCollection = db.collection('pesquisas');

        app.listen(3000, () => console.log("Servidor a correr em http://localhost:3000"));
    } catch (err) {
        console.error("Erro BD:", err);
    }
}
startServer();

 