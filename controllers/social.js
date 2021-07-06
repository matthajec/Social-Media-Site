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
  let username = (req.query.user || "").toLowerCase();
  let user = req.user;
  let isOwnProfile = true;
  let isBlocked = user.blockedList.includes(username);
  let isFollowing = false;
  let isFollowingBack = false;

  if (username && username !== req.user.username) {
    const foundUser = await User.findOne({ username_lower: username });

    if (!foundUser) {
      return res.status(404).render("error/404.ejs");
    }

    if (req.user.following.includes(username)) {
      isFollowing = true;
    }

    if (req.user.followers.includes(username)) {
      isFollowingBack = true;
    }

    isOwnProfile = false;
    user = foundUser;
  }

  res.render("social/profile/profile.ejs", {
    user: user,
    isOwnProfile,
    isBlocked,
    isFollowing,
    isFollowingBack,
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
  const username = (req.query.user || "").toLowerCase();
  const targetUser = await User.findOne({ username_lower: username });

  const onlyBlock = req.query.onlyBlock;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).render("error/404.ejs");
  }

  if (req.user.blockedList.includes(targetUser.username_lower)) {
    // unblock the user if onlyBlock is not set to one
    if (onlyBlock != 1) {
      const targetUserIndex = req.user.blockedList.findIndex(
        (v) => v === targetUser.username_lower
      );
      req.user.blockedList.splice(targetUserIndex, 1);
    }
  } else {
    // block the user
    const targetUserIndex = req.user.following.findIndex(
      (v) => v === targetUser.username_lower
    );
    if (targetUserIndex > -1) {
      req.user.following.splice(targetUserIndex, 1);
    }

    const indexInTargetUser = targetUser.followers.findIndex(
      (v) => v === req.user.username_lower
    );
    if (indexInTargetUser > -1) {
      targetUser.followers.splice(indexInTargetUser, 1);
    }

    req.user.blockedList.push(targetUser.username_lower);
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
  if (req.user.following.includes(targetUser.username_lower)) {
    const targetUserIndex = req.user.following.findIndex(
      (v) => v === targetUser.username_lower
    );
    req.user.following.splice(targetUserIndex, 1);

    const indexInTargetUser = targetUser.followers.findIndex(
      (v) => v === req.user.username_lower
    );
    if (indexInTargetUser > -1) {
      targetUser.followers.splice(indexInTargetUser, 1);
    }
  } else {
    req.user.following.push(targetUser.username_lower);
    targetUser.followers.push(req.user.username_lower);
  }

  await Promise.all([req.user.save(), targetUser.save()]);
  res.redirect("/profile?user=" + targetUser.username_lower);
};
