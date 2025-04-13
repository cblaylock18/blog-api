const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

router.get("/", controllers.post.postAllGet); //also allows offset query for pagination, takes page and limit query
router.get("/:postId", controllers.post.postSingleGet);
router.get("/:postId/comment", controllers.comment.commentGet);

module.exports = router;
