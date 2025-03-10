const PayOS = require('../utils/payos'); // Assuming PayOS is your payment gateway utility
const Order = require("../models/Order");
const Service = require("../models/Service");
const User = require("../models/User");
const dotenv = require('dotenv');
dotenv.config();

// Function to create an embedded payment link
const createEmbeddedPaymentLink = async (req, res) => {
    try {
        const { serviceId } = req.params; // Get service ID from the request parameters
        console.log('serviceId:', serviceId);
        const userId = req.user.id; // Get the logged-in user's ID (assumed to be added in the request)

        // Fetch user and service data
        const user = await User.findById(userId);
        const service = await Service.findById(serviceId);

        // Check if user and service exist
        if (!user) {
            return res.status(404).json({ error: 1, message: 'User not found' });
        }

        if (!service) {
            return res.status(404).json({ error: 1, message: 'Service not found' });
        }

        const transactionDateTime = new Date();

        // Generate a unique order code
        let orderCode;
        while (1 > 0) {
            orderCode = Number(Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0'));
            const existingOrder = await Order.findOne({ orderCode });
            if (!existingOrder) break; // Ensure unique order code
        }

        // Create a new order in the database
        const newOrder = new Order({
            memberId: userId,
            serviceId,
            status: "Pending",
            amount: service.price,
            orderCode,
            description: "Thanh toan dich vu",
            buyerName: user.firstName + " " + user.lastName,
            buyerEmail: user.email,
            buyerPhone: user.phoneNumber,
            buyerAddress: user.address || "",
            transactionDateTime
        });
        await newOrder.save();

        // Payment link parameters
        const amount = service.price;
        const description = "Thanh toan dich vu";
        const items = [{ name: service.name, quantity: 1, price: service.price }];
        const returnUrl = "http://localhost:5000/pay-success"; // URL cho trang thành công
        const cancelUrl = "http://localhost:5000/pay-failed"; // URL cho trang thất bại

        // Create the payment link using PayOS
        try {
            const paymentLinkRes = await PayOS.createPaymentLink({
                orderCode,
                amount,
                description,
                items,
                returnUrl,
                cancelUrl,
            });

            return res.json({
                error: 0,
                message: "Success",
                data: {
                    bin: paymentLinkRes.bin,
                    checkoutUrl: paymentLinkRes.checkoutUrl,
                    accountNumber: paymentLinkRes.accountNumber,
                    accountName: paymentLinkRes.accountName,
                    amount: paymentLinkRes.amount,
                    description: paymentLinkRes.description,
                    orderCode: paymentLinkRes.orderCode,
                    qrCode: paymentLinkRes.qrCode,
                },
            });

        } catch (error) {
            console.log(error);
            return res.json({
                error: -1,
                message: "Failed to create payment link",
                data: null,
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 1,
            message: "Internal server error",
            data: null,
        });
    }
};


// Function to handle payment status (webhook)
const receivePayment = async (req, res) => {
    try {
        const data = req.body; // Get data from the webhook
        if (!data.data || !data.data.orderCode) {
            return res.status(400).json({ error: 1, message: "Invalid payment data" });
        }

        const orderCode = data.data.orderCode;
        const order = await Order.findOne({ orderCode });

        if (!order) {
            console.log(`Order with orderCode ${orderCode} not found.`);
            return res.status(404).json({ error: 1, message: "Order not found" });
        }

        // Update order status based on payment success/failure
        if (data.success) {
            order.status = "Paid";
            order.currency = data.data.currency;
            order.paymentMethod = "PayOS"; // You can change this to match your actual payment gateway
            order.paymentStatus = data.data.desc || "Payment Successful";
            console.log(`Order ${orderCode} updated to Paid.`);
        } else {
            order.status = "Canceled";
            order.paymentStatus = data.data.desc || "Payment Failed";
            console.log(`Order ${orderCode} updated to Canceled.`);
        }

        await order.save(); // Save the updated order status

        return res.status(200).json({ error: 0, message: "Order updated successfully", order });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return res.status(500).json({ error: 1, message: "Internal server error" });
    }
};

module.exports = { createEmbeddedPaymentLink, receivePayment };
