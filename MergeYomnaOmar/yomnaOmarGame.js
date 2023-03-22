//NOTES FOR YOMNA:
/*

 1) Is there a reaosn fire cant be a boolean?

*/


// define global variables

// create canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// height of window for reference 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// define arrays for tanks and bullets
let tanks = [];
let bullets = [];

// TODO: draw arena borders

// define the Tank class
class Tank {
  constructor(x, y, accX, accY, player, fire) {
    this.x = x;
    this.y = y;
    this.accX = accX;
    this.accY = accY;
    this.color = "red";
    this.width = 50*0.0035*canvas.height;
    this.height = 35*0.0035*canvas.height;
    this.angle = 0;
    this.magnitude = 0;
    this.speed = 5;
    this.health = 100;
    this.player = player;
    this.fire = fire;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }


  move() {
    // Caculate angle and magnitude of movement based on the acceleration
    this.magnitude = Math.sqrt(this.accX * this.accX + this.accY * this.accY);
    this.angle = Math.atan2(this.accY, this.accX);

    // Update coordinates
    this.x += Math.cos(this.angle) * this.magnitude * this.speed;
    this.y += Math.sin(this.angle) * this.magnitude * this.speed;

    this.detectCollision();
  }

  fireBullets() {
    if (this.fire == "t") {
      // check of the tank is allowed to shoot
      const bullet = new Bullet(this.x, this.y, this.angle, 10, 5, "black", this);
      bullets.push(bullet); // add the bullet to the bullets array
    }
  }

  detectCollision() {
    // detect collision with other tanks
    tanks.forEach((tank) => {
      if (tank !== this) {
        let dx = tank.x - this.x;
        let dy = tank.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy); // calculate distance
        if (distance < this.width / 2 + tank.width / 2) {
          // detect and resolve collision
          let overlap = (this.width / 2 + tank.width / 2) - distance;
          let angle = Math.atan2(dy, dx);
          let moveX = overlap * Math.cos(angle);
          let moveY = overlap * Math.sin(angle);
          this.x -= moveX / 2;
          this.y -= moveY / 2;
          tank.x += moveX / 2;
          tank.y += moveY / 2;
         }
      }
    });

    // detect collision with simple arena borders
    if (this.x - this.width / 2 < 0 ) {
      this.x = this.width / 2;
    } else if (this.x + this.width / 2 > canvas.width) {
      this.x = canvas.width - this.width / 2;
    }

    if (this.y - this.height / 2 < 0) {
      this.y = this.height / 2;
    } else if (this.y + this.height / 2 > canvas.height) {
      this.y = canvas.height - this.height / 2;
    }
  }

  checkHealth() {
    if(this.health <= 0){
      tanks.splice(i, 1);
    }
  }
}

// define the Bullet class
class Bullet {
  constructor(x, y, angle, speed, damage, color, tank) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.color = color;
    this.tank = tank;
    this.radius = 5;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  move() {
    let dx = Math.cos(this.angle) * this.speed;
    let dy = Math.sin(this.angle) * this.speed;
    this.x += dx;
    this.y += dy;
    // detect collision with arena borders
    if (
      this.x - this.radius < 0 ||
      this.x + this.radius > canvas.width ||
      this.y - this.radius < 0 ||
      this.y + this.radius > canvas.height
    ) {
      bullets.splice(bullets.indexOf(this), 1);
    }

    // detect collision with tanks
    tanks.forEach((tank) => {
      if (tank !== this.tank) {
        let dx = tank.x - this.x;
        let dy = tank.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < tank.width / 2 + this.radius) {
          bullets.splice(bullets.indexOf(this), 1);
          tank.health -= this.damage;
        }
      }
    });
  }
}

// define the game loop
let lastTime = 0;
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // listen for player data
  socket.on("data", (data) => { // event name 
    // update the players' tanks

    console.log(`Player ${data.Player} data: ${data.x}, ${data.y}, ${data.Fire}`);

    tanks[parseInt(data.Player)-1].accX = data.x;
    tanks[parseInt(data.Player)-1].accY = data.y;
    tanks[parseInt(data.Player)-1].fire = data.Fire;
  });

  // update tanks
  tanks.forEach((tank) => {
    tank.draw();
    tank.move();
    // tank.checkHealth();
    tank.fireBullets();
  });

  // update bullets
  bullets.forEach((bullet) => {
    bullet.draw();
    bullet.move();
  });

  // request the next frame
  requestAnimationFrame(gameLoop);
}

// initialize the game
function init() {
  document.body.appendChild(canvas);

  // create tanks
  // initialise tank positions to center and facing each other
  tanks.push(new Tank(canvas.width * 0.25, canvas.height / 2, 0, 0, "1", "f"));
  tanks.push(new Tank(canvas.width * 0.75, canvas.height / 2, 0, 0, "2", "f"));

  // open socket for players
  socket= io(); 

  // start the game loop
  gameLoop();
}

// run the game
init();