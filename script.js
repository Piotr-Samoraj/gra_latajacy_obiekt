let gameOver = false;
let przeszkody = [];
let speed = 2;
let spawnRate = 0.02;
let licznikCzasu = 0;
const maxPrzeszkod = 10;
let najlepszyWynik = 0;

const obrazPrzeszkody = [
    'img/obs1.jpg',
    'img/obs2.png',
    'img/obs4.jpg',
    'img/obs5.jpg',
    'img/obs6.png',
    'img/obs3.jpg',
    'img/obs7.jpg',
    'img/obs8.jpg',
    'img/obs9.jpg',
    'img/obs6.jpg'
];

const player = {
    x: 375,
    y: 275,
    size: 50,
    hue: 0,
    speed: 5,
    draw: function (context) {
        context.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        context.fillRect(this.x, this.y, this.size, this.size);
    },
    update: function (keys) {
        if (keys['ArrowUp'] && this.y > 10) this.y -= this.speed;
        if (keys['ArrowDown'] && this.y < canvas.height - this.size - 10) this.y += this.speed;
        if (keys['ArrowLeft'] && this.x > 10) this.x -= this.speed;
        if (keys['ArrowRight'] && this.x < canvas.width - this.size - 10) this.x += this.speed;

        this.hue += 1;
        if (this.hue >= 360) this.hue = 0;
    }
};

function stworzPrzeszkode() {
    const size = Math.random() * 50 + 70;
    let x, y;
    let czyBrakKolizji = false;
    let proby = 0;

    while (!czyBrakKolizji && proby < 10) {
        x = Math.random() * (canvas.width - size);
        y = -size;

        czyBrakKolizji = true;
        for (let i = 0; i < przeszkody.length; i++) {
            const obstacle = przeszkody[i];
            const distanceX = Math.abs(obstacle.x - x);
            const distanceY = Math.abs(obstacle.y - y);

            if (distanceX < size + obstacle.size && distanceY < size + obstacle.size) {
                czyBrakKolizji = false;
                break;
            }
        }

        proby++;
    }

    if (!czyBrakKolizji) {
        x = Math.random() * (canvas.width - size);
        y = -size;
    }

    const indeksObrazu = Math.floor(Math.random() * obrazPrzeszkody.length);
    const zrodloObrazu = obrazPrzeszkody[indeksObrazu];
    const img = new Image();
    img.src = zrodloObrazu;

    img.onload = function () {
        przeszkody.push({ x, y, size, img });
    };
}

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const keys = {};
window.addEventListener('keydown', (event) => keys[event.key] = true);
window.addEventListener('keyup', (event) => keys[event.key] = false);

function rysujGranice() {
    context.strokeStyle = 'black';
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
}

function rysujPrzeszkode() {
    for (let i = 0; i < przeszkody.length; i++) {
        let obstacle = przeszkody[i];
        obstacle.y += speed;

        // Rysowanie przeszkody
        context.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.size, obstacle.size);

        // Dodanie cienkiego obrysu (border) wokół przeszkody
        context.strokeStyle = "red";  // Kolor obrysu
        context.lineWidth = 2;  // Grubość obrysu
        context.strokeRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);  // Rysowanie obrysu wokół przeszkody

        // Sprawdzenie kolizji z graczem
        if (
            player.x < obstacle.x + obstacle.size &&
            player.x + player.size > obstacle.x &&
            player.y < obstacle.y + obstacle.size &&
            player.y + player.size > obstacle.y
        ) {
            gameOver = true;
        }

        // Usuwanie przeszkody, jeśli opuściła ekran
        if (obstacle.y > canvas.height) {
            przeszkody.splice(i, 1);
            i--;
        }
    }
}


function gameOverTlo() {
    const img = new Image();
    img.src = 'img/pork.jpg';

    img.onload = function () {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        context.fillStyle = 'red';
        context.font = '50px Arial';
        context.textAlign = 'center';
        context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

        context.fillStyle = 'black';
        context.font = '30px Arial';
        context.fillText(`Najlepszy wynik: ${najlepszyWynik}s`, canvas.width / 2, canvas.height / 2 + 50);
    };
}

function aktualizujInfo() {
    const czas = Math.floor(licznikCzasu / 60); 
    document.getElementById('czas').textContent = `Czas: ${czas}s`;

    
    document.getElementById('najlepszyWynik').textContent = `Najlepszy wynik: ${najlepszyWynik}s`;
}

function petlaGry() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
       
        const czas = Math.floor(licznikCzasu / 60);
        if (czas > najlepszyWynik) {
            najlepszyWynik = czas; 
        }
        gameOverTlo();
        document.getElementById('restart-btn').style.display = 'block'; 
        return;
    }

    rysujGranice();
    player.update(keys);
    player.draw(context);
    rysujPrzeszkode();
    aktualizujInfo(); 

    if (Math.random() < spawnRate && przeszkody.length < maxPrzeszkod) {
        stworzPrzeszkode();
    }

    licznikCzasu++;
    if (licznikCzasu % 100 === 0) {
        speed += 0.05;
        spawnRate += 0.01;
    }

    requestAnimationFrame(petlaGry);
}

function restartGry() {
    gameOver = false;
    przeszkody = [];
    player.x = 375;
    player.y = 275;
    speed = 2;
    spawnRate = 0.02;
    licznikCzasu = 0;
    document.getElementById('restart-btn').style.display = 'none'; // Ukryj przycisk po restarcie
    petlaGry();
}

petlaGry();
