const { Router } = require("express");
const router = Router();
const controllers = require("../controllers");

router.post("/", controllers.user.userPost);

module.exports = router;
