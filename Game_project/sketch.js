/* Welcome to my game project. Have fun! */

// ---------------------
// Global variables
// ---------------------

var floorPos_y;
var scrollPos;
// Game character variables.
var gameChar_x;
var gameChar_y;
var gameChar_world_x;
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
// Scenery variables.
var trees_x;
var trees_y;
var clouds;
var mountains;
var collectables;
var canyons;
var flagpole;
var tokens;
var platforms;

var game_score;
var game_lives;
// Sound variables.
var jumpSound;
var collectableSound;
var tokenSound;
var sheepSound;
var eatingSound;
var fallingSound;
var winningSound;
var gameThemeSound;
// Text font.
var font;

var gameStarted;
var enemies;

// ---------------------
// Preload and setup
// ---------------------

function preload() {
    soundFormats('mp3', 'wav');

    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);

    collectableSound = loadSound('assets/collectable.wav');
    collectableSound.setVolume(0.3);

    eatingSound = loadSound('assets/eating.wav');
    eatingSound.setVolume(0.2);

    sheepSound = loadSound('assets/sheep.wav');
    sheepSound.setVolume(0.1);

    fallingSound = loadSound('assets/falling.wav');
    fallingSound.setVolume(0.2);

    winningSound = loadSound('assets/winning.wav');
    winningSound.setVolume(0.1);

    gameThemeSound = loadSound('assets/gameTheme.wav');
    font = loadFont('assets/norwester.otf');
}

function setup() {
    createCanvas(1024, 576);

    floorPos_y = height * 3 / 4;
    game_lives = 3;
    game_score = 0;
    gameStarted = false;
}

// ---------------------
// Game controls
// ---------------------

function startGame() {
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    trees_y = height / 2;

    // Variable to control the background scrolling.
    scrollPos = 0;

    // Variable to store the real position of the gameChar in the game world. Needed for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    // Boolean variables to control the movement of the game character.
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;

    // Initialise arrays of scenery objects.
    trees_x = [50, 300, 480, 1000, 1400, 1800, 2200];

    clouds = [
        { x_pos: 100, y_pos: 200, size: 40 },
        { x_pos: 600, y_pos: 100, size: 40 },
        { x_pos: 800, y_pos: 200, size: 40 },
        { x_pos: 1200, y_pos: 100, size: 40 },
        { x_pos: 1600, y_pos: 100, size: 40 },
        { x_pos: 2000, y_pos: 200, size: 40 },
        { x_pos: 2400, y_pos: 100, size: 40 }
    ];

    mountains = [
        { x1_pos: 200, y1_pos: floorPos_y - 250, x2_pos: 50, y2_pos: floorPos_y, x3_pos: 350, y3_pos: floorPos_y },
        { x1_pos: 900, y1_pos: floorPos_y - 250, x2_pos: 750, y2_pos: floorPos_y, x3_pos: 1050, y3_pos: floorPos_y },
        { x1_pos: 1600, y1_pos: floorPos_y - 250, x2_pos: 1450, y2_pos: floorPos_y, x3_pos: 1750, y3_pos: floorPos_y },
        { x1_pos: 2600, y1_pos: floorPos_y - 250, x2_pos: 2450, y2_pos: floorPos_y, x3_pos: 2750, y3_pos: floorPos_y }
    ];

    canyons = [
        { x_pos: floorPos_y + 100, y_pos: floorPos_y, width: 150, height: 110 },
        { x_pos: floorPos_y + 700, y_pos: floorPos_y, width: 150, height: 110 },
        { x_pos: floorPos_y + 1500, y_pos: floorPos_y, width: 150, height: 110 }
    ];

    collectables = [
        { x_pos: 200, y_pos: floorPos_y, size: 30, isFound: false },
        { x_pos: 1500, y_pos: floorPos_y, size: 30, isFound: false },
        { x_pos: 2600, y_pos: floorPos_y, size: 30, isFound: false }
    ];

    tokens = [
        { x_pos: 1750, y_pos: floorPos_y, size: 30, stem_x: 10, stem_y: 20, isFound: false }
    ];

    platforms = [];
    platforms.push(createPlatforms(100, floorPos_y - 100, 70));
    platforms.push(createPlatforms(530, floorPos_y - 100, 150));
    platforms.push(createPlatforms(1140, floorPos_y - 100, 150));
    platforms.push(createPlatforms(1940, floorPos_y - 100, 150));

    flagpole = { isReached: false, x_pos: 3000 };

    enemies = [];
    enemies.push(new Enemy(100, floorPos_y - 10, 200));
    enemies.push(new Enemy(1500, floorPos_y - 10, 100));
}

