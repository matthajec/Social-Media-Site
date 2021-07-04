const { validationResult } = require("express-validator");
const User = require("../models/user");

// Home
// =============================================================================

exports.getHome = (req, res) => {
  res.render("social/home.ejs");
};

// Profile
// =============================================================================

exports.getProfile = async (req, res) => {
  const username = req.query.user;
  let user = req.user;
  let isOwnProfile = true;
  let isBlocked = user.blockedList.includes(username);
  let isFollowing = false;

  if (username && username !== req.user.username) {
    const foundUser = await User.findOne({ username: username });

    if (!foundUser) {
      return res.status(404).render("error/404.ejs");
    }

    if (req.user.following.includes(username)) {
      isFollowing = true;
    }

    isOwnProfile = false;
    user = foundUser;
  }

  res.render("social/profile/profile.ejs", {
    user: user,
    isOwnProfile,
    isBlocked,
    isFollowing,
  });
};

// Edit Profile
// =============================================================================

exports.getEditProfile = (req, res) => {
  res.render("social/profile/edit-profile.ejs", {
    formErrors: [],
    prevValues: {
      bio: req.user.bio,
    },
  });
};

exports.postEditProfile = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("social/profile/edit-profile.ejs", {
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
  const blockedUser = req.query.user;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).render("error/404.ejs");
  }

  // block and unfollow the user
  if (req.user.blockedList.includes(blockedUser)) {
    const blockedIndex = req.user.blockedList.findIndex(
      (v) => v === blockedUser
    );
    if (blockedIndex > -1) {
      req.user.blockedList.splice(blockedIndex, 1);
    } else {
      return res.status(404).render("error/404.ejs");
    }

    const followingIndex = req.user.following.findIndex(
      (v) => v === blockedUser
    );
    if (followingIndex > -1) {
      req.user.following.splice(followignIndex, 1);
    }

    await req.user.save();
  } else {
    req.user.blockedList.push(blockedUser);
    await req.user.save();
  }

  res.redirect("/profile?user=" + blockedUser);
};

// Follow
// =============================================================================

// toggles following state
exports.postFollow = async (req, res) => {
  const followedUser = req.query.user;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).render("error/404.ejs");
  }

  if (req.user.following.includes(followedUser)) {
    const followingIndex = req.user.following.findIndex(
      (v) => v === followedUser
    );
    if (followingIndex > -1) {
      req.user.following.splice(followingIndex, 1);
    } else {
      return res.status(404).render("error/404.ejs");
    }

    await req.user.save();
  } else {
    req.user.following.push(followedUser);
    await req.user.save();
  }

  res.redirect("/profile?user=" + followedUser);
};
