require('dotenv').config();

const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const path = require("path");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
let date = new Date();

//create connection
const db = mysql.createConnection({
  host: "146.148.71.201",
  user: "root",
  password: "serverless2",
  port: "3306",
  database: "user",
});

//connect
db.connect((err) => {
  if (err) {
    throw err;
  }
});
console.log("MySQL connected!");

router.get("/", (req, res) => {
  res.send("Hello Logout");
});

//Validate User
router.post("/", authenticateToken, (req, res) => {
  
  //State table operations
  console.log(`Im get with id: ${req.result.email}`);
  let where = " email=?";
  let values = [req.result.email];
  let sqlUpdateState = "UPDATE userstate SET ? WHERE"+where;
  let updateUserState = {
    state: "offline",
    logout_timestmp: date.getTime(),
    token: null
  };

  let queryUpdateState = db.query(sqlUpdateState, [updateUserState, values], (err, user) => {
    // con

    if (err) {
      throw err;
    }
    
    
    res.status(200).json({msg: `Successfully LoggedOut`,});
    });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // console.log("HEYYYYYYYYYY");
  
  // console.log("body:",req.body);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log("token:",token);
  
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.result = result;
      next();
  });
}
module.exports = router;
