const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");

const userMiddleware = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized access" });
    } else {
      const decodedToken = jwt.verify(token, JWT_USER_SECRET);
      if (decodedToken) {
        req.userId = decodedToken.id;
        next();
      } else {
        res.status(401).send({ message: "Invalid token" });
      }
    }
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  userMiddleware: userMiddleware,
};
