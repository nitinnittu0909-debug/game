// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const bestScore = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Audio elements
const flapSound = document.getElementById('flapSound');
const hitSound = document.getElementById('hitSound');
const pointSound = document.getElementById('pointSound');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let frames = 0;
let particles = [];

// Bird properties
const bird = {
    x: 80,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -9,
    rotation: 0,
    wingPosition: 0
};

// Pipes
let pipes = [];
const pipeConfig = {
    width: 70,
    gap: 160,
    minY: -200,
    maxY: -100,
    speed: 3
};

// Background elements
let clouds = [];
let mountains = [];

// Initialize game elements
function initGameElements() {
    // Create clouds
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 200 + 50,
            width: Math.random() * 100 + 50,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    // Create mountains
    mountains = [];
    for (let i = 0; i < 3; i++) {
        mountains.push({
            x: i * 200,
            height: Math.random() * 100 + 50,
            speed: 0.3
        });
    }
}

// Create pipe
function createPipe() {
    const y = Math.random() * (pipeConfig.maxY - pipeConfig.minY) + pipeConfig.minY;
    return {
        x: canvas.width,
        y: y,
        width: pipeConfig.width,
        height: 400,
        gap: pipeConfig.gap,
        passed: false
    };
}

// Create particles
function createParticles(x, y, count, color = '#FFD700') {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 4 + 2,
            color: color,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            life: 30
        });
    }
}

// Draw animated bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Bird body
    const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 20);
    gradient.addColorStop(0, '#FFEA00');
    gradient.addColorStop(1, '#FFA000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated wing
    bird.wingPosition = Math.sin(frames * 0.3) * 5;
    ctx.fillStyle = '#FF8A00';
    ctx.beginPath();
    ctx.ellipse(-8, bird.wingPosition, 12, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(12, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(14, -8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(35, -5);
    ctx.lineTo(35, 5);
    ctx.closePath();
    ctx.fill();

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    
    ctx.restore();
}

// Draw pipes with animation
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        const topGradient = ctx.createLinearGradient(pipe.x, pipe.y, pipe.x, pipe.y + pipe.height);
        topGradient.addColorStop(0, '#4CAF50');
        topGradient.addColorStop(1, '#388E3C');
        
        ctx.fillStyle = topGradient;
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        
        // Top pipe cap
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(pipe.x - 5, pipe.y + pipe.height - 25, pipe.width + 10, 25);
        
        // Bottom pipe
        const bottomY = pipe.y + pipe.height + pipe.gap;
        const bottomGradient = ctx.createLinearGradient(pipe.x, bottomY, pipe.x, canvas.height);
        bottomGradient.addColorStop(0, '#4CAF50');
        bottomGradient.addColorStop(1, '#388E3C');
        
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(pipe.x, bottomY, pipe.width, canvas.height - bottomY);
        
        // Bottom pipe cap
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(pipe.x - 5, bottomY, pipe.width + 10, 25);
        
        // Pipe details
        ctx.fillStyle = '#81C784';
        for (let i = 0; i < pipe.height; i += 30) {
            ctx.fillRect(pipe.x + 10, pipe.y + i, pipe.width - 20, 10);
        }
        for (let i = 0; i < canvas.height - bottomY; i += 30) {
            ctx.fillRect(pipe.x + 10, bottomY + i, pipe.width - 20, 10);
        }
    });
}

