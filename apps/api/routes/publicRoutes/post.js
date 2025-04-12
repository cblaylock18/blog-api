const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

router.get("/", controllers.post.postAllGet);
router.get("/:postId", controllers.post.postSingleGet); //also allows offset query for pagination
router.get("/:postId/comment", controllers.comment.commentGet);

module.exports = router;
