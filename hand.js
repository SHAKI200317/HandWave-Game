/* =========================================================
   HANDWAVE — NEON CATCH
   Complete Game + Hand Tracking
   ========================================================= */

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const homeButton = document.getElementById("homeButton");

const scoreElement = document.getElementById("score");
const comboElement = document.getElementById("combo");
const levelElement = document.getElementById("level");
const livesElement = document.getElementById("lives");

const finalScoreElement = document.getElementById("finalScore");
const finalLevelElement = document.getElementById("finalLevel");
const finalComboElement = document.getElementById("finalCombo");
const highScoreElement = document.getElementById("highScore");

const webcam = document.getElementById("webcam");
const handCanvas = document.getElementById("handCanvas");
const gameCanvas = document.getElementById("gameCanvas");

const gestureElement = document.getElementById("gesture");
const gestureIcon = document.getElementById("gestureIcon");
const cameraStatus = document.getElementById("cameraStatus");

const pauseOverlay = document.getElementById("pauseOverlay");

const magnetBar = document.getElementById("magnetBar");
const shieldBar = document.getElementById("shieldBar");

const gameMessage = document.getElementById("gameMessage");

const ctx = gameCanvas.getContext("2d");
const handCtx = handCanvas.getContext("2d");


/* =========================================================
   GAME STATE
   ========================================================= */

let gameState = "home";

let score = 0;
let lives = 3;
let level = 1;
let combo = 0;
let maxCombo = 0;

let highScore =
    Number(localStorage.getItem("handwaveHighScore")) || 0;

let lastTime = 0;
let spawnTimer = 0;
let screenShake = 0;

let gameStarted = false;


/* =========================================================
   OBJECT ARRAYS
   ========================================================= */

let fallingObjects = [];
let particles = [];
let floatingTexts = [];
let backgroundStars = [];


/* =========================================================
   CATCHER
   ========================================================= */

const catcher = {

    x: 0,

    targetX: 0,

    y: 0,

    width: 115,

    height: 25,

    shieldTimer: 0,

    magnetTimer: 0
};


/* =========================================================
   HAND VARIABLES
   ========================================================= */

let handDetected = false;

let handX = 0.5;

let smoothedHandX = 0.5;

let currentGesture = "SHOW HAND";

let previousGesture = "";


/* =========================================================
   PAUSE GESTURE
   ========================================================= */

let openPalmStart = 0;

let pauseGestureLocked = false;

const PAUSE_HOLD_TIME = 650;


/* =========================================================
   OTHER GESTURE COOLDOWNS
   ========================================================= */

let thumbsCooldown = 0;


/* =========================================================
   CAMERA
   ========================================================= */

let cameraStream = null;

let hands = null;


/* =========================================================
   START / RESTART
   ========================================================= */

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);

homeButton.addEventListener("click", goHome);


/* =========================================================
   RESIZE
   ========================================================= */

function resizeCanvases() {

    const gameRect =
        gameCanvas.getBoundingClientRect();

    const handRect =
        handCanvas.getBoundingClientRect();

    gameCanvas.width =
        Math.max(1, Math.floor(gameRect.width));

    gameCanvas.height =
        Math.max(1, Math.floor(gameRect.height));

    handCanvas.width =
        Math.max(1, Math.floor(handRect.width));

    handCanvas.height =
        Math.max(1, Math.floor(handRect.height));


    catcher.y =
        gameCanvas.height - 70;


    catcher.x =
        gameCanvas.width / 2;

    catcher.targetX =
        catcher.x;
}


window.addEventListener(
    "resize",
    resizeCanvases
);


/* =========================================================
   CREATE BACKGROUND STARS
   ========================================================= */

function createStars() {

    backgroundStars = [];

    for (let i = 0; i < 100; i++) {

        backgroundStars.push({

            x: Math.random() *
                gameCanvas.width,

            y: Math.random() *
                gameCanvas.height,

            size:
                Math.random() * 2 + 0.5,

            speed:
                Math.random() * 30 + 10,

            alpha:
                Math.random() * 0.8 + 0.2
        });
    }
}


/* =========================================================
   START GAME
   ========================================================= */

