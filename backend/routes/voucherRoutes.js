const express = require("express");
const router = express.Router();

const voucherController = require("../controllers/voucherController");

// Bộ đôi bảo vệ route quản trị
const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// ======================================================
// API CÔNG KHAI - KHÁCH HÀNG
// ======================================================

// Khách chỉ xem voucher đang hoạt động và còn hiệu lực
router.get(
    "/",
    voucherController.getVouchers
);

// ======================================================
// API QUẢN TRỊ - CHỈ ADMIN
// Các route cụ thể phải đặt trước route có :id
// ======================================================

// Admin lấy toàn bộ voucher
router.get(
    "/admin/list",
    verifyToken,
    isAdmin,
    voucherController.getAdminVouchers
);

// Admin lấy chi tiết một voucher để sửa
router.get(
    "/admin/:id",
    verifyToken,
    isAdmin,
    voucherController.getAdminVoucherById
);

// Admin thêm voucher mới
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    voucherController.createVoucher
);

// Admin cập nhật voucher
router.put(
    "/admin/:id",
    verifyToken,
    isAdmin,
    voucherController.updateVoucher
);

// Admin xóa voucher
router.delete(
    "/admin/:id",
    verifyToken,
    isAdmin,
    voucherController.deleteVoucher
);

module.exports = router;