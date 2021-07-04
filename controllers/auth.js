// TODO: look over all this code. it's all just a rough proof of concept, you'll add a lot and rewrite a lot

const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require("../models/user");

// Signup
// =============================================================================

const signupDocTitle = "Signup | Connect Social Media";

exports.getSignup = (req, res) => {
  res.render("auth/signup.ejs", {
    docTitle: signupDocTitle,
    formErrors: [],
    prevValues: {
      email: "",
      username: "",
    },
  });
};

exports.postSignup = async (req, res) => {
  email = req.body.email;
  username = req.body.username;
  password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/signup.ejs", {
      docTitle: signupDocTitle,
      formErrors: errors.errors,
      prevValues: {
        email,
        username,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    email: email,
    username: username,
    password: hashedPassword,
  });

  const savedUser = await newUser.save();

  req.session.userId = savedUser._id;
  await req.session.save();

  res.redirect("/");
};

// Login
// =============================================================================

const loginDocTitle = "Login | Connect Social Media";

exports.getLogin = (req, res) => {
  res.render("auth/login.ejs", {
    docTitle: loginDocTitle,
    formErrors: [],
    prevValues: {
      email: "",
    },
  });
};

exports.postLogin = async (req, res) => {
  email = req.body.email;
  password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/login.ejs", {
      docTitle: loginDocTitle,
      formErrors: errors.errors,
      prevValues: {
        email,
      },
    });
  }

  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    return res.render("auth/login.ejs", {
      docTitle: loginDocTitle,
      formErrors: [{ msg: "There is no account with that email address" }],
      prevValues: {
        email,
      },
    });
  }

  bcrypt.compare(password, user.password, async (err, correct) => {
    if (correct) {
      req.session.userId = user._id;
      await req.session.save();
      return res.redirect("/");
    }
    return res.render("auth/login.ejs", {
      docTitle: loginDocTitle,
      formErrors: [{ msg: "Wrong password" }],
      prevValues: {
        email,
      },
    });
  });
};
