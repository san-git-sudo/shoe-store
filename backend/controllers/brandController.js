const Brand = require("../models/brandModel");

// ==========================================
// CHUẨN HÓA RESPONSE
// ==========================================
const normalizeBrandResponse = (brand) => {
    if (!brand) return null;

    return {
        ...brand,

        mahang: Number(brand.mahang),

        ...(brand.sosanpham !== undefined
            ? {
                sosanpham: Number(
                    brand.sosanpham || 0
                )
            }
            : {})
    };
};

// ==========================================
// KIỂM TRA VÀ CHUẨN HÓA BODY
// Dùng chung cho thêm và sửa
// ==========================================
const validateBrandData = (body) => {
    let {
        tenhang,
        mota,
        trangthai
    } = body;

    tenhang = String(tenhang || "")
        .trim()
        .replace(/\s+/g, " ");

    mota = String(mota || "").trim();

    trangthai = String(
        trangthai || "hoạt động"
    ).trim();

    // ==========================================
    // KIỂM TRA TÊN HÃNG
    // ==========================================
    if (!tenhang) {
        return {
            error: "Tên hãng không được để trống"
        };
    }

    if (
        tenhang.length < 2 ||
        tenhang.length > 100
    ) {
        return {
            error:
                "Tên hãng phải có từ 2 đến 100 ký tự"
        };
    }

    /*
        Cho phép:
        Nike
        New Balance
        H&M
        Li-Ning
        Dr. Martens
    */
    if (
        !/^[\p{L}\p{N}\s&.'/-]+$/u.test(
            tenhang
        )
    ) {
        return {
            error:
                "Tên hãng chỉ được chứa chữ, số, khoảng trắng và các ký tự &, ., ', /, -"
        };
    }

    // ==========================================
    // KIỂM TRA MÔ TẢ
    // ==========================================
    if (mota.length > 250) {
        return {
            error:
                "Mô tả không được vượt quá 250 ký tự"
        };
    }

    // ==========================================
    // KIỂM TRA TRẠNG THÁI
    // ==========================================
    if (
        !["hoạt động", "vô hiệu"].includes(
            trangthai
        )
    ) {
        return {
            error:
                "Trạng thái hãng chỉ được là hoạt động hoặc vô hiệu"
        };
    }

    return {
        data: {
            tenhang,
            mota: mota || null,
            trangthai
        }
    };
};

// ==========================================
// 1. PUBLIC: LẤY HÃNG ĐANG HOẠT ĐỘNG
// ==========================================
const getBrands = async (req, res) => {
    try {
        const results =
            await Brand.getAllBrands();

        return res.status(200).json({
            success: true,
            message:
                "Lấy danh sách hãng thành công",
            data: results.map(
                normalizeBrandResponse
            )
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách hãng:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách hãng"
        });
    }
};

// ==========================================
// 2. ADMIN: LẤY TOÀN BỘ HÃNG
// ==========================================
const getAdminBrands = async (req, res) => {
    try {
        const results =
            await Brand.getAllBrandsAdmin();

        return res.status(200).json({
            success: true,
            message:
                "Lấy danh sách hãng quản trị thành công",
            data: results.map(
                normalizeBrandResponse
            )
        });
    } catch (error) {
        console.error(
            "Lỗi lấy hãng admin:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách hãng quản trị"
        });
    }
};

// ==========================================
// 3. ADMIN: LẤY HÃNG THEO ID
// ==========================================
const getBrandById = async (req, res) => {
    try {
        const brandId = Number(req.params.id);

        if (
            !Number.isInteger(brandId) ||
            brandId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã hãng không hợp lệ"
            });
        }

        const brand =
            await Brand.getBrandById(brandId);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hãng"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Lấy chi tiết hãng thành công",
            data: normalizeBrandResponse(brand)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy hãng theo ID:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy chi tiết hãng"
        });
    }
};

// ==========================================
// 4. ADMIN: THÊM HÃNG
// ==========================================
const createBrand = async (req, res) => {
    try {
        const validation =
            validateBrandData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const brandData = validation.data;

        const duplicatedBrand =
            await Brand.findByName(
                brandData.tenhang
            );

        if (duplicatedBrand) {
            return res.status(409).json({
                success: false,
                message:
                    `Hãng "${brandData.tenhang}" đã tồn tại`
            });
        }

        const brandId =
            await Brand.createBrand(brandData);

        const createdBrand =
            await Brand.getBrandById(brandId);

        return res.status(201).json({
            success: true,
            message: "Thêm hãng thành công",
            data:
                normalizeBrandResponse(
                    createdBrand
                )
        });
    } catch (error) {
        console.error(
            "Lỗi thêm hãng:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Tên hãng đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể thêm hãng"
        });
    }
};

// ==========================================
// 5. ADMIN: CẬP NHẬT HÃNG
// ==========================================
const updateBrand = async (req, res) => {
    try {
        const brandId = Number(req.params.id);

        if (
            !Number.isInteger(brandId) ||
            brandId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã hãng không hợp lệ"
            });
        }

        const currentBrand =
            await Brand.getBrandById(brandId);

        if (!currentBrand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hãng"
            });
        }

        const validation =
            validateBrandData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const brandData = validation.data;

        const duplicatedBrand =
            await Brand.findByName(
                brandData.tenhang,
                brandId
            );

        if (duplicatedBrand) {
            return res.status(409).json({
                success: false,
                message:
                    `Hãng "${brandData.tenhang}" đã tồn tại`
            });
        }

        await Brand.updateBrand(
            brandId,
            brandData
        );

        const updatedBrand =
            await Brand.getBrandById(brandId);

        return res.status(200).json({
            success: true,
            message:
                "Cập nhật hãng thành công",
            data:
                normalizeBrandResponse(
                    updatedBrand
                )
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật hãng:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Tên hãng đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Không thể cập nhật hãng"
        });
    }
};

// ==========================================
// 6. ADMIN: XÓA HÃNG
// ==========================================
const deleteBrand = async (req, res) => {
    try {
        const brandId = Number(req.params.id);

        if (
            !Number.isInteger(brandId) ||
            brandId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã hãng không hợp lệ"
            });
        }

        const currentBrand =
            await Brand.getBrandById(brandId);

        if (!currentBrand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hãng"
            });
        }

        const productCount =
            await Brand.countProductsUsingBrand(
                brandId
            );

        if (productCount > 0) {
            return res.status(409).json({
                success: false,
                message:
                    `Không thể xóa hãng "${currentBrand.tenhang}" vì đang có ${productCount} sản phẩm sử dụng`
            });
        }

        const affectedRows =
            await Brand.deleteBrand(brandId);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy hãng để xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                `Đã xóa hãng "${currentBrand.tenhang}" thành công`
        });
    } catch (error) {
        console.error(
            "Lỗi xóa hãng:",
            error
        );

        if (
            error.code ===
            "ER_ROW_IS_REFERENCED_2"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Hãng đang được sản phẩm sử dụng nên không thể xóa"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể xóa hãng"
        });
    }
};

module.exports = {
    getBrands,
    getAdminBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};