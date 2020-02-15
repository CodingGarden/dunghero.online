const zoo = document.querySelector('.zoo');
const scoreElement = document.querySelector('.score .value');
const socket = io();

const animalsById = {};
const dungsById = {};

function collectDung(dung) {
  return () => {
    socket.emit('collect-dung', {
      id: dung.id,
    });
    if (dungsById[dung.id]) {
      dungsById[dung.id].remove();
      delete dungsById[dung.id];
    }
  };
}

function updateView(gameState) {
  scoreElement.textContent = gameState.dungCollected;
  gameState.dungs.forEach((dung) => {
    if (!dungsById[dung.id]) {
      const dungElement = document.createElement('span');
      dungElement.classList.add('emoji');
      dungElement.classList.add('dung');
      dungElement.textContent = '💩';
      dungsById[dung.id] = dungElement;
      dungElement.addEventListener('click', collectDung(dung));
      zoo.appendChild(dungElement);
    }
    dungsById[dung.id].style.top = dung.location.y * window.innerHeight + 'px';
    dungsById[dung.id].style.left = dung.location.x * window.innerWidth + 'px';
  });
  gameState.animals.forEach((animal) => {
    if (!animalsById[animal.id]) {
      const animalElement = document.createElement('span');
      animalElement.classList.add('emoji');
      animalElement.classList.add('animal');
      animalElement.classList.add('bounce');
      animalElement.textContent = animal.emoji;
      animalsById[animal.id] = animalElement;
      zoo.appendChild(animalElement);
    }
    animalsById[animal.id].style.top = animal.location.y * window.innerHeight + 'px';
    animalsById[animal.id].style.left = animal.location.x * window.innerWidth + 'px';
  });
  console.log(gameState);
}

socket.on('game-state', updateView);