// Helper function to play game theme music.
function playGameTheme() {
    if (!gameThemeSound.isPlaying()) {
        gameThemeSound.setVolume(0.05);
        gameThemeSound.loop();
    }
}

function checkPlayerDie() {
    if (gameChar_y >= height) {
        game_lives -= 1;

        if (game_lives > 0) {
            startGame();
            playGameTheme();
        }
        else {
            game_lives = 0;
            gameThemeSound.stop();
        }
    }
}

// Check if the character has reached the flagpole.
function checkFlagpole() {
    var d = abs(gameChar_world_x - flagpole.x_pos);

    if (d < 15) {
        gameThemeSound.stop();
        winningSound.play();
        flagpole.isReached = true;
    }
}

function draw() {
    background(100, 155, 255); // Fill sky blue.

    noStroke();
    fill(0, 120, 0);
    rect(0, floorPos_y, width, height / 4); // Draw green ground.

    if (!gameStarted) {
        fill(255);
        textAlign(CENTER);
        textFont(font);
        textSize(50);
        text("Press SPACE to start", width / 2, height / 2);
        textSize(24);
        text("Welcome to my game project", width / 2, height / 2 + 50);
        textAlign(LEFT);
        return;
    }

    // Cloud animation.
    push(); // Start cloud scroll.
    translate(scrollPos * 0.2, 0); // Slowest scroll rate.
    drawClouds();
    pop(); // End cloud scroll.

    push(); // Start world scroll.
    translate(scrollPos, 0); // Normal scroll rate.
    drawMountains();

    drawTrees();

    // Draw platforms.
    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    // Draw canyons.
    for (var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]); // Draw canyon.
        checkCanyon(canyons[i]); // Check whether the character should fall into the canyon.
    }

    // Draw collectable items.
    for (var i = 0; i < collectables.length; i++) {
        if (!collectables[i].isFound) {
            drawCollectable(collectables[i]); // Draw collectables.
            checkCollectable(collectables[i]); // Check for collection.
        }
    }

    // Draw life tokens.
    for (var i = 0; i < tokens.length; i++) {
        if (!tokens[i].isFound) {
            drawTokens(tokens[i]); // Draw tokens.
            checkTokens(tokens[i]); // Check for collection.
        }
    }

    renderFlagpole();

    // Checking if enemies in contact.
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();

        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

        if (isContact) {
            game_lives -= 1;

            if (game_lives > 0) {
                startGame();
                playGameTheme();
                break;
            }
            else {
                game_lives = 0;
                gameThemeSound.stop();
            }
        }
    }

    pop();

    drawGameChar();

    // Display score and lives.
    fill(225);
    noStroke();
    textSize(20);
    textFont(font);
    text("Score: " + game_score, 30, 30);
    text("Lives: " + game_lives, 30, 60);

    // Display game over.
    if (game_lives <= 0) {
        fill(127, 255, 212);
        noStroke();
        textSize(50);
        text("Game over", width / 3, height / 2.3);
        textSize(20);
        text("Press space to restart.", width / 3, height / 1.9);
        return;
    }

    // Display level complete.
    if (flagpole.isReached) {
        fill(127, 255, 212);
        noStroke();
        textSize(50);
        text("Level complete", width / 3, height / 2.3);
        textSize(20);
        text("Congratulations, You won!", width / 3, height / 1.9);
        return;
    }

    // Logic to make the game character move or the background scroll.
    if (isLeft) {
        if (gameChar_x > width * 0.2) {
            gameChar_x -= 5;
        }
        else {
            scrollPos += 5;
        }
    }

    if (isRight) {
        if (gameChar_x < width * 0.8) {
            gameChar_x += 5;
        }
        else {
            scrollPos -= 5; // Negative for moving against the background.
        }
    }

    // Logic to make the game character rise and fall.
    if (gameChar_y < floorPos_y) {
        var isContact = false;
        for (var i = 0; i < platforms.length; i++) {
            if (platforms[i].checkContact(gameChar_world_x, gameChar_y)) {
                isContact = true;
                isFalling = false;
                break;
            }
        }
        if (!isContact) {
            gameChar_y += 5;
            isFalling = true;
        }
    }
    else {
        isFalling = false;
    }

    // Logic to check the flagpole.
    if (!flagpole.isReached) {
        checkFlagpole();
    }

    checkPlayerDie();

    // Update real position of gameChar for collision detection. 
    gameChar_world_x = gameChar_x - scrollPos;
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
    // Start screen.
    if (!gameStarted) {
        if (keyCode == 32) {
            gameStarted = true;
            startGame();

            playGameTheme();
        }
        return;
    }

    // Space key to restart when game is over.
    if (game_lives <= 0) {
        if (keyCode == 32) {
            game_lives = 3;
            game_score = 0;
            startGame();

            playGameTheme();
        }
        return;
    }

    // Normal controls only if game is not over.
    if (keyCode == 37) {
        isLeft = true;
    }
    else if (keyCode == 39) {
        isRight = true;
    }
    // Checks if game character is on the floor.
    else if (keyCode == 32 || keyCode == 38) {
        if (gameChar_y == floorPos_y) {
            gameChar_y -= 130;
            jumpSound.play();
        }
    }
}

