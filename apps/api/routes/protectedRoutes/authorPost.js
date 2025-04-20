const { Router } = require("express");
const router = Router();
const controllers = require("../../controllers");

// "/author/post" route
router.get("/", controllers.authorPost.postAllGet);
router.get("/:postId", controllers.authorPost.postSingleGet);
router.post("/", controllers.authorPost.postPost);
router.put("/:postId", controllers.authorPost.postPut);
router.delete("/:postId", controllers.authorPost.postDelete);
router.patch("/:postId", controllers.authorPost.postPatch);

module.exports = router;
