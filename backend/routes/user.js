const userController = require("../controllers/userController");
const authorization = require("../middlewares/authorization");

const router = require("express").Router();

router.use(authorization.verifyToken);

router.get("/view/:username", userController.viewUser);

router.post("/update/:id", userController.updateProfile);

router.post("/changePassword", userController.changePassword);

router.get("/address", userController.findAddress);

router.post("/changeAddress", userController.changeAddress);

router.get("/search", userController.searchUser);

router.post("/follow/:id", userController.followUser);

router.get("/getRandomUser", userController.getRandomUser);




module.exports = router;