const mongoose = require("mongoose");
const Post = require("../models/post");

// Home
// =============================================================================

exports.getHome = async (req, res) => {
  const featuredPosts = await Post.find({
    by: { $in: req.user.following },
  })
    .sort({ date: "desc" })
    .limit(10)
    .populate("by");

  res.render("social/feed.ejs", {
    posts: featuredPosts,
  });
};
