const orderController = require("../controllers/orderController");
const authorization = require("../middlewares/authorization");
const router = require("express").Router();

router.use(authorization.verifyToken);

router.post("/createOrder", orderController.createOrder);

router.get("/getPendingOrders", orderController.getPendingOrders);

router.get("/getShippedOrders", orderController.getShippedOrders);

router.get("/getDeliveredOrders", orderController.getDeliveredOrders);

router.get("/getCancelledOrders", orderController.getCancelledOrders);

router.post("/cancel/:id", orderController.cancelOrder);

router.post("/changeStatus/:id", orderController.changeStatus);

router.post("/confirm/:id", orderController.confirmOrder);

router.get("/getOrder/:id", orderController.getOrderdetails);

module.exports = router;