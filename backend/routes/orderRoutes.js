const express = require("express");
const router = express.Router();

const orderController = require(
    "../controllers/orderController"
);

const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// ======================================================
// API KHÁCH HÀNG ĐÃ ĐĂNG NHẬP
// Chỉ cần token hợp lệ, không yêu cầu quyền admin
// ======================================================

// Lấy lịch sử đơn hàng của người đang đăng nhập
router.get(
    "/my-orders",
    verifyToken,
    orderController.getMyOrders
);

// Lấy chi tiết một đơn hàng thuộc người đang đăng nhập
router.get(
    "/my-orders/:id",
    verifyToken,
    orderController.getMyOrderDetail
);

// ======================================================
// API QUẢN TRỊ ĐƠN HÀNG
// Tất cả đều yêu cầu token hợp lệ và quyền admin
// ======================================================

// Dashboard
router.get(
    "/admin/dashboard",
    verifyToken,
    isAdmin,
    orderController.getDashboard
);

// Doanh thu
router.get(
    "/admin/revenue",
    verifyToken,
    isAdmin,
    orderController.getRevenueStatistics
);

// Danh sách đơn hàng
router.get(
    "/admin/list",
    verifyToken,
    isAdmin,
    orderController.getAdminOrders
);

// Xem chi tiết đơn hàng
router.get(
    "/admin/:id",
    verifyToken,
    isAdmin,
    orderController.getOrderDetail
);

// Cập nhật trạng thái đơn hàng
router.put(
    "/admin/:id/status",
    verifyToken,
    isAdmin,
    orderController.updateOrderStatus
);

// Cập nhật trạng thái thanh toán
router.put(
    "/admin/:id/payment",
    verifyToken,
    isAdmin,
    orderController.updatePaymentStatus
);

module.exports = router;