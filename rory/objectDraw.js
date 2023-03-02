

/*tank class needs: x and y coords of centre of tank 
                    dx and dy movement parameters (calc direction of travel for angling base)
                    colour to differentiate between different tank objects
                    shotAngle to rotate barrel, and tell bullet object which direction to go
*/


// create canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// height of window for reference 

//initialisation stuff for key controls (testing)
let aPressed = false; //left
let dPressed = false; //right
let wPressed = false; //up
let sPressed = false; //down
let ePressed = false; //turret clockwise
let qPressed = false; //turret anticlockwise
let spacePressed = false; //fire



// define arrays for tanks and bullets
let tanks = [];
let bullets = [];

tanks.push(new Tank(canvas.width * 0.25, canvas.height / 2, "Red"));
tanks.push(new Tank(canvas.width * 0.75, canvas.height / 2, "Blue"));


  class Tank {
    constructor(x, y, colour) {                                 //insantiate tank object, specifying id (e.g. t1, t2, etc), start position and appearance
      this.xInit = x;                             // initial x and y coords, for respawns
      this.yInit = y;
      this.x = x;
      this.y = y;
      this.dx = 0;
      this.dy = 0;
      this.speed = 5;
      this.shotAngle = 0;
      this.colour = colour;
      this.health = 100;
      this.fire = 0;                                //a bool, indicating whether or not firing action is currently happening
      this.width = 40                               //tank body diameter                                
      /*this.width = 50*0.0035*canvas.height;
    this.height = 35*0.0035*canvas.height;*/        //scaling object size to canvas size a good idea - implement later
    }
    drawTank() {
      ctx.beginPath();                              //draw treads
        var theta = Math.atan2(this.dy, this.dx);                     //tank object contains postion change info (here used to calculate direction of travel)
        theta = (Math.PI * 0.5) + theta; 
        ctx.fillStyle = "Black";
        ctx.translate(this.x, this.y);
        ctx.rotate(theta);
        ctx.fillRect(-25, -15, 50, 30);
        ctx.rotate(-theta);
        ctx.translate(-this.x, -this.y);
      ctx.closePath();

      ctx.beginPath();                                //draw body
        ctx.arc(this.x, this.y, this.width/2 , 0, Math.PI * 2);                    //tank object contains position info (tank.x and tank.y mark centre of tank circle) - we say here tank is 20pix in radius
        ctx.fillStyle = this.colour;                                         //tank object contains colour
        ctx.fill();
      ctx.closePath();

      ctx.beginPath();                                //draw barrel
        ctx.translate(this.x, this.y);                                    //tank object contains shotAngle, which specifies direction of barrel/shooting
        ctx.rotate(this.shotAngle * 0.05);
        ctx.fillStyle = "Green"; 
        ctx.fillRect(-2, -2, 4, 35);                                     //draw line from centre of tank                                                   
        ctx.rotate(-this.shotAngle * 0.05);                                   //shotAngle should be controlled by tilting the nios2
        ctx.translate(-this.x, -this.y);
        ctx.closePath();
      }

    respawnTank() {                                   //respawning moves tank back to spawn point, and resets health and movement;
      this.x = xInit;
      this.y = yInit;
      this.dx = 0;
      this.dy = 0;
      this.shotAngle = 0;
      this.health = 100;
    }

    detectCollision() {                                                       // detect collision with other tanks
      tanks.forEach((tank) => {
        if (tank !== this) {
          let distX = tank.x - this.x;
          let distY = tank.y - this.y;
          let distance = Math.sqrt(distX * distX + distY * distY);            // calculate distance
          if (distance < (this.width / 2) + (tank.width / 2)) {
                                                                              // detect and resolve collision
            let overlap = (this.width / 2 + tank.width / 2) - distance;
            let angle = Math.atan2(distY, distX);
            let moveX = overlap * Math.cos(angle);
            let moveY = overlap * Math.sin(angle);
            this.x -= moveX / 2;
            this.y -= moveY / 2;
            tank.x += moveX / 2;
            tank.y += moveY / 2;
           }
        }
      });
    }

    moveTank()  {                                                               //moves tank, not letting it move off the canvas
        if (this.dx > 0) {
          this.x = Math.min(this.x + this.dx, canvas.width - this.width/2);     // this.width/2 is the radius of the tank
        } else if (dx < 0) {
          this.x = Math.max(this.x + this.dx, this.width/2);
        }
        if (this.dy > 0) {
          this.y = Math.min(this.y + this.dy, canvas.width - this.width/2);
        } else if (dy < 0) {
          this.y = Math.max(this.y + this.dy, this.width/2);
        }
        this.detectCollision();
    }

    fireBullets() {
      if (this.fire == "t") {
        // check of the tank is allowed to shoot
        const bullet = new Bullet(this.x, this.y, this.shotAngle);
        bullets.push(bullet); // add the bullet to the bullets array
      }
    }

    checkHealth() {
      if(this.health <= 0){
        this.respawnTank();
        //tanks.splice(i, 1);
      }
    }
  }

  class Bullet {
    constructor(x, y, shotAngle) {
      this.x = x;
      this.y = y;
      this.dx = Math.cos(shotAngle);                      
      this.dy = Math.sin(shotAngle);
      this.speed = 5;                               //scales how fast the bullet moves
      this.shotAngle = shotAngle;
      this.damage = 100;
      this.color = "Black";
      this.radius = 5;
      this.dirChange = 0;                           //count no. of wall bounces, so we can delete on the 2nd
    }
  
    drawBullet() {
      ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
      ctx.closePath();
    }

    detectHit() {
      // detect collision with tanks
      tanks.forEach((tank) => {
        let dx = tank.x - this.x;
        let dy = tank.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < tank.width / 2 + this.radius) {
          bullets.splice(bullets.indexOf(this), 1);
          tank.health -= this.damage;
        }
      });
    }

    moveBullet()  {
      this.x += (this.speed * this.dx);
      this.y += (this.speed * this.dy);
      this.detectHit();
      if (x + dx > canvas.width - ballRadius|| x + dx < ballRadius) {           //if colliding with edge of canvas, reflect
        dx = -dx;
        this.dirChange ++;
      }
      if (y + dy < ballRadius || y + dy > canvas.height - ballRadius) {
        dy = -dy;
        this.dirChange ++;
      }
      if(this.dirChange > 1){
        bullets.splice(bullets.indexOf(this), 1);                             //if 2nd bounce off wall, delete;
      }
    }
  }
    






