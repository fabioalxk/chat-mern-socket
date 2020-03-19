const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const User = require("../../model/User");
const config = require("config");

// (post) auth user and get token
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jsonwebtoken.sign(payload, config.get("jwtSecret"), (err, token) => {
      return res.json({ token });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});
module.exports = router;
