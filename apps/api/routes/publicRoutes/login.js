const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

router.post("/", controllers.login.loginPost);

module.exports = router;