function startGame() {

    gameState = "playing";

    gameStarted = true;

    score = 0;

    lives = 3;

    level = 1;

    combo = 0;

    maxCombo = 0;

    spawnTimer = 0;

    screenShake = 0;

    fallingObjects = [];

    particles = [];

    floatingTexts = [];

    catcher.shieldTimer = 0;

    catcher.magnetTimer = 0;

    smoothedHandX = 0.5;

    openPalmStart = 0;

    pauseGestureLocked = false;

    homeScreen.classList.remove("active");

    gameOverScreen.classList.remove("active");

    gameScreen.classList.add("active");

    pauseOverlay.classList.remove("show");

    resizeCanvases();

    createStars();

    updateHUD();

    showMessage(
        "GET READY!",
        "#00f5ff"
    );

    startCamera();
}


/* =========================================================
   GO HOME
   ========================================================= */

function goHome() {

    gameState = "home";

    gameStarted = false;

    gameScreen.classList.remove("active");

    gameOverScreen.classList.remove("active");

    homeScreen.classList.add("active");

    pauseOverlay.classList.remove("show");
}


/* =========================================================
   END GAME
   ========================================================= */

function endGame() {

    gameState = "gameover";

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "handwaveHighScore",
            highScore
        );
    }


    finalScoreElement.textContent =
        score;

    finalLevelElement.textContent =
        level;

    finalComboElement.textContent =
        maxCombo;

    highScoreElement.textContent =
        highScore;


    gameScreen.classList.remove("active");

    gameOverScreen.classList.add("active");

    pauseOverlay.classList.remove("show");
}


/* =========================================================
   UPDATE HUD
   ========================================================= */

function updateHUD() {

    scoreElement.textContent =
        score;

    comboElement.textContent =
        combo;

    levelElement.textContent =
        level;

    livesElement.textContent =
        lives;
}


/* =========================================================
   LEVEL SYSTEM
   ========================================================= */

function updateLevel() {

    const newLevel =
        Math.floor(score / 500) + 1;


    if (newLevel !== level) {

        level = newLevel;

        showMessage(
            "LEVEL " + level,
            "#8b5cf6"
        );

        createParticles(
            gameCanvas.width / 2,
            gameCanvas.height / 2,
            "#8b5cf6",
            60
        );
    }
}


/* =========================================================
   SPAWN OBJECTS
   ========================================================= */

function spawnObject() {

    const random =
        Math.random();

    let type;


    if (random < 0.46) {

        type = "crystal";

    } else if (random < 0.70) {

        type = "star";

    } else if (random < 0.84) {

        type = "bomb";

    } else if (random < 0.94) {

        type = "power";

    } else {

        type = "mega";
    }


    const sizes = {

        crystal: 24,

        star: 25,

        bomb: 26,

        power: 24,

        mega: 32
    };


    const speed = {

        crystal: 170,

        star: 190,

        bomb: 220,

        power: 175,

        mega: 150
    };


    fallingObjects.push({

        type: type,

        x:
            Math.random() *
            (gameCanvas.width - 60) + 30,

        y: -40,

        size:
            sizes[type],

        speed:
            speed[type] +
            level * 12,

        rotation:
            Math.random() * Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 3
    });
}


/* =========================================================
   OBJECT COLORS
   ========================================================= */

function getObjectColor(type) {

    if (type === "crystal")
        return "#00c8ff";

    if (type === "star")
        return "#ffe600";

    if (type === "bomb")
        return "#ff3158";

    if (type === "power")
        return "#a855f7";

    if (type === "mega")
        return "#00ff9d";

    return "#ffffff";
}


/* =========================================================
   UPDATE OBJECTS
   ========================================================= */

function updateObjects(delta) {

    for (
        let i = fallingObjects.length - 1;
        i >= 0;
        i--
    ) {

        const obj =
            fallingObjects[i];


        obj.y +=
            obj.speed * delta;


        obj.rotation +=
            obj.rotationSpeed * delta;


        /* MAGNET */

        if (
            catcher.magnetTimer > 0 &&
            obj.type !== "bomb"
        ) {

            const dx =
                catcher.x - obj.x;

            const dy =
                catcher.y - obj.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance < 250) {

                obj.x +=
                    dx * delta * 2.8;

                obj.y +=
                    dy * delta * 2.8;
            }
        }


        /* COLLISION */

        if (checkCollision(obj)) {

            collectObject(obj);

            fallingObjects.splice(i, 1);

            continue;
        }


        /* MISSED */

        if (
            obj.y >
            gameCanvas.height + 60
        ) {

            if (
                obj.type !== "bomb"
            ) {

                combo = 0;
            }

            fallingObjects.splice(i, 1);
        }
    }
}


