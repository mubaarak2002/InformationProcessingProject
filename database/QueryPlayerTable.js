const mysql = require("mysql");

const db = mysql.createConnection({
    host: "database-1.czawgzjnocpk.us-east-1.rds.amazonaws.com",
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

//Table "rivalries" structure:
//|player1ID | player2ID | player1wins | player2 wins |


//establishes connection to the database
db.connect((err) => {
  if(err){
    console.log(err.message);
    return;
  }
  console.log("Database connected")
});

//displays all columns
var sql = "SELECT * FROM players";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
});

//checks if player is already in the database, if no adds a row, if yes does nothing
var newplayer = "test3";
var set = "SET @playerID = '" + newplayer + "', @wins = '0', @losses = '0';";
var sql = "INSERT INTO players VALUES ('" + newplayer + "', '0', '0') ON DUPLICATE KEY UPDATE playerID = playerID;" ;
db.query(sql, (err, result) => {
    if(err) throw err;
});

//updates the wins column of the winner
var winner = "test1";
var sql = "UPDATE players SET wins = wins + 1 WHERE playerID = '" + winner +"';";
db.query(sql, (err, result) => {
    if(err) throw err;
});

//updates the lossses column of the loser
var loser = "test2";
var sql = "UPDATE players SET losses = losses + 1 WHERE playerID = '" + loser +"';";
db.query(sql, (err, result) => {
    if(err) throw err;
});

//displays all columns
var sql = "SELECT * FROM players";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
});

//closes connection to the database
db.end((err) => {
    console.log("connection ended");
  });