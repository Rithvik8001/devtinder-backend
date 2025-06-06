const express = require("express");
const requestRouter = express.Router();
const userAuth = require("../middlewares/authMiddleware");
const ConnectionRequestModel = require("../models/connectionRequests");
const UserModel = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      //Status Check
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status type:" + status);
      }

      //toUser exist check
      const toUser = await UserModel.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          message: "User not found",
          success: false,
        });
      }

      // Check if user is trying to send request to themselves
      if (fromUserId.toString() === toUserId.toString()) {
        return res.status(400).json({
          message: "You cannot send a connection request to yourself",
          success: false,
        });
      }

      // Existing user exist check
      const existingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      console.log(existingConnectionRequest);
      if (existingConnectionRequest) {
        throw new Error("Already sent the connection request before");
      }

      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.status(200).json({
        message: user.firstName + " is " + status + " in " + toUser.firstName,
        data,
        success: true,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ messaage: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

module.exports = {
  requestRouter,
};