function keyReleased() {
    if (keyCode == 37) {
        isLeft = false;
    }

    else if (keyCode == 39) {
        isRight = false;
    }
}

// ------------------------------
// Game character drawing
// ------------------------------

function drawGameChar() {
    if (isLeft && isFalling) { // Jumping-left code.
        // Head
        fill(210, 180, 140);
        ellipse(gameChar_x, gameChar_y - 60, 25, 25);
        // Hair 
        fill(130, 0, 0);
        arc(gameChar_x, gameChar_y - 65, 26, 23, PI, TWO_PI);
        // Eye
        stroke(0);
        fill(255);
        ellipse(gameChar_x - 4, gameChar_y - 60, 5, 7);
        strokeWeight(3);
        point(gameChar_x - 4, gameChar_y - 59);
        strokeWeight(1);
        // Body
        fill(30, 144, 150);
        rect(gameChar_x - 7, gameChar_y - 48, 20, 20);
        // Arm
        strokeWeight(5);
        line(gameChar_x - 11, gameChar_y - 40,
            gameChar_x + 5, gameChar_y - 46);
        fill(210, 180, 140);
        noStroke();
        ellipse(gameChar_x - 11, gameChar_y - 40, 10, 5);
        strokeWeight(1);
        // Leg
        fill(0);
        rect(gameChar_x - 15, gameChar_y - 33, 28, 8);
        rect(gameChar_x - 15, gameChar_y - 30, 8, 10);
    }
    else if (isRight && isFalling) { // Jumping-right code.
        // Head
        fill(210, 180, 140);
        ellipse(gameChar_x, gameChar_y - 60, 25, 25);
        // Hair
        fill(130, 0, 0);
        arc(gameChar_x, gameChar_y - 65, 26, 23, PI, TWO_PI);
        // Eye
        stroke(0);
        fill(255);
        ellipse(gameChar_x + 4, gameChar_y - 60, 5, 7);
        strokeWeight(3);
        point(gameChar_x + 4, gameChar_y - 59);
        strokeWeight(1);
        // Body
        fill(30, 144, 150);
        rect(gameChar_x - 15, gameChar_y - 48, 20, 20);
        // Arm
        strokeWeight(5);
        line(gameChar_x + 13, gameChar_y - 40,
            gameChar_x, gameChar_y - 46);
        fill(210, 180, 140);
        noStroke();
        ellipse(gameChar_x + 13, gameChar_y - 40, 10, 5);
        strokeWeight(1);
        // Leg
        fill(0);
        rect(gameChar_x - 15, gameChar_y - 33, 28, 8);
        rect(gameChar_x + 5, gameChar_y - 30, 8, 10);
    }
    else if (isLeft) { // Walking left code.
        // Head
        fill(210, 180, 140);
        ellipse(gameChar_x, gameChar_y - 51, 25, 25);
        // Hair
        fill(130, 0, 0);
        arc(gameChar_x, gameChar_y - 55, 26, 23, PI, TWO_PI);
        // Eye
        stroke(0);
        fill(255);
        ellipse(gameChar_x - 4, gameChar_y - 51, 5, 7);
        strokeWeight(3);
        point(gameChar_x - 4, gameChar_y - 51);
        strokeWeight(1);
        // Body
        fill(30, 144, 150);
        rect(gameChar_x - 7, gameChar_y - 39, 20, 25);
        // Arm
        strokeWeight(5);
        line(gameChar_x - 15, gameChar_y - 30,
            gameChar_x + 5, gameChar_y - 36);
        fill(210, 180, 140);
        noStroke();
        ellipse(gameChar_x - 15, gameChar_y - 30, 10, 5);
        strokeWeight(1);
        // Leg
        fill(0);
        rect(gameChar_x - 2, gameChar_y - 15, 10, 18);
        rect(gameChar_x - 5, gameChar_y, 5, 3);
    }
    else if (isRight) { // Walking right code.
        // Head
        fill(210, 180, 140);
        ellipse(gameChar_x, gameChar_y - 51, 25, 25);
        // Hair
        fill(130, 0, 0);
        arc(gameChar_x, gameChar_y - 55, 26, 23, PI, TWO_PI);
        // Eye
        stroke(0);
        fill(255);
        ellipse(gameChar_x + 4, gameChar_y - 51, 5, 7);
        strokeWeight(3);
        point(gameChar_x + 4, gameChar_y - 51);
        strokeWeight(1);
        // Body
        fill(30, 144, 150);
        rect(gameChar_x - 15, gameChar_y - 39, 20, 25);
        // Arm
        strokeWeight(5);
        line(gameChar_x + 15, gameChar_y - 30,
            gameChar_x - 5, gameChar_y - 36);
        fill(210, 180, 140);
        noStroke();
        ellipse(gameChar_x + 15, gameChar_y - 30, 10, 5);
        strokeWeight(1);
        // Leg
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 15, 10, 18);
        rect(gameChar_x, gameChar_y, 5, 3);
    }
    else if (isFalling || isPlummeting) { // Jumping facing forwards.
        // Head
        fill(210, 180, 140);
        ellipse(gameChar_x, gameChar_y - 62, 25, 25);
        // Hair
        fill(130, 0, 0);
        arc(gameChar_x, gameChar_y - 67, 26, 23, PI, TWO_PI);
        fill(210, 180, 140);
        triangle(gameChar_x + 4, gameChar_y - 72,
            gameChar_x - 6, gameChar_y - 65,
            gameChar_x + 9, gameChar_y - 65);
        // Mouth
        fill(255, 0, 0);
        arc(gameChar_x, gameChar_y - 55, 8, 4, TWO_PI, PI);
        // Eyes
        stroke(0);
        fill(255);
        ellipse(gameChar_x - 4, gameChar_y - 64, 5, 7);
        ellipse(gameChar_x + 4, gameChar_y - 64, 5, 7);
        strokeWeight(3);
        point(gameChar_x - 4, gameChar_y - 63);
        point(gameChar_x + 4, gameChar_y - 63);
        strokeWeight(1);
        // Body
        fill(30, 144, 150);
        rect(gameChar_x - 12, gameChar_y - 50, 23, 20);
        fill(60, 60, 250);
        noStroke();
        ellipse(gameChar_x, gameChar_y - 40, 14, 14);
        fill(255, 255, 0);
        textSize(12);
        text("D", gameChar_x - 4, gameChar_y - 36);
        stroke(0);
        // Arms
        strokeWeight(5);
        line(gameChar_x + 18, gameChar_y - 40,
            gameChar_x + 11, gameChar_y - 48);
        line(gameChar_x - 18, gameChar_y - 40,
            gameChar_x - 11, gameChar_y - 48);
        fill(210, 180, 140);
        noStroke();
        ellipse(gameChar_x + 18, gameChar_y - 40, 5, 10);
        ellipse(gameChar_x - 18, gameChar_y - 40, 5, 10);
        strokeWeight(1);
        // Legs
        fill(0);
        rect(gameChar_x - 15, gameChar_y - 35, 8, 15);
        rect(gameChar_x + 7, gameChar_y - 35, 8, 15);
        rect(gameChar_x - 10, gameChar_y - 35, 8, 8);
        rect(gameChar_x + 2, gameChar_y - 35, 8, 8);
    }
    else { // standing front facing.
        // Head
        fill(210, 180, 140);
        ellipse(gameChar_x, gameChar_y - 52, 25, 25);
        // Hair
        fill(130, 0, 0);
        arc(gameChar_x, gameChar_y - 55, 26, 23, PI, TWO_PI);
        fill(210, 180, 140);
        triangle(gameChar_x + 4, gameChar_y - 62,
            gameChar_x - 6, gameChar_y - 55,
            gameChar_x + 9, gameChar_y - 55);
        // Mouth
        fill(255, 0, 0);
        arc(gameChar_x, gameChar_y - 45, 8, 8, TWO_PI, PI);
        // Eyes
        stroke(0);
        fill(255);
        ellipse(gameChar_x - 4, gameChar_y - 51, 5, 7);
        ellipse(gameChar_x + 4, gameChar_y - 51, 5, 7);
        strokeWeight(3);
        point(gameChar_x - 4, gameChar_y - 51);
        point(gameChar_x + 4, gameChar_y - 51);
        strokeWeight(1);
        // Body & T-shirt logo
        fill(30, 144, 150);
        rect(gameChar_x - 12, gameChar_y - 40, 23, 27);
        noStroke();
        fill(60, 60, 250);
        ellipse(gameChar_x, gameChar_y - 30, 14, 14);
        fill(255, 255, 0);
        textSize(12);
        text("D", gameChar_x - 4, gameChar_y - 26);
        stroke(0);
        // Arms
        strokeWeight(5);
        line(gameChar_x + 9, gameChar_y - 20,
            gameChar_x + 10, gameChar_y - 38);
        line(gameChar_x - 9, gameChar_y - 20,
            gameChar_x - 10, gameChar_y - 38);
        fill(210, 180, 140);
        noStroke();
        ellipse(gameChar_x - 8, gameChar_y - 20, 5, 10);
        ellipse(gameChar_x + 8, gameChar_y - 20, 5, 10);
        strokeWeight(1);
        // Legs
        fill(0);
        rect(gameChar_x - 12, gameChar_y - 13, 8, 16);
        rect(gameChar_x + 3, gameChar_y - 13, 8, 16);
    }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds() {
    for (var i = 0; i < clouds.length; i++) {
        fill(192, 192, 192);
        ellipse(
            clouds[i].x_pos,
            clouds[i].y_pos,
            clouds[i].size + 30,
            clouds[i].size + 25);
        ellipse(
            clouds[i].x_pos + 40,
            clouds[i].y_pos,
            clouds[i].size + 15,
            clouds[i].size);
        ellipse(
            clouds[i].x_pos - 50,
            clouds[i].y_pos,
            clouds[i].size + 15,
            clouds[i].size);
        fill(255);
        ellipse(
            clouds[i].x_pos,
            clouds[i].y_pos,
            clouds[i].size + 30,
            clouds[i].size + 20);
        ellipse(
            clouds[i].x_pos + 45,
            clouds[i].y_pos,
            clouds[i].size + 10,
            clouds[i].size);
        ellipse(
            clouds[i].x_pos - 40,
            clouds[i].y_pos,
            clouds[i].size + 10,
            clouds[i].size);
    }
}

