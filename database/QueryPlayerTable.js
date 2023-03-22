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
var sql = "UPDATE players SET wins = wins + 1 WHERE playerID = '" + winner + "';";
db.query(sql, (err, result) => {
    if(err) throw err;
});

//query for the loser, creates a new row if player has no record, adds 1 to losses
var loser = "test2";
var sql = "UPDATE players SET losses = losses + 1 WHERE playerID = '" + loser + "';";
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