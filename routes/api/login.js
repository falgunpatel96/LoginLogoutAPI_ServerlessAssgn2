require('dotenv').config();

const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const path = require("path");
const uuid = require("uuid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
  res.send("Hello Login");
});

//Validate User
router.post("/", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ msg: `Please include both emailid and password!` });
  }

  //Data table operations
  console.log(`Im get with id: ${req.body.email}`);
  let where = " email=?";
  let values = [req.body.email];
  let sqlSelectData = "SELECT * FROM userdata WHERE" + where;
  console.log(`sqlSelect: ${sqlSelectData}`);

  //State table operations
  let sqlSelectState = "SELECT * FROM userstate WHERE" + where;
  
  let sqlUpdateState = "UPDATE userstate SET ? WHERE" + where;
  let updateUserState = {
    state: "online",
    login_timestmp: date.getTime(),
    logout_timestmp: null,
    token: null,
  };

  let sqlInsertState = "INSERT INTO userstate SET ? ";
  let insertUserState = {
    email: req.body.email,
    state: "online",
    login_timestmp: date.getTime(),
    logout_timestmp: null,
    token: null,
  };
  let querySelectData = db.query(sqlSelectData, values, async (err, user) => {
    // con
    console.log(`SQL: values`, values);

    if (err) {
      throw err;
    }
    console.log("USER: ",user.length);
    if (user.length === 0) {
      res.status(404).json({ msg: `email: ${req.body.email} is not registered!` });
    } else {
      try {
        // console.log(`user sub: ${req.body.password}`);
        // console.log(`Database: ${user[0].password}`);
        
        if (await bcrypt.compare(req.body.password, user[0].password)) {
          
          
          //generate token
          const accessToken = jwt.sign({email : req.body.email}, process.env.ACCESS_TOKEN_SECRET);
          console.log(`access: ${accessToken}`);
          
          //Login
          let querySelectState = db.query(
            sqlSelectState,
            values,
            (err, stateSelect) => {
              // console.log(`SQL state: ${this.sql}`);

              if (err) {
                throw err;
              }
              console.log("STATE: ", stateSelect[0]);
              if (stateSelect.length === 0) {
                //data nathi
                //Insert karavano
                insertUserState.token = accessToken;
                let queryInsertState = db.query(
                  sqlInsertState,
                  insertUserState,
                  (err, stateInsert) => {
                    if (err) {
                      throw err;
                    }
                    // res.status(404).json({ msg: `Error with token storage in database! Please Try Again!` });
                    res.status(200).json({
                      msg: `Successfully LoggedIn Firsttime (inserted)`,
                      token: accessToken,
                    });
                  }
                );
              } else {
                //data 6e
                //Update karavano
                updateUserState.token = accessToken;
                console.log(updateUserState);
                
                let queryUpdateState = db.query(
                  sqlUpdateState,
                  [updateUserState, req.body.email],
                  (err, updatedData) => {
                    if (err) {
                      throw err;
                    }
                    res.status(200).json({ msg: `Successfully LoggedIn`, token: accessToken });
                  }
                );
              }
            }
          );
          //1. Entry 6e? (select)
          //  1a. Hoi to (update)
          //  1b. Nai hoi to (Insert)
          // res.status(200).json({ msg: `User logged In!` });
        } else {
          res.status(401).json({ msg: `Invalid credentials!` });
        }
      } catch (error) {
        res.status(500).send();
      }
    }
  });
});

module.exports = router;
