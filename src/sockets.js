const crypto = require('crypto');
const SocketIO = require('socket.io');

function getRandomLocation() {
  return {
    x: 0.05 + (Math.random() * 0.85),
    y: 0.05 + (Math.random() * 0.75),
  };
}

function createID() {
  return `id_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;
}

function getRandomEndTime() {
  return Date.now() + ((5 + Math.floor(Math.random() * 5)) * 1000);
}

function createAnimal(emoji) {
  return {
    id: createID(),
    emoji,
    location: getRandomLocation(),
    nextLocation: getRandomLocation(),
    endTime: getRandomEndTime(),
  };
}

function createDung(location) {
  return {
    id: createID(),
    location,
  };
}

function leaderboard(clients) {
  const sortable = [];
  for (const id in clients) {
    const client = clients[id];
    if (client.name !== "") {
      sortable.push({
        id: id,
        name: client.name,
        score: client.score,
      });
    }
  }
  sortable.sort((a, b) => {
    return b.score - a.score;
  });
  // only top 10 are getting sent
  return sortable.slice(0, 10);
}

module.exports = (server) => {
  const io = SocketIO(server);
  const clients = {};
  const gameState = {
    dungCollected: 0,
    animals: [
      '🐅',
      '🐘',
      '🐂',
      '🐧',
      '🐿',
    ].map(createAnimal),
    dungs: [],
  };

  let hasUpdate = false;
  io.on('connection', (socket) => {
    clients[socket.id] = {name: '', score: 0};
    console.log('Connected clients', Object.keys(clients).length);
    const lastCollected = Date.now();
    socket.emit('game-state', gameState);
    socket.emit('leaderboard', leaderboard(clients));
    socket.on('collect-dung', ({ id }) => {
      if (Date.now() - lastCollected < 1000) return;
      const foundIndex = gameState.dungs.findIndex((dung) => dung.id === id);
      if (foundIndex !== -1) {
        gameState.dungs.splice(foundIndex, 1);
        gameState.dungCollected += 1;
        hasUpdate = true;
        clients[socket.id].score += 1;
        socket.emit('score', clients[socket.id].score);
      }
    });
    socket.on('disconnect', () => {
      delete clients[socket.id];
    });
    socket.on('input-name', (name) => {
      clients[socket.id].name = name;
    });
  });

  setInterval(() => {
    gameState.animals.forEach((animal) => {
      const diff = animal.endTime - Date.now();
      if (diff <= 0) {
        const nextLocation = getRandomLocation();
        gameState.dungs.push(createDung({
          y: (nextLocation.y > animal.nextLocation.y) ? (animal.nextLocation.y + 0.02) : (animal.nextLocation.y - 0.02),
          x: (nextLocation.x > animal.nextLocation.x) ? (animal.nextLocation.x + 0.02) : (animal.nextLocation.x - 0.02),
        }));
        if (gameState.dungs.length > 40) {
          gameState.dungs.shift();
        }
        animal.location = animal.nextLocation;
        animal.nextLocation = nextLocation;
        animal.endTime = getRandomEndTime();
        animal.hasUpdate = true;
        hasUpdate = true;
      } else {
        animal.hasUpdate = false;
      }
    });
    if (hasUpdate) {
      io.emit('game-state', gameState);
      io.emit('leaderboard', leaderboard(clients));
      hasUpdate = false;
    }
  }, 300);
};
