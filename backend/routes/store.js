const storeController = require("../controllers/storeController");
const authorization = require("../middlewares/authorization");
const router = require("express").Router();

router.use(authorization.verifyToken);

router.post("/create", storeController.createStore);

router.get("/getStore", storeController.getStore);

router.post("/createCategory", storeController.createCategory);

router.post("/editCategory/:id", storeController.editCategory);

router.delete("/deleteCategory/:id", storeController.deleteCategory);

router.get("/getCategories", storeController.getCategories);

router.post("/createProduct", storeController.createProduct);

router.post("/editProduct/:id", storeController.editProduct);

router.post("/enableProduct/:id", storeController.enableProduct);

router.delete("/deleteProduct/:id", storeController.deleteProduct);

router.get("/getProducts", storeController.getProducts);

router.get("/getPendingOrders", storeController.getPendingOrders);

router.get("/getShippedOrders", storeController.getShippedOrders);

router.get("/getDeliveredOrders", storeController.getDeliveredOrders);

router.get("/getCancelledOrders", storeController.getCancelledOrders);

router.get("/getDeliveredOrderStatistics", storeController.getDeliveredOrderStatistics);

router.get("/getCancelledOrderStatistics", storeController.getCancelledOrderStatistics);

router.get("/getCustomerStatistics", storeController.getCustomerStatistics);

router.get("/getBestSellingProducts", storeController.getBestSellingProducts);

router.get("/getTodayOrdersAndRevenue", storeController.getTodayOrdersAndRevenue);

router.get("/getTotalRevenueByMonth", storeController.getTotalRevenueByMonth);

router.get("/getTotalRevenueLast30Days", storeController.getTotalRevenueLast30Days);

router.get("/getTotalRevenueLast7Days", storeController.getTotalRevenueLast7Days);

router.get("/search", storeController.searchProduct);

router.get("/searchStore", storeController.searchStore);

router.get("/confirmationStore", authorization.verifyAdmin, storeController.confirmationStore);

router.post("/verifyStore/:id", authorization.verifyAdmin, storeController.verifyStore);



module.exports = router;
