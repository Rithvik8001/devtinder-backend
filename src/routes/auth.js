const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/userValidation");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();

// signup Route
authRouter.post("/signup", async (req, res) => {
  const { password, firstName, lastName, emailId } = req.body;

  try {
    validateSignUpData(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      firstName: firstName,
      lastName: lastName,
      emailId: emailId,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login route
authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    // Find the user by emailId in the database
    const user = await userModel.findOne({ emailId: emailId });
    if (!user) {
      return res.status(404).json("User not found.");
    }

    if (!emailId || !password) {
      return res.status(400).json("Email and password are required.");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // JWT Token.
      const token = await user.getJwtToken();
      res.cookie("token", token).json(user);
      res.send(user);
    } else {
      return res.status(401).json("Invalid credentials.");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", "", { expires: new Date(Date.now()) })
    .send("Logout Successful.");
});

module.exports = {
  authRouter,
};
