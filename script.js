const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const pauseBtn = document.getElementById('pause-btn');
const exitBtn = document.getElementById('exit-btn');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');

canvas.width = 400;
canvas.height = 600;

let basket = {
  width: 100,
  height: 25,
  x: canvas.width / 2 - 50,
  y: canvas.height - 40,
  speed: 7,
  dx: 0,
  color: '#b18aff', // light purple basket
};

let stars = [];
let starRadius = 15;

let score = 0;
let isPaused = false;
let animationId = null;

function createStar() {
  const x = Math.random() * (canvas.width - 2 * starRadius) + starRadius;
  const y = -starRadius;
  const speed = 2 + Math.random() * 2;
  stars.push({ x, y, radius: starRadius, speed });
}

function drawBasket() {
  ctx.fillStyle = basket.color;
  const r = 10; // corner radius
  ctx.beginPath();
  ctx.moveTo(basket.x + r, basket.y);
  ctx.lineTo(basket.x + basket.width - r, basket.y);
  ctx.quadraticCurveTo(basket.x + basket.width, basket.y, basket.x + basket.width, basket.y + r);
  ctx.lineTo(basket.x + basket.width, basket.y + basket.height - r);
  ctx.quadraticCurveTo(basket.x + basket.width, basket.y + basket.height, basket.x + basket.width - r, basket.y + basket.height);
  ctx.lineTo(basket.x + r, basket.y + basket.height);
  ctx.quadraticCurveTo(basket.x, basket.y + basket.height, basket.x, basket.y + basket.height - r);
  ctx.lineTo(basket.x, basket.y + r);
  ctx.quadraticCurveTo(basket.x, basket.y, basket.x + r, basket.y);
  ctx.closePath();
  ctx.fill();
}

function drawStar(star) {
  const spikes = 5;
  const outerRadius = star.radius;
  const innerRadius = star.radius / 2.5;
  let rot = Math.PI / 2 * 3;
  let x = star.x;
  let y = star.y;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let sx = x + Math.cos(rot) * outerRadius;
    let sy = y + Math.sin(rot) * outerRadius;
    ctx.lineTo(sx, sy);
    rot += step;

    sx = x + Math.cos(rot) * innerRadius;
    sy = y + Math.sin(rot) * innerRadius;
    ctx.lineTo(sx, sy);
    rot += step;
  }
  ctx.lineTo(x, y - outerRadius);
  ctx.closePath();
  ctx.fillStyle = '#b18aff';
  ctx.shadowColor = '#8a52ff';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function moveBasket() {
  basket.x += basket.dx;
  if (basket.x < 0) basket.x = 0;
  if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
}

function updateStars() {
  for (let i = stars.length - 1; i >= 0; i--) {
    stars[i].y += stars[i].speed;

    if (
      stars[i].y + stars[i].radius > basket.y &&
      stars[i].x > basket.x &&
      stars[i].x < basket.x + basket.width
    ) {
      stars.splice(i, 1);
      score++;
      scoreElement.textContent = 'Score: ' + score;
    } else if (stars[i].y - stars[i].radius > canvas.height) {
      stars.splice(i, 1);
    }
  }
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  clear();
  drawBasket();
  stars.forEach(drawStar);
}

function gameLoop() {
  if (!isPaused) {
    moveBasket();
    updateStars();
    draw();
  }
  animationId = requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    basket.dx = basket.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
    basket.dx = -basket.speed;
  }
}

function keyUpHandler(e) {
  if (
    e.key === 'ArrowRight' ||
    e.key === 'Right' ||
    e.key === 'ArrowLeft' ||
    e.key === 'Left'
  ) {
    basket.dx = 0;
  }
}

function mouseMoveHandler(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  basket.x = mouseX - basket.width / 2;
  if (basket.x < 0) basket.x = 0;
  if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
}

pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

exitBtn.addEventListener('click', () => {
  cancelAnimationFrame(animationId);
  stars = [];
  score = 0;
  scoreElement.textContent = 'Score: 0';
  isPaused = false;
  pauseBtn.textContent = 'Pause';
  gameContainer.style.display = 'none';
  startScreen.style.display = 'block';
});

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
canvas.addEventListener('mousemove', mouseMoveHandler);

let starInterval;

function startGame() {
  basket.x = canvas.width / 2 - basket.width / 2;
  stars = [];
  score = 0;
  scoreElement.textContent = 'Score: 0';
  isPaused = false;
  pauseBtn.textContent = 'Pause';
  startScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
  if (starInterval) clearInterval(starInterval);
  starInterval = setInterval(createStar, 1000);
}

document.getElementById('start-btn').addEventListener('click', startGame);

