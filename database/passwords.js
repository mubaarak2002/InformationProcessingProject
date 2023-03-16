const mysql = require("mysql");

const db = mysql.createConnection({
    host: "database-1.cxopmddrp3hh.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "password",
    database: "my_db",
});



function get_info(playerID, password, callback){
    var sql = "SELECT playerID, password FROM players WHERE playerID = '" + playerID + "' AND password = '" + password + "';";
    db.query(sql, function(err, results){
        if (err){ 
          throw err;
        }
        results.forEach((row) => {
            //player= row.player1wins;
            //P2wins = row.player2wins;  
        });
        return callback(results.player1wins);
})
}
var playerID = "Omar";
var password = "password";
get_info(playerID, password, function(result){

});

//closes connection to the database
db.end((err) => {
    console.log("connection ended");
  });
    