/* =========================================================
   COLLISION
   ========================================================= */

function checkCollision(obj) {

    return (

        obj.x + obj.size >
        catcher.x - catcher.width / 2 &&

        obj.x - obj.size <
        catcher.x + catcher.width / 2 &&

        obj.y + obj.size >
        catcher.y - catcher.height / 2 &&

        obj.y - obj.size <
        catcher.y + catcher.height / 2
    );
}


/* =========================================================
   COLLECT OBJECT
   ========================================================= */

function collectObject(obj) {

    const color =
        getObjectColor(obj.type);


    /* BOMB */

    if (obj.type === "bomb") {

        if (catcher.shieldTimer > 0) {

            showMessage(
                "BLOCKED!",
                "#00ff9d"
            );

            createParticles(
                obj.x,
                obj.y,
                "#00ff9d",
                30
            );

            return;
        }


        lives--;

        combo = 0;

        screenShake = 12;

        showMessage(
            "-1 LIFE",
            "#ff3158"
        );

        createParticles(
            obj.x,
            obj.y,
            "#ff3158",
            40
        );


        updateHUD();


        if (lives <= 0) {

            endGame();
        }

        return;
    }


    /* CRYSTAL */

    if (obj.type === "crystal") {

        score += 50;

        combo++;

        floatingText(
            obj.x,
            obj.y,
            "+50",
            "#00c8ff"
        );
    }


    /* STAR */

    else if (obj.type === "star") {

        score += 100;

        combo++;

        floatingText(
            obj.x,
            obj.y,
            "+100",
            "#ffe600"
        );
    }


    /* POWER */

    else if (obj.type === "power") {

        score += 75;

        combo++;

        catcher.magnetTimer = 5;

        floatingText(
            obj.x,
            obj.y,
            "MAGNET!",
            "#a855f7"
        );
    }


    /* MEGA */

    else if (obj.type === "mega") {

        score += 250;

        combo++;

        catcher.magnetTimer = 3;

        floatingText(
            obj.x,
            obj.y,
            "+250",
            "#00ff9d"
        );
    }


    maxCombo =
        Math.max(
            maxCombo,
            combo
        );


    createParticles(
        obj.x,
        obj.y,
        color,
        25
    );


    updateLevel();

    updateHUD();
}


/* =========================================================
   PARTICLES
   ========================================================= */

function createParticles(
    x,
    y,
    color,
    amount
) {

    for (let i = 0; i < amount; i++) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5)
                * 260,

            vy:
                (Math.random() - 0.5)
                * 260,

            life: 1,

            size:
                Math.random() * 4 + 2,

            color: color
        });
    }
}


/* =========================================================
   UPDATE PARTICLES
   ========================================================= */

function updateParticles(delta) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];


        p.x +=
            p.vx * delta;

        p.y +=
            p.vy * delta;

        p.vy +=
            200 * delta;

        p.life -=
            delta * 2;


        if (p.life <= 0) {

            particles.splice(i, 1);
        }
    }
}


/* =========================================================
   FLOATING TEXT
   ========================================================= */

function floatingText(
    x,
    y,
    text,
    color
) {

    floatingTexts.push({

        x: x,

        y: y,

        text: text,

        color: color,

        life: 1
    });
}


/* =========================================================
   UPDATE FLOATING TEXT
   ========================================================= */

function updateFloatingTexts(delta) {

    for (
        let i = floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            floatingTexts[i];


        item.y -=
            45 * delta;

        item.life -=
            delta;


        if (item.life <= 0) {

            floatingTexts.splice(i, 1);
        }
    }
}


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground(delta) {

    const width =
        gameCanvas.width;

    const height =
        gameCanvas.height;


    ctx.fillStyle =
        "#02050d";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(0,245,255,0.07)";

    ctx.lineWidth = 1;


    const gridSize = 45;


    for (
        let x = 0;
        x < width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();
    }


    /* STARS */

    backgroundStars.forEach(star => {

        star.y +=
            star.speed * delta;


        if (
            star.y >
            height
        ) {

            star.y = 0;

            star.x =
                Math.random() * width;
        }


        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });


    ctx.globalAlpha = 1;
}


