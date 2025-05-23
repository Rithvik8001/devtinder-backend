const express = require("express");
const app = express();
const { connectDB } = require("./config/database");
console.log("db");

connectDB()
  .then(() => {
    console.log("Database Connection is Succesfull.");
    app.listen(3000, () => {
      console.log("Server on port 3000 is running successfully");
    });
  })
  .catch((err) => {
    console.log("db connection not succesfull", err);
    console.error("Full error details:", err.message);
  });
