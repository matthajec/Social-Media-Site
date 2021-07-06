const express = require("express");

const router = express.Router();

const postController = require("../controllers/post");

// Post
// =============================================================================

router.get("/", postController.getPost);

router.post("/", postController.postPost);

module.exports = router;
