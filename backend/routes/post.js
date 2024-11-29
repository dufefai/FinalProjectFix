const postController = require("../controllers/postController");
const authorization = require("../middlewares/authorization");
const router = require("express").Router();

router.post("/post", authorization.verifyToken , postController.post);

router.post("/edit/:id", authorization.verifyToken , postController.editPost);

router.post("/repost/:id", authorization.verifyToken , postController.rePost);

router.get("/view/:id", authorization.verifyToken, postController.viewPost);

router.delete("/delete/:id", authorization.verifyToken , postController.deletePost);

router.post("/like/:id", authorization.verifyToken , postController.likePost);

router.post("/comment/:id", authorization.verifyToken , postController.commentPost);

router.get("/news", authorization.verifyToken , postController.getNews);

router.get("/getNotifications", authorization.verifyToken , postController.getNotifications);

router.post("/viewNotification/:id", authorization.verifyToken , postController.viewNotification);

router.post("/readNotification", authorization.verifyToken , postController.readNotification);

router.get("/search", authorization.verifyToken, postController.searchPost);

router.get("/:username", authorization.verifyToken , postController.getUserPosts);





module.exports = router;