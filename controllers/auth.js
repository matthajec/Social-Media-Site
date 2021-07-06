const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require("../models/user");

// Signup
// =============================================================================

exports.getSignup = (req, res) => {
  res.render("auth/signup.ejs", {
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
    return res.status(422).render("auth/signup.ejs", {
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
    username_lower: username.toLowerCase(),
    password: hashedPassword,
  });

  const savedUser = await newUser.save();

  req.session.userId = savedUser._id;
  await req.session.save();

  res.redirect("/");
};

// Login
// =============================================================================

exports.getLogin = (req, res) => {
  res.render("auth/login.ejs", {
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
    return res.status(422).render("auth/login.ejs", {
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
    return res.status(422).render("auth/login.ejs", {
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
    return res.status(422).render("auth/login.ejs", {
      formErrors: [{ msg: "Wrong password" }],
      prevValues: {
        email,
      },
    });
  });
};

// Logout
// =============================================================================

exports.postLogout = async (req, res) => {
  await req.session.destroy();
  res.redirect("/login");
};
