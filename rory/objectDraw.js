

/*tank class needs: x and y coords of centre of tank 
                    dx and dy movement parameters (calc direction of travel for angling base)
                    colour to differentiate between different tank objects
                    shotAngle to rotate barrel, and tell bullet object which direction to go
*/


const tank1 = { //NEEDS WORK
    colour: "Blue",
    x: ,

  };

  
function drawTank(tank){                                          //this could also work as a method of the tank class

  ctx.beginPath();                              //draw treads
    var theta = Math.atan2(tank.dy, tank.dx);                     //tank object contains postion change info (here used to calculate direction of travel)
    theta = (Math.PI * 0.5) + theta; 
    ctx.fillStyle = "Black";
    ctx.translate(tan.x, tan.y);
    ctx.rotate(theta);
    ctx.fillRect(-25, -15, 50, 30);
    ctx.rotate(-theta);
    ctx.translate(-tan.x, -tan.y);
  ctx.closePath();

  ctx.beginPath();                                //draw body
    ctx.arc(tan.x, tan.y, 20 , 0, Math.PI * 2);                    //tank object contains position info (tank.x and tank.y mark centre of tank circle) - we say here tank is 20pix in radius
    ctx.fillStyle = "Red";                                         //tank object contains colour
    ctx.fill();
  ctx.closePath();

  ctx.beginPath();                                //draw barrel
    ctx.translate(tan.x, tan.y);                                    //tank object contains shotAngle, which specifies direction of barrel/shooting
    ctx.rotate(tank.shotAngle * 0.05);
    ctx.fillStyle = "Green"; 
    ctx.fillRect(-2, -2, 4, 35);                                     //draw line from centre of tank                                                   
    ctx.rotate(-shotAngle * 0.05);                                   //shotAngle should be controlled by tilting the nios2
    ctx.translate(-tan.x, -tan.y);
    ctx.closePath();

}