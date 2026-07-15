const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

// Import bộ đôi vệ sĩ bảo mật cho Admin
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ======================================================
// API CÔNG KHAI (PUBLIC APIs) - Khách mua hàng xem được
// ======================================================

// Lấy danh sách sản phẩm (show ra trang chủ, tìm kiếm, lọc...)
router.get("/", productController.getProducts);

// Lấy chi tiết một sản phẩm cụ thể
router.get("/:id", productController.getProductById);


// ======================================================
// API QUẢN TRỊ (ADMIN APIs) - Chỉ Admin có Token hợp lệ mới dùng được
// ======================================================
// Lấy danh sách sản phẩm đầy đủ cho Admin (ĐẶT TRÊN ROUTE CÓ :id)
router.get("/admin/list", verifyToken, isAdmin, productController.getAdminProducts);
// Thêm sản phẩm mới (Yêu cầu đăng nhập + quyền admin)
router.post("/", verifyToken, isAdmin, productController.createProduct);

// Xóa sản phẩm (Yêu cầu đăng nhập + quyền admin)
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

// Sửa sản phẩm (Yêu cầu đăng nhập + quyền admin) -> Thêm dòng này nha anh!
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);

module.exports = router;