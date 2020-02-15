const SocketIO = require('socket.io');

function getRandomLocation() {
  return {
    x: Math.random(),
    y: Math.random() * 0.8,
  };
}

module.exports = (server) => {
  const io = SocketIO(server);

  const gameState = {
    dungCollected: 0,
    animals: [{
      id: 0,
      emoji: '🐅',
      location: getRandomLocation(),
    }, {
      id: 1,
      emoji: '🐘',
      location: getRandomLocation(),
    }, {
      id: 2,
      emoji: '🐂',
      location: getRandomLocation(),
    }, {
      id: 3,
      emoji: '🐧',
      location: getRandomLocation(),
    }, {
      id: 4,
      emoji: '🐿',
      location: getRandomLocation(),
    }],
    dungs: [{
      id: 0,
      location: getRandomLocation(),
    }, {
      id: 1,
      location: getRandomLocation(),
    }, {
      id: 2,
      location: getRandomLocation(),
    }, {
      id: 3,
      location: getRandomLocation(),
    }, {
      id: 4,
      location: getRandomLocation(),
    }, {
      id: 5,
      location: getRandomLocation(),
    }, {
      id: 6,
      location: getRandomLocation(),
    }, {
      id: 7,
      location: getRandomLocation(),
    }],
  };

  let hasUpdate = false;
  io.on('connection', (socket) => {
    socket.emit('game-state', gameState);
    socket.on('collect-dung', ({ id }) => {
      gameState.dungCollected += 1;
      gameState.dungs = gameState.dungs.filter((dung) => dung.id !== id);
      gameState.dungs.push({
        id: gameState.dungs[gameState.dungs.length - 1].id + 1,
        location: getRandomLocation(),
      });
      hasUpdate = true;
    });
  });

  setInterval(() => {
    if (hasUpdate) {
      io.emit('game-state', gameState);
      hasUpdate = false;
    }
  }, 300);
};
