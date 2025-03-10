const Order = require("../models/Order");
const User = require("../models/User");
const Service = require("../models/Service");

// Hàm tạo mã đơn hàng tự động
const generateOrderCode = () => {
    return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const createOrder = async (req, res) => {
    try {
        const { serviceId, amount, description, buyerName, buyerEmail, buyerPhone, buyerAddress, items, currency, paymentMethod, paymentStatus, transactionDateTime } = req.body;
        const memberID = req.user.id;
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const newOrder = new Order({
            memberId: memberID,
            serviceId,
            orderCode: generateOrderCode(),  // Thêm orderCode
            amount,
            description,
            buyerName,
            buyerEmail,
            buyerPhone,
            buyerAddress,
            items,
            currency,
            paymentMethod,
            paymentStatus,
            transactionDateTime: transactionDateTime ? new Date(transactionDateTime) : Date.now(), // Định dạng lại thời gian
        });

        await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrdersByMemberId = async (req, res) => {
    try {
        const memberId = req.user.id;
        const orders = await Order.find({ memberId, status: "Paid" }); // Chỉ lấy đơn hàng đã thanh toán

        res.status(200).json(orders); // Trả về [] nếu không có đơn hàng nào
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders); // Không cần kiểm tra `if (!orders)`, vì MongoDB sẽ trả về []
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const memberId = req.user.id;

        // Kiểm tra quyền sở hữu trước khi xóa
        const deletedOrder = await Order.findOneAndDelete({ _id: orderId, memberId });
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderByOrderCode = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const order = await Order.findOne({ orderCode: orderCode.toLowerCase() }); // Không phân biệt hoa thường

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrdersByMemberId,
    getAllOrders,
    getOrderByOrderCode,
    deleteOrder,
};