/* =========================================================
   DRAW OBJECTS
   ========================================================= */

function drawObjects() {

    fallingObjects.forEach(obj => {

        ctx.save();

        ctx.translate(
            obj.x,
            obj.y
        );

        ctx.rotate(
            obj.rotation
        );


        const color =
            getObjectColor(obj.type);


        ctx.shadowBlur = 25;

        ctx.shadowColor =
            color;


        if (obj.type === "crystal") {

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.moveTo(
                0,
                -obj.size
            );

            ctx.lineTo(
                obj.size * 0.65,
                0
            );

            ctx.lineTo(
                0,
                obj.size
            );

            ctx.lineTo(
                -obj.size * 0.65,
                0
            );

            ctx.closePath();

            ctx.fill();
        }


        else if (
            obj.type === "star"
        ) {

            drawStar(
                0,
                0,
                obj.size,
                color
            );
        }


        else if (
            obj.type === "bomb"
        ) {

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                obj.size,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 18px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "!",
                0,
                1
            );
        }


        else {

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                obj.size,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 16px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                obj.type === "power"
                    ? "⚡"
                    : "◆",
                0,
                1
            );
        }


        ctx.restore();
    });
}


/* =========================================================
   DRAW STAR
   ========================================================= */

function drawStar(
    x,
    y,
    radius,
    color
) {

    ctx.fillStyle =
        color;

    ctx.beginPath();


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const angle =
            -Math.PI / 2 +
            i * Math.PI / 5;


        const r =
            i % 2 === 0
                ? radius
                : radius * 0.45;


        const px =
            x +
            Math.cos(angle) * r;

        const py =
            y +
            Math.sin(angle) * r;


        if (i === 0)
            ctx.moveTo(px, py);
        else
            ctx.lineTo(px, py);
    }


    ctx.closePath();

    ctx.fill();
}


/* =========================================================
   DRAW CATCHER
   ========================================================= */

function drawCatcher() {

    const x =
        catcher.x;

    const y =
        catcher.y;


    ctx.save();


    /* MAGNET AURA */

    if (
        catcher.magnetTimer > 0
    ) {

        ctx.shadowBlur = 45;

        ctx.shadowColor =
            "#a855f7";

        ctx.strokeStyle =
            "rgba(168,85,247,0.35)";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            75,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }


    /* SHIELD */

    if (
        catcher.shieldTimer > 0
    ) {

        ctx.shadowBlur = 35;

        ctx.shadowColor =
            "#00ff9d";

        ctx.strokeStyle =
            "#00ff9d";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            90,
            Math.PI,
            Math.PI * 2
        );

        ctx.stroke();
    }


    /* MAIN CATCHER */

    ctx.shadowBlur = 30;

    ctx.shadowColor =
        "#00f5ff";

    ctx.fillStyle =
        "#00f5ff";


    roundRect(
        ctx,
        x - catcher.width / 2,
        y - catcher.height / 2,
        catcher.width,
        catcher.height,
        12
    );


    ctx.fill();


    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "#ffffff";


    roundRect(
        ctx,
        x - catcher.width / 2 + 8,
        y - catcher.height / 2 + 5,
        catcher.width - 16,
        5,
        3
    );


    ctx.fill();


    ctx.restore();
}


/* =========================================================
   ROUND RECT
   ========================================================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    context.beginPath();

    context.moveTo(
        x + radius,
        y
    );

    context.lineTo(
        x + width - radius,
        y
    );

    context.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );

    context.lineTo(
        x + width,
        y + height - radius
    );

    context.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );

    context.lineTo(
        x + radius,
        y + height
    );

    context.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );

    context.lineTo(
        x,
        y + radius
    );

    context.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );

    context.closePath();
}


/* =========================================================
   DRAW PARTICLES
   ========================================================= */

function drawParticles() {

    particles.forEach(p => {

        ctx.globalAlpha =
            p.life;

        ctx.fillStyle =
            p.color;

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            p.color;


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });


    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
}


