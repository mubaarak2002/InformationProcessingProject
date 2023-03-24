//testing the rivalries table
const mysql = require("mysql");

const db = mysql.createConnection({
    host: "database-1.cxopmddrp3hh.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "password",
    database: "my_db",
});

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
var player1ID = "test3";
var player2ID = "test1";
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
    console.log(P1wins);
    console.log(P2wins);
 });

//closes connection to the database
db.end((err) => {
    console.log("connection ended");
  });