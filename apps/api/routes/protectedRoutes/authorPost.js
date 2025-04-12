const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

// "/author/post" route
router.post("/", controllers.authorPost.postPost);
router.put("/:postId", controllers.authorPost.postPut);
router.delete("/:postId", controllers.authorPost.postDelete);

module.exports = router;
