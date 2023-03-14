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
        data["Player"] = playerId;
        data["Username"] = playerNames[playerId-1];
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
        // data.player1 | data.player2 | data.winner -- boolean (p1 wins = 1, p2 wins = 0)
        
        if (data.winner){
            var winner = data.player1;
            var loser = data.player2;
        }
        else if (data.winner == 0){
            var winner = data.player2;
            var loser = data.player1;
        }
        var set = "SET @playerID = '" + winner + "', @wins = '0', @losses = '0';";
        var sql = "INSERT INTO players VALUES ('" + winner + "', '1', '0') ON DUPLICATE KEY UPDATE wins = wins + 1;" ;
        db.query(sql, (err, result) => {
            if(err) throw err;
        });

        var set = "SET @playerID = '" + loser + "', @wins = '0', @losses = '0';";
        var sql = "INSERT INTO players VALUES ('" + loser + "', '0', '1') ON DUPLICATE KEY UPDATE losses = losses + 1;" ;
        db.query(sql, (err, result) => {
            if(err) throw err;
        });

        if (data.winner){
            var sql = "INSERT INTO rivalries VALUES ('" + data.player1 + "', '" + data.player2 + "', '1', '0') ON DUPLICATE KEY UPDATE player1wins = player1wins + 1;" ;
            db.query(sql, (err, result) => {
                if(err) throw err;
            });
        }
        else{
            var sql = "INSERT INTO rivalries VALUES ('" + player1ID + "', '" + player2ID + "', '0', '1') ON DUPLICATE KEY UPDATE player2wins = player2wins + 1;" ;
            db.query(sql, (err, result) => {
                if(err) throw err;
            });
        }

        let json = {"history": player1wins + " - " + player2wins};
        socket.emit("history", json);
    });

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
        webId = null;
	});
});
