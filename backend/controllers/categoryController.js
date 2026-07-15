const Category = require("../models/categoryModel");

// ==========================================
// CHUẨN HÓA RESPONSE
// ==========================================
const normalizeCategoryResponse = (category) => {
    if (!category) return null;

    return {
        ...category,

        madanhmuc: Number(
            category.madanhmuc
        ),

        ...(category.sosanpham !== undefined
            ? {
                sosanpham: Number(
                    category.sosanpham || 0
                )
            }
            : {})
    };
};

// ==========================================
// KIỂM TRA VÀ CHUẨN HÓA BODY
// Dùng chung cho thêm và sửa
// ==========================================
const validateCategoryData = (body) => {
    let {
        tendanhmuc,
        gioitinh
    } = body;

    tendanhmuc = String(tendanhmuc || "")
        .trim()
        .replace(/\s+/g, " ");

    gioitinh = String(gioitinh || "").trim();

    // ==========================================
    // KIỂM TRA TÊN DANH MỤC
    // ==========================================
    if (!tendanhmuc) {
        return {
            error:
                "Tên danh mục không được để trống"
        };
    }

    if (
        tendanhmuc.length < 3 ||
        tendanhmuc.length > 100
    ) {
        return {
            error:
                "Tên danh mục phải có từ 3 đến 100 ký tự"
        };
    }

    /*
        Cho phép:
        Giày Chạy Bộ Nam
        Giày Sneaker Nam
        Giày Thể Thao / Lifestyle
        Giày Nam-Nữ
        Giày Thể Thao & Thời Trang
    */
    if (
        !/^[\p{L}\p{N}\s&/-]+$/u.test(
            tendanhmuc
        )
    ) {
        return {
            error:
                "Tên danh mục chỉ được chứa chữ, số, khoảng trắng và các ký tự &, /, -"
        };
    }

    // ==========================================
    // KIỂM TRA GIỚI TÍNH
    // ==========================================
    if (!["Nam", "Nữ"].includes(gioitinh)) {
        return {
            error:
                "Giới tính chỉ được là Nam hoặc Nữ"
        };
    }

    return {
        data: {
            tendanhmuc,
            gioitinh
        }
    };
};

// ==========================================
// 1. PUBLIC: LẤY DANH SÁCH DANH MỤC
// ==========================================
const getCategories = async (req, res) => {
    try {
        const results =
            await Category.getAllCategories();

        return res.status(200).json({
            success: true,
            message:
                "Lấy danh sách danh mục thành công",
            data: results.map(
                normalizeCategoryResponse
            )
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh mục:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách danh mục"
        });
    }
};

// ==========================================
// 2. ADMIN: LẤY TOÀN BỘ DANH MỤC
// Kèm số sản phẩm của từng danh mục
// ==========================================
const getAdminCategories = async (req, res) => {
    try {
        const results =
            await Category.getAllCategoriesAdmin();

        return res.status(200).json({
            success: true,
            message:
                "Lấy danh sách danh mục quản trị thành công",
            data: results.map(
                normalizeCategoryResponse
            )
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh mục admin:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách danh mục quản trị"
        });
    }
};

// ==========================================
// 3. ADMIN: LẤY DANH MỤC THEO ID
// ==========================================
const getCategoryById = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Mã danh mục không hợp lệ"
            });
        }

        const category =
            await Category.getCategoryById(
                categoryId
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy danh mục"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Lấy chi tiết danh mục thành công",
            data:
                normalizeCategoryResponse(category)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh mục theo ID:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy chi tiết danh mục"
        });
    }
};

// ==========================================
// 4. ADMIN: THÊM DANH MỤC
// ==========================================
const createCategory = async (req, res) => {
    try {
        const validation =
            validateCategoryData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const categoryData = validation.data;

        const duplicatedCategory =
            await Category.findByName(
                categoryData.tendanhmuc
            );

        if (duplicatedCategory) {
            return res.status(409).json({
                success: false,
                message:
                    `Danh mục "${categoryData.tendanhmuc}" đã tồn tại`
            });
        }

        const categoryId =
            await Category.createCategory(
                categoryData
            );

        const createdCategory =
            await Category.getCategoryById(
                categoryId
            );

        return res.status(201).json({
            success: true,
            message:
                "Thêm danh mục thành công",
            data:
                normalizeCategoryResponse(
                    createdCategory
                )
        });
    } catch (error) {
        console.error(
            "Lỗi thêm danh mục:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message:
                    "Tên danh mục đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Không thể thêm danh mục"
        });
    }
};

// ==========================================
// 5. ADMIN: CẬP NHẬT DANH MỤC
// ==========================================
const updateCategory = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Mã danh mục không hợp lệ"
            });
        }

        const currentCategory =
            await Category.getCategoryById(
                categoryId
            );

        if (!currentCategory) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy danh mục"
            });
        }

        const validation =
            validateCategoryData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const categoryData = validation.data;

        const duplicatedCategory =
            await Category.findByName(
                categoryData.tendanhmuc,
                categoryId
            );

        if (duplicatedCategory) {
            return res.status(409).json({
                success: false,
                message:
                    `Danh mục "${categoryData.tendanhmuc}" đã tồn tại`
            });
        }

        await Category.updateCategory(
            categoryId,
            categoryData
        );

        const updatedCategory =
            await Category.getCategoryById(
                categoryId
            );

        return res.status(200).json({
            success: true,
            message:
                "Cập nhật danh mục thành công",
            data:
                normalizeCategoryResponse(
                    updatedCategory
                )
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật danh mục:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message:
                    "Tên danh mục đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Không thể cập nhật danh mục"
        });
    }
};

// ==========================================
// 6. ADMIN: XÓA DANH MỤC
// ==========================================
const deleteCategory = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Mã danh mục không hợp lệ"
            });
        }

        const currentCategory =
            await Category.getCategoryById(
                categoryId
            );

        if (!currentCategory) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy danh mục"
            });
        }

        const productCount =
            await Category
                .countProductsUsingCategory(
                    categoryId
                );

        if (productCount > 0) {
            return res.status(409).json({
                success: false,
                message:
                    `Không thể xóa danh mục "${currentCategory.tendanhmuc}" vì đang có ${productCount} sản phẩm sử dụng`
            });
        }

        const affectedRows =
            await Category.deleteCategory(
                categoryId
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy danh mục để xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                `Đã xóa danh mục "${currentCategory.tendanhmuc}" thành công`
        });
    } catch (error) {
        console.error(
            "Lỗi xóa danh mục:",
            error
        );

        if (
            error.code ===
            "ER_ROW_IS_REFERENCED_2"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Danh mục đang được sản phẩm sử dụng nên không thể xóa"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Không thể xóa danh mục"
        });
    }
};

module.exports = {
    getCategories,
    getAdminCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};