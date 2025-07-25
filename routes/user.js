const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRouter = Router();
const { userModel, purchaseModel, courseModel } = require("../db");
const { JWT_USER_SECRET } = require("../config");
const { userMiddleware } = require("../middlewares/userMiddleware");

userRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      email,
      hashedPassword,
      firstName,
      lastName,
    });
    res.status(201).send({
      message: "User created successfully",
      user: {
        _id: userModel._id,
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

userRouter.post("/signin", async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email: email,
    });
    const passwordMatch = bcrypt.compare(password, user.password);
    if (user && passwordMatch) {
      const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_USER_SECRET
      );
      res.status(200).send({
        message: "User signed in successfully",
        token: token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } else {
      res.status(403).send({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

userRouter.get("/purchases", userMiddleware, async function (req, res) {
  try {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
      userId,
    });
    const courseIds = purchases.map((x) => x.courseId);
    const coursesData = await courseModel.find({
      _id: { $in: courseIds },
    });
    res.json({
      purchases,
      coursesData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = {
  userRouter: userRouter,
};
