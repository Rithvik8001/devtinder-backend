const express = require("express");
const requestsRouter = express.Router();
const userAuth = require("../middlewares/authMiddleware");
const ConnectionRequestModel = require("../models/connectionRequests");
const UserModel = require("../models/user");

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "invalid status type" + status,
        });
      }

      const toUser = await UserModel.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          message: "User Not Found",
        });
      }

      const fromUser = await UserModel.findById(fromUserId);

      // If there is an existing connection request
      const existingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Connection Request already exists..",
        });
      }
      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.json({
        message: "Connection Request sent succesfully.",
        data: data,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
);

module.exports = {
  requestsRouter,
};
