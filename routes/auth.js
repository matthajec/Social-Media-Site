const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  body("email").isEmail().normalizeEmail(),
  body("username").isAlphanumeric().isLength({ min: 3, max: 24 }),
  body("password").isStrongPassword(),
  authController.postSignup
);

module.exports = router;
