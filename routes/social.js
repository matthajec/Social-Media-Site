const express = require("express");

const redirectUnauth = require("../middleware/redirectUnauth");

const socialController = require("../controllers/social");
const router = express.Router();

// Home
// =============================================================================

router.get("/", redirectUnauth("/login"), socialController.getHome);

module.exports = router;