/* =========================================================
   DRAW FLOATING TEXT
   ========================================================= */

function drawFloatingTexts() {

    floatingTexts.forEach(item => {

        ctx.globalAlpha =
            item.life;

        ctx.fillStyle =
            item.color;

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            item.color;

        ctx.font =
            "bold 22px Orbitron, sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            item.text,
            item.x,
            item.y
        );
    });


    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;
}


/* =========================================================
   UPDATE POWER BARS
   ========================================================= */

function updatePowerBars() {

    if (
        catcher.magnetTimer > 0
    ) {

        magnetBar.style.width =
            Math.min(
                catcher.magnetTimer / 5 * 100,
                100
            ) + "%";

    } else {

        magnetBar.style.width =
            "0%";
    }


    if (
        catcher.shieldTimer > 0
    ) {

        shieldBar.style.width =
            Math.min(
                catcher.shieldTimer / 3 * 100,
                100
            ) + "%";

    } else {

        shieldBar.style.width =
            "0%";
    }
}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(timestamp) {

    const delta =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.033
        );


    lastTime =
        timestamp;


    if (
        gameState === "playing"
    ) {

        /* HAND MOVEMENT */

        catcher.targetX =
            smoothedHandX *
            gameCanvas.width;


        catcher.targetX =
            Math.max(
                catcher.width / 2,
                Math.min(
                    gameCanvas.width -
                    catcher.width / 2,
                    catcher.targetX
                )
            );


        catcher.x +=
            (
                catcher.targetX -
                catcher.x
            ) * 0.15;


        /* POWER TIMERS */

        catcher.magnetTimer =
            Math.max(
                0,
                catcher.magnetTimer -
                delta
            );


        catcher.shieldTimer =
            Math.max(
                0,
                catcher.shieldTimer -
                delta
            );


        /* SPAWN */

        spawnTimer -=
            delta;


        const spawnRate =
            Math.max(
                0.35,
                0.85 -
                level * 0.04
            );


        if (
            spawnTimer <= 0
        ) {

            spawnObject();

            spawnTimer =
                spawnRate;
        }


        updateObjects(delta);

        updateParticles(delta);

        updateFloatingTexts(delta);

        updatePowerBars();
    }


    drawScene(delta);


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   DRAW SCENE
   ========================================================= */

function drawScene(delta) {

    ctx.save();


    if (
        screenShake > 0
    ) {

        ctx.translate(
            (Math.random() - 0.5) *
            screenShake,

            (Math.random() - 0.5) *
            screenShake
        );

        screenShake *= 0.9;
    }


    drawBackground(delta);

    drawObjects();

    drawCatcher();

    drawParticles();

    drawFloatingTexts();


    ctx.restore();
}


/* =========================================================
   CAMERA
   ========================================================= */

async function startCamera() {

    try {

        cameraStatus.textContent =
            "CONNECTING CAMERA...";


        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 480
                    },

                    facingMode: "user"
                },

                audio: false
            });


        cameraStream =
            stream;


        webcam.srcObject =
            stream;


        await webcam.play();


        cameraStatus.textContent =
            "CAMERA ONLINE";


        setupHands();


    } catch (error) {

        console.error(error);


        cameraStatus.textContent =
            "CAMERA BLOCKED";


        showMessage(
            "ALLOW CAMERA",
            "#ff3158"
        );
    }
}


/* =========================================================
   MEDIAPIPE HANDS
   ========================================================= */

function setupHands() {

    if (hands)
        return;


    hands = new Hands({

        locateFile: function(file) {

            return (
                "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" +
                file
            );
        }
    });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.55,

        minTrackingConfidence: 0.55
    });


    hands.onResults(
        onHandResults
    );


    processCameraFrame();
}


/* =========================================================
   PROCESS CAMERA FRAME
   ========================================================= */

async function processCameraFrame() {

    if (
        hands &&
        webcam.readyState >= 2
    ) {

        try {

            await hands.send({
                image: webcam
            });

        } catch (error) {

            console.error(
                "Hand tracking error:",
                error
            );
        }
    }


    requestAnimationFrame(
        processCameraFrame
    );
}


/* =========================================================
   HAND RESULTS
   ========================================================= */

