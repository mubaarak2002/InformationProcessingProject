const http = require('http');
const express = require("express");
const app = express();

const server = http.createServer(app);

const io = require('socket.io')(server); //require socket.io module and pass the http object (the server)

server.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/MovementTest.html");
});

let pythonIDs = [];
let webIDs = [];

io.sockets.on('connection', function (socket) {// WebSocket Connection
	console.log("Connection from " + socket.handshake.headers); //reveals client ip
    
    let paramNum = 0;
    for(var key in socket.handshake.headers){
        paramNum++;
    }
    console.log(paramNum); // 5 for python, 14 for website for some reason
    
    let client = 0;
    if (paramNum == 5) { //python client
        client = 0;
        pythonIDs.push(socket.id); //TODO: remove this from array afterwards
    } else { //web client
        client = 1;
        webIDs.push(socket.id);
    }
    
	socket.on("data", function (arg) {
		if (client == 0) {
            for (var id of webIDs) {
                socket.to(id).emit("data", arg); //socket.emit to this socket. io.emit to all sockets.
            }
        }
	});

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
	});
});