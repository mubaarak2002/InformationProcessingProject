const http = require('http');
const express = require("express");
const app = express();
const mysql = require("mysql");
const bcrypt = require('bcryptjs');

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

function getHistory(player1, player2, gameSend) {
    // console.log("1: ", player1, " ", player2);

    //query database for match history of players
    //make sure to rearrange to player1, player2 - should not return from here alphabetically

    //format data as a json object
    //data = {"History": history} where history is a string of form 1 - 0
    //query the rivalries table
    //send rivalry data to socket
    let P1wins;
    let P2wins;
    let data;

    function get_info(player1, player2, callback) {
        // console.log("2: ", player1, " ", player2);
        let sql = "INSERT INTO rivalries VALUES ('" + player1 + "', '" + player2 + "', '0', '0') ON DUPLICATE KEY UPDATE player1wins = player1wins;" ;
        db.query(sql, (err, result) => {
            if(err) throw err;
        });
        sql = "SELECT player1wins, player2wins FROM rivalries WHERE player1ID = '" + player1 + "' AND player2ID = '" + player2 + "';";
        // console.log(sql);
        db.query(sql, function(err, results){
            if (err){ 
            throw err;
            }
            // console.log(results);
            results.forEach((row) => {
                P1wins = row.player1wins;
                P2wins = row.player2wins;

                // console.log("AAAAAAAA  ", P1wins, " ", P2wins);
            });
            return callback(results.player1wins);
        });
    }
    
    
    get_info(player1, player2, function(result){
        // console.log("3: ", player1, " ", player2);
        if(player1 == playerNames[0]){
            data = {"History": P1wins + "-" + P2wins};
            console.log("player 1 wins: " + P1wins);
            console.log("player 2 wins: " + P2wins);
        }
        else{
            data = {"History": P2wins + "-" + P1wins};
            console.log("player 1 wins: " + P2wins);
            console.log("player 2 wins: " + P1wins);
        }
        
        clientIDs.forEach(clientID => {
            io.of("/client").to(clientID).emit("clientData", data);
        });
        if (gameSend) {
            io.of("/webpage").to(webId).emit("history", data);
        }
    });
    return data;
}



