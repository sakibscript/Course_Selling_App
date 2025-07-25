const { Router } = require("express");
const courseRouter = Router();
const { courseModel, purchaseModel } = require("../db");
const { userMiddleware } = require("../middlewares/userMiddleware");

courseRouter.post("/purchase", userMiddleware, async function (req, res) {
  try {
    const courseId = req.body.courseId;
    const userId = req.userId;

    const course = await purchaseModel.create({
      userId,
      courseId,
    });
    res.status(200).json({
      message: "Course successfully purchased",
      course,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

courseRouter.get("/preview", async function (req, res) {
  try {
    const courses = await courseModel.find({});
    res.json({
      courses,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = {
  courseRouter: courseRouter,
};
