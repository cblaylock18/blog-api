const { Router } = require("express");
const router = Router();

const authorPost = require("./authorPost");
const comment = require("./comment");
const profile = require("./profile");

router.use("/author/post", authorPost);
router.use("/post/:postId/comment", comment);
router.use("/profile", profile);

module.exports = router;
