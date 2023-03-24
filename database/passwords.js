// testing the login functionality
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

var playerID = "qwerty";
var password = "id";
var sql = "INSERT INTO players VALUES ('" + playerID + "', '0', '0', '" + password + "') ON DUPLICATE KEY UPDATE playerID = playerID;" ;
db.query(sql, (err, result) => {
    if(err) throw err;
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
            match = true;
        }
        else{
            match = false;
        }
        return callback(match);
})
}

get_info(playerID, password, function(result){
    console.log(match)
});

var sql = "SELECT * FROM players";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
});

//closes connection to the database
db.end((err) => {
    console.log("connection ended");
  });
    