//board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

//dino il dinosaurino
let dinoWidth = 88; //grandezza dell'immagine, se cambi immagine cambia valore?
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;

let dino = { //Oggetto JavaScritp: raggruppa una serie di informazioni correlate all'interno di un'unica entità dino
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

//cac il tus
//3 tipi di cactus. Tutti hanno la stessa altezza, cambia la larghezza
let cactusArray = [];

let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;

let cactusHeight = 70; //Vale per tutti e tre i cactus
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

//in game physics
let velocityX = -8; //cactsu movimento sx
let velocityY = 0; 
let gravity = .4;

//jump buffer
let jumpBufferCounter = 0;
let jumpBufferLimit = 10; // Quanti frame ricordare la pressione del tasto (circa 150ms)

let gameOver = false;
let score = 0;


window.onload = function() {
    board = document.getElementById("board"); //minuto 6.23
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //usato per disegnare sulla board

    //ridisegna il dinosauro tutte le volte
    dinoImg = new Image();
    dinoImg.src = "./img/dinoC.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    //carico le immagini dei cactus
    //cactus1
    cactus1Img = new Image();
    cactus1Img.src = "./img/cactus1.png";
    
    //cactus2
    cactus2Img = new Image();
    cactus2Img.src = "./img/cactus2.png";

    //cactus3
    cactus3Img = new Image();
    cactus3Img.src = "./img/cactus3.png";

    //spawn rate dei cactus - modifica setInterval per cambiare la frequenza di spawn
    requestAnimationFrame(update);
    setInterval(placeCactus, 780); //1000 = 1 secondo. Ogni secondo viene richiamata la funzione placeCactus che genera un cactus
    document.addEventListener("keydown", moveDino);
}

function update() {
    requestAnimationFrame(update);

    //fine gioco
    if (gameOver) { //blocca generazioni immagini quando gameOver
        return;
    }

    context.clearRect(0, 0, board.width, board.height)

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY); //applica la gravità a dino.y

    if (jumpBufferCounter > 0) {
        jumpBufferCounter--;
    }

    if (dino.y == dinoY && jumpBufferCounter > 0) {
        velocityY = -10;
        jumpBufferCounter = 0;
    }

    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    //cactus
    for(let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            dinoImg.src = "./img/dinoC-dead.png";
            dinoImg.onload = function() {
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            }
        }
    }

    //visualizza hitbox
    context.lineWidth = 2;

    //hitbox Dino (Rettangolo originale di debug o ovale)
    context.strokeStyle = "red";
    context.strokeRect(dino.x, dino.y, dino.width, dino.height);

    //hitbox cactus
    context.strokeStyle = "blue";
    for(let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        context.strokeRect(cactus.x, cactus.y, cactus.width, cactus.height);
    }

    //punteggio
    context.fillStyle="black";
    context.font="20px courier";

    score++;

    if (score >= 400) {
        context.fillStyle = "green";
    } else {
        context.fillStyle = "black";
    }

    context.fillText(score, 5, 20);

    /*cambia se vuoi aggiungere un "traguardo"
    if (score >= 400) {
        context.fillStyle="green";
    }*/
}

//movimento con jump buffer implementato
function moveDino(e) {
    if (gameOver) { 
        return;
    }

    if (e.code == "Space" || e.code == "ArrowUp") {
        // Invece di saltare subito, "carichiamo" il buffer del salto
        jumpBufferCounter = jumpBufferLimit; 
    }
}

//funzione per piantare i cactus: viene chiamata ogni 1 secondi. Ogni 1 secondi c'è una CHANCE che pianti un cactus 
function placeCactus() {
    if (gameOver) { //blocca la generazione di cactus se gameOver
        return;
    }
    
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height : cactusHeight
    }

    let placeCactusChance = Math.random(); //Genera un numero casuale tra 0 e 9999...

    if (placeCactusChance > .90) { //10% di possibilità di avere un cactus3
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    } 
    else if (placeCactusChance > .70) { //30% di ottenere cactus2
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    } 
    else if (placeCactusChance > .50) { //50% di ottenere cactus1
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //rimuove il primo elemento dell'array così che la grandezza dell'array non continui a crescere
    }
}

//detect collision modificato: la hitbox del dinosauro è ora un ovale
function detectCollision(dino, cactus) {
    let dinoCenterX = dino.x + dino.width / 2;
    let dinoCenterY = dino.y + dino.height / 2;
    
    let dinoRadius = dino.width / 3.2; 

    let closestX = Math.max(cactus.x, Math.min(dinoCenterX, cactus.x + cactus.width));
    let closestY = Math.max(cactus.y, Math.min(dinoCenterY, cactus.y + cactus.height));

    let distanceX = dinoCenterX - closestX;
    let distanceY = dinoCenterY - closestY;
    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

    return distanceSquared < (dinoRadius * dinoRadius);
}