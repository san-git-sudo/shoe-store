const express = require("express");
const router = express.Router();

const categoryController = require(
    "../controllers/categoryController"
);

const {
    verifyToken,
    isAdmin
} = require("../middleware/authMiddleware");

// ======================================================
// API CÔNG KHAI
// Navbar, bộ lọc và form sản phẩm được sử dụng
// ======================================================

router.get(
    "/",
    categoryController.getCategories
);

// ======================================================
// API QUẢN TRỊ
// Chỉ admin có token hợp lệ được sử dụng
// ======================================================

// Lấy toàn bộ danh mục kèm số lượng sản phẩm
router.get(
    "/admin/list",
    verifyToken,
    isAdmin,
    categoryController.getAdminCategories
);

// Lấy chi tiết danh mục
router.get(
    "/admin/:id",
    verifyToken,
    isAdmin,
    categoryController.getCategoryById
);

// Thêm danh mục
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    categoryController.createCategory
);

// Sửa danh mục
router.put(
    "/admin/:id",
    verifyToken,
    isAdmin,
    categoryController.updateCategory
);

// Xóa danh mục
router.delete(
    "/admin/:id",
    verifyToken,
    isAdmin,
    categoryController.deleteCategory
);

module.exports = router;