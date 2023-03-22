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
    });

	socket.on("disconnect", function () {
		console.log(socket.request.connection.remoteAddress + " has disconnected");
        webId = null;
        //query the rivalries table
        const mysql = require("mysql");

const db = mysql.createConnection({
    host: "database-1.cxopmddrp3hh.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "password",
    database: "my_db",
});

//Two tables in the database
//One for specific player records
//One for player rivalries

//Table "players" structure:
//|playerID | wins | losses |
//playerID is the primary key

//Table "rivalries" structure:
//|player1ID | player2ID | player1wins | player2 wins |
//player1ID and player2ID form a composite key


//establishes connection to the database
db.connect((err) => {
  if(err){
    console.log(err.message);
    return;
  }
  console.log("Database connected")
});

//displays all columns
var sql = "SELECT * FROM rivalries";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
});

//rivalries table update
var player1ID = "test1";
var player2ID = "test3";
var wins = false;
if (wins){
    var sql = "INSERT INTO rivalries VALUES ('" + player1ID + "', '" + player2ID + "', '1', '0') ON DUPLICATE KEY UPDATE player1wins = player1wins + 1;" ;
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

//displays select player1wins and player2wins
//var sql = "SELECT player1wins, player2wins FROM rivalries WHERE player1ID = '" + player1ID + "' AND player2ID = '" + player2ID + "';";
//db.query(sql, (err, result) => {
//    if(err) throw err;
//    console.log(result);

//    result.forEach((row) => {
//        console.log(row.player1wins);
//        console.log(row.player2wins);  
//    });
//});

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

var P1wins;
var P2wins;

 get_info(player1ID, player2ID, function(result){
    //rest of your code goes in here
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
});
