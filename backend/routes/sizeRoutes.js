const express = require("express");
const router = express.Router();

const sizeController = require("../controllers/sizeController");

// Bộ đôi xác thực và phân quyền admin
const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// ======================================================
// API CÔNG KHAI
// Khách hàng và frontend sản phẩm được lấy danh sách size
// ======================================================

router.get(
    "/",
    sizeController.getAllSizes
);

// ======================================================
// API QUẢN TRỊ
// Chỉ admin có token hợp lệ mới được sử dụng
// ======================================================

// Lấy chi tiết một size
router.get(
    "/admin/:id",
    verifyToken,
    isAdmin,
    sizeController.getSizeById
);

// Thêm size mới
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    sizeController.createSize
);

// Sửa size
router.put(
    "/admin/:id",
    verifyToken,
    isAdmin,
    sizeController.updateSize
);

// Xóa size
router.delete(
    "/admin/:id",
    verifyToken,
    isAdmin,
    sizeController.deleteSize
);

module.exports = router;