const db = require("../config/db");

const Order = {};
// ======================================================
// CHUẨN HÓA LIMIT CHO CÁC KHỐI DASHBOARD
//
// Không cho truy vấn số lượng bản ghi quá lớn.
// Mặc định 5, tối đa 20.
// ======================================================
const normalizeLimit = (
    value,
    defaultValue = 5,
    maxValue = 20
) => {
    const parsedValue = Number(value);

    if (
        !Number.isInteger(parsedValue) ||
        parsedValue <= 0
    ) {
        return defaultValue;
    }

    return Math.min(parsedValue, maxValue);
};

// ======================================================
// 1. ADMIN: LẤY DANH SÁCH ĐƠN HÀNG
//
// Có thể lọc bằng:
// - status
// - payment
// - customerId
//
// Ví dụ:
// GET /api/orders/admin/list?status=đã giao
// GET /api/orders/admin/list?payment=1
// ======================================================
Order.getAdminOrders = async (filters = {}) => {
    const {
        status,
        payment,
        customerId
    } = filters;

    let sql = `
        SELECT
            dh.madonhang,
            dh.manguoidung,
            dh.mavoucher,
            dh.tennguoinhan,
            dh.sodienthoai,
            dh.diachigiao,
            dh.donvivanchuyen,
            dh.ngaydukiengiao,
            dh.hinhthucthanhtoan,
            dh.dathanhtoan,
            dh.ngaythanhtoan,
            dh.tongtien,
            dh.phivanchuyen,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.ghichu,
            dh.lydo_huy,
            dh.ngaytao,
            dh.ngaycapnhat,

            nd.hoten AS tenkhachhang,
            nd.email AS emailkhachhang,

            v.magiamgia,

            COUNT(ct.machitietdonhang) AS sodongchitiet,
            COALESCE(SUM(ct.soluong), 0) AS tongsoluongsanpham

        FROM donhang dh

        LEFT JOIN nguoidung nd
            ON dh.manguoidung = nd.manguoidung

        LEFT JOIN voucher v
            ON dh.mavoucher = v.mavoucher

        LEFT JOIN chitietdonhang ct
            ON dh.madonhang = ct.madonhang

        WHERE 1 = 1
    `;

    const params = [];

    // Lọc theo trạng thái đơn hàng
    if (status) {
        sql += ` AND dh.trangthai = ?`;
        params.push(status);
    }

    // Lọc theo trạng thái thanh toán
    if (
        payment !== undefined &&
        payment !== null &&
        payment !== ""
    ) {
        sql += ` AND dh.dathanhtoan = ?`;
        params.push(Number(payment));
    }

    // Lọc theo khách hàng
    if (customerId) {
        sql += ` AND dh.manguoidung = ?`;
        params.push(Number(customerId));
    }

    sql += `
        GROUP BY
            dh.madonhang,
            dh.manguoidung,
            dh.mavoucher,
            dh.tennguoinhan,
            dh.sodienthoai,
            dh.diachigiao,
            dh.donvivanchuyen,
            dh.ngaydukiengiao,
            dh.hinhthucthanhtoan,
            dh.dathanhtoan,
            dh.ngaythanhtoan,
            dh.tongtien,
            dh.phivanchuyen,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.ghichu,
            dh.lydo_huy,
            dh.ngaytao,
            dh.ngaycapnhat,
            nd.hoten,
            nd.email,
            v.magiamgia

        ORDER BY dh.madonhang DESC
    `;

    const [rows] = await db.query(sql, params);

    return rows;
};

// ======================================================
// 2. ADMIN: LẤY THÔNG TIN CHUNG CỦA MỘT ĐƠN HÀNG
// ======================================================
Order.getOrderById = async (orderId) => {
    const sql = `
        SELECT
            dh.madonhang,
            dh.app_trans_id,
            dh.zalopay_trans_id,
            dh.manguoidung,
            dh.mavoucher,
            dh.tennguoinhan,
            dh.sodienthoai,
            dh.diachigiao,
            dh.donvivanchuyen,
            dh.ngaydukiengiao,
            dh.hinhthucthanhtoan,
            dh.dathanhtoan,
            dh.ngaythanhtoan,
            dh.tongtien,
            dh.phivanchuyen,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.ghichu,
            dh.lydo_huy,
            dh.ngaytao,
            dh.ngaycapnhat,

            nd.hoten AS tenkhachhang,
            nd.email AS emailkhachhang,

            v.magiamgia,
            v.loaikhuyenmai AS loaivoucher,
            v.giatrigiam AS giatrivoucher

        FROM donhang dh

        LEFT JOIN nguoidung nd
            ON dh.manguoidung = nd.manguoidung

        LEFT JOIN voucher v
            ON dh.mavoucher = v.mavoucher

        WHERE dh.madonhang = ?

        LIMIT 1
    `;

    const [rows] = await db.query(sql, [orderId]);

    return rows[0] || null;
};