io.of("/client").on('connection', function (socket) {
    let loginFailed = 0;
    console.log("socket connection");
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
            loginFailed = 1;
        }
        if(clientIDs.length >= 2 && !loginFailed) {
            console.log("Maximum players already reached");
            json = {"verified": "0"};
            socket.emit("clientData", json);
            socket.disconnect();
            loginFailed = 1;
        }

        // let resultGot = false;

        if(!databaseConnected) {
            db.connect((err) => {
                if (err) throw err;
                console.log("Database connected");
            });
            databaseConnected = 1;
        }

        let hashed = bcrypt.hashSync(data.Password, 10);
        //inserts new players into table with username and password, doesn't change existing players
        let sql = "INSERT INTO players VALUES ('" + data.Username + "', '0', '0', '" + hashed + "') ON DUPLICATE KEY UPDATE playerID = playerID;" ;
        db.query(sql, (err, result) => {
            if(err) throw err;
        });

        //data.Username, data.Password
        //query for if they are in DB, if yes check password if not make new entry
        //make this set loggedIn to 1 if login successful, 0 if not please

        let loggedIn;
        let PCheck;
        // function get_info(playerID, password, callback){
        sql = "SELECT playerID, password FROM players WHERE playerID = '" + data.Username + "';";
        if (!loginFailed) {
            db.query(sql, function(err, results){
                if (err){ 
                    throw err;
                }
                results.forEach((row) => {
                    PCheck = row.password;  
                });
                loggedIn = bcrypt.compareSync(data.Password, PCheck);
                if(loggedIn){
                    assignUsers();
                }
                console.log("logincheck");
                // resultGot = true;
                // return callback(loggedIn);
            });
        }

        function assignUsers() {
            if (!loggedIn && !loginFailed) {
                console.log("Password for ", data.Username, " incorrect");
                json = {"verified": "0"};
                socket.emit("clientData", json);
                socket.disconnect();
                loginFailed = 1;
            } else if (!loginFailed) {
                console.log("Login successful");
                if (clientIDs[0] == null){
                    clientIDs[0] = socket.id;
                    console.log(clientIDs[0]);
                    playerId = 1;
                    playerNames[playerId-1] = data.Username;
                } else {
                    clientIDs[1] = socket.id;
                    console.log(clientIDs[1]);
                    playerId = 2;
                    playerNames[playerId-1] = data.Username;

                    if (playerNames[0] > playerNames[1]) {
                        getHistory(playerNames[0], playerNames[1], 0);
                    } else {
                        getHistory(playerNames[1], playerNames[0], 0);
                    }
                }
                console.log("Player ", playerId, ": ", playerNames[playerId-1], " connected."); //reveals client ip

                json = {"verified": "1"};
                socket.emit("clientData", json);
                json = {"Player": playerId,
                        "Username": playerNames[playerId-1]};
                io.of("/webpage").to(webId).emit("connection", json);
            }
        }
    });

    socket.on("terminate", function () {
        console.log(playerId, " has disconnected");
        socket.disconnect();
    })

    socket.on("data", function (data) {
        data["Player"] = playerId;
        // console.log(data, " ", playerNames[playerId-1]);
        // data["Username"] = playerNames[playerId-1];
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
        console.log("\n\n\n", player);
        console.log(clientIDs[0]);
        console.log(clientIDs[1]);
        delete data.Player;
        console.log(data);
        io.of("/client").to(clientIDs[player - 1]).emit("clientData", data);
        console.log(player, " send lives to ", clientIDs[player - 1]);
    });

    socket.on("Ready", function() {
        let json = {"ready": "1"};
        console.log("send ready");
        clientIDs.forEach(clientID => {
            io.of("/client").to(clientID).emit("clientData", json);
        });
    });

    socket.on("game over", function (data) {
        console.log("Game over");
        console.log(data.winner);

        // console.log(data.player1, " ", data.player2);

        // add to database the winner and loser data
        // data.player1 | data.player2 | data.winner -- boolean (p1 wins = 1, p2 wins = 0)

        
        let winner;
        if(data.winner == "1") {
            winner = 1;
        } else {
            winner = 0;
        }

        
        // if (data.winner){
        //     var winner = data.player1;
        //     var loser = data.player2;
        // }
        // else if (data.winner == 0){
        //     var winner = data.player2;
        //     var loser = data.player1;
        // }
        //update winner
        var sql = "UPDATE players SET wins = wins + 1 WHERE playerID = '" + playerNames[!winner] + "';";
        db.query(sql, (err, result) => {
            if(err) throw err;
        });
        //update loser
        var sql = "UPDATE players SET losses = losses + 1 WHERE playerID = '" + playerNames[winner] + "';";
        db.query(sql, (err, result) => {
            if(err) throw err;
        });


        if (playerNames[0] > playerNames[1]) {
            player1 = playerNames[0];
            player2 = playerNames[1];
            // if (data.winner == "1") {
            //     winner = 0;
            //     loser = 1;
            // } else {
            //     winner = 1;
            //     loser = 0;
            // }
        } else {
            player1 = playerNames[1];
            player2 = playerNames[0];
            // if (data.winner == "1") {
            //     winner = 1;
            //     loser = 0;
            // } else {
            //     winner = 0;
            //     loser = 1;
            // }
            winner = !winner;
        }
        console.log(winner);


        //update rivalries
        if (winner){ //!winner as winner=0 for player 1 wins
            var sql = "INSERT INTO rivalries VALUES ('" + player1 + "', '" + player2 + "', '1', '0') ON DUPLICATE KEY UPDATE player1wins = player1wins + 1;" ;
            db.query(sql, (err, result) => {
                if(err) throw err;
            });
        }
        else{
            var sql = "INSERT INTO rivalries VALUES ('" + player1 + "', '" + player2 + "', '0', '1') ON DUPLICATE KEY UPDATE player2wins = player2wins + 1;" ;
            db.query(sql, (err, result) => {
                if(err) throw err;
            });
        }
        //query the rivalries table
        // function get_info(player1ID, player2ID, callback){
        //     let sql = "SELECT player1wins, player2wins FROM rivalries WHERE player1ID = '" + player1ID + "' AND player2ID = '" + player2ID + "';";
        //     db.query(sql, function(err, results){
        //         if (err){ 
        //           throw err;
        //         }
        //         results.forEach((row) => {
        //             P1wins = row.player1wins;
        //             P2wins = row.player2wins;  
        //         });
        //         return callback(results.player1wins);
        //     });
        // }
        // //send rivalry data to socket
        // var P1wins;
        // var P2wins;
        // get_info(data.player1, data.player2, function(result){
        //     console.log("player 1 wins: " + P1wins);
        //     console.log("player 2 wins: " + P2wins);
        //     let json;
        //     if(data.player1 == playerNames[0]){
        //         json = {"history": P1wins + " - " + P2wins};
        //     }
        //     else{
        //         json = {"history": P2wins + " - " + P1wins};
        //     }
        //     socket.emit("history", json);
        // });

         //closes connection to the database
        // db.end((err) => {
        //     console.log("connection ended");
        // });

        
        if (playerNames[0] > playerNames[1]) {
            getHistory(playerNames[0], playerNames[1], 1); // 1 is to show we want to send to game also
        } else {
            getHistory(playerNames[1], playerNames[0], 1);
        }
    });

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
        webId = null;
	});
});
