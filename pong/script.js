// ========== DOM 元素 ==========
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const statusEl = document.getElementById('gameStatus');

// ========== 游戏常量 ==========
const PADDLE_W = 12;
const PADDLE_H = 90;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const MAX_SCORE = 11;

// ========== 游戏状态 ==========
let paddle1Y, paddle2Y;
let ballX, ballY, ballDX, ballDY;
let score1, score2;
let running = false;
let gameOver = false;

// ========== 键盘状态 ==========
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!running || gameOver) startGame();
    }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// ========== 初始化 / 重置 ==========
function reset() {
    paddle1Y = canvas.height / 2 - PADDLE_H / 2;
    paddle2Y = canvas.height / 2 - PADDLE_H / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    const angle = (Math.random() * 0.5 - 0.25) * Math.PI; // -45° ~ +45°
    const dir = Math.random() < 0.5 ? 1 : -1;
    const speed = 5;
    ballDX = speed * Math.cos(angle) * dir;
    ballDY = speed * Math.sin(angle);
}

function startGame() {
    score1 = 0;
    score2 = 0;
    gameOver = false;
    updateScore();
    reset();
    running = true;
    statusEl.textContent = '比赛中...';
}

function endGame(winner) {
    running = false;
    gameOver = true;
    statusEl.textContent = `🎉 玩家${winner} 获胜！按 空格键 再来一局`;
}

// ========== 碰撞检测 ==========
function checkPaddleCollision(paddleY) {
    const paddleCenter = paddleY + PADDLE_H / 2;
    const ballCenter = ballY + BALL_SIZE / 2;
    return Math.abs(paddleCenter - ballCenter) < (PADDLE_H / 2 + BALL_SIZE / 2);
}

// ========== 更新逻辑 ==========
function update() {
    if (!running) return;

    // 移动球拍
    if (keys['w'] || keys['W']) paddle1Y = Math.max(0, paddle1Y - PADDLE_SPEED);
    if (keys['s'] || keys['S']) paddle1Y = Math.min(canvas.height - PADDLE_H, paddle1Y + PADDLE_SPEED);
    if (keys['ArrowUp'])   paddle2Y = Math.max(0, paddle2Y - PADDLE_SPEED);
    if (keys['ArrowDown']) paddle2Y = Math.min(canvas.height - PADDLE_H, paddle2Y + PADDLE_SPEED);

    // 移动球
    ballX += ballDX;
    ballY += ballDY;

    // 上下墙反弹
    if (ballY <= 0) {
        ballY = 0;
        ballDY = -ballDY;
    }
    if (ballY + BALL_SIZE >= canvas.height) {
        ballY = canvas.height - BALL_SIZE;
        ballDY = -ballDY;
    }

    // 左球拍碰撞
    if (ballX <= PADDLE_W && checkPaddleCollision(paddle1Y)) {
        ballX = PADDLE_W;
        ballDX = -ballDX * 1.05;
        ballDY += (Math.random() - 0.5) * 2; // 微调角度
    }

    // 右球拍碰撞
    if (ballX + BALL_SIZE >= canvas.width - PADDLE_W && checkPaddleCollision(paddle2Y)) {
        ballX = canvas.width - PADDLE_W - BALL_SIZE;
        ballDX = -ballDX * 1.05;
        ballDY += (Math.random() - 0.5) * 2;
    }

    // 出界判定
    if (ballX < 0) {
        score2++;
        updateScore();
        if (score2 >= MAX_SCORE) { endGame(2); return; }
        reset();
    }
    if (ballX + BALL_SIZE > canvas.width) {
        score1++;
        updateScore();
        if (score1 >= MAX_SCORE) { endGame(1); return; }
        reset();
    }
}

// ========== 绘制 ==========
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 中线
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // 左侧球拍
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.fillRect(0, paddle1Y, PADDLE_W, PADDLE_H);

    // 右侧球拍
    ctx.fillRect(canvas.width - PADDLE_W, paddle2Y, PADDLE_W, PADDLE_H);

    // 球
    ctx.beginPath();
    ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}

function updateScore() {
    score1El.textContent = score1;
    score2El.textContent = score2;
}

// ========== 游戏循环 ==========
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

reset();
loop();