// ======================================================
// 3. ADMIN: LẤY DANH SÁCH SẢN PHẨM CỦA ĐƠN HÀNG
//
// Ưu tiên dữ liệu snapshot:
// - tensanpham
// - kichthuoc
// - mausac
//
// Nếu snapshot NULL thì lấy dữ liệu hiện tại từ sản phẩm.
// ======================================================
Order.getOrderItems = async (orderId) => {
    const sql = `
        SELECT
            ct.machitietdonhang,
            ct.madonhang,
            ct.mabienthe,

            COALESCE(
                ct.tensanpham,
                sp.tensanpham
            ) AS tensanpham,

            COALESCE(
                ct.kichthuoc,
                kt.tenkichthuoc
            ) AS kichthuoc,

            COALESCE(
                ct.mausac,
                ms.tenmausac
            ) AS mausac,

            ct.soluong,
            ct.giagoc,
            ct.loaikhuyenmai,
            ct.giakhuyenmai,
            ct.giasaukhuyenmai,
            ct.ghichu,

            sp.anhdaidien,

            (
                ct.giasaukhuyenmai * ct.soluong
            ) AS thanhtien

        FROM chitietdonhang ct

        LEFT JOIN bienthesanpham bt
            ON ct.mabienthe = bt.mabienthe

        LEFT JOIN sanpham sp
            ON bt.masanpham = sp.masanpham

        LEFT JOIN kichthuoc kt
            ON bt.makichthuoc = kt.makichthuoc

        LEFT JOIN mausac ms
            ON bt.mamausac = ms.mamausac

        WHERE ct.madonhang = ?

        ORDER BY ct.machitietdonhang ASC
    `;

    const [rows] = await db.query(sql, [orderId]);

    return rows;
};

// ======================================================
// 4. ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
//
// Có thể cập nhật:
// - trạng thái
// - lý do hủy
// - đơn vị vận chuyển
// - ngày dự kiến giao
// ======================================================
Order.updateOrderStatus = async (
    orderId,
    orderData
) => {
    const {
        trangthai,
        lydo_huy = null,
        donvivanchuyen = null,
        ngaydukiengiao = null
    } = orderData;

    const sql = `
        UPDATE donhang
        SET
            trangthai = ?,
            lydo_huy = ?,
            donvivanchuyen = ?,
            ngaydukiengiao = ?,
            ngaycapnhat = CURRENT_TIMESTAMP
        WHERE madonhang = ?
    `;

    const [result] = await db.query(sql, [
        trangthai,
        lydo_huy,
        donvivanchuyen,
        ngaydukiengiao,
        orderId
    ]);

    return result.affectedRows;
};

// ======================================================
// 5. ADMIN: CẬP NHẬT TRẠNG THÁI THANH TOÁN
//
// dathanhtoan:
// 0 = chưa thanh toán
// 1 = đã thanh toán
//
// Khi chuyển thành 1:
// - lưu ngaythanhtoan
//
// Khi chuyển thành 0:
// - xóa ngaythanhtoan
// ======================================================
Order.updatePaymentStatus = async (
    orderId,
    paymentStatus
) => {
    const sql = `
        UPDATE donhang
        SET
            dathanhtoan = ?,

            ngaythanhtoan =
                CASE
                    WHEN ? = 1
                    THEN COALESCE(
                        ngaythanhtoan,
                        CURRENT_TIMESTAMP
                    )
                    ELSE NULL
                END,

            ngaycapnhat = CURRENT_TIMESTAMP

        WHERE madonhang = ?
    `;

    const [result] = await db.query(sql, [
        paymentStatus,
        paymentStatus,
        orderId
    ]);

    return result.affectedRows;
};

// ======================================================
// 6. DASHBOARD: THỐNG KÊ TỔNG QUAN
//
// Doanh thu chỉ tính đơn đã giao.
// ======================================================
Order.getDashboardSummary = async () => {
    const sql = `
        SELECT
            (
                SELECT COALESCE(
                    SUM(tongthanhtoan),
                    0
                )
                FROM donhang
                WHERE trangthai = 'đã giao'
            ) AS doanhthu,

            (
                SELECT COUNT(*)
                FROM donhang
            ) AS tongdonhang,

            (
                SELECT COUNT(*)
                FROM sanpham
            ) AS tongsanpham,

            (
                SELECT COUNT(*)
                FROM nguoidung
                WHERE vaitro = 'client'
            ) AS tongkhachhang,

            (
                SELECT COUNT(*)
                FROM donhang
                WHERE trangthai = 'chờ xác nhận'
            ) AS donchoxacnhan,

            (
                SELECT COUNT(*)
                FROM donhang
                WHERE trangthai = 'đã hủy'
            ) AS donhuy
    `;

    const [rows] = await db.query(sql);

    return rows[0] || null;
};

