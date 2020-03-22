const express = require("express");
const router = express.Router();
const User = require("../../model/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ msg: "Users not found" });
    }
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

// register new user and return token
router.post("/", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password
    });

    const salt = await bcryptjs.genSalt(10);

    user.password = await bcryptjs.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, config.get("jwtSecret"), (err, token) => {
      return res.json({ token });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});
// delete all users
router.delete("/deleteAll", async (req, res) => {
  try {
    await User.deleteMany({});
    return res.json({ msg: "All users deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

module.exports = router;
