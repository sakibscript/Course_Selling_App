const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const { JWT_ADMIN_SECRET } = require("../config");
const { adminMiddleware } = require("../middlewares/adminMiddleware");

adminRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await adminModel.create({
      email,
      hashedPassword,
      firstName,
      lastName,
    });
    res.status(201).send({
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
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

adminRouter.post("/signin", async function (req, res) {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({
      email: email,
    });
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (admin && passwordMatch) {
      const token = jwt.sign(
        {
          id: admin._id.toString(),
        },
        JWT_ADMIN_SECRET
      );
      res.status(200).send({
        message: "Admin signed in successfully",
        token: token,
        admin: {
          _id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
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

adminRouter.post("/course", adminMiddleware, async function (req, res) {
  try {
    const { title, description, price, imageUrl } = req.body;
    const creatorId = req.adminId;
    const course = await courseModel.create({
      title,
      description,
      price,
      imageUrl,
      creatorId,
    });
    res.status(201).send({
      message: "Course created successfully",
      course: {
        id: course._id,
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl,
        creatorId: creatorId,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

adminRouter.put("/course/:id", adminMiddleware, async function (req, res) {
  try {
    const { title, description, imageUrl, price } = req.body;
    const courseId = req.params.id;
    const adminId = req.adminId;
    const course = await courseModel.findOneAndUpdate(
      {
        _id: courseId,
        creatorId: adminId,
      },
      {
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl,
      }
    );

    if (!course) {
      return res.status(404).send({
        message: "Course not found or unauthorized",
      });
    } else {
      res.status(200).json({
        message: "Course updated successfully",
        course,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

adminRouter.get("/course", adminMiddleware, async function (req, res) {
  try {
    const adminId = req.adminId;
    const courses = await courseModel.find({
      creatorId: adminId,
    });
    if (courses) {
      res.status(200).json({
        courses,
      });
    } else {
      res.status(404).send({
        message: "Course not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = {
  adminRouter: adminRouter,
};
