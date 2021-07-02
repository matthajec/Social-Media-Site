const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.getSignup = (req, res) => {
  res.render("auth/signup.ejs", {
    csrfToken: req.csrfToken(),
  });
};

exports.postSignup = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.send("bad validation");
  }

  email = req.body.email;
  username = req.body.username;
  password = req.body.password;

  const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return res.send("a user with that email already exists");
    }
    return res.send("that username is taken");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    email: email,
    username: username,
    password: hashedPassword,
  });

  const savedUser = await newUser.save();

  req.session.userId = savedUser._id;

  // TODO: add reCaptcha
  // TODO: add more robust error handling

  res.send("new user created");
};
