const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyToken, isAdmin, upload.array("image", 10), (req, res) => {
    try {
        // Kiểm tra xem req.files có tồn tại và có file nào được tải lên không
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không nhận được file nào. Vui lòng đảm bảo bạn chọn đúng File "
            });
        }

        // Nếu có files hợp lệ, tiến hành map lấy URL
        const imageUrls = req.files.map(file => file.path);

        return res.json({
            success: true,
            imageUrls: imageUrls,
        });
    } catch (error) {
        console.error("Lỗi xử lý file upload:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi trong quá trình xử lý upload hình ảnh."
        });
    }
});

module.exports = router;