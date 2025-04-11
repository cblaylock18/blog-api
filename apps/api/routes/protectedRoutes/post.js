const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

router.post("/", controllers.post.postPost);

module.exports = router;


