const express = require("express");
const { query, checkSchema } = require("express-validator");

const redirectUnauth = require("../middleware/redirectUnauth");
const errCodes = require("./validationErrors/codes");

const reportController = require("../controllers/report");
const router = express.Router();

// Report User
// =============================================================================

router.get(
  "/user",
  redirectUnauth("/login"),
  query("user").notEmpty().isAlphanumeric(),
  reportController.getUser
);

router.post(
  "/user",
  redirectUnauth("/login"),
  query("user")
    .notEmpty()
    .isAlphanumeric()
    .withMessage(errCodes.ERR_INVALID_TYPE),
  checkSchema({
    reason: {
      in: ["body"],
      custom: {
        options: async (value) => {
          if (!["offensive", "harassment", "illegal"].includes(value)) {
            throw new Error("Invalid report reason");
          }
        },
        bail: true,
      },
    },
    details: {
      in: ["body"],
      isLength: {
        errorMessage: "Details should be less than 1500 characters",
        options: { max: 1500 },
        bail: true,
      },
    },
  }),
  reportController.postUser
);

module.exports = router;
