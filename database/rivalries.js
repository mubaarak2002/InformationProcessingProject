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
var sql = "SELECT player1wins, player2wins FROM rivalries WHERE player1ID = '" + player1ID + "' AND player2ID = '" + player2ID + "';";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
    result.split(" ");
    console.log(result);
});


//closes connection to the database
db.end((err) => {
    console.log("connection ended");
  });