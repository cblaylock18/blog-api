const { Router } = require("express");
const router = Router();

const user = require("./user");
const login = require("./login");

router.use("/user", user);
router.use("/login", login);

module.exports = router;
