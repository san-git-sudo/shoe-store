const express = require("express");
const router = express.Router();

const colorController = require(
    "../controllers/colorController"
);

const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// ======================================================
// API CÔNG KHAI
// Khách hàng và frontend sản phẩm được xem màu
// ======================================================

router.get(
    "/",
    colorController.getAllColors
);

// ======================================================
// API QUẢN TRỊ
// Chỉ admin có token hợp lệ mới được sử dụng
// ======================================================

// Lấy chi tiết màu để sửa
router.get(
    "/admin/:id",
    verifyToken,
    isAdmin,
    colorController.getColorById
);

// Thêm màu mới
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    colorController.createColor
);

// Sửa màu
router.put(
    "/admin/:id",
    verifyToken,
    isAdmin,
    colorController.updateColor
);

// Xóa màu
router.delete(
    "/admin/:id",
    verifyToken,
    isAdmin,
    colorController.deleteColor
);

module.exports = router;