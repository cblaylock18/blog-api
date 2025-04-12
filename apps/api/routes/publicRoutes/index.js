const { Router } = require("express");
const router = Router();

const user = require("./user");
const login = require("./login");
const post = require("./post");

router.use("/user", user);
router.use("/login", login);
router.use("/post", post);

module.exports = router;
