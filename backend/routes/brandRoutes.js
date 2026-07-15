const express = require("express");
const router = express.Router();

const brandController = require(
    "../controllers/brandController"
);

const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// ======================================================
// API CÔNG KHAI
// Chỉ trả về các hãng đang hoạt động
// ======================================================

router.get(
    "/",
    brandController.getBrands
);

// ======================================================
// API QUẢN TRỊ
// Chỉ admin có token hợp lệ được sử dụng
// ======================================================

// Lấy toàn bộ hãng kèm số sản phẩm
router.get(
    "/admin/list",
    verifyToken,
    isAdmin,
    brandController.getAdminBrands
);

// Lấy chi tiết hãng
router.get(
    "/admin/:id",
    verifyToken,
    isAdmin,
    brandController.getBrandById
);

// Thêm hãng
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    brandController.createBrand
);

// Sửa hãng
router.put(
    "/admin/:id",
    verifyToken,
    isAdmin,
    brandController.updateBrand
);

// Xóa hãng
router.delete(
    "/admin/:id",
    verifyToken,
    isAdmin,
    brandController.deleteBrand
);

module.exports = router;