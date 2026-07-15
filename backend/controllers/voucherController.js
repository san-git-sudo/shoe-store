const Voucher = require("../models/voucherModel");

// ==========================================
// HÀM CHUYỂN KIỂU DỮ LIỆU SỐ
// ==========================================
const normalizeVoucherResponse = (voucher) => {
    if (!voucher) return null;

    return {
        ...voucher,
        mavoucher: Number(voucher.mavoucher),
        giatrigiam: Number(voucher.giatrigiam),
        giantoida:
            voucher.giantoida === null
                ? null
                : Number(voucher.giantoida),
        dontoithieu:
            voucher.dontoithieu === null
                ? 0
                : Number(voucher.dontoithieu),
        apdungtoanbo: Number(voucher.apdungtoanbo)
    };
};

// ==========================================
// HÀM KIỂM TRA VÀ CHUẨN HÓA BODY
// Dùng chung cho thêm và sửa
// ==========================================
const validateVoucherData = (body) => {
    let {
        magiamgia,
        mota,
        loaikhuyenmai,
        giatrigiam,
        giantoida,
        dontoithieu,
        apdungtoanbo,
        masanpham,
        madanhmuc,
        mahang,
        ngaybatdau,
        ngayketthuc,
        trangthai
    } = body;

    // Chuẩn hóa mã voucher
    magiamgia = String(magiamgia || "")
        .trim()
        .toUpperCase();

    mota = String(mota || "").trim();

    loaikhuyenmai = String(loaikhuyenmai || "").trim();

    trangthai = String(trangthai || "hoạt động").trim();

    giatrigiam = Number(giatrigiam);
    dontoithieu = Number(dontoithieu || 0);
    apdungtoanbo = Number(apdungtoanbo);

    // Nếu không có giá trị thì đưa về null
    giantoida =
        giantoida === "" ||
            giantoida === undefined ||
            giantoida === null
            ? null
            : Number(giantoida);

    masanpham =
        masanpham === "" ||
            masanpham === undefined ||
            masanpham === null
            ? null
            : Number(masanpham);

    madanhmuc =
        madanhmuc === "" ||
            madanhmuc === undefined ||
            madanhmuc === null
            ? null
            : Number(madanhmuc);

    mahang =
        mahang === "" ||
            mahang === undefined ||
            mahang === null
            ? null
            : Number(mahang);

    // ==========================================
    // KIỂM TRA MÃ GIẢM GIÁ
    // ==========================================
    if (!magiamgia) {
        return {
            error: "Mã giảm giá không được để trống"
        };
    }

    if (magiamgia.length < 3 || magiamgia.length > 30) {
        return {
            error: "Mã giảm giá phải có từ 3 đến 30 ký tự"
        };
    }

    if (!/^[A-Z0-9-]+$/.test(magiamgia)) {
        return {
            error:
                "Mã giảm giá chỉ được chứa chữ, số và dấu gạch ngang"
        };
    }

    // ==========================================
    // KIỂM TRA LOẠI KHUYẾN MÃI
    // ==========================================
    if (!["percent", "fixed"].includes(loaikhuyenmai)) {
        return {
            error:
                "Loại khuyến mãi chỉ được là percent hoặc fixed"
        };
    }

    // ==========================================
    // KIỂM TRA GIÁ TRỊ GIẢM
    // ==========================================
    if (!Number.isFinite(giatrigiam) || giatrigiam <= 0) {
        return {
            error: "Giá trị giảm phải lớn hơn 0"
        };
    }

    if (
        loaikhuyenmai === "percent" &&
        giatrigiam > 100
    ) {
        return {
            error:
                "Voucher phần trăm không được giảm quá 100%"
        };
    }

    // Voucher fixed không cần giảm tối đa
    if (loaikhuyenmai === "fixed") {
        giantoida = null;
    }

    if (
        loaikhuyenmai === "percent" &&
        (giantoida === null ||
            !Number.isFinite(giantoida) ||
            giantoida <= 0)
    ) {
        return {
            error:
                "Voucher phần trăm phải có số tiền giảm tối đa lớn hơn 0"
        };
    }

    // ==========================================
    // KIỂM TRA ĐƠN TỐI THIỂU
    // ==========================================
    if (
        !Number.isFinite(dontoithieu) ||
        dontoithieu < 0
    ) {
        return {
            error:
                "Giá trị đơn tối thiểu không được là số âm"
        };
    }

    // ==========================================
    // KIỂM TRA NGÀY
    // ==========================================
    const startDate = new Date(ngaybatdau);
    const endDate = new Date(ngayketthuc);

    if (
        !ngaybatdau ||
        Number.isNaN(startDate.getTime())
    ) {
        return {
            error: "Ngày bắt đầu không hợp lệ"
        };
    }

    if (
        !ngayketthuc ||
        Number.isNaN(endDate.getTime())
    ) {
        return {
            error: "Ngày kết thúc không hợp lệ"
        };
    }

    if (endDate <= startDate) {
        return {
            error:
                "Ngày kết thúc phải sau ngày bắt đầu"
        };
    }

    // ==========================================
    // KIỂM TRA TRẠNG THÁI
    // ==========================================
    if (
        !["hoạt động", "hết hạn", "vô hiệu"].includes(
            trangthai
        )
    ) {
        return {
            error: "Trạng thái voucher không hợp lệ"
        };
    }

    // ==========================================
    // KIỂM TRA PHẠM VI ÁP DỤNG
    // ==========================================
    if (![0, 1].includes(apdungtoanbo)) {
        return {
            error:
                "Giá trị áp dụng toàn bộ chỉ được là 0 hoặc 1"
        };
    }

    const selectedScopes = [
        masanpham,
        madanhmuc,
        mahang
    ].filter(
        (value) =>
            value !== null &&
            Number.isInteger(value) &&
            value > 0
    );

    // Áp dụng toàn bộ thì xóa các phạm vi riêng
    if (apdungtoanbo === 1) {
        masanpham = null;
        madanhmuc = null;
        mahang = null;
    } else {
        // Không áp dụng toàn bộ thì phải chọn đúng một phạm vi
        if (selectedScopes.length !== 1) {
            return {
                error:
                    "Voucher phải áp dụng cho đúng một sản phẩm, danh mục hoặc hãng"
            };
        }
    }

    return {
        data: {
            magiamgia,
            mota: mota || null,
            loaikhuyenmai,
            giatrigiam,
            giantoida,
            dontoithieu,
            apdungtoanbo,
            masanpham,
            madanhmuc,
            mahang,
            ngaybatdau,
            ngayketthuc,
            trangthai
        }
    };
};

