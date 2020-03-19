const config = require("config");
const jsonwebtoken = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Token not found" });
  }

  try {
    await jsonwebtoken.verify(
      token,
      config.get("jwtSecret"),
      (err, decoded) => {
        if (err) throw err;
        req.user = decoded.user;
        next();
      }
    );
  } catch (error) {
    console.error("Something went wrong on the auth middleware");
    console.error(error);
    return res.status(500).send(error);
  }
};