// Function to draw mountains objects.
function drawMountains() {
    for (var i = 0; i < mountains.length; i++) {
        // Mountain shadow
        fill(105, 105, 105);
        triangle(
            mountains[i].x1_pos,
            mountains[i].y1_pos,
            mountains[i].x2_pos,
            mountains[i].y2_pos,
            mountains[i].x3_pos,
            mountains[i].y3_pos);
        // Mountains
        fill(145, 163, 176);
        triangle(
            mountains[i].x1_pos,
            mountains[i].y1_pos,
            mountains[i].x2_pos + 50,
            mountains[i].y2_pos,
            mountains[i].x3_pos,
            mountains[i].y3_pos);
        // Mountain ice top
        fill(255, 255, 255);
        triangle(
            mountains[i].x1_pos,
            mountains[i].y1_pos,
            mountains[i].x2_pos + 100,
            mountains[i].y2_pos - 169,
            mountains[i].x3_pos - 110,
            mountains[i].y3_pos - 190);
    }
}

// Function to draw trees objects.
function drawTrees() {
    for (var i = 0; i < trees_x.length; i++) {
        // Tree trunk
        noStroke();
        fill(160, 82, 45);
        rect(
            trees_x[i],
            floorPos_y,
            20, -90);
        // Branches
        fill(50, 110, 34);
        triangle(
            trees_x[i] + 15,
            trees_y + 30,
            trees_x[i] + 65,
            trees_y + 100,
            trees_x[i] - 40,
            trees_y + 100);
        fill(34, 130, 34);
        triangle(
            trees_x[i] + 15,
            trees_y + 10,
            trees_x[i] + 55,
            trees_y + 70,
            trees_x[i] - 35,
            trees_y + 70);
        fill(50, 150, 34);
        triangle(
            trees_x[i] + 15,
            trees_y - 10,
            trees_x[i] + 45,
            trees_y + 40,
            trees_x[i] - 25,
            trees_y + 40);
    }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon) {
    fill(0, 0, 255);
    rect(
        t_canyon.x_pos,
        t_canyon.y_pos + 110,
        t_canyon.width,
        t_canyon.height);
    fill(100, 155, 255);
    rect(
        t_canyon.x_pos,
        t_canyon.y_pos,
        t_canyon.width,
        t_canyon.height);
    fill(139, 69, 19);
    triangle(
        t_canyon.x_pos,
        t_canyon.y_pos,
        t_canyon.x_pos - 10,
        t_canyon.y_pos + 145,
        t_canyon.x_pos,
        t_canyon.y_pos + 145);
    fill(139, 69, 19);
    triangle(
        t_canyon.x_pos + 150,
        t_canyon.y_pos,
        t_canyon.x_pos + 150,
        t_canyon.y_pos + 300,
        t_canyon.x_pos + 130,
        t_canyon.y_pos + 300);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon) {
    if (gameChar_world_x > t_canyon.x_pos + 10 &&
        gameChar_world_x < t_canyon.x_pos + t_canyon.width) {
        if (!isPlummeting && (gameChar_y >= floorPos_y)) {
            gameThemeSound.stop();
            fallingSound.play();
        }

        if (gameChar_y >= floorPos_y) {
            isPlummeting = true;
        }
    }

    if (isPlummeting) {
        gameChar_world_x = constrain(gameChar_world_x,
            (t_canyon.x_pos + 10),
            (t_canyon.x_pos + t_canyon.width));
        gameChar_y += 1;
    }
}