function onHandResults(results) {

    handCtx.clearRect(
        0,
        0,
        handCanvas.width,
        handCanvas.height
    );


    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        handDetected = true;


        const hand =
            results.multiHandLandmarks[0];


        drawHand(hand);


        analyzeHand(hand);


    } else {

        handDetected = false;

        currentGesture =
            "SHOW HAND";


        gestureElement.textContent =
            "SHOW HAND";

        gestureIcon.textContent =
            "🖐️";
    }
}


/* =========================================================
   DRAW HAND
   ========================================================= */

function drawHand(hand) {

    handCtx.save();


    handCtx.translate(
        handCanvas.width,
        0
    );


    handCtx.scale(
        -1,
        1
    );


    drawConnectors(
        handCtx,
        hand,
        HAND_CONNECTIONS,
        {
            color: "#00f5ff",
            lineWidth: 2
        }
    );


    drawLandmarks(
        handCtx,
        hand,
        {
            color: "#ffffff",
            lineWidth: 1,
            radius: 3
        }
    );


    handCtx.restore();
}


/* =========================================================
   HAND ANALYSIS
   ========================================================= */

function analyzeHand(hand) {

    const now =
        performance.now();


    const rawX =
        hand[9].x;


    handX =
        1 - rawX;


    smoothedHandX =
        smoothedHandX * 0.78 +
        handX * 0.22;


    const fingers =
        getFingerStates(hand);


    const openPalm =
        isOpenPalm(hand);


    const fist =
        isFist(fingers);


    const indexOnly =
        fingers.index &&
        !fingers.middle &&
        !fingers.ring &&
        !fingers.pinky;


    const thumbsUp =
        isThumbsUp(hand);


    /* =====================================================
       PAUSE GESTURE
       ===================================================== */

    handlePauseGesture(
        openPalm,
        now
    );


    /* =====================================================
       NORMAL GESTURES
       ===================================================== */

    let gesture = "MOVE";


    if (thumbsUp) {

        gesture =
            "THUMBS UP";

    } else if (fist) {

        gesture =
            "SHIELD";

    } else if (indexOnly) {

        gesture =
            "MAGNET";

    } else if (openPalm) {

        gesture =
            gameState === "paused"
                ? "PAUSED"
                : "PAUSE";
    }


    currentGesture =
        gesture;


    updateGestureUI(
        gesture
    );


    handleGestureAction(
        gesture,
        now
    );
}


/* =========================================================
   FINGER STATES
   ========================================================= */

function getFingerStates(hand) {

    return {

        index:
            hand[8].y <
            hand[6].y,

        middle:
            hand[12].y <
            hand[10].y,

        ring:
            hand[16].y <
            hand[14].y,

        pinky:
            hand[20].y <
            hand[18].y
    };
}


/* =========================================================
   OPEN PALM DETECTION
   ========================================================= */

function isOpenPalm(hand) {

    const index =
        hand[8].y <
        hand[6].y;


    const middle =
        hand[12].y <
        hand[10].y;


    const ring =
        hand[16].y <
        hand[14].y;


    const pinky =
        hand[20].y <
        hand[18].y;


    return (
        index &&
        middle &&
        ring &&
        pinky
    );
}


/* =========================================================
   FIST DETECTION
   ========================================================= */

function isFist(fingers) {

    return (

        !fingers.index &&
        !fingers.middle &&
        !fingers.ring &&
        !fingers.pinky
    );
}


/* =========================================================
   THUMBS UP
   ========================================================= */

function isThumbsUp(hand) {

    const thumbUp =
        hand[4].y <
        hand[3].y &&
        hand[4].y <
        hand[2].y;


    const indexDown =
        hand[8].y >
        hand[6].y;


    const middleDown =
        hand[12].y >
        hand[10].y;


    const ringDown =
        hand[16].y >
        hand[14].y;


    const pinkyDown =
        hand[20].y >
        hand[18].y;


    return (

        thumbUp &&
        indexDown &&
        middleDown &&
        ringDown &&
        pinkyDown
    );
}


/* =========================================================
   RELIABLE PAUSE GESTURE
   ========================================================= */

