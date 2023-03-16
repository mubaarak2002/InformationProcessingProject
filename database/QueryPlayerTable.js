const mysql = require("mysql");

//connection requirements
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

//TODO:
//Table "rivalries" structure:
//|player1ID | player2ID | player1wins | player2 wins |
// order alphabetically

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


//run on game over

//query for the winner, creates a new row if player has no record, adds 1 to wins
var winner = "test1";
var set = "SET @playerID = '" + winner + "', @wins = '0', @losses = '0';";
var sql = "INSERT INTO players VALUES ('" + winner + "', '1', '0') ON DUPLICATE KEY UPDATE wins = wins + 1;" ;
db.query(sql, (err, result) => {
    if(err) throw err;
});

//query for the loser, creates a new row if player has no record, adds 1 to losses
var loser = "test2";
var set = "SET @playerID = '" + loser + "', @wins = '0', @losses = '0';";
var sql = "INSERT INTO players VALUES ('" + loser + "', '0', '1') ON DUPLICATE KEY UPDATE losses = losses + 1;" ;
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