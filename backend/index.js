// index.js (Backend Node.js/Express)

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors'); 
const fs = require('fs'); 

// Charger les variables d'environnement depuis le fichier .env
dotenv.config(); 

// Importez les données simulées. Assurez-vous que ce fichier existe !
const mockTransactions = require('./mock-transactions.json'); 

const app = express();
// Récupérer le port depuis .env, sinon utiliser 5000
const PORT = process.env.PORT || 5000;

const REVOLUT_API_URL = process.env.REVOLUT_API_URL || 'https://sandbox.revolut.com/api/1.0';
const CLIENT_ID = process.env.REVOLUT_CLIENT_ID;
const CLIENT_SECRET = process.env.REVOLUT_CLIENT_SECRET;
const REDIRECT_URI = process.env.REVOLUT_REDIRECT_URI;
const ACCOUNT_ID = process.env.REVOLUT_ACCOUNT_ID;
const PRIVATE_KEY_PATH = process.env.REVOLUT_PRIVATE_KEY_PATH;

// --- CONFIGURATION CORS (ESSENTIEL POUR LA COMMUNICATION 3000 <-> 5000) ---
// Doit être placé AVANT les définitions de routes (app.get, app.post)
app.use(cors({
    origin: 'http://localhost:3000', // Autorise votre Frontend React
    methods: ['GET', 'POST'], 
    credentials: true,
}));

// Middleware pour gérer les données JSON
app.use(express.json()); 

// ----------------------------------------------------------------------
// 1. ROUTE DE TRANSACTION (MODE SIMULATION TEMPORAIRE)
// ----------------------------------------------------------------------

app.get('/api/transactions', async (req, res) => {
    // Si un Access Token est défini, on essaie l'appel réel (bloc actuellement bloquant)
    const accessToken = process.env.REVOLUT_ACCESS_TOKEN;
    
    if (accessToken && ACCOUNT_ID) {
        try {
            console.log("Tentative d'appel à l'API Revolut réelle...");
            
            const response = await axios.get(`${REVOLUT_API_URL}/accounts/${ACCOUNT_ID}/transactions`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                params: { count: 50, ...req.query }
            });
            
            return res.json({ success: true, data: response.data });
        } catch (error) {
            console.error("Erreur API RÉELLE (Passage en Mock):", error.message);
        }
    }
    
    // --- BLOC DE SECOURS (MODE SIMULATION) ---
    console.log("Mode simulation actif: Retourne les données Mock.");
    return res.json({ success: true, data: mockTransactions });
});

// ----------------------------------------------------------------------
// 2. ROUTE D'INTERCEPTION OAUTH (Le "callback" pour l'échange de jeton)
// ----------------------------------------------------------------------

app.get('/auth/revolut/callback', async (req, res) => {
    const code = req.query.code; 
    
    if (!code) {
        return res.status(400).send("Erreur: Code d'autorisation manquant dans l'URL.");
    }

    try {
        // --- Appel POST pour l'échange de jeton ---
        const tokenExchangeResponse = await axios.post(`${REVOLUT_API_URL}/auth/token`, {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET, 
            redirect_uri: REDIRECT_URI,
            code: code,
            // (La logique de signature JWT est omise ici car bloquante)
        });

        const tokens = tokenExchangeResponse.data;
        
        console.log('--- Jeton d\'accès obtenu avec succès ---');
        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);
        
        // Redirige l'utilisateur vers la page d'accueil de votre Frontend
        res.redirect('http://localhost:3000/historique'); 

    } catch (error) {
        console.error("Erreur d'échange de jeton:", error.response ? error.response.data : error.message);
        res.status(500).send("Échec de l'échange de jeton. Vérifiez le Client Secret et la signature JWT.");
    }
});

// ----------------------------------------------------------------------
// 3. LANCEMENT DU SERVEUR
// ----------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Serveur Backend démarré sur http://localhost:${PORT}`);
});