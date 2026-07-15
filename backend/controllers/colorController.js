const colorModel = require("../models/colorModel");

// ==========================================
// CHUẨN HÓA DỮ LIỆU TRẢ VỀ
// ==========================================
const normalizeColorResponse = (color) => {
    if (!color) return null;

    return {
        ...color,
        mamausac: Number(color.mamausac)
    };
};

// ==========================================
// KIỂM TRA VÀ CHUẨN HÓA DỮ LIỆU MÀU
// ==========================================
const validateColorData = (body) => {
    let {
        tenmausac,
        mota,
        hexcode
    } = body;

    tenmausac = String(tenmausac || "").trim();
    mota = String(mota || "").trim();
    hexcode = String(hexcode || "")
        .trim()
        .toUpperCase();

    // ==========================================
    // KIỂM TRA TÊN MÀU
    // ==========================================
    if (!tenmausac) {
        return {
            error: "Tên màu không được để trống"
        };
    }

    if (tenmausac.length < 2 || tenmausac.length > 50) {
        return {
            error: "Tên màu phải có từ 2 đến 50 ký tự"
        };
    }

    /*
        Cho phép chữ tiếng Việt, chữ cái, số,
        khoảng trắng và dấu gạch ngang.

        Ví dụ:
        Đen
        Trắng Kem
        Xanh Dương
        Đỏ-Đen
    */
    if (
        !/^[\p{L}\p{N}\s-]+$/u.test(tenmausac)
    ) {
        return {
            error:
                "Tên màu chỉ được chứa chữ, số, khoảng trắng và dấu gạch ngang"
        };
    }

    // Chuẩn hóa nhiều khoảng trắng liên tiếp thành một
    tenmausac = tenmausac.replace(/\s+/g, " ");

    // ==========================================
    // KIỂM TRA MÃ HEX
    // ==========================================
    if (!hexcode) {
        return {
            error: "Mã màu HEX không được để trống"
        };
    }

    /*
        Chỉ chấp nhận dạng đầy đủ:
        #000000
        #FFFFFF
        #1E90FF
    */
    if (!/^#[0-9A-F]{6}$/.test(hexcode)) {
        return {
            error:
                "Mã HEX phải đúng định dạng #RRGGBB, ví dụ #000000"
        };
    }

    // ==========================================
    // KIỂM TRA MÔ TẢ
    // ==========================================
    if (mota.length > 250) {
        return {
            error: "Mô tả không được vượt quá 250 ký tự"
        };
    }

    return {
        data: {
            tenmausac,
            mota: mota || null,
            hexcode
        }
    };
};

// ==========================================
// 1. API CÔNG KHAI: LẤY DANH SÁCH MÀU
// ==========================================
const getAllColors = async (req, res) => {
    try {
        const colors = await colorModel.getAllColors();

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách màu sắc thành công",
            data: colors.map(normalizeColorResponse)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách màu sắc:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách màu sắc"
        });
    }
};

// ==========================================
// 2. ADMIN: LẤY MÀU THEO ID
// ==========================================
const getColorById = async (req, res) => {
    try {
        const colorId = Number(req.params.id);

        if (
            !Number.isInteger(colorId) ||
            colorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã màu sắc không hợp lệ"
            });
        }

        const color = await colorModel.getColorById(
            colorId
        );

        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy màu sắc"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết màu sắc thành công",
            data: normalizeColorResponse(color)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy màu theo ID:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy chi tiết màu sắc"
        });
    }
};

// ==========================================
// 3. ADMIN: THÊM MÀU SẮC
// ==========================================
const createColor = async (req, res) => {
    try {
        const validation = validateColorData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const colorData = validation.data;

        const duplicatedName =
            await colorModel.findByName(
                colorData.tenmausac
            );

        if (duplicatedName) {
            return res.status(409).json({
                success: false,
                message:
                    `Màu "${colorData.tenmausac}" đã tồn tại`
            });
        }

        const duplicatedHex =
            await colorModel.findByHexCode(
                colorData.hexcode
            );

        if (duplicatedHex) {
            return res.status(409).json({
                success: false,
                message:
                    `Mã màu ${colorData.hexcode} đã được sử dụng cho màu "${duplicatedHex.tenmausac}"`
            });
        }

        const colorId =
            await colorModel.createColor(colorData);

        const createdColor =
            await colorModel.getColorById(colorId);

        return res.status(201).json({
            success: true,
            message: "Thêm màu sắc thành công",
            data: normalizeColorResponse(createdColor)
        });
    } catch (error) {
        console.error("Lỗi thêm màu sắc:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message:
                    "Tên màu hoặc mã HEX đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể thêm màu sắc"
        });
    }
};

// ==========================================
// 4. ADMIN: CẬP NHẬT MÀU SẮC
// ==========================================
const updateColor = async (req, res) => {
    try {
        const colorId = Number(req.params.id);

        if (
            !Number.isInteger(colorId) ||
            colorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã màu sắc không hợp lệ"
            });
        }

        const currentColor =
            await colorModel.getColorById(colorId);

        if (!currentColor) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy màu sắc"
            });
        }

        const validation = validateColorData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const colorData = validation.data;

        const duplicatedName =
            await colorModel.findByName(
                colorData.tenmausac,
                colorId
            );

        if (duplicatedName) {
            return res.status(409).json({
                success: false,
                message:
                    `Màu "${colorData.tenmausac}" đã tồn tại`
            });
        }

        const duplicatedHex =
            await colorModel.findByHexCode(
                colorData.hexcode,
                colorId
            );

        if (duplicatedHex) {
            return res.status(409).json({
                success: false,
                message:
                    `Mã màu ${colorData.hexcode} đã được sử dụng cho màu "${duplicatedHex.tenmausac}"`
            });
        }

        await colorModel.updateColor(
            colorId,
            colorData
        );

        const updatedColor =
            await colorModel.getColorById(colorId);

        return res.status(200).json({
            success: true,
            message: "Cập nhật màu sắc thành công",
            data: normalizeColorResponse(updatedColor)
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật màu sắc:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message:
                    "Tên màu hoặc mã HEX đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật màu sắc"
        });
    }
};

// ==========================================
// 5. ADMIN: XÓA MÀU SẮC
// ==========================================
const deleteColor = async (req, res) => {
    try {
        const colorId = Number(req.params.id);

        if (
            !Number.isInteger(colorId) ||
            colorId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã màu sắc không hợp lệ"
            });
        }

        const currentColor =
            await colorModel.getColorById(colorId);

        if (!currentColor) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy màu sắc"
            });
        }

        const variantsCount =
            await colorModel.countVariantsUsingColor(
                colorId
            );

        if (variantsCount > 0) {
            return res.status(409).json({
                success: false,
                message:
                    `Không thể xóa màu "${currentColor.tenmausac}" vì đang được sử dụng trong ${variantsCount} biến thể sản phẩm`
            });
        }

        const affectedRows =
            await colorModel.deleteColor(colorId);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy màu sắc để xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                `Đã xóa màu "${currentColor.tenmausac}" thành công`
        });
    } catch (error) {
        console.error("Lỗi xóa màu sắc:", error);

        if (
            error.code ===
            "ER_ROW_IS_REFERENCED_2"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Màu sắc đang được biến thể sản phẩm sử dụng nên không thể xóa"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể xóa màu sắc"
        });
    }
};

module.exports = {
    getAllColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor
};