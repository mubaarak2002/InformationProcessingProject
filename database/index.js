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
//|player1ID | password | player2ID | player1wins | player2 wins |
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
//var sql = "SELECT player1wins, player2wins FROM rivalries WHERE player1ID = 't1y' AND player2ID = 'jj7';";
//db.query(sql, (err, result) => {
//    if(err) throw err;
//    console.log(result);
//});

//displays all columns
var sql = "SELECT * FROM rivalries";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
});

//closes connection to the database
db.end((err) => {
  console.log("connection ended");
});
  