// Draw animated background
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#98D8F0');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(300, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(300, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    // Animated clouds
    clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - cloud.width / 6, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 1.5, cloud.y - cloud.width / 6, cloud.width / 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Mountains
    mountains.forEach(mountain => {
        ctx.fillStyle = '#7E8C7D';
        ctx.beginPath();
        ctx.moveTo(mountain.x, canvas.height - 100);
        ctx.lineTo(mountain.x + 100, canvas.height - 100 - mountain.height);
        ctx.lineTo(mountain.x + 200, canvas.height - 100);
        ctx.fill();
        
        ctx.fillStyle = '#6A7B6A';
        ctx.beginPath();
        ctx.moveTo(mountain.x + 150, canvas.height - 100);
        ctx.lineTo(mountain.x + 200, canvas.height - 100 - mountain.height * 0.8);
        ctx.lineTo(mountain.x + 250, canvas.height - 100);
        ctx.fill();
    });

    // Ground
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    groundGradient.addColorStop(0, '#8BC34A');
    groundGradient.addColorStop(1, '#7CB342');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Ground pattern
    ctx.fillStyle = '#7CB342';
    for (let i = 0; i < canvas.width; i += 25) {
        const height = Math.sin((i + frames) * 0.1) * 3 + 8;
        ctx.fillRect(i, canvas.height - 100, 15, height);
    }
}

// Draw particles
function drawParticles() {
    particles.forEach((particle, index) => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    ctx.globalAlpha = 1;
}

// Update bird physics
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Rotation based on velocity
    bird.rotation = bird.velocity * 0.05;
    bird.rotation = Math.max(-0.5, Math.min(0.5, bird.rotation));
    
    // Ground collision
    if (bird.y + bird.height / 2 > canvas.height - 100) {
        bird.y = canvas.height - 100 - bird.height / 2;
        if (gameRunning) {
            gameOver();
        }
    }
    
    // Ceiling collision
    if (bird.y - bird.height / 2 < 0) {
        bird.y = bird.height / 2;
        bird.velocity = 0;
    }
}

// Update pipes
function updatePipes() {
    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeConfig.speed;
        
        // Check if pipe passed
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
            scoreElement.classList.add('score-pop');
            setTimeout(() => scoreElement.classList.remove('score-pop'), 300);
            playSound(pointSound);
            createParticles(bird.x, bird.y, 8, '#4ECDC4');
        }
    });
    
    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
    
    // Add new pipe
    if (frames % 120 === 0) {
        pipes.push(createPipe());
    }
}

// Update background elements
function updateBackground() {
    // Move clouds
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
        }
    });
    
    // Move mountains
    mountains.forEach(mountain => {
        mountain.x -= mountain.speed;
        if (mountain.x + 250 < 0) {
            mountain.x = canvas.width;
        }
    });
}

// Check collisions
function checkCollisions() {
    pipes.forEach(pipe => {
        const birdRight = bird.x + bird.width / 2;
        const birdLeft = bird.x - bird.width / 2;
        const birdTop = bird.y - bird.height / 2;
        const birdBottom = bird.y + bird.height / 2;
        
        const pipeRight = pipe.x + pipe.width;
        const pipeLeft = pipe.x;
        const topPipeBottom = pipe.y + pipe.height;
        const bottomPipeTop = pipe.y + pipe.height + pipe.gap;
        
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
                gameOver();
            }
        }
    });
}

// Jump function
function jump() {
    if (gameRunning) {
        bird.velocity = bird.jump;
        playSound(flapSound);
        createParticles(bird.x, bird.y, 5);
    }
}

// Play sound
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Audio play failed:', e));
}

// Game over
function gameOver() {
    gameRunning = false;
    playSound(hitSound);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }
    
    // Show game over screen
    finalScore.textContent = score;
    bestScore.textContent = highScore;
    gameOverScreen.classList.remove('hidden');
    
    // Create explosion particles
    createParticles(bird.x, bird.y, 20, '#FF6B6B');
}

// Reset game
function resetGame() {
    score = 0;
    frames = 0;
    pipes = [];
    particles = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    
    scoreElement.textContent = score;
    highScoreElement.textContent = `Best: ${highScore}`;
    gameOverScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
}

// Start game
function startGame() {
    resetGame();
    gameRunning = true;
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        updateBird();
        updatePipes();
        updateBackground();
        checkCollisions();
        
        drawBackground();
        drawPipes();
        drawBird();
        drawParticles();
        
        frames++;
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning && startScreen.classList.contains('hidden')) {
            startGame();
        }
        jump();
    }
});

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Initialize and start
initGameElements();
highScoreElement.textContent = `Best: ${highScore}`;
gameLoop();
