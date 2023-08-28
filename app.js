const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// import routers
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// create express app
const app = express();

// import Mango DB database
mongoose.connect('mongodb+srv://roxannelottier:fHRD0SpgqzIadFY1@cluster0.wazzpsi.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// access the core of the request. Intercepts the requests that have a content type json and make the content content accessible using req.body
app.use(express.json());

// middleware to defy the CORS security. make  API accessible to everyone, autorize certaine headers and methodes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;