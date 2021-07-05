const { validationResult } = require("express-validator");

const errCodes = require("../routes/validationErrors/codes");
const User = require("../models/user");
const Report = require("../models/report");

exports.getUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).render("error/404.ejs");
  }

  const reportedUser = await User.findOne({ username: req.query.user });

  if (!reportedUser) {
    return res.status(404).render("error/404.ejs");
  }

  res.render("report/user.ejs", {
    reportedUser,
    formErrors: [],
    prevValues: {
      reason: "",
      details: "",
    },
  });
};

exports.postUser = async (req, res) => {
  const errors = validationResult(req);

  // check if the user being reported could even theoretically exist
  if (!errors.isEmpty()) {
    isInvalidUsername = false;
    errors.errors.forEach((e) => {
      if (e.msg === errCodes.ERR_INVALID_TYPE) {
        isInvalidUsername = true;
      }
    });

    if (isInvalidUsername) {
      return res.status(404).render("error/404.ejs");
    }
  }

  const reportedUser = await User.findOne({ username: req.query.user });

  if (!reportedUser) {
    return res.status(404).render("error/404.ejs");
  }

  if (!errors.isEmpty()) {
    console.log(errors.errors);
    return res.status(422).render("report/user.ejs", {
      reportedUser,
      formErrors: errors.errors,
      prevValues: {
        reason: req.body.reason,
        details: req.body.details,
      },
    });
  }

  const newReport = new Report({
    by: req.user.username,
    against: req.query.user,
    for: req.body.reason,
    details: req.body.details,
  });

  await newReport.save();

  res.render("report/report-success.ejs", {
    reportedUser,
  });
};