// ==========================================
// 1. KHÁCH HÀNG: LẤY VOUCHER CÒN HIỆU LỰC
// ==========================================
const getVouchers = async (req, res) => {
    try {
        const results = await Voucher.getAllVoucher();

        const vouchers = results.map(
            normalizeVoucherResponse
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách voucher thành công",
            data: vouchers
        });
    } catch (error) {
        console.error(
            "Lỗi lấy voucher khách hàng:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách voucher"
        });
    }
};

// ==========================================
// 2. ADMIN: LẤY TOÀN BỘ VOUCHER
// ==========================================
const getAdminVouchers = async (req, res) => {
    try {
        const results =
            await Voucher.getAllVoucherAdmin();

        const vouchers = results.map(
            normalizeVoucherResponse
        );

        return res.status(200).json({
            success: true,
            message:
                "Lấy danh sách voucher quản trị thành công",
            data: vouchers
        });
    } catch (error) {
        console.error(
            "Lỗi lấy voucher admin:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách voucher quản trị"
        });
    }
};

// ==========================================
// 3. ADMIN: LẤY VOUCHER THEO ID
// ==========================================
const getAdminVoucherById = async (req, res) => {
    try {
        const voucherId = Number(req.params.id);

        if (
            !Number.isInteger(voucherId) ||
            voucherId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã voucher không hợp lệ"
            });
        }

        const voucher =
            await Voucher.getVoucherById(voucherId);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy voucher"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Lấy chi tiết voucher thành công",
            data: normalizeVoucherResponse(voucher)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy voucher theo ID:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy chi tiết voucher"
        });
    }
};

// ==========================================
// 4. ADMIN: THÊM VOUCHER
// ==========================================
const createVoucher = async (req, res) => {
    try {
        const validation =
            validateVoucherData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const voucherData = validation.data;

        const existedVoucher =
            await Voucher.findByCode(
                voucherData.magiamgia
            );

        if (existedVoucher) {
            return res.status(409).json({
                success: false,
                message: "Mã giảm giá đã tồn tại"
            });
        }

        const voucherId =
            await Voucher.createVoucher(voucherData);

        const createdVoucher =
            await Voucher.getVoucherById(voucherId);

        return res.status(201).json({
            success: true,
            message: "Thêm voucher thành công",
            data: normalizeVoucherResponse(
                createdVoucher
            )
        });
    } catch (error) {
        console.error("Lỗi thêm voucher:", error);

        // Trường hợp database có UNIQUE cho magiamgia
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Mã giảm giá đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể thêm voucher"
        });
    }
};

// ==========================================
// 5. ADMIN: CẬP NHẬT VOUCHER
// ==========================================
const updateVoucher = async (req, res) => {
    try {
        const voucherId = Number(req.params.id);

        if (
            !Number.isInteger(voucherId) ||
            voucherId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã voucher không hợp lệ"
            });
        }

        const currentVoucher =
            await Voucher.getVoucherById(voucherId);

        if (!currentVoucher) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy voucher"
            });
        }

        const validation =
            validateVoucherData(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const voucherData = validation.data;

        const existedVoucher =
            await Voucher.findByCode(
                voucherData.magiamgia,
                voucherId
            );

        if (existedVoucher) {
            return res.status(409).json({
                success: false,
                message:
                    "Mã giảm giá đã được voucher khác sử dụng"
            });
        }

        await Voucher.updateVoucher(
            voucherId,
            voucherData
        );

        const updatedVoucher =
            await Voucher.getVoucherById(voucherId);

        return res.status(200).json({
            success: true,
            message: "Cập nhật voucher thành công",
            data: normalizeVoucherResponse(
                updatedVoucher
            )
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật voucher:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Mã giảm giá đã tồn tại"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật voucher"
        });
    }
};

// ==========================================
// 6. ADMIN: XÓA VOUCHER
// ==========================================
const deleteVoucher = async (req, res) => {
    try {
        const voucherId = Number(req.params.id);

        if (
            !Number.isInteger(voucherId) ||
            voucherId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Mã voucher không hợp lệ"
            });
        }

        const currentVoucher =
            await Voucher.getVoucherById(voucherId);

        if (!currentVoucher) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy voucher"
            });
        }

        const affectedRows =
            await Voucher.deleteVoucher(voucherId);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy voucher để xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa voucher thành công"
        });
    } catch (error) {
        console.error("Lỗi xóa voucher:", error);

        if (
            error.code ===
            "ER_ROW_IS_REFERENCED_2"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Voucher đã được sử dụng nên không thể xóa. Hãy chuyển sang trạng thái vô hiệu."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể xóa voucher"
        });
    }
};

module.exports = {
    getVouchers,
    getAdminVouchers,
    getAdminVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher
};