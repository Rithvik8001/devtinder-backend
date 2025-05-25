const express = require("express");
const app = express();
const cors = require("cors");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
app.use(cors());
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/requests");
const { userRouter } = require("./routes/user");
require("dotenv").config();

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// connect to DB.
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {});
    console.log("connection successful");
  })
  .catch((err) => {
    console.log("db connection not Successfull.", err);
  });
