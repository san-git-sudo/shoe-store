const sizeModel = require("../models/sizeModel");

// ==========================================
// CHUẨN HÓA DỮ LIỆU TRẢ VỀ
// ==========================================
const normalizeSizeResponse = (size) => {
    if (!size) return null;

    return {
        ...size,
        makichthuoc: Number(size.makichthuoc)
    };
};

// ==========================================
// KIỂM TRA VÀ CHUẨN HÓA DỮ LIỆU SIZE
// ==========================================
const validateSizeData = (body) => {
    let {
        tenkichthuoc,
        mota
    } = body;

    tenkichthuoc = String(tenkichthuoc || "").trim();
    mota = String(mota || "").trim();

    // Không được để trống
    if (!tenkichthuoc) {
        return {
            error: "Tên kích thước không được để trống"
        };
    }

    /*
        Cho phép:
        38
        39
        40
        38.5

        Không cho phép:
        size 38
        38abc
        -38
    */
    if (!/^\d{1,2}(\.\d)?$/.test(tenkichthuoc)) {
        return {
            error:
                "Kích thước phải là số hợp lệ, ví dụ 38, 39 hoặc 38.5"
        };
    }

    const numericSize = Number(tenkichthuoc);

    if (
        !Number.isFinite(numericSize) ||
        numericSize < 20 ||
        numericSize > 60
    ) {
        return {
            error:
                "Kích thước giày phải nằm trong khoảng từ 20 đến 60"
        };
    }

    if (mota.length > 250) {
        return {
            error: "Mô tả không được vượt quá 250 ký tự"
        };
    }

    /*
        Chuẩn hóa:
        "038" thành "38"
        "38.0" thành "38"
        "38.5" giữ nguyên "38.5"
    */
    tenkichthuoc = String(numericSize);

    return {
        data: {
            tenkichthuoc,
            mota: mota || null
        }
    };
};

// ==========================================
// 1. LẤY DANH SÁCH KÍCH THƯỚC
// API công khai
// ==========================================
const getAllSizes = async (req, res) => {
    try {
        const sizes = await sizeModel.getAllSizes();

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách kích thước thành công",
            data: sizes.map(normalizeSizeResponse)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách kích thước:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách kích thước"
        });
    }
};

// ==========================================
// 2. ADMIN: LẤY CHI TIẾT SIZE THEO ID
// ==========================================
const getSizeById = async (req, res) => {
    try {
        const sizeId = Number(req.params.id);

        if (
            !Number.isInteger(sizeId) ||
            sizeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã kích thước không hợp lệ"
            });
        }

        const size = await sizeModel.getSizeById(sizeId);

        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy kích thước"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết kích thước thành công",
            data: normalizeSizeResponse(size)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy kích thước theo ID:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy chi tiết kích thước"
        });
    }
};

// ==========================================
// 3. ADMIN: THÊM KÍCH THƯỚC
// ==========================================
const createSize = async (req, res) => {
    try {
        const validation = validateSizeData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const sizeData = validation.data;

        const existingSize = await sizeModel.findByName(
            sizeData.tenkichthuoc
        );

        if (existingSize) {
            return res.status(409).json({
                success: false,
                message: `Size ${sizeData.tenkichthuoc} đã tồn tại`
            });
        }

        const sizeId = await sizeModel.createSize(sizeData);

        const createdSize = await sizeModel.getSizeById(
            sizeId
        );

        return res.status(201).json({
            success: true,
            message: "Thêm kích thước thành công",
            data: normalizeSizeResponse(createdSize)
        });
    } catch (error) {
        console.error("Lỗi thêm kích thước:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Kích thước này đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể thêm kích thước"
        });
    }
};

// ==========================================
// 4. ADMIN: CẬP NHẬT KÍCH THƯỚC
// ==========================================
const updateSize = async (req, res) => {
    try {
        const sizeId = Number(req.params.id);

        if (
            !Number.isInteger(sizeId) ||
            sizeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã kích thước không hợp lệ"
            });
        }

        const currentSize = await sizeModel.getSizeById(
            sizeId
        );

        if (!currentSize) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy kích thước"
            });
        }

        const validation = validateSizeData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const sizeData = validation.data;

        const duplicateSize = await sizeModel.findByName(
            sizeData.tenkichthuoc,
            sizeId
        );

        if (duplicateSize) {
            return res.status(409).json({
                success: false,
                message: `Size ${sizeData.tenkichthuoc} đã tồn tại`
            });
        }

        await sizeModel.updateSize(sizeId, sizeData);

        const updatedSize = await sizeModel.getSizeById(
            sizeId
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật kích thước thành công",
            data: normalizeSizeResponse(updatedSize)
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật kích thước:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Kích thước này đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật kích thước"
        });
    }
};

// ==========================================
// 5. ADMIN: XÓA KÍCH THƯỚC
// ==========================================
const deleteSize = async (req, res) => {
    try {
        const sizeId = Number(req.params.id);

        if (
            !Number.isInteger(sizeId) ||
            sizeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã kích thước không hợp lệ"
            });
        }

        const currentSize = await sizeModel.getSizeById(
            sizeId
        );

        if (!currentSize) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy kích thước"
            });
        }

        /*
            Không cho xóa size nếu đã được dùng trong
            bảng bienthesanpham.
        */
        const variantsCount =
            await sizeModel.countVariantsUsingSize(sizeId);

        if (variantsCount > 0) {
            return res.status(409).json({
                success: false,
                message:
                    `Không thể xóa size ${currentSize.tenkichthuoc} vì đang được sử dụng trong ${variantsCount} biến thể sản phẩm`
            });
        }

        const affectedRows = await sizeModel.deleteSize(
            sizeId
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy kích thước để xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Đã xóa size ${currentSize.tenkichthuoc} thành công`
        });
    } catch (error) {
        console.error("Lỗi xóa kích thước:", error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message:
                    "Kích thước đang được sản phẩm sử dụng nên không thể xóa"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể xóa kích thước"
        });
    }
};

module.exports = {
    getAllSizes,
    getSizeById,
    createSize,
    updateSize,
    deleteSize
};