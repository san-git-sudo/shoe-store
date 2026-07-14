const jwt = require("jsonwebtoken");

// ======================================================
// Kiểm tra access token từ header Authorization
//
// Frontend phải gửi:
// Authorization: Bearer <token>
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
        // Controller phía sau có thể dùng req.user
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

module.exports = verifyToken;