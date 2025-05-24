const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      // can restrict user to only these values.
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is Incorrect Status Type.`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// compound index - query with both the params
connectionRequestSchema.index({
  fromUserId: 1,
  toUserId: 1,
});

// check if from and to user Id are same before saving the request
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You cannot send request to yourself");
  }
  next();
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequestModel;
