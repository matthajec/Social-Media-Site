const express = require("express");
const { body, checkSchema } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");
const redirectAuth = require("../middleware/redirectAuth");
const redirectUnauth = require("../middleware/redirectUnauth");

const router = express.Router();

// Signup
// =============================================================================

router.get("/signup", redirectAuth("/"), authController.getSignup);
router.post(
  "/signup",
  redirectAuth("/login"),
  checkSchema({
    email: {
      in: ["body"],
      notEmpty: {
        errorMessage: "Email is required",
        bail: true,
      },
      isEmail: {
        errorMessage: "Please use a real email address",
        bail: true,
      },
      normalizeEmail: {},
      custom: {
        options: async (value) => {
          const existingUser = await User.findOne({
            $or: [{ email: email }, { username: username }],
          });

          if (existingUser) {
            if (existingUser.email === value) {
              throw new Error("An account with that email already exists");
            }
          }
        },
      },
    },
    username: {
      in: ["body"],
      notEmpty: {
        errorMessage: "Username is required",
        bail: true,
      },
      isAlphanumeric: {
        errorMessage: "Username must be alphanumeric (a-Z, 0-9)",
        bail: true,
      },
      isLength: {
        errorMessage: "Username must be between 3 and 24 characters long",
        options: { min: 3, max: 24 },
        bail: true,
      },
      custom: {
        options: async (value) => {
          const existingUser = await User.findOne({ username: username });

          if (existingUser) {
            if (existingUser.username === value) {
              throw new Error("An account with that username already exists");
            }
          }
        },
        bail: true,
      },
    },
    password: {
      in: ["body"],
      notEmpty: {
        errorMessage: "Password is required",
        bail: true,
      },
      isStrongPassword: {
        errorMessage:
          "Password must contain: At least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.",
      },
    },
    acknowledgement: {
      in: ["body"],
      custom: {
        options: async (value) => {
          if (value !== "on") {
            throw new Error("You must accept the terms to create an account");
          }
        },
        bail: true,
      },
    },
  }),
  authController.postSignup
);

// Login
// =============================================================================

router.get("/login", redirectAuth("/"), authController.getLogin);
router.post(
  "/login",
  redirectAuth("/login"),
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: "Email is required",
        bail: true,
      },
      isEmail: {
        errorMessage:
          "Invalid email address (are you sure you typed everything correctly?)",
        bail: true,
      },
      normalizeEmail: {},
    },
    password: {
      notEmpty: {
        errorMessage: "Password is required",
        bail: true,
      },
      isStrongPassword: {
        errorMessage: "Wrong password",
        bail: true,
      },
    },
  }),
  authController.postLogin
);

// Logout
// =============================================================================

router.post("/logout", redirectUnauth("/login"), authController.postLogout);

module.exports = router;
