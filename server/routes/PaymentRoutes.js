const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/AuthMiddleware"); 
const paymentController = require("../controllers/PaymentController");


router.post("/receive-hook", paymentController.receivePayment); 
router.post("/create-payment/:bookingId", authenticate, paymentController.createEmbeddedPaymentLink); 
module.exports = router;
