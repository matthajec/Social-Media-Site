const express = require("express");
const { param, query, checkSchema } = require("express-validator");

const redirectUnauth = require("../middleware/redirectUnauth");

const socialController = require("../controllers/social");
const router = express.Router();

// Home
// =============================================================================

router.get("/", redirectUnauth("/login"), socialController.getHome);

// Profile
// =============================================================================

router.get(
  "/profile",
  redirectUnauth("/login"),
  query("username").isAlphanumeric(),
  socialController.getProfile
);

// Edit Profile
// =============================================================================

router.get(
  "/profile/edit",
  redirectUnauth("/login"),
  socialController.getEditProfile
);

router.post(
  "/profile/edit",
  checkSchema({
    bio: {
      in: ["body"],
      isLength: {
        errorMessage: "Bio must be 140 characters or less",
        options: { max: 140 },
      },
    },
  }),
  redirectUnauth("/login"),
  socialController.postEditProfile
);

// Block
// =============================================================================

router.post(
  "/profile/block",
  query("user").notEmpty().isAlphanumeric(),
  socialController.postBlock
);

// Follow
// =============================================================================

router.post(
  "/profile/follow",
  query("user").notEmpty().isAlphanumeric(),
  socialController.postFollow
);

module.exports = router;
