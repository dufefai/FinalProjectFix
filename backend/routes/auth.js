const {authController} = require("../controllers/authController");
const authorization = require("../middlewares/authorization");
const router = require("express").Router();

router.post("/register", authController.register);

router.post("/googleLogin", authController.googleLogin);

router.post("/login", authController.login);

router.post("/logout", authorization.verifyToken, authController.logout);

router.post("/refresh", authController.requestRefreshToken);

module.exports = router;
