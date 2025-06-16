const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const pauseBtn = document.getElementById('pause-btn');
const exitBtn = document.getElementById('exit-btn');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const gameOverPopup = document.getElementById('game-over-popup');
const tryAgainBtn = document.getElementById('try-again-btn');
const exitPopupBtn = document.getElementById('exit-popup-btn');

canvas.width = 400;
canvas.height = 600;

let basket = {
  width: 100,
  height: 25,
  x: canvas.width / 2 - 50,
  y: canvas.height - 40,
  speed: 7,
  dx: 0,
  color: '#b18aff',
};

let stars = [];
let starRadius = 15;
let score = 0;
let missedStars = 0;
let isPaused = false;
let animationId = null;
let starInterval;
let isDragging = false;

function createStar() {
  const x = Math.random() * (canvas.width - 2 * starRadius) + starRadius;
  stars.push({ x, y: -starRadius, radius: starRadius, speed: 2 + Math.random() * 2 });
}

function drawBasket() {
  ctx.fillStyle = basket.color;
  ctx.beginPath();
  ctx.roundRect(basket.x, basket.y, basket.width, basket.height, 10);
  ctx.fill();
}

function drawStar(star) {
  const spikes = 5, outer = star.radius, inner = outer / 2.5;
  let rot = Math.PI / 2 * 3, step = Math.PI / spikes, x = star.x, y = star.y;
  ctx.beginPath();
  ctx.moveTo(x, y - outer);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(x + Math.cos(rot) * inner, y + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = '#b18aff';
  ctx.shadowColor = '#8a52ff';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function moveBasket() {
  basket.x += basket.dx;
  basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
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
    } else if (stars[i].y - stars[i].radius > canvas.height) {
      stars.splice(i, 1);
      missedStars++;
    }
  }

  if (missedStars >= 5) return endGame();
  scoreElement.textContent = `Score: ${score} | Missed: ${missedStars}`;
}

function endGame() {
  cancelAnimationFrame(animationId);
  clearInterval(starInterval);
  gameOverPopup.style.display = 'block';
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  clearCanvas();
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

function startGame() {
  score = 0;
  missedStars = 0;
  stars = [];
  basket.x = canvas.width / 2 - basket.width / 2;
  isPaused = false;
  gameOverPopup.style.display = 'none';
  scoreElement.textContent = `Score: 0 | Missed: 0`;
  startScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  cancelAnimationFrame(animationId);
  clearInterval(starInterval);
  animationId = requestAnimationFrame(gameLoop);
  starInterval = setInterval(createStar, 1000);
}

// Controls
document.getElementById('start-btn').addEventListener('click', startGame);
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});
exitBtn.addEventListener('click', () => {
  cancelAnimationFrame(animationId);
  gameContainer.style.display = 'none';
  startScreen.style.display = 'block';
});
tryAgainBtn.addEventListener('click', () => startGame());
exitPopupBtn.addEventListener('click', () => {
  gameOverPopup.style.display = 'none';
  gameContainer.style.display = 'none';
  startScreen.style.display = 'block';
});

document.addEventListener('keydown', e => {
  basket.dx = (e.key === 'ArrowRight') ? basket.speed : (e.key === 'ArrowLeft') ? -basket.speed : 0;
});
document.addEventListener('keyup', () => basket.dx = 0);
canvas.addEventListener('mousemove', e => {
  const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  basket.x = mouseX - basket.width / 2;
});
canvas.addEventListener('touchstart', e => {
  const t = e.touches[0], r = canvas.getBoundingClientRect();
  const tx = t.clientX - r.left, ty = t.clientY - r.top;
  if (tx > basket.x && tx < basket.x + basket.width && ty > basket.y && ty < basket.y + basket.height) isDragging = true;
});
canvas.addEventListener('touchmove', e => {
  if (isDragging) {
    e.preventDefault();
    const tx = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    basket.x = tx - basket.width / 2;
  }
});
canvas.addEventListener('touchend', () => isDragging = false);