// ======================================================
// 7. DASHBOARD: LẤY ĐƠN HÀNG GẦN ĐÂY
// ======================================================
Order.getRecentOrders = async (limit = 5) => {
    const safeLimit = normalizeLimit(limit, 5, 20);

    const sql = `
        SELECT
            dh.madonhang,
            dh.tennguoinhan,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.ngaytao,

            nd.hoten AS tenkhachhang,

            (
                SELECT GROUP_CONCAT(
                    DISTINCT COALESCE(
                        ct.tensanpham,
                        sp.tensanpham
                    )
                    ORDER BY ct.machitietdonhang ASC
                    SEPARATOR ', '
                )

                FROM chitietdonhang ct

                LEFT JOIN bienthesanpham bt
                    ON ct.mabienthe = bt.mabienthe

                LEFT JOIN sanpham sp
                    ON bt.masanpham = sp.masanpham

                WHERE ct.madonhang = dh.madonhang
            ) AS sanpham

        FROM donhang dh

        LEFT JOIN nguoidung nd
            ON dh.manguoidung = nd.manguoidung

        ORDER BY dh.ngaytao DESC, dh.madonhang DESC

        LIMIT ?
    `;

    const [rows] = await db.query(sql, [
        safeLimit
    ]);

    return rows;
};

// ======================================================
// 8. DASHBOARD: SẢN PHẨM BÁN CHẠY
//
// Chỉ tính sản phẩm thuộc đơn đã giao.
// ======================================================
Order.getBestSellingProducts = async (
    limit = 5
) => {
    const safeLimit = normalizeLimit(limit, 5, 20);

    const sql = `
        SELECT
            bt.masanpham,

            COALESCE(
                ct.tensanpham,
                sp.tensanpham
            ) AS tensanpham,

            sp.anhdaidien,

            SUM(ct.soluong) AS soluongban,

            SUM(
                ct.giasaukhuyenmai * ct.soluong
            ) AS doanhthusanpham

        FROM chitietdonhang ct

        INNER JOIN donhang dh
            ON ct.madonhang = dh.madonhang

        LEFT JOIN bienthesanpham bt
            ON ct.mabienthe = bt.mabienthe

        LEFT JOIN sanpham sp
            ON bt.masanpham = sp.masanpham

        WHERE dh.trangthai = 'đã giao'

        GROUP BY
            bt.masanpham,
            COALESCE(
                ct.tensanpham,
                sp.tensanpham
            ),
            sp.anhdaidien

        ORDER BY
            soluongban DESC,
            doanhthusanpham DESC

        LIMIT ?
    `;

    const [rows] = await db.query(sql, [
        safeLimit
    ]);

    return rows;
};

// ======================================================
// 9. DASHBOARD: SẢN PHẨM SẮP HẾT HÀNG
//
// Tổng tồn của toàn bộ biến thể <= ngưỡng.
// Mặc định ngưỡng = 15.
// ======================================================
Order.getLowStockProducts = async (
    threshold = 15,
    limit = 5
) => {
    const parsedThreshold = Number(threshold);

    const safeThreshold =
        Number.isInteger(parsedThreshold) &&
            parsedThreshold >= 0
            ? Math.min(parsedThreshold, 10000)
            : 15;

    const safeLimit = normalizeLimit(limit, 5, 20);

    const sql = `
        SELECT
            sp.masanpham,
            sp.tensanpham,
            sp.anhdaidien,

            COALESCE(
                SUM(bt.soluongton),
                0
            ) AS tongtonkho

        FROM sanpham sp

        LEFT JOIN bienthesanpham bt
            ON sp.masanpham = bt.masanpham
            AND bt.trangthaihoatdongbtsp = 'hoạt động'

        GROUP BY
            sp.masanpham,
            sp.tensanpham,
            sp.anhdaidien

        HAVING tongtonkho <= ?

        ORDER BY
            tongtonkho ASC,
            sp.masanpham DESC

        LIMIT ?
    `;

    const [rows] = await db.query(sql, [
        safeThreshold,
        safeLimit
    ]);

    return rows;
};

// ======================================================
// 10. DOANH THU: THỐNG KÊ THEO THÁNG
// ======================================================
Order.getMonthlyRevenue = async (year) => {
    const sql = `
        SELECT
            MONTH(ngaytao) AS thang,

            COUNT(*) AS sodondagiao,

            COALESCE(
                SUM(tongthanhtoan),
                0
            ) AS doanhthu

        FROM donhang

        WHERE trangthai = 'đã giao'
          AND YEAR(ngaytao) = ?

        GROUP BY MONTH(ngaytao)

        ORDER BY thang ASC
    `;

    const [rows] = await db.query(sql, [year]);

    return rows;
};

