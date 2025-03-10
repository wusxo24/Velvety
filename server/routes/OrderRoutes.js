const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Tạo đơn hàng (Chỉ người dùng đã đăng nhập mới có thể đặt hàng)
router.post("/", authenticate, orderController.createOrder);

// Lấy danh sách đơn hàng của thành viên (Chỉ người dùng đã đăng nhập mới xem được đơn của mình)
router.get("/member", authenticate, orderController.getOrdersByMemberId);

// Lấy tất cả đơn hàng (Chỉ Admin mới có quyền truy cập)
router.get("/", authenticate, authorize(["Admin"]), orderController.getAllOrders);

// Lấy đơn hàng theo ID (Tất cả người dùng có thể xem)
router.get("/:orderCode", authenticate, orderController.getOrderByOrderCode);

router.delete("/:id", orderController.deleteOrder);
module.exports = router;