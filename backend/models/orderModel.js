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
            AND bt.trangthaihoatdongbtsp = 1

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

module.exports = Order;