// Flagpole created.
function renderFlagpole() {
    push();

    strokeWeight(5);
    stroke(200);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);

    fill(238, 130, 238);
    noStroke();

    if (flagpole.isReached) {
        rect(flagpole.x_pos, floorPos_y - 250, 70, 50);
    }
    else {
        rect(flagpole.x_pos, floorPos_y - 50, 70, 50);
    }

    pop();
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable) {
    // Ring collectable.
    noFill();
    strokeWeight(6);
    stroke(255, 220, 0);
    ellipse(
        t_collectable.x_pos,
        t_collectable.y_pos - 20,
        t_collectable.size,
        t_collectable.size);
    fill(255, 0, 255);
    stroke(255, 165, 0);
    strokeWeight(1);
    stroke(255);
    quad(
        t_collectable.x_pos - 5,
        t_collectable.y_pos - t_collectable.size,
        t_collectable.x_pos - 10,
        t_collectable.y_pos - (t_collectable.size + 15),
        t_collectable.x_pos + 10,
        t_collectable.y_pos - (t_collectable.size + 15),
        t_collectable.x_pos + 5,
        t_collectable.y_pos - t_collectable.size);
    noStroke();
}

// Function to check character has collected an item.
function checkCollectable(t_collectable) {
    if (dist(gameChar_world_x - 20, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 20) {
        t_collectable.isFound = true;
        game_score += 1;
        collectableSound.play();
    }
}

// Functions to draw tokens.
function drawTokens(t_tokens) {
    fill(220, 0, 0);
    ellipse(
        t_tokens.x_pos + 5,
        t_tokens.y_pos - 15,
        t_tokens.size, 10);
    fill(255);
    rect(
        t_tokens.x_pos,
        t_tokens.y_pos - 14,
        t_tokens.stem_x,
        t_tokens.stem_y);
    fill(128, 0, 0);
    arc(
        t_tokens.x_pos + 5,
        t_tokens.y_pos - 15,
        t_tokens.size, 35,
        PI, TWO_PI);
}

// Check collected tokens.
function checkTokens(t_tokens) {
    if (dist(gameChar_world_x - 20, gameChar_y, t_tokens.x_pos, t_tokens.y_pos) < 20) {
        t_tokens.isFound = true;
        eatingSound.play();
        game_lives += 1;
    }
}

// Construction function for the platforms.
function createPlatforms(x, y, length) {
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function () {
            fill(120, 69, 19);
            rect(this.x, this.y, this.length, 25, 50);
            fill(0, 100, 0);
            rect(this.x, this.y, this.length, 18, 50);
        },
        checkContact: function (gc_x, gc_y) {
            if (gc_x > this.x && gc_x < this.x + this.length) {
                var d = this.y - gc_y;
                if (d >= 0 && d < 5) {
                    return true;
                }
            }
            return false;
        }
    };
    return p;
}

