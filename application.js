const http = require('http');
const express = require("express");
const app = express();
const mysql = require("mysql");

const db = mysql.createConnection({
    host: "database-1.cxopmddrp3hh.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "password",
    database: "my_db",
});

let databaseConnected = 0;

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


function getHistory(player1, player2) {
    //query database for match history of players
    //make sure to rearrange to player1, player2 - should not return from here alphabetically

    //format data as a json object
    //data = {"History": history} where history is a string of form 1 - 0
    return data;
}

io.of("/client").on('connection', function (socket) {
    // console.log(socket.id);
    let playerId;
    
    //added connection based code
    socket.on("connection", function (data) {
        current_session_players.append(data.player - 1);
    });


    socket.on("init", function (data) { //username checking
        // console.log("init ", data);

        let json;

        if (playerNames.includes(data.Username)) {
            console.log(data.Username, " already connected");
            json = {"verified": "0"};
            socket.emit("clientData", json);
            socket.disconnect();
        }
        if(clientIDs.length >= 2) {
            console.log("Maximum players already reached");
            json = {"verified": "0"};
            socket.emit("clientData", json);
            socket.disconnect();
        }

        if(!databaseConnected) {
            db.connect((err) => {
                if (err) throw err;
                console.log("Database connected");
            });
            databaseConnected = 1;
        }


        //data.Username, data.Password
        //query for if they are in DB, if yes check password if not make new entry
        //make this set loggedIn to 1 if login successful, 0 if not please
        
        if (!loggedIn) {
            console.log("Password for ", data.Username, " incorrect");
            json = {"verified": "0"};
            socket.emit("clientData", json);
            socket.disconnect();
        } else {
            console.log("Login successful");
            if (clientIDs[0] == null){
                clientIDs[0] = socket.id;
                playerId = 1;
                playerNames[playerId-1] = data.Username;
            } else {
                clientIDs[1] = socket.id;
                playerId = 2;
                playerNames[playerId-1] = data.Username;
                let history = getHistory(playerNames[0], playerNames[1]);
                clientIDs.forEach(clientID => {
                    socket.to(clientID).emit("clientData", history);
                });
            }
            console.log("Player ", playerId, ": ", playerNames[playerId-1], " connected."); //reveals client ip

            json = {"verified": "1"};
            socket.emit("clientData", json);
        }

        json = {"Player": playerId,
                "Username": playerNames[playerId-1]};
        io.of("/webpage").to(webId).emit("connection", json);
    });


    socket.on("data", function (data) {
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

    socket.on("clientData", function (data) {
        let player = data.Player;
        delete data.Player;
        console.log(data);
        io.of("/client").to(clientIDs[player - 1]).emit("clientData", data);
        console.log(player, " send lives to ", clientIDs[player - 1]);
    });

    socket.on("Ready", function() {
        let json = {"ready": "1"};
        clientIDs.forEach(clientID => {
            socket.to(clientID).emit("clientData", json);
        });
    });

    socket.on("History", function() {
        let history = getHistory(playerNames[0], playerNames[1]);
        socket.emit("History", history);
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
        //update winner
        var set = "SET @playerID = '" + winner + "', @wins = '0', @losses = '0';";
        var sql = "INSERT INTO players VALUES ('" + winner + "', '1', '0') ON DUPLICATE KEY UPDATE wins = wins + 1;" ;
        db.query(sql, (err, result) => {
            if(err) throw err;
        });
        //update loser
        var set = "SET @playerID = '" + loser + "', @wins = '0', @losses = '0';";
        var sql = "INSERT INTO players VALUES ('" + loser + "', '0', '1') ON DUPLICATE KEY UPDATE losses = losses + 1;" ;
        db.query(sql, (err, result) => {
            if(err) throw err;
        });
        //update rivalries
        if (data.winner){
            var sql = "INSERT INTO rivalries VALUES ('" + data.player1 + "', '" + data.player2 + "', '1', '0') ON DUPLICATE KEY UPDATE player1wins = player1wins + 1;" ;
            db.query(sql, (err, result) => {
                if(err) throw err;
            });
        }
        else{
            var sql = "INSERT INTO rivalries VALUES ('" + data.player1 + "', '" + data.player2 + "', '0', '1') ON DUPLICATE KEY UPDATE player2wins = player2wins + 1;" ;
            db.query(sql, (err, result) => {
                if(err) throw err;
            });
        }
        //query the rivalries table
        function get_info(player1ID, player2ID, callback){
            var sql = "SELECT player1wins, player2wins FROM rivalries WHERE player1ID = '" + player1ID + "' AND player2ID = '" + player2ID + "';";
            db.query(sql, function(err, results){
                if (err){ 
                  throw err;
                }
                results.forEach((row) => {
                    P1wins = row.player1wins;
                    P2wins = row.player2wins;  
                });
                return callback(results.player1wins);
        })
        }
        //send rivalry data to socket
        var P1wins;
        var P2wins;  
         get_info(data.player1, data.player2, function(result){
            console.log("player 1 wins: " + P1wins);
            console.log("player 2 wins: " + P2wins);
            let json = {"history": P1wins + " - " + P2wins};
            socket.emit("history", json);
         });

         //closes connection to the database
        db.end((err) => {
            console.log("connection ended");
        });
    });

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
        webId = null;
	});
});
