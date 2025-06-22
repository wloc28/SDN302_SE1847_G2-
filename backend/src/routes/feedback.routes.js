const express = require("express");
const router = express.Router();
const controller = require("../controllers/feedback.controller");

router.post("/", controller.createFeedback);
router.get("/seller/:sellerId", controller.getListBySellerId);

module.exports = router;
