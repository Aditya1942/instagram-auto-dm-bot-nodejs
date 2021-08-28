const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config("./.env");

let connection = mysql.createConnection({
  host: process.env.SQl_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
});
connection.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  console.log("Connected to the MySQL server.");
});

module.exports = connection;
