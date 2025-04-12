const { Router } = require("express");
const router = Router({ mergeParams: true });
const controllers = require("../../controllers");

router.post("/", controllers.comment.commentPost);
router.put("/:commentId", controllers.comment.commentPut);
router.delete("/:commentId", controllers.comment.commentDelete);

module.exports = router;
