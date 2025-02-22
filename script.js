const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const backgroundMusic = document.getElementById('backgroundMusic');
const explosionSound = document.getElementById('explosionSound');

backgroundMusic.volume = 0.5;
backgroundMusic.play();
explosionSound.volume = 0.7;

const GRID_SIZE = 30;
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;
let score = 0;

let grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]]  // Z
];

const COLORS = ['cyan', 'yellow', 'purple', 'orange', 'blue', 'green', 'red'];

let currentShape, currentX, currentY, currentColor;

function newShape() {
  const index = Math.floor(Math.random() * SHAPES.length);
  currentShape = SHAPES[index];
  currentColor = COLORS[index];
  currentX = Math.floor(COLS / 2) - Math.floor(currentShape[0].length / 2);
  currentY = 0;

  if (collides(currentShape, currentX, currentY)) {
    alert('Game Over!');
    grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
  }
}

function collides(shape, x, y) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && grid[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge() {
  for (let row = 0; row < currentShape.length; row++) {
    for (let col = 0; col < currentShape[row].length; col++) {
      if (currentShape[row][col]) {
        grid[currentY + row][currentX + col] = currentColor;
      }
    }
  }
}

let particles = [];

function createExplosion(x, y) {
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: x + GRID_SIZE / 2,
      y: y + GRID_SIZE / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 10 + 5,
      life: 30 + Math.random() * 20,
      opacity: 1
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.size *= 0.95;
    p.opacity -= 0.03;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255, 165, 0, ${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function clearLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row].every(cell => cell !== 0)) {
      for (let col = 0; col < COLS; col++) {
        createExplosion(col * GRID_SIZE, row * GRID_SIZE);
      }
      explosionSound.currentTime = 0;
      explosionSound.play();
      grid.splice(row, 1);
      grid.unshift(Array(COLS).fill(0));
      score += 10;
      scoreElement.textContent = score;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Vẽ nền với chữ "Jax's Tetris"
  ctx.font = '40px Arial'; // Kích thước chữ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Màu đen, mờ (opacity 0.2)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("Jax's Tetris", canvas.width / 2, canvas.height / 2); // Đặt ở giữa canvas

  // Vẽ lưới
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col]) {
        ctx.fillStyle = grid[row][col];
        ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      }
    }
  }

  // Vẽ khối hiện tại
  for (let row = 0; row < currentShape.length; row++) {
    for (let col = 0; col < currentShape[row].length; col++) {
      if (currentShape[row][col]) {
        ctx.fillStyle = currentColor;
        ctx.fillRect((currentX + col) * GRID_SIZE, (currentY + row) * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      }
    }
  }

  // Vẽ particle
  drawParticles();
}

function rotate() {
  const rotated = currentShape[0].map((_, index) =>
    currentShape.map(row => row[index]).reverse()
  );
  if (!collides(rotated, currentX, currentY)) {
    currentShape = rotated;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && !collides(currentShape, currentX - 1, currentY)) {
    currentX--;
  } else if (e.key === 'ArrowRight' && !collides(currentShape, currentX + 1, currentY)) {
    currentX++;
  } else if (e.key === 'ArrowDown' && !collides(currentShape, currentX, currentY + 1)) {
    currentY++;
  } else if (e.key === 'ArrowUp') {
    rotate();
  }
});

let dropCounter = 0;
const DROP_INTERVAL = 500;

function update() {
  dropCounter += 16;
  if (dropCounter >= DROP_INTERVAL) {
    if (!collides(currentShape, currentX, currentY + 1)) {
      currentY++;
    } else {
      merge();
      clearLines();
      newShape();
    }
    dropCounter = 0;
  }
  updateParticles();
  draw();
  requestAnimationFrame(update);
}

newShape();
update();