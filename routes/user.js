const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRouter = Router();
const { userModel } = require("../db");
const { JWT_USER_SECRET } = require("../config");

userRouter.post("/signup", async function (req, res) {
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
});

userRouter.post("/signin", async function (req, res) {
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
});

userRouter.post("/purchase", function (req, res) {});

module.exports = {
  userRouter: userRouter,
};
