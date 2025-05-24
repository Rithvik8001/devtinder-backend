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

// get all the user connections.
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", userData)
      .populate("toUserId", userData);

    if (connections.length === 0) {
      return res.json({
        message: "There are no connections",
      });
    }
    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Data fetched succesfully",
      data: data,
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
