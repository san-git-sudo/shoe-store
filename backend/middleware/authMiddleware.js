const jwt = require("jsonwebtoken");

// ======================================================
// 1. Kiểm tra access token từ header Authorization
// ======================================================
const verifyToken = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập."
            });
        }

        const token = authorization.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Lưu thông tin giải mã vào request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập đã hết hạn."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ."
        });
    }
};

// ======================================================
// 2. Kiểm tra xem user có phải là Admin hay không
// (Chạy ngay sau verifyToken)
// ======================================================
const isAdmin = (req, res, next) => {
    // Sửa req.user.role thành req.user.vaitro cho đúng với database của anh nha!
    // Đồng thời kiểm tra giá trị lưu trong DB của anh là "admin" hay "Admin" để so khớp chính xác nhé.
    if (req.user && (req.user.vaitro === "admin" || req.user.vaitro === "Admin")) {
        next(); // Hợp lệ thì cho đi tiếp
    } else {
        return res.status(403).json({
            success: false,
            message: "Truy cập bị từ chối. Bạn không có quyền Admin!"
        });
    }
};

// Xuất cả 2 middleware dưới dạng object để dễ import ở các file route
module.exports = {
    verifyToken,
    isAdmin
};