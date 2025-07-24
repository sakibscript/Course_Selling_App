const jwt = require("jsonwebtoken");
const { JWT_ADMIN_SECRET } = require("../config");

const adminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized access" });
    } else {
      decodedToken = jwt.verify(token, JWT_ADMIN_SECRET);
      if (decodedToken) {
        req.adminId = decodedToken.id;
        next();
      } else {
        return res.status(401).send({ message: "Invalid token" });
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
  adminMiddleware: adminMiddleware,
};
