const Posts = require("../models/post");

// Home
// =============================================================================

exports.getHome = (req, res) => {
  res.render("social/home.ejs");
};
