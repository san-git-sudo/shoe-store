const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// ======================================================
// Đăng ký và xác thực email
// ======================================================

// Bước 1: gửi OTP đăng ký
router.post("/register", authController.register);

// Bước 2: xác thực OTP và tạo tài khoản
router.post("/verify-register-otp", authController.verifyRegisterOTP);

// ======================================================
// Đăng nhập
// ======================================================
router.post("/login", authController.login);

// ======================================================
// Quên mật khẩu
// Không cần JWT vì người dùng chưa đăng nhập
// ======================================================

// Gửi liên kết đặt lại mật khẩu đến email
router.post("/forgot-password", authController.forgotPassword);

// Kiểm tra reset token và cập nhật mật khẩu mới
router.post("/reset-password/:token", authController.resetPassword);

// ======================================================
// Thông tin cá nhân
// Phải đăng nhập và gửi JWT
// ======================================================

// Lấy thông tin người đang đăng nhập
router.get("/profile", verifyToken, authController.getProfile);

// Cập nhật thông tin người đang đăng nhập
router.put("/profile", verifyToken, authController.updateProfile);

module.exports = router;