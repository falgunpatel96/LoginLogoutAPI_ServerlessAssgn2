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
  const token = authHeader && authHeader.split(" ")[1];
  console.log(`token check: ${token}`);

  let sqlSelectState = "SELECT * FROM userstate WHERE token = ?";

  if (token == null) {
    return res.status(401);
  }

  let querySelectState = db.query(sqlSelectState, token, (err, stateEntry) => {
    if (err) {
      throw err;
    }
    // console.log("hi");
    console.log(`length:`, stateEntry[0]);
    console.log(`lengthTokrn:`, token);
    console.log("db:",stateEntry[0]);
    

    if (stateEntry[0] === undefined) {
      return res.status(404).json({
        msg: `Invalid Request! Unauthenticated User!`,
      });
    }
    // console.log("hi");

    try {
      let result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.result = result;
      // console.log(req.body);

      // console.log("result");

      next();
    } catch (err) {
      console.log(err);
      return res.status(403);
    }

  });
}
module.exports = router;
