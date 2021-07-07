const express = require("express");
const { query, checkSchema } = require("express-validator");

const redirectUnauth = require("../middleware/redirectUnauth");

const profileController = require("../controllers/profile");
const router = express.Router();

// Profile
// =============================================================================

router.get(
  "/",
  redirectUnauth("/login"),
  query("user").isAlphanumeric(),
  profileController.getProfile
);

// Edit Profile
// =============================================================================

router.get("/edit", redirectUnauth("/login"), profileController.getEditProfile);

router.post(
  "/edit",
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
  profileController.postEditProfile
);

// Block
// =============================================================================

router.post(
  "/block",
  redirectUnauth("/login"),
  query("user").notEmpty().isAlphanumeric(),
  profileController.postBlock
);

// Follow
// =============================================================================

router.post(
  "/follow",
  redirectUnauth("/login"),
  query("user").notEmpty().isAlphanumeric(),
  profileController.postFollow
);

module.exports = router;
