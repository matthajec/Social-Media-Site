const Post = require("../models/post");

exports.getPost = (req, res) => {
  res.render("post/new", {
    formErrors: [],
    prevValues: {
      body: "",
    },
  });
};

exports.postPost = async (req, res) => {
  const body = req.body.body;

  const newPost = new Post({
    body,
    by: req.user._id,
  });

  await newPost.save();

  res.redirect("/profile");
};

exports.postDeletePost = async (req, res) => {
  const id = req.body.postId;

  await Post.findByIdAndDelete(id);

  res.redirect("/profiel");
};
