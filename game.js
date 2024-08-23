const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const groundHeight = 50;
const gravity = 0.5;  
const character = {
    x: 50,
    y: canvas.height - groundHeight - 40,
    width: 30,
    height: 40,
    color: 'red',
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    isJumping: false,
    isAlive: true
};

const platforms = [
    { x: 100, y: 300, width: 100, height: 10 },
    { x: 250, y: 250, width: 100, height: 10 },
    { x: 400, y: 200, width: 100, height: 10 },
    { x: 550, y: 150, width: 100, height: 10 }
];

const obstacles = [
    { x: 200, y: canvas.height - groundHeight - 20, width: 20, height: 20 },
    { x: 450, y: canvas.height - groundHeight - 20, width: 20, height: 20 }
];

const enemy = {
    x: 600,
    y: canvas.height - groundHeight - 30,
    width: 30,
    height: 30,
    color: 'purple',
    direction: 1,
    speed: 2
};

const keys = {
    right: false,
    left: false,
    up: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp') {
        if (!character.isJumping && character.isAlive) {
            character.velocityY = -10;
            character.isJumping = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
});

const drawGround = () => {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
};

const drawPlatforms = () => {
    ctx.fillStyle = '#A9A9A9';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
};

const drawObstacles = () => {
    ctx.fillStyle = 'black';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
};

const drawEnemy = () => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
};

const drawCharacter = () => {
    if (character.isAlive) {
        ctx.fillStyle = character.color;
        ctx.fillRect(character.x, character.y, character.width, character.height);
    }
};

const checkPlatformCollision = () => {
    platforms.forEach(platform => {
        if (character.x < platform.x + platform.width &&
            character.x + character.width > platform.x &&
            character.y + character.height > platform.y &&
            character.y + character.height < platform.y + platform.height) {
            character.y = platform.y - character.height;
            character.velocityY = 0;
            character.isJumping = false;
        }
    });
};

const checkObstacleCollision = () => {
    obstacles.forEach(obstacle => {
        if (character.x < obstacle.x + obstacle.width &&
            character.x + character.width > obstacle.x &&
            character.y + character.height > obstacle.y) {
            character.isAlive = false;
        }
    });
};

const checkEnemyCollision = () => {
    if (character.x < enemy.x + enemy.width &&
        character.x + character.width > enemy.x &&
        character.y + character.height > enemy.y) {
        character.isAlive = false;
    }
};

const updateEnemyPosition = () => {
    enemy.x += enemy.speed * enemy.direction;
    if (enemy.x <= 550 || enemy.x + enemy.width >= 750) {
        enemy.direction *= -1;
    }
};

const updateCharacterPosition = () => {
    if (character.isAlive) {
        if (keys.right) character.velocityX = character.speed;
        else if (keys.left) character.velocityX = -character.speed;
        else character.velocityX = 0;

        character.velocityY += gravity;
        character.x += character.velocityX;
        character.y += character.velocityY;

        if (character.y + character.height > canvas.height - groundHeight) {
            character.y = canvas.height - groundHeight - character.height;
            character.velocityY = 0;
            character.isJumping = false;
        }

        checkPlatformCollision();
        checkObstacleCollision();
        checkEnemyCollision();

        if (character.x < 0) character.x = 0;
        if (character.x + character.width > canvas.width) character.x = canvas.width - character.width;
    }
};

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlatforms();
    drawObstacles();
    drawEnemy();
    drawCharacter();
    updateCharacterPosition();
    updateEnemyPosition();

    requestAnimationFrame(gameLoop);
};

gameLoop();
