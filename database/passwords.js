const mysql = require("mysql");

const db = mysql.createConnection({
    host: "database-1.cxopmddrp3hh.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "password",
    database: "my_db",
});

db.connect((err) => {
    if(err){
      console.log(err.message);
      return;
    }
    console.log("Database connected")
});

var match
var PCheck
function get_info(playerID, password, callback){
    var sql = "SELECT playerID, password FROM players WHERE playerID = '" + playerID + "';";
    db.query(sql, function(err, results){
        if (err){ 
          throw err;
        }
        results.forEach((row) => {
            PCheck = row.password;  
        });
        if(password == PCheck){
            return callback(1);
        }
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
    