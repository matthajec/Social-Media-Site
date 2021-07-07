const { validationResult } = require("express-validator");
const User = require("../models/user");
const Posts = require("../models/post");
const mongoose = require("mongoose");

// Profile
// =============================================================================

exports.getProfile = async (req, res) => {
  let username = (req.query.user || "").toLowerCase();
  let user = req.user;
  let isOwnProfile = true;
  let isBlocked = false;
  let isFollowing = false;
  let isFollowingBack = false;

  if (username && username !== req.user.username) {
    const foundUser = await User.findOne({ username_lower: username });

    if (!foundUser) {
      return res.status(404).render("error/404.ejs");
    }

    const id = foundUser._id.toString();

    isBlocked = user.blockedList.includes(id);

    if (req.user.following.includes(id)) {
      isFollowing = true;
    }

    if (req.user.followers.includes(id)) {
      isFollowingBack = true;
    }

    isOwnProfile = false;
    user = foundUser;
  }

  const posts = await Posts.find({ by: user._id })
    .sort({ createdAt: "desc" })
    .limit(10);

  res.render("profile/profile.ejs", {
    user: user,
    isOwnProfile,
    isBlocked,
    isFollowing,
    isFollowingBack,
    posts,
  });
};

// Edit Profile
// =============================================================================

exports.getEditProfile = (req, res) => {
  res.render("profile/edit-profile.ejs", {
    formErrors: [],
    prevValues: {
      bio: req.user.bio,
    },
  });
};

exports.postEditProfile = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("profile/edit-profile.ejs", {
      formErrors: errors.errors,
      prevValues: {
        bio: req.body.bio,
      },
    });
  }

  req.user.bio = req.body.bio;

  await req.user.save();

  res.redirect("/profile");
};

// Block
// =============================================================================

// toggles block state
exports.postBlock = async (req, res) => {
  const username = (req.query.user || "").toLowerCase();
  const targetUser = await User.findOne({ username_lower: username });

  const onlyBlock = req.query.onlyBlock;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).render("error/404.ejs");
  }

  if (req.user.blockedList.includes(targetUser._id)) {
    // unblock the user if onlyBlock is not set to one
    if (onlyBlock != 1) {
      const targetUserIndex = req.user.blockedList.findIndex(
        (v) => v.toString() === targetUser._id.toString()
      );
      req.user.blockedList.splice(targetUserIndex, 1);
    }
  } else {
    // block the user
    const targetUserIndex = req.user.following.findIndex(
      (v) => v.toString() === targetUser._id.toString()
    );
    if (targetUserIndex > -1) {
      req.user.following.splice(targetUserIndex, 1);
    }

    const indexInTargetUser = targetUser.followers.findIndex((v) => {
      return v.toString() === req.user._id.toString();
    });
    console.log(indexInTargetUser);
    if (indexInTargetUser > -1) {
      targetUser.followers.splice(indexInTargetUser, 1);
    }

    req.user.blockedList.push(targetUser._id);
  }

  await Promise.all([req.user.save()], targetUser.save());
  res.redirect("/profile?user=" + targetUser.username_lower);
};

// Follow
// =============================================================================

// toggles following state
exports.postFollow = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).render("error/404.ejs");
  }

  const username = (req.query.user || "").toLowerCase();
  const targetUser = await User.findOne({ username_lower: username });

  if (!targetUser) {
    return res.status(404).render("error/404.ejs");
  }

  // unfollow the user if they're already being followed, follow if they're not
  if (req.user.following.includes(targetUser._id)) {
    const targetUserIndex = req.user.following.findIndex(
      (v) => v.toString() === targetUser._id.toString()
    );
    req.user.following.splice(targetUserIndex, 1);

    const indexInTargetUser = targetUser.followers.findIndex(
      (v) => v.toString() === req.user._id.toString()
    );
    if (indexInTargetUser > -1) {
      targetUser.followers.splice(indexInTargetUser, 1);
    }
  } else {
    req.user.following.push(targetUser._id);
    targetUser.followers.push(req.user._id);
  }

  await Promise.all([req.user.save(), targetUser.save()]);
  res.redirect("/profile?user=" + targetUser.username_lower);
};
