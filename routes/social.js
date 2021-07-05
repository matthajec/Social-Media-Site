const express = require("express");
const { query, checkSchema } = require("express-validator");

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
  redirectUnauth("/login"),
  checkSchema({
    bio: {
      in: ["body"],
      isLength: {
        errorMessage: "Bio must be 220 characters or less",
        options: { max: 220 },
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
  redirectUnauth("/login"),
  query("user").notEmpty().isAlphanumeric(),
  socialController.postBlock
);

// Follow
// =============================================================================

router.post(
  "/profile/follow",
  redirectUnauth("/login"),
  query("user").notEmpty().isAlphanumeric(),
  socialController.postFollow
);

module.exports = router;
