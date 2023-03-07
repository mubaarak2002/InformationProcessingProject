const http = require('http');
const express = require("express");
const app = express();

const server = http.createServer(app);

const io = require('socket.io')(server); //require socket.io module and pass the http object (the server)

server.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/game.html");
});

let clientIDs = [];
let webId;

io.of("/client").on('connection', function (socket) {
	console.log("Connection from client:" + socket.handshake.headers); //reveals client ip
    // console.log(socket.id);
    // console.log("web: ", webId);

	socket.on("data", function (data) {
        // console.log(webId);
        io.of("/webpage").to(webId).emit("data", data);
	});

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
	});
});


io.of("/webpage").on('connection', function (socket) {// WebSocket Connection
	console.log("Connection from webpage" + socket.handshake.headers); //reveals client ip
    
    webId = socket.id;
    console.log(webId);

    // let paramNum = 0;
    // for(var key in socket.handshake.headers){
    //     paramNum++;
    // }
    // console.log(paramNum); // 5 for python, 14 for website for some reason
    
    // let client = 0;
    // if (paramNum == 5 || paramNum == 2) { //python/rust client
    //     client = 0;
    //     pythonIDs.push(socket.id); //TODO: remove this from array afterwards
    // } else { //web client
    //     client = 1;
    //     webIDs.push(socket.id);
    // }

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
	});
});
