const { Router } = require("express");
const router = Router();

const post = require("./post");

router.use("/post", post);

module.exports = router;
