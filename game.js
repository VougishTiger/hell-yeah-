const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const groundHeight = 50;
const gravity = 0.5;
let scrollOffset = 0;

const images = {
    background: new Image(),
    platform: new Image(),
    obstacle: new Image(),
    enemy: new Image(),
    character: new Image()
};

const scaleFactor = 3; // Scaling factor based on character size

images.background.src = './sprites/maps/cave.png';
images.character.src = './sprites/Commissions/Rogue.png';
images.platform.src = './sprites/Objects/Ground0.png';
images.obstacle.src = './sprites/Objects/Trap0.png';
images.enemy.src = './sprites/Characters/Demon0.png';


let imagesLoaded = 0;
const totalImages = Object.keys(images).length;

const imageLoaded = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop(); // Start the game loop once all images are loaded
    }
};

Object.values(images).forEach(image => {
    image.onload = imageLoaded;
    image.onerror = () => console.error(`Failed to load image: ${image.src}`);
});

const character = {
    x: 50,
    y: canvas.height - groundHeight - 60, // Adjust based on character height
    width: 30, // Scaled size on the canvas
    height: 60, // Scaled size on the canvas
    velocityX: 0,
    velocityY: 0,
    speed: 1,
    isJumping: false,
    isAlive: true,
    frameX: 0,
    frameY: 0,
    frameWidth: 16, // Original frame width
    frameHeight: 16, // Original frame height
    frameSpeed: 15, // Control the animation speed
    currentFrame: 0
};

// Keep the original positions but scale the dimensions
const platforms = [
    { x: 100, y: 300, width: 100, height: 10 },
    { x: 250, y: 250, width: 100, height: 10 },
    { x: 400, y: 200, width: 100, height: 10 },
    { x: 550, y: 150, width: 100, height: 10 }
].map(platform => ({
    x: platform.x, // Keep position the same
    y: platform.y, // Keep position the same
    width: platform.width * scaleFactor,
    height: platform.height * scaleFactor
}));

const obstacles = [
    { x: 200, y: canvas.height - groundHeight - 20, width: 20, height: 20 },
    { x: 450, y: canvas.height - groundHeight - 20, width: 20, height: 20 }
].map(obstacle => ({
    x: obstacle.x, // Keep position the same
    y: obstacle.y, // Keep position the same
    width: obstacle.width * scaleFactor,
    height: obstacle.height * scaleFactor
}));

const enemy = {
    x: 600,
    y: canvas.height - groundHeight - (30 * scaleFactor), // Keep position on ground
    width: 16 * scaleFactor, // Scaled to match character size
    height: 16 * scaleFactor, // Scaled to match character size
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

const drawBackground = () => {
    ctx.drawImage(images.background, -scrollOffset, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, canvas.width - scrollOffset, 0, canvas.width, canvas.height);
    if (scrollOffset >= canvas.width) scrollOffset = 0;
};

const drawGround = () => {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
};

const drawPlatforms = () => {
    platforms.forEach(platform => {
        ctx.drawImage(images.platform, 0, 0, images.platform.width, images.platform.height, platform.x - scrollOffset, platform.y, platform.width, platform.height);
    });
};

const drawObstacles = () => {
    obstacles.forEach(obstacle => {
        ctx.drawImage(images.obstacle, 0, 0, images.obstacle.width, images.obstacle.height, obstacle.x - scrollOffset, obstacle.y, obstacle.width, obstacle.height);
    });
};

const drawEnemy = () => {
    ctx.drawImage(images.enemy, 0, 0, images.enemy.width, images.enemy.height, enemy.x - scrollOffset, enemy.y, enemy.width, enemy.height);
};

const drawCharacter = () => {
    if (character.isAlive) {
        ctx.drawImage(
            images.character,
            character.frameX * character.frameWidth, // Soasdurce X
            character.frameY * character.frameHeight, // Source Y
            character.frameWidth, // Source Width
            character.frameHeight, // Source Height
            character.x,
            character.y, 
            character.width, 
            character.height 
        );
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
    const buffer = 5; // Add some buffer space to prevent premature collisions
    if (character.x + buffer < enemy.x + enemy.width &&
        character.x + character.width - buffer > enemy.x &&
        character.y + buffer < enemy.y + enemy.height &&
        character.y + character.height - buffer > enemy.y) {
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
        if (keys.right) {
            character.velocityX = character.speed;
            character.frameY = 2; // Assuming row 2 is walking right
        } else if (keys.left) {
            character.velocityX = -character.speed;
            character.frameY = 1; // Assuming row 1 is walking left
        } else {
            character.velocityX = 0;
            character.frameY = 0; // Assuming row 0 is idle
        }

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

        scrollOffset += character.velocityX;

        // Handle animation frame updates
        character.currentFrame++;
        if (character.currentFrame >= character.frameSpeed) {
            character.frameX = (character.frameX + 1) % 4; // Cycle through the frames
            character.currentFrame = 0;
        }
    }
};

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawGround();
    drawPlatforms();
    drawObstacles();
    drawEnemy();
    drawCharacter();
    updateCharacterPosition();
    updateEnemyPosition();

    requestAnimationFrame(gameLoop);
};