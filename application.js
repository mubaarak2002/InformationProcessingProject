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
let playerNames = [];
let webId = null;

io.of("/client").on('connection', function (socket) {
    let playerId;
    if (clientIDs[0] == null){
        clientIDs[0] = socket.id;
        playerId = 1;
        console.log("Connection from player 1: " + socket.handshake.headers); //reveals client ip
    } else if (clientIDs[1] == null) {
        clientIDs[1] = socket.id;
        playerId = 2;
        console.log("Connection from player 2: " + socket.handshake.headers); //reveals client ip
    } else {
        console.log("Maximum players already reached");
        socket.disconnect();
    }

    
    socket.on("init", function (data) {
        // console.log("init ", data);
        
        if (!playerNames.includes(data.Username)) {
            playerNames[playerId-1] = data.Username;
        }
    });


    socket.on("data", function (data) {
        console.log("data ", data);
        data["Player"] = playerNames[playerId-1];
        data["Username"] = playerUsername;
        io.of("/webpage").to(webId).emit("data", data);
    });

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
	});
});


io.of("/webpage").on('connection', function (socket) {// WebSocket Connection
    if (webId == null) {
        webId = socket.id;
        console.log("Connection from webpage" + socket.handshake.headers); //reveals client ip
    } else {
        console.log("Go away");
        socket.disconnect();
    }

    socket.on("lives", function (data) {
        io.of("/client").to(clientIDs[data.Player]).emit("data", data);
    });

    socket.on("game over", function (data) {
        // add to database the winner and loser data
        // data.player1 | data.player2 | boolean (p1 wins = 1, p2 wins = 0)
        
        let json = {"history": player1wins + " - " + player2wins};
        socket.emit("history", json);
    });

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
        webId = null;
	});
});
