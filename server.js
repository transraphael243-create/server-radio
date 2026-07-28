const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Page d'accueil basique
app.get('/', (req, res) => {
    res.send('Serveur Talkie-Walkie Radio en ligne !');
});

// Gestion des connexions en temps réel
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté :', socket.id);

    // Réception du flux audio et rediffusion aux autres (effet talkie-walkie)
    socket.on('audio-stream', (audioData) => {
        socket.broadcast.emit('audio-stream', audioData);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté :', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
