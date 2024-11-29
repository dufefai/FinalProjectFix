const marketController = require("../controllers/marketController");
const authorization = require("../middlewares/authorization");
const router = require("express").Router();

router.use(authorization.verifyToken);

router.get("/getStore", marketController.storeRecommendation);

router.get("/getStoreDetail/:id", marketController.getStoreDetail);

router.get("/getProductDetail/:id", marketController.getProduct);

router.post("/review", marketController.reviewStore);

router.get("/getReview/:id", marketController.getStoreReviews);

router.get("/search", marketController.searchStore);



module.exports = router;