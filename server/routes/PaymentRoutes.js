const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/AuthMiddleware"); // Make sure this exists for authentication checks
const paymentController = require("../controllers/PaymentController");
const { createEmbeddedPaymentLink, receivePayment } = require("../controllers/PaymentController");

router.post('/create-payment/:serviceId', createEmbeddedPaymentLink); // Ensure the function is correctly passed here
router.post('/payment-webhook', receivePayment); // Same for this route

module.exports = router;