// define the game loop
//let lastTime = 0;
function gameLoop() {
  //let deltaTime = timestamp - lastTime;
  //lastTime = timestamp;
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* SOCKET STUFF I DONT WANT TO MESS WITH RN

  // listen for 1st player's data
  socket.on("player1Data", (data) => { // TODO: change event names
    // update the player's tank
    var decodedData = JSON.parse(data);

    console.log(`Player 1 data: ${decodedData.Player}, ${decodedData.x}, ${decodedData.y}, ${decodedData.Fire}`);

    tanks[0].accX = decodedData.x;
    tanks[0].accY = decodedData.y;
    tanks[0].player = decodedData.Player;
    tanks[0].fire = decodedData.Fire;
  });

  // listen for 2nd player's data
  socket.on("player2Data", (data)  => { // TODO: change event names
    // update the player's tank
    var decodedData = JSON.parse(data);

    console.log(`Player 2 data: ${decodedData.Player}, ${decodedData.x}, ${decodedData.y}, ${decodedData.Fire}`);

    tanks[1].accX = decodedData.x;
    tanks[1].accX = decodedData.y;
    tanks[1].player = decodedData.Player;
    tanks[1].fire = decodedData.Fire;
  });
  */
  

  // update tanks
  tanks.forEach((tank) => {
    tank.drawTank();
    tank.moveTank();
    tank.checkHealth();
    tank.fireBullets();
  });

  // update bullets
  bullets.forEach((bullet) => {
    bullet.drawBullet();
    bullet.moveBullet();
  });
  //KEY BINDING STUFF FOR TESTING
  tanks[0].dx = 0;
  tanks[0].dy = 0;
  tanks[0].fire = 0;

  if (ePressed) {
    tanks[0].shotAngle += 5;
  } else if (qPressed) {
    tanks[0].shotAngle -= 5;
  } else if (aPressed) {
    tanks[0].dx = -1;
  } else if (dPressed) {
    tanks[0].dx = 1;
  } else if (wPressed) {
    tanks[0].dy = -1;
  } else if (sPressed) {
    tanks[0].dy = 1;
  } else if (spacePressed) {
    tanks[0].fire = 1;
  }
}
  // request the next frame
  //requestAnimationFrame(gameLoop);

//these just define key inputs for testing
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    function keyDownHandler(e) {
      if (e.key === 65) {
        aPressed = true;
      } else if (e.key === 68) {
        dPressed = true;
      } else if (e.key === 87) {
        wPressed = true;
      } else if (e.key === 83) {
        sPressed = true;
      } else if (e.key === 69) {
        ePressed = true;
      } else if (e.key === 81) {
        qPressed = true;
      } else if (e.key === 32) {
        spacePressed = true;
      }
    }

    function keyUpHandler(e) {
      if (e.key === 65) {
        aPressed = false;
      } else if (e.key === 68) {
        dPressed = false;
      } else if (e.key === 87) {
        wPressed = false;
      } else if (e.key === 83) {
        sPressed = false;
      } else if (e.key === 69) {
        ePressed = false;
      } else if (e.key === 81) {
        qPressed = false;
      } else if (e.key === 32) {
        spacePressed = false;
      }
    }
// run the game

// start the game loop
const interval = setInterval(gameLoop, 30);

