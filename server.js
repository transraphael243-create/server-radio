const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const agentsConnectes = new Map();

function diffuserListeAgents() {
    const liste = Array.from(agentsConnectes.entries()).map(([id, data]) => ({
        id: id,
        name: data.name,
        matricule: data.matricule
    }));
    io.emit('mise-a-jour-agents', liste);
}

io.on('connection', (socket) => {
    console.log(`Un appareil s'est connecté : ${socket.id}`);

    socket.on('enregistrer-agent', (data) => {
        const { name, matricule } = data;
        agentsConnectes.set(socket.id, { name, matricule });
        socket.matricule = matricule;
        console.log(`[CONNECTÉ] Agent : ${name} | Matricule : ${matricule}`);
        socket.emit('enregistrement-succes', { message: 'Connecté au réseau radio' });
        diffuserListeAgents();
    });

    // Transmission audio privée ou générale
    socket.on('transmettre-audio', (data) => {
        const { destinataireId } = data;
        if (destinataireId) {
            // Envoi ciblé à un agent précis
            io.to(destinataireId).emit('recevoir-audio', {
                expediteur: socket.matricule
            });
            console.log(`[RADIO PRIVÉE] De ${socket.matricule} vers ${destinataireId}`);
        } else {
            // Diffusion générale
            socket.broadcast.emit('recevoir-audio', { expediteur: socket.matricule });
            console.log(`[RADIO GÉNÉRALE] De ${socket.matricule}`);
        }
    });

    socket.on('disconnect', () => {
        if (agentsConnectes.has(socket.id)) {
            const agent = agentsConnectes.get(socket.id);
            agentsConnectes.delete(socket.id);
            console.log(`[DÉCONNECTÉ] Matricule : ${agent.matricule}`);
            diffuserListeAgents();
        }
    });
});

server.listen(3000, () => {
    console.log('Serveur radio en écoute sur le port 3000');
});