// ======================================
// CANVAS SETUP
// ======================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ======================================
// GAME STATE
// ======================================

let gameRunning = false;
let difficulty = "easy";
let lastSpawnTime = 0;
let spawnRate = 2000;
let enemySpeed = 2;
let lastDirection = "right";

// ======================================
// 🔊 AUDIO SETUP
// INSERT YOUR AUDIO LINKS BELOW
// ======================================

// 🎵 Background Music
const bgMusic = new Audio("https://rural-green-zkrb2on20x.edgeone.app/Crystal%20Orchard%20Loop.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5; // Adjust volume (0.0 - 1.0)

// 🔥 Shooting Sound
const shootSound = new Audio("https://amazing-chocolate-hdvrcwof4n.edgeone.app/Sound_Creator_FULL_SONG_MusicGPT.mp3");
shootSound.volume = 0.6;

// ======================================
// 🖼 IMAGE PLACEHOLDERS
// INSERT IMAGE LINKS BELOW
// ======================================

const heroImg = new Image();
heroImg.src = "https://i.postimg.cc/2ScPLsND/image-1-removebg-preview.png";

const enemyImg = new Image();
enemyImg.src = "https://i.postimg.cc/wB9dDX7s/image-4-removebg-preview.png";

const bgImg = new Image();
bgImg.src = "https://i.postimg.cc/8zM1Rk4w/9491c1a6-ebc2-4b75-9514-829e4737cec9.jpg";

// ======================================
// PLAYER
// ======================================

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 80,
  height: 100,
  speed: 8, // Increased movement speed
  health: 3
};

// ======================================
// BULLETS
// ======================================

let bullets = [];

function shoot() {

  let dx = 0;
  let dy = 0;

  if (lastDirection === "up") dy = -1;
  if (lastDirection === "down") dy = 1;
  if (lastDirection === "left") dx = -1;
  if (lastDirection === "right") dx = 1;

  bullets.push({
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    size: 8,
    speed: 10,
    dx: dx,
    dy: dy
  });

  // 🔥 Play shooting sound
  shootSound.currentTime = 0; // restart sound if spamming
  shootSound.play();
}

// ======================================
// ENEMIES
// ======================================

let enemies = [];

function spawnEnemy() {

  let side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -60;
  } else if (side === 1) {
    x = Math.random() * canvas.width;
    y = canvas.height + 60;
  } else if (side === 2) {
    x = -60;
    y = Math.random() * canvas.height;
  } else {
    x = canvas.width + 60;
    y = Math.random() * canvas.height;
  }

  enemies.push({
    x: x,
    y: y,
    width: 70,
    height: 90
  });
}

// ======================================
// DIFFICULTY
// ======================================

function setDifficulty(level) {
  if (level === "easy") {
    enemySpeed = 2;
    spawnRate = 2000;
  } else if (level === "medium") {
    enemySpeed = 3;
    spawnRate = 1200;
  } else {
    enemySpeed = 4.5;
    spawnRate = 800;
  }
}

// ======================================
// COLLISION
// ======================================

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ======================================
// GAME LOOP
// ======================================

function gameLoop(timestamp) {

  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Spawn enemies
  if (timestamp - lastSpawnTime > spawnRate) {
    spawnEnemy();
    lastSpawnTime = timestamp;
  }

  // Draw player
  ctx.drawImage(heroImg, player.x, player.y, player.width, player.height);

  // Move bullets
  for (let i = bullets.length - 1; i >= 0; i--) {

    bullets[i].x += bullets[i].dx * bullets[i].speed;
    bullets[i].y += bullets[i].dy * bullets[i].speed;

    ctx.fillStyle = "cyan";
    ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].size, bullets[i].size);

    // Remove offscreen bullets
    if (
      bullets[i].x < 0 ||
      bullets[i].x > canvas.width ||
      bullets[i].y < 0 ||
      bullets[i].y > canvas.height
    ) {
      bullets.splice(i, 1);
    }
  }

  // Move enemies
  for (let i = enemies.length - 1; i >= 0; i--) {

    let enemy = enemies[i];

    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist !== 0) {
      enemy.x += (dx / dist) * enemySpeed;
      enemy.y += (dy / dist) * enemySpeed;
    }

    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

    // Player collision
    if (isColliding(enemy, player)) {
      player.health--;
      enemies.splice(i, 1);

      if (player.health <= 0) {
        endGame();
      }
    }

    // Bullet collision
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (isColliding(
        {x: bullets[j].x, y: bullets[j].y, width: bullets[j].size, height: bullets[j].size},
        enemy
      )) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        break;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// ======================================
// CONTROLS
// ======================================

document.addEventListener("keydown", function(e) {

  if (!gameRunning) return;

  if (e.key === "ArrowUp") {
    player.y -= player.speed;
    lastDirection = "up";
  }

  if (e.key === "ArrowDown") {
    player.y += player.speed;
    lastDirection = "down";
  }

  if (e.key === "ArrowLeft") {
    player.x -= player.speed;
    lastDirection = "left";
  }

  if (e.key === "ArrowRight") {
    player.x += player.speed;
    lastDirection = "right";
  }

  if (e.key === " ") shoot();
});

// ======================================
// START / RESTART / GAME OVER
// ======================================

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

document.getElementById("startBtn").onclick = function () {

  difficulty = document.getElementById("difficulty").value;
  setDifficulty(difficulty);

  startScreen.classList.add("hidden");

  player.health = 3;
  enemies = [];
  bullets = [];
  lastSpawnTime = 0;

  gameRunning = true;

  // 🎵 Start background music
  bgMusic.currentTime = 0;
  bgMusic.play();

  requestAnimationFrame(gameLoop);
};

function endGame() {
  gameRunning = false;
  gameOverScreen.classList.remove("hidden");

  // ⛔ Stop background music
  bgMusic.pause();
}

document.getElementById("restartBtn").onclick = function () {

  gameOverScreen.classList.add("hidden");

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = 3;

  enemies = [];
  bullets = [];
  lastSpawnTime = 0;

  gameRunning = true;

  bgMusic.currentTime = 0;
  bgMusic.play();

  requestAnimationFrame(gameLoop);
};
