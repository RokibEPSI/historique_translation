// revolut-backend/server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Charge le fichier .env
const app = express();
const PORT = 5000;

const REVOLUT_API_URL = 'https://sandbox.revolut.com/api/1.0';


// revolut-backend/server.js
const express = require('express');
const mockTransactions = require('./mock-transactions.json'); // Importez le fichier mock


// Endpoint pour récupérer les transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const accessToken = process.env.REVOLUT_ACCESS_TOKEN;
        const accountId = process.env.REVOLUT_ACCOUNT_ID;
        
        if (!accessToken) {
            return res.status(401).json({ error: 'Access Token manquant. Veuillez authentifier l\'utilisateur.' });
        }

        // Appel sécurisé à l'API Revolut
        const response = await axios.get(`${REVOLUT_API_URL}/accounts/${accountId}/transactions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                count: 50, // Limiter à 50 transactions
                // Ajoutez ici les paramètres 'from', 'to', 'type' si besoin de filtrer
            }
        });

        // Retourne les données brutes des transactions au Frontend
        res.json({ success: true, data: response.data });

    } catch (error) {
        console.error("Erreur Revolut API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Revolut démarré sur http://localhost:${PORT}`);
});

// AJOUTEZ CETTE LOGIQUE À VOTRE SERVER.JS (Port 5000)

// 1. Route pour intercepter le code depuis Revolut (via le Frontend)
app.get('/auth/revolut/callback', async (req, res) => {
    const code = req.query.code; // Récupère le code d'autorisation
    
    
    if (code) {
        // ... Logique d'échange sécurisé ici (avec client_id, client_secret, code) ...
        
        // 3. Stockage du token (mettez à jour le .env ou base de données)
        // ... et redirection de l'utilisateur vers la page d'historique.
        
        res.send(`Code reçu : ${code}. Échange de jeton en cours...`);
    } else {
        res.status(400).send("Erreur : Code d'autorisation manquant.");
    }
});