function handlePauseGesture(
    isOpen,
    now
) {

    /* Palm removed */

    if (!isOpen) {

        openPalmStart = 0;

        pauseGestureLocked = false;

        return;
    }


    /* Prevent repeated toggling */

    if (
        pauseGestureLocked
    ) {

        return;
    }


    /* Start timer */

    if (!openPalmStart) {

        openPalmStart =
            now;
    }


    /* Hold palm */

    if (
        now -
        openPalmStart >=
        PAUSE_HOLD_TIME
    ) {

        if (
            gameState === "playing" ||
            gameState === "paused"
        ) {

            togglePause();
        }


        pauseGestureLocked =
            true;


        openPalmStart = 0;
    }
}


/* =========================================================
   GESTURE UI
   ========================================================= */

function updateGestureUI(
    gesture
) {

    if (
        gesture === "THUMBS UP"
    ) {

        gestureElement.textContent =
            "START / RESTART";

        gestureIcon.textContent =
            "👍";

    } else if (
        gesture === "SHIELD"
    ) {

        gestureElement.textContent =
            "SHIELD";

        gestureIcon.textContent =
            "✊";

    } else if (
        gesture === "MAGNET"
    ) {

        gestureElement.textContent =
            "MAGNET";

        gestureIcon.textContent =
            "☝️";

    } else if (
        gesture === "PAUSE"
    ) {

        gestureElement.textContent =
            "HOLD TO PAUSE";

        gestureIcon.textContent =
            "🖐️";

    } else if (
        gesture === "PAUSED"
    ) {

        gestureElement.textContent =
            "HOLD TO PLAY";

        gestureIcon.textContent =
            "▶️";

    } else {

        gestureElement.textContent =
            "MOVE";

        gestureIcon.textContent =
            "🖐️";
    }
}


/* =========================================================
   GESTURE ACTIONS
   ========================================================= */

function handleGestureAction(
    gesture,
    now
) {

    /* THUMBS UP */

    if (
        gesture === "THUMBS UP"
    ) {

        if (
            now >= thumbsCooldown
        ) {

            if (
                gameState === "home" ||
                gameState === "gameover"
            ) {

                startGame();

                thumbsCooldown =
                    now + 1500;
            }
        }
    }


    /* SHIELD */

    if (
        gesture === "SHIELD" &&
        gameState === "playing"
    ) {

        catcher.shieldTimer =
            Math.max(
                catcher.shieldTimer,
                3
            );
    }


    /* MAGNET */

    if (
        gesture === "MAGNET" &&
        gameState === "playing"
    ) {

        catcher.magnetTimer =
            Math.max(
                catcher.magnetTimer,
                1.5
            );
    }
}


/* =========================================================
   PAUSE / PLAY
   ========================================================= */

function togglePause() {

    if (
        gameState === "playing"
    ) {

        gameState =
            "paused";


        pauseOverlay.classList.add(
            "show"
        );


        gestureElement.textContent =
            "PAUSED";


        gestureIcon.textContent =
            "⏸️";


        showMessage(
            "PAUSED",
            "#ffe600"
        );


    } else if (
        gameState === "paused"
    ) {

        gameState =
            "playing";


        pauseOverlay.classList.remove(
            "show"
        );


        gestureElement.textContent =
            "PLAY";


        gestureIcon.textContent =
            "▶️";


        showMessage(
            "GO!",
            "#00f5ff"
        );
    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    text,
    color
) {

    gameMessage.textContent =
        text;


    gameMessage.style.color =
        color;


    gameMessage.classList.remove(
        "show"
    );


    void gameMessage.offsetWidth;


    gameMessage.classList.add(
        "show"
    );
}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /* SPACE = PAUSE / PLAY */

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (
                gameState === "playing" ||
                gameState === "paused"
            ) {

                togglePause();
            }


            return;
        }


        if (
            gameState !== "playing"
        ) {

            return;
        }


        /* LEFT */

        if (
            event.key === "ArrowLeft"
        ) {

            smoothedHandX -=
                0.08;
        }


        /* RIGHT */

        if (
            event.key === "ArrowRight"
        ) {

            smoothedHandX +=
                0.08;
        }


        smoothedHandX =
            Math.max(
                0,
                Math.min(
                    1,
                    smoothedHandX
                )
            );
    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

highScoreElement.textContent =
    highScore;


resizeCanvases();


createStars();


requestAnimationFrame(
    gameLoop
);