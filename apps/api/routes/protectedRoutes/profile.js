const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

router.get("/", controllers.user.userGet);
router.put("/", controllers.user.userPut);

module.exports = router;
