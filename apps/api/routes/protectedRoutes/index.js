const { Router } = require("express");
const router = Router();

const authorPost = require("./authorPost");
const comment = require("./comment");

router.use("/author/post", authorPost);
router.use("/post/:postId/comment", comment);

module.exports = router;
