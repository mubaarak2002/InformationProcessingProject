//testing the password hashing functionality
const mysql = require("mysql");
const bcrypt = require('bcryptjs');

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

const password = "password";
const hashed = bcrypt.hashSync(password, 10);
console.log(hashed);


var playerID = "hashing2";
var sql = "INSERT INTO players VALUES ('" + playerID + "', '0', '0', '" + hashed + "') ON DUPLICATE KEY UPDATE playerID = playerID;" ;
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
        match = bcrypt.compareSync(password, PCheck);
        return callback(PCheck);
})
}

get_info(playerID, hashed, function(result){
    match = bcrypt.compareSync(password, PCheck);
    console.log(match)
});

var sql = "SELECT * FROM players WHERE playerID = 'hashing2'";
db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
});

//closes connection to the database
db.end((err) => {
    console.log("connection ended");
  });
    