// Construction function for the enemy.
function Enemy(x, y, range) {
    this.x = x;
    this.y = y;
    this.range = range;

    this.currentX = x;
    this.inc = 1;

    this.update = function () {
        this.currentX += this.inc;

        if (this.currentX >= this.x + this.range) {
            this.inc = -1;
        }
        else if (this.currentX < this.x) {
            this.inc = 1;
        }
    };
    // Enemy drawing.
    this.draw = function () {
        this.update();
        if (this.inc < 0) {
            // Opposite enemy direction when moving left.
            fill(0);
            // Head & tail
            ellipse(this.currentX - 20, this.y - 25, 33, 23);
            rect(this.currentX + 20, this.y - 35, 2, 30, 20);
            ellipse(this.currentX + 20, this.y - 35, 5, 5);
            // Legs
            rect(this.currentX + 10, this.y, 5, 17);
            rect(this.currentX + 17, this.y, 5, 17);
            rect(this.currentX - 19, this.y, 5, 17);
            rect(this.currentX - 26, this.y, 5, 17);
            fill(255);
            // Body
            ellipse(this.currentX + 15, this.y - 10, 25, 25);
            ellipse(this.currentX, this.y - 10, 30, 30);
            ellipse(this.currentX - 15, this.y - 10, 25, 25);
            // Hair
            ellipse(this.currentX - 16, this.y - 38, 15, 5);
            ellipse(this.currentX - 10, this.y - 34, 10, 5);
            ellipse(this.currentX - 8, this.y - 29, 10, 5);
            // Eyes
            ellipse(this.currentX - 20, this.y - 28, 10, 10);
            fill(255, 0, 0);
            ellipse(this.currentX - 22, this.y - 28, 5, 3);
        }
        else {
            fill(0);
            // Head & tail
            ellipse(this.currentX + 20, this.y - 25, 33, 23);
            rect(this.currentX - 20, this.y - 35, 2, 30, 20);
            ellipse(this.currentX - 20, this.y - 35, 5, 5);
            // Legs
            rect(this.currentX + 10, this.y, 5, 15);
            rect(this.currentX + 20, this.y, 5, 15);
            rect(this.currentX - 15, this.y, 5, 15);
            rect(this.currentX - 23, this.y, 5, 15);
            fill(255);
            // Body
            ellipse(this.currentX + 15, this.y - 10, 25, 25);
            ellipse(this.currentX, this.y - 10, 30, 30);
            ellipse(this.currentX - 15, this.y - 10, 25, 25);
            // Hair
            ellipse(this.currentX + 16, this.y - 38, 15, 5);
            ellipse(this.currentX + 10, this.y - 34, 10, 5);
            ellipse(this.currentX + 8, this.y - 29, 10, 5);
            // Eyes
            ellipse(this.currentX + 20, this.y - 28, 10, 10);
            fill(255, 0, 0);
            ellipse(this.currentX + 22, this.y - 28, 5, 3);
        }
    };

    // Check if the character is in contact with the enemy.
    this.checkContact = function (gc_x, gc_y) {
        var d = dist(gc_x, gc_y, this.currentX, this.y);

        if (d < 20) {
            if (game_lives > 0) {
                gameThemeSound.stop();
                sheepSound.play();
            }
            else {
                sheepSound.stop();
            }
            return true;
        }
        return false;
    };
}
