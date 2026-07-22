const express = require("express");
const router = express.Router();

const zalopayController = require(
    "../controllers/zalopayController"
);

const {
    verifyToken
} = require(
    "../middleware/authMiddleware"
);

// ======================================================
// KHÁCH HÀNG: TẠO THANH TOÁN ZALOPAY
//
// POST /api/zalopay/create
//
// Bắt buộc đăng nhập.
// ======================================================
router.post(
    "/create",
    verifyToken,
    zalopayController.createZaloPayPayment
);

// ======================================================
// CALLBACK TỪ ZALOPAY
//
// POST /api/zalopay/callback
//
// KHÔNG dùng verifyToken.
// ZaloPay gọi trực tiếp từ server của họ.
// Bảo mật bằng MAC với key2.
// ======================================================
router.post(
    "/callback",
    zalopayController.zaloPayCallback
);

// ======================================================
// KHÁCH HÀNG: KIỂM TRA TRẠNG THÁI GIAO DỊCH
//
// GET /api/zalopay/status/:appTransId
//
// Bắt buộc đăng nhập.
// ======================================================
router.get(
    "/status/:appTransId",
    verifyToken,
    zalopayController.getZaloPayStatus
);

module.exports = router;