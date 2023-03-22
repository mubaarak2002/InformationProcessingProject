function drawTank(tank){                                //this could also work as a method of the tank class


    ctx.beginPath();
    //draw treads
    var theta = Math.atan2(dy, dx); // range (-PI, PI]              //tank object contains postion change info
    theta = (Math.PI * 0.5) + theta; // range [0, 2PI)
    ctx.fillStyle = "Black";
    ctx.translate(x, y);
    ctx.rotate(theta);
    ctx.fillRect(-25, -15, 50, 30);
    ctx.rotate(-theta);
    ctx.translate(-x, -y);
    ctx.closePath();

    ctx.beginPath();
    //draw body
    ctx.arc(x, y, 20 , 0, Math.PI * 2);      //tank object contains position info (tank.x and tank.y mark centre of tank circle)
    ctx.fillStyle = "Red";                        //tank object contains colour
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    //draw barrel
    //ctx.arc(x, y, 25, 0, ((shotAngle * 0.05) % (Math.PI * 2))); //tank object contains shotAngle, which specifies direction of barrel/shooting
    ctx.translate(x, y);
    ctx.rotate(this.angle * 0.05);
    ctx.fillStyle = "Green"; 
    ctx.fillRect(-2, -2, 4, 35);
    //ctx.rotate(-);
    //ctx.translate(-x, -y);                                        //draw line from end of barrel to centre of tank
                                                    //shotAngle should be controlled by tilting the nios2
    ctx.rotate(-this.angle * 0.05);
    ctx.translate(-x, -y);
    ctx.closePath();

  }



  function updateBoard() {
    // drawing code
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //drawTank();
  
    //on here twice because wouldn't propogate down the else-if ladder
    //once remapping is done cean be mvoed to a normal key

    //PROBLEM: You can't move in diagonals
    //possible fix: replace all else-if with just if 
    if (rightPressed) {
      this.angle += 5;

      updatePosition("RIGHT");

    } else if (leftPressed) {

      updatePosition("LEFT");

      this.angle -= 5;

    } else if (WkeyDown) {

      updatePosition("UP");

    } else if (SkeyDown) {
      
      updatePosition("DOWN");

    } else if (AkeyDown) {

      updatePosition("LEFT");

    } else if (DkeyDown) {

      updatePosition("RIGHT");
      
    }

    // update tanks
    tanks.forEach((tank) => {
    tank.draw();
    tank.move();
});

    /*

        constructor(x, y, player, angle, fire, health) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.player = player;
        this.health = health;
        this.fire = fire;
      }

    */

    tanks.push(new Tank(10, 10, 1, 0, false, 10));


    }

    //eg: const forbiddenSpaces = [ [[1,1], [2,2], [3,3], [4,4]] ]
    function updatePosition(direction) {
      //the n prefix stands for "new"
      console.log("updating postioning");

      let nx = x;
      let ny = y;
      if (direction === "UP") {
        console.log("up");
        ny = y + dy;
      } else if (direction === "DOWN") {
        ny = y - dy;
      } else if (direction === "LEFT") {
        nx = x - dx;
      } else if (direction === "RIGHT") {
        nx = x + dx;
      }

      
      forbiddenSpaces.forEach(function check(space, index){
        //given the lines are straight lines, a vertex will always define the maximum and minimum
        //x and y values. This means that we can establish that the new y value cannot be inside
        //the min/max y verticies if the new x value is also inside the min/max x verticies
        
        let minx = 0;
        let miny = 0;
        let maxx = 0;
        let maxy = 0;

        space.forEach(function thing(vertex, index) {

          if (vertex[0] < minx) {
            minx = vertex[0];
          }
          if (vertex[0] > maxx) {
            maxx = vertex[0];
          }
          if (vertex[1] < miny) {
            miny = vertex[1];
          }
          if (vertex[1] > maxy) {
            maxy = vertex[1];
          }
          //debugging text
          //console.log("maxy: " + maxy + " and ny: " + ny + " and y: " + y);

      });
        if (ny < maxy && ny > miny) {
          //console.log("y Bueno");
          y = ny;
        }
        
        if (nx < maxx && nx > minx) {
          //console.log("bueno");
          x = nx;
        } else {
          //console.log("no bueno");
        }

      });
    }