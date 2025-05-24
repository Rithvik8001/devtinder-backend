const express = require("express");
const userAuth = require("../middlewares/authMiddleware");
const ConnectionRequestModel = require("../models/connectionRequests");
const userRouter = express.Router();

const userData = [
  "firstName",
  "lastName",
  "skills",
  "age",
  "gender",
  "photoUrl",
  "about",
];

// get all the pending connection requests for the loggedIn user.
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", userData);

    res.json({
      message: "Data fetched succesfully. ",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error" + err.message,
    });
  }
});

// get all the connections

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "accepted",
    }).populate("User", userData);

    res.json({
      message: "Data fetched succesfully",
      data: connections,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = {
  userRouter,
};