// ======================================================
// 11. DOANH THU: TỔNG QUAN THEO NĂM
// ======================================================
Order.getRevenueSummaryByYear = async (year) => {
    const sql = `
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN trangthai = 'đã giao'
                        THEN tongthanhtoan
                        ELSE 0
                    END
                ),
                0
            ) AS tongdoanhthu,

            SUM(
                CASE
                    WHEN trangthai = 'đã giao'
                    THEN 1
                    ELSE 0
                END
            ) AS sodondagiao,

            SUM(
                CASE
                    WHEN trangthai = 'đã hủy'
                    THEN 1
                    ELSE 0
                END
            ) AS sodondahuy,

            COUNT(*) AS tongdontrongnam

        FROM donhang

        WHERE YEAR(ngaytao) = ?
    `;

    const [rows] = await db.query(sql, [year]);

    return rows[0] || null;
};

// ======================================================
// 12. LẤY CÁC NĂM CÓ DỮ LIỆU ĐƠN HÀNG
// Dùng cho dropdown năm ở trang Doanh thu.
// ======================================================
Order.getAvailableRevenueYears = async () => {
    const sql = `
        SELECT DISTINCT
            YEAR(ngaytao) AS nam

        FROM donhang

        WHERE ngaytao IS NOT NULL

        ORDER BY nam DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};
// ======================================================
// KHÁCH HÀNG: LẤY LỊCH SỬ ĐƠN HÀNG
// ======================================================
Order.getMyOrders = async (customerId) => {
    const sql = `
        SELECT
            dh.madonhang,
            dh.tennguoinhan,
            dh.tongtien,
            dh.phivanchuyen,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.dathanhtoan,
            dh.ngaytao,
            dh.ngaycapnhat,

            COUNT(ct.machitietdonhang)
                AS sodongchitiet,

            COALESCE(
                SUM(ct.soluong),
                0
            ) AS tongsoluongsanpham,

            (
                SELECT COALESCE(
                    ct2.tensanpham,
                    sp.tensanpham
                )
                FROM chitietdonhang ct2

                LEFT JOIN bienthesanpham bt
                    ON ct2.mabienthe = bt.mabienthe

                LEFT JOIN sanpham sp
                    ON bt.masanpham = sp.masanpham

                WHERE ct2.madonhang = dh.madonhang

                ORDER BY ct2.machitietdonhang ASC
                LIMIT 1
            ) AS tensanphamdau,

            (
                SELECT sp.anhdaidien
                FROM chitietdonhang ct3

                LEFT JOIN bienthesanpham bt
                    ON ct3.mabienthe = bt.mabienthe

                LEFT JOIN sanpham sp
                    ON bt.masanpham = sp.masanpham

                WHERE ct3.madonhang = dh.madonhang

                ORDER BY ct3.machitietdonhang ASC
                LIMIT 1
            ) AS anhdaidien

        FROM donhang dh

        LEFT JOIN chitietdonhang ct
            ON dh.madonhang = ct.madonhang

        WHERE dh.manguoidung = ?

        GROUP BY
            dh.madonhang,
            dh.tennguoinhan,
            dh.tongtien,
            dh.phivanchuyen,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.dathanhtoan,
            dh.ngaytao,
            dh.ngaycapnhat

        ORDER BY
            dh.ngaytao DESC,
            dh.madonhang DESC
    `;

    const [rows] = await db.query(sql, [
        customerId
    ]);

    return rows;
};
// ======================================================
// KHÁCH HÀNG: LẤY THÔNG TIN ĐƠN THUỘC TÀI KHOẢN
// ======================================================
Order.getMyOrderById = async (
    orderId,
    customerId
) => {
    const sql = `
        SELECT
            dh.madonhang,
            dh.mavoucher,
            dh.tennguoinhan,
            dh.sodienthoai,
            dh.diachigiao,
            dh.donvivanchuyen,
            dh.ngaydukiengiao,
            dh.hinhthucthanhtoan,
            dh.dathanhtoan,
            dh.ngaythanhtoan,
            dh.tongtien,
            dh.phivanchuyen,
            dh.tongthanhtoan,
            dh.trangthai,
            dh.ghichu,
            dh.lydo_huy,
            dh.ngaytao,
            dh.ngaycapnhat,
            v.magiamgia

        FROM donhang dh

        LEFT JOIN voucher v
            ON dh.mavoucher = v.mavoucher

        WHERE dh.madonhang = ?
          AND dh.manguoidung = ?

        LIMIT 1
    `;

    const [rows] = await db.query(sql, [
        orderId,
        customerId
    ]);

    return rows[0] || null;
};
// ======================================================
// TẠO LỖI NGHIỆP VỤ CHO CHECKOUT
// Controller sẽ sử dụng statusCode để trả response phù hợp.
// ======================================================
const createCheckoutError = (
    message,
    statusCode = 400
) => {
    const error = new Error(message);

    error.statusCode = statusCode;

    return error;
};

// ======================================================
// KHÁCH HÀNG: TẠO ĐƠN HÀNG COD
//
// Toàn bộ quá trình chạy trong transaction:
//
// 1. Kiểm tra tài khoản.
// 2. Khóa biến thể bằng FOR UPDATE.
// 3. Kiểm tra tồn kho.
// 4. Kiểm tra voucher.
// 5. Tạo đơn.
// 6. Tạo chi tiết đơn.
// 7. Trừ tồn kho.
// ======================================================
const createCheckoutOrder = async ({
    customerId,
    tennguoinhan,
    sodienthoai,
    diachigiao,
    ghichu = null,
    mavoucher = null,
    items,
    paymentMethod
}) => {
    const allowedPaymentMethods = [
        "COD",
        "ZaloPay"
    ];

    if (
        !allowedPaymentMethods.includes(
            paymentMethod
        )
    ) {
        throw createCheckoutError(
            "Phương thức thanh toán không hợp lệ"
        );
    }
    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        // ==================================================
        // 1. KIỂM TRA TÀI KHOẢN KHÁCH HÀNG
        // ==================================================
        const [userRows] =
            await connection.query(
                `
                SELECT
                    manguoidung,
                    vaitro,
                    trangthai
                FROM nguoidung
                WHERE manguoidung = ?
                LIMIT 1
                FOR UPDATE
                `,
                [customerId]
            );

        const user = userRows[0];

        if (!user) {
            throw createCheckoutError(
                "Không tìm thấy tài khoản người dùng",
                404
            );
        }

        if (user.vaitro !== "client") {
            throw createCheckoutError(
                "Tài khoản không hợp lệ để đặt hàng",
                403
            );
        }

        if (user.trangthai !== "hoạt động") {
            throw createCheckoutError(
                "Tài khoản hiện không hoạt động",
                403
            );
        }

        // ==================================================
        // 2. LẤY VÀ KHÓA TOÀN BỘ BIẾN THỂ
        // ==================================================
        const variantIds = items.map(
            (item) => item.mabienthe
        );

        const placeholders = variantIds
            .map(() => "?")
            .join(", ");

        const [variantRows] =
            await connection.query(
                `
                SELECT
                    bt.mabienthe,
                    bt.masanpham,
                    bt.soluongton,
                    bt.giaban,
                    bt.trangthaihoatdongbtsp,

                    sp.tensanpham,
                    sp.madanhmuc,
                    sp.mahang,

                    kt.tenkichthuoc,
                    ms.tenmausac

                FROM bienthesanpham bt

                INNER JOIN sanpham sp
                    ON bt.masanpham = sp.masanpham

                LEFT JOIN kichthuoc kt
                    ON bt.makichthuoc =
                       kt.makichthuoc

                LEFT JOIN mausac ms
                    ON bt.mamausac =
                       ms.mamausac

                WHERE bt.mabienthe IN (
                    ${placeholders}
                )

                FOR UPDATE
                `,
                variantIds
            );

        if (
            variantRows.length !==
            variantIds.length
        ) {
            throw createCheckoutError(
                "Có sản phẩm trong giỏ hàng không còn tồn tại",
                404
            );
        }

        const variantMap = new Map(
            variantRows.map((variant) => [
                Number(variant.mabienthe),
                variant
            ])
        );

        // ==================================================
        // 3. KIỂM TRA TỪNG SẢN PHẨM VÀ TÍNH TẠM TÍNH
        // ==================================================
        let subtotal = 0;

        const orderItems = items.map(
            (item) => {
                const variant =
                    variantMap.get(
                        item.mabienthe
                    );

                if (!variant) {
                    throw createCheckoutError(
                        `Không tìm thấy biến thể ${item.mabienthe}`,
                        404
                    );
                }

                if (
                    variant.trangthaihoatdongbtsp !==
                    "hoạt động"
                ) {
                    throw createCheckoutError(
                        `Sản phẩm "${variant.tensanpham}" hiện không còn bán`,
                        409
                    );
                }

                const stock = Number(
                    variant.soluongton || 0
                );

                if (item.soluong > stock) {
                    throw createCheckoutError(
                        `Sản phẩm "${variant.tensanpham}" chỉ còn ${stock} sản phẩm trong kho`,
                        409
                    );
                }

                const originalPrice = Number(
                    variant.giaban || 0
                );

                if (
                    !Number.isFinite(
                        originalPrice
                    ) ||
                    originalPrice < 0
                ) {
                    throw createCheckoutError(
                        `Giá của sản phẩm "${variant.tensanpham}" không hợp lệ`,
                        409
                    );
                }

                const lineTotal =
                    originalPrice *
                    item.soluong;

                subtotal += lineTotal;

                return {
                    mabienthe:
                        Number(
                            variant.mabienthe
                        ),

                    masanpham:
                        Number(
                            variant.masanpham
                        ),

                    madanhmuc:
                        variant.madanhmuc !==
                            null
                            ? Number(
                                variant.madanhmuc
                            )
                            : null,

                    mahang:
                        variant.mahang !== null
                            ? Number(
                                variant.mahang
                            )
                            : null,

                    tensanpham:
                        variant.tensanpham,

                    kichthuoc:
                        variant.tenkichthuoc ||
                        null,

                    mausac:
                        variant.tenmausac ||
                        null,

                    soluong:
                        item.soluong,

                    giagoc:
                        originalPrice,

                    giakhuyenmai: 0,

                    giasaukhuyenmai:
                        originalPrice,

                    thanhtien:
                        lineTotal
                };
            }
        );

        if (subtotal <= 0) {
            throw createCheckoutError(
                "Tổng tiền đơn hàng không hợp lệ"
            );
        }

        // ==================================================
        // 4. KIỂM TRA VOUCHER VÀ TÍNH GIẢM GIÁ
        // ==================================================
        let validVoucherId = null;
        let discount = 0;

        if (mavoucher !== null) {
            const [voucherRows] =
                await connection.query(
                    `
                    SELECT
                        mavoucher,
                        magiamgia,
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

                    FROM voucher

                    WHERE mavoucher = ?

                    LIMIT 1
                    FOR UPDATE
                    `,
                    [mavoucher]
                );

            const voucher =
                voucherRows[0];

            if (!voucher) {
                throw createCheckoutError(
                    "Voucher không tồn tại",
                    404
                );
            }

            if (
                voucher.trangthai !==
                "hoạt động"
            ) {
                throw createCheckoutError(
                    "Voucher hiện không hoạt động",
                    409
                );
            }

            const now = new Date();

            if (
                voucher.ngaybatdau &&
                new Date(
                    voucher.ngaybatdau
                ) > now
            ) {
                throw createCheckoutError(
                    "Voucher chưa đến thời gian sử dụng",
                    409
                );
            }

            if (
                voucher.ngayketthuc &&
                new Date(
                    voucher.ngayketthuc
                ) < now
            ) {
                throw createCheckoutError(
                    "Voucher đã hết hạn",
                    409
                );
            }

            const minimumOrder = Number(
                voucher.dontoithieu || 0
            );

            if (subtotal < minimumOrder) {
                throw createCheckoutError(
                    `Đơn hàng phải đạt tối thiểu ${minimumOrder.toLocaleString(
                        "vi-VN"
                    )}đ để sử dụng voucher`,
                    409
                );
            }

            /*
                Tính tổng tiền đủ điều kiện giảm:

                - apdungtoanbo = 1:
                  áp dụng toàn bộ đơn.

                - Nếu không:
                  áp dụng cho sản phẩm, danh mục
                  hoặc hãng được cấu hình.
            */
            let eligibleSubtotal = 0;

            if (
                Number(
                    voucher.apdungtoanbo
                ) === 1
            ) {
                eligibleSubtotal = subtotal;
            } else {
                eligibleSubtotal =
                    orderItems.reduce(
                        (sum, item) => {
                            const matchesProduct =
                                voucher.masanpham !==
                                null &&
                                Number(
                                    voucher.masanpham
                                ) ===
                                item.masanpham;

                            const matchesCategory =
                                voucher.madanhmuc !==
                                null &&
                                Number(
                                    voucher.madanhmuc
                                ) ===
                                item.madanhmuc;

                            const matchesBrand =
                                voucher.mahang !==
                                null &&
                                Number(
                                    voucher.mahang
                                ) ===
                                item.mahang;

                            return (
                                matchesProduct ||
                                    matchesCategory ||
                                    matchesBrand
                                    ? sum +
                                    item.thanhtien
                                    : sum
                            );
                        },
                        0
                    );
            }

            if (eligibleSubtotal <= 0) {
                throw createCheckoutError(
                    "Voucher không áp dụng cho các sản phẩm trong đơn hàng",
                    409
                );
            }

            const discountValue = Number(
                voucher.giatrigiam || 0
            );

            if (
                voucher.loaikhuyenmai ===
                "percent"
            ) {
                discount =
                    (eligibleSubtotal *
                        discountValue) /
                    100;

                const maximumDiscount =
                    Number(
                        voucher.giantoida ||
                        0
                    );

                if (
                    maximumDiscount > 0 &&
                    discount >
                    maximumDiscount
                ) {
                    discount =
                        maximumDiscount;
                }
            } else if (
                voucher.loaikhuyenmai ===
                "fixed"
            ) {
                discount =
                    discountValue;
            } else {
                throw createCheckoutError(
                    "Loại voucher không hợp lệ",
                    409
                );
            }

            discount = Math.min(
                discount,
                eligibleSubtotal,
                subtotal
            );

            validVoucherId = Number(
                voucher.mavoucher
            );
        }

        const shippingFee = 0;

        const totalPayment = Math.max(
            subtotal -
            discount +
            shippingFee,
            0
        );

        // ==================================================
        // 5. TẠO ĐƠN HÀNG COD
        // ==================================================
        const [orderResult] =
            await connection.query(
                `
                INSERT INTO donhang
                (
                    manguoidung,
                    mavoucher,
                    tennguoinhan,
                    sodienthoai,
                    diachigiao,
                    hinhthucthanhtoan,
                    dathanhtoan,
                    ngaythanhtoan,
                    tongtien,
                    phivanchuyen,
                    tongthanhtoan,
                    trangthai,
                    ghichu
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    0,
                    NULL,
                    ?,
                    ?,
                    ?,
                    'chờ xác nhận',
                    ?
                )
                `,
                [
                    customerId,
                    validVoucherId,
                    tennguoinhan,
                    sodienthoai,
                    diachigiao,
                    paymentMethod,
                    subtotal,
                    shippingFee,
                    totalPayment,
                    ghichu
                ]
            );

        const orderId =
            orderResult.insertId;

        // ==================================================
        // 6. TẠO CHI TIẾT VÀ TRỪ TỒN KHO
        // ==================================================
        for (const item of orderItems) {
            await connection.query(
                `
                INSERT INTO chitietdonhang
                (
                    madonhang,
                    mabienthe,
                    tensanpham,
                    kichthuoc,
                    mausac,
                    soluong,
                    giagoc,
                    loaikhuyenmai,
                    giakhuyenmai,
                    giasaukhuyenmai,
                    ghichu
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    NULL,
                    0,
                    ?,
                    NULL
                )
                `,
                [
                    orderId,
                    item.mabienthe,
                    item.tensanpham,
                    item.kichthuoc,
                    item.mausac,
                    item.soluong,
                    item.giagoc,
                    item.giasaukhuyenmai
                ]
            );

            const [stockResult] =
                await connection.query(
                    `
                    UPDATE bienthesanpham
                    SET soluongton =
                        soluongton - ?
                    WHERE mabienthe = ?
                      AND trangthaihoatdongbtsp = 'hoạt động'
                      AND soluongton >= ?
                    `,
                    [
                        item.soluong,
                        item.mabienthe,
                        item.soluong
                    ]
                );

            /*
                Dù đã SELECT FOR UPDATE,
                vẫn kiểm tra affectedRows để an toàn.
            */
            if (
                stockResult.affectedRows !==
                1
            ) {
                throw createCheckoutError(
                    `Sản phẩm "${item.tensanpham}" không đủ tồn kho`,
                    409
                );
            }
        }

        await connection.commit();

        return {
            madonhang: orderId,
            manguoidung: customerId,
            mavoucher: validVoucherId,

            hinhthucthanhtoan:
                paymentMethod,

            dathanhtoan: 0,

            tongtien: subtotal,
            giamgia: discount,
            phivanchuyen: shippingFee,
            tongthanhtoan: totalPayment,

            trangthai: "chờ xác nhận",

            /*
                Dùng để tạo trường item gửi ZaloPay.
                Đây là dữ liệu đã lấy và kiểm tra từ database.
            */
            items: orderItems.map((item) => ({
                mabienthe: item.mabienthe,
                tensanpham: item.tensanpham,
                soluong: item.soluong,
                giagoc: item.giagoc,
                giasaukhuyenmai:
                    item.giasaukhuyenmai
            }))
        };
    } catch (error) {
        await connection.rollback();

        throw error;
    } finally {
        connection.release();
    }
};
// ======================================================
// CHECKOUT COD
// ======================================================
Order.checkoutCOD = async (orderData) => {
    return createCheckoutOrder({
        ...orderData,
        paymentMethod: "COD"
    });
};

// ======================================================
// CHECKOUT ZALOPAY
// ======================================================
Order.checkoutZaloPay = async (
    orderData
) => {
    return createCheckoutOrder({
        ...orderData,
        paymentMethod: "ZaloPay"
    });
};
// ======================================================
// LƯU MÃ GIAO DỊCH ZALOPAY VÀO ĐƠN HÀNG
// ======================================================
Order.updateZaloPayAppTransId = async (
    orderId,
    appTransId
) => {
    const sql = `
        UPDATE donhang
        SET
            app_trans_id = ?,
            ngaycapnhat =
                CURRENT_TIMESTAMP
        WHERE madonhang = ?
          AND hinhthucthanhtoan =
              'ZaloPay'
          AND dathanhtoan = 0
    `;

    const [result] = await db.query(
        sql,
        [
            appTransId,
            orderId
        ]
    );

    return result.affectedRows;
};
// ======================================================
// TÌM ĐƠN HÀNG THEO APP_TRANS_ID
// Dùng cho callback và query trạng thái.
// ======================================================
Order.getOrderByAppTransId = async (
    appTransId
) => {
    const sql = `
        SELECT
            madonhang,
            app_trans_id,
            zalopay_trans_id,
            manguoidung,
            hinhthucthanhtoan,
            dathanhtoan,
            ngaythanhtoan,
            tongthanhtoan,
            trangthai
        FROM donhang
        WHERE app_trans_id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(
        sql,
        [appTransId]
    );

    return rows[0] || null;
};
// ======================================================
// XÁC NHẬN THANH TOÁN ZALOPAY
//
// Callback có thể được gửi lại nhiều lần.
// Hàm này xử lý theo hướng idempotent.
// ======================================================
Order.confirmZaloPayPayment = async ({
    appTransId,
    zaloPayTransId
}) => {
    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] =
            await connection.query(
                `
                SELECT
                    madonhang,
                    dathanhtoan,
                    trangthai
                FROM donhang
                WHERE app_trans_id = ?
                  AND hinhthucthanhtoan =
                      'ZaloPay'
                LIMIT 1
                FOR UPDATE
                `,
                [appTransId]
            );

        const order = rows[0];

        if (!order) {
            throw createCheckoutError(
                "Không tìm thấy đơn hàng ZaloPay",
                404
            );
        }

        /*
            Callback đã được xử lý trước đó.
            Không cập nhật hoặc trừ kho thêm lần nữa.
        */
        if (
            Number(order.dathanhtoan) === 1
        ) {
            await connection.commit();

            return {
                madonhang:
                    Number(order.madonhang),

                alreadyPaid: true
            };
        }

        await connection.query(
            `
            UPDATE donhang
            SET
                zalopay_trans_id = ?,
                dathanhtoan = 1,
                ngaythanhtoan =
                    CURRENT_TIMESTAMP,
                ngaycapnhat =
                    CURRENT_TIMESTAMP
            WHERE madonhang = ?
            `,
            [
                zaloPayTransId || null,
                order.madonhang
            ]
        );

        await connection.commit();

        return {
            madonhang:
                Number(order.madonhang),

            alreadyPaid: false
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
// ======================================================
// HỦY ĐƠN ZALOPAY CHƯA THANH TOÁN VÀ HOÀN TỒN KHO
//
// Dùng khi:
// - Đã tạo đơn trong database
// - Nhưng ZaloPay không tạo được giao dịch
//
// Chỉ xử lý đơn:
// - ZaloPay
// - chưa thanh toán
// - chờ xác nhận
// ======================================================
Order.cancelFailedZaloPayOrder = async (
    orderId,
    reason = "Không thể khởi tạo thanh toán ZaloPay"
) => {
    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        const [orderRows] =
            await connection.query(
                `
                SELECT
                    madonhang,
                    hinhthucthanhtoan,
                    dathanhtoan,
                    trangthai
                FROM donhang
                WHERE madonhang = ?
                LIMIT 1
                FOR UPDATE
                `,
                [orderId]
            );

        const order = orderRows[0];

        if (!order) {
            await connection.commit();

            return {
                affected: false,
                message:
                    "Không tìm thấy đơn hàng"
            };
        }

        if (
            order.hinhthucthanhtoan !==
            "ZaloPay" ||
            Number(order.dathanhtoan) !== 0 ||
            order.trangthai !==
            "chờ xác nhận"
        ) {
            await connection.commit();

            return {
                affected: false,
                message:
                    "Đơn hàng không đủ điều kiện hoàn tác"
            };
        }

        const [itemRows] =
            await connection.query(
                `
                SELECT
                    mabienthe,
                    soluong
                FROM chitietdonhang
                WHERE madonhang = ?
                FOR UPDATE
                `,
                [orderId]
            );

        // Hoàn lại tồn kho
        for (const item of itemRows) {
            await connection.query(
                `
                UPDATE bienthesanpham
                SET soluongton =
                    soluongton + ?
                WHERE mabienthe = ?
                `,
                [
                    Number(item.soluong),
                    Number(item.mabienthe)
                ]
            );
        }

        await connection.query(
            `
            UPDATE donhang
            SET
                trangthai = 'đã hủy',
                lydo_huy = ?,
                ngaycapnhat =
                    CURRENT_TIMESTAMP
            WHERE madonhang = ?
            `,
            [
                String(reason).slice(0, 500),
                orderId
            ]
        );

        await connection.commit();

        return {
            affected: true,
            message:
                "Đã hủy đơn và hoàn tồn kho"
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
module.exports = Order;