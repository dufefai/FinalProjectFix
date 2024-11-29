const messageController = require("../controllers/messageController");
const authorization = require("../middlewares/authorization");
const router = require("express").Router();

router.use(authorization.verifyToken);

router.post("/sendMessage/:id", messageController.sendMessage);

router.post("/readConversation/:id", messageController.readConversation)

router.get("/getConversations", messageController.getConversations);

router.get("/getMessages/:id", messageController.getMessages);

module.exports = router;