const db = require("../config/db");

// ==========================================
// 1. LẤY VOUCHER HỢP LỆ CHO KHÁCH HÀNG
// ==========================================
const getAllVoucher = async () => {
    const sql = `
        SELECT
            v.mavoucher,
            v.magiamgia,
            v.mota,
            v.loaikhuyenmai,
            v.giatrigiam,
            v.giantoida,
            v.dontoithieu,
            v.apdungtoanbo,
            v.masanpham,
            v.madanhmuc,
            v.mahang,
            v.ngaybatdau,
            v.ngayketthuc,
            v.trangthai
        FROM voucher v
        WHERE v.trangthai = 'hoạt động'
          AND NOW() BETWEEN v.ngaybatdau AND v.ngayketthuc
        ORDER BY v.giatrigiam DESC
    `;

    const [rows] = await db.query(sql);
    return rows;
};

// ==========================================
// 2. ADMIN: LẤY TOÀN BỘ VOUCHER
// ==========================================
const getAllVoucherAdmin = async () => {
    const sql = `
        SELECT
            v.mavoucher,
            v.magiamgia,
            v.mota,
            v.loaikhuyenmai,
            v.giatrigiam,
            v.giantoida,
            v.dontoithieu,
            v.apdungtoanbo,

            v.masanpham,
            sp.tensanpham,

            v.madanhmuc,
            dm.tendanhmuc,

            v.mahang,
            h.tenhang,

            v.ngaybatdau,
            v.ngayketthuc,
            v.trangthai,
            v.ngaytao
        FROM voucher v
        LEFT JOIN sanpham sp
            ON v.masanpham = sp.masanpham
        LEFT JOIN danhmuc dm
            ON v.madanhmuc = dm.madanhmuc
        LEFT JOIN hang h
            ON v.mahang = h.mahang
        ORDER BY v.mavoucher DESC
    `;

    const [rows] = await db.query(sql);
    return rows;
};

// ==========================================
// 3. ADMIN: LẤY CHI TIẾT VOUCHER THEO ID
// ==========================================
const getVoucherById = async (voucherId) => {
    const sql = `
        SELECT
            v.mavoucher,
            v.magiamgia,
            v.mota,
            v.loaikhuyenmai,
            v.giatrigiam,
            v.giantoida,
            v.dontoithieu,
            v.apdungtoanbo,

            v.masanpham,
            sp.tensanpham,

            v.madanhmuc,
            dm.tendanhmuc,

            v.mahang,
            h.tenhang,

            v.ngaybatdau,
            v.ngayketthuc,
            v.trangthai,
            v.ngaytao
        FROM voucher v
        LEFT JOIN sanpham sp
            ON v.masanpham = sp.masanpham
        LEFT JOIN danhmuc dm
            ON v.madanhmuc = dm.madanhmuc
        LEFT JOIN hang h
            ON v.mahang = h.mahang
        WHERE v.mavoucher = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [voucherId]);
    return rows[0] || null;
};

// ==========================================
// 4. KIỂM TRA MÃ VOUCHER ĐÃ TỒN TẠI
// excludeId dùng khi sửa để bỏ qua chính voucher hiện tại
// ==========================================
const findByCode = async (code, excludeId = null) => {
    let sql = `
        SELECT mavoucher, magiamgia
        FROM voucher
        WHERE UPPER(magiamgia) = UPPER(?)
    `;

    const params = [code];

    if (excludeId !== null) {
        sql += ` AND mavoucher <> ?`;
        params.push(excludeId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);
    return rows[0] || null;
};

// ==========================================
// 5. THÊM VOUCHER
// ==========================================
const createVoucher = async (voucherData) => {
    const {
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
    } = voucherData;

    const sql = `
        INSERT INTO voucher (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
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
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
};

// ==========================================
// 6. CẬP NHẬT VOUCHER
// ==========================================
const updateVoucher = async (voucherId, voucherData) => {
    const {
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
    } = voucherData;

    const sql = `
        UPDATE voucher
        SET
            magiamgia = ?,
            mota = ?,
            loaikhuyenmai = ?,
            giatrigiam = ?,
            giantoida = ?,
            dontoithieu = ?,
            apdungtoanbo = ?,
            masanpham = ?,
            madanhmuc = ?,
            mahang = ?,
            ngaybatdau = ?,
            ngayketthuc = ?,
            trangthai = ?
        WHERE mavoucher = ?
    `;

    const values = [
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
        trangthai,
        voucherId
    ];

    const [result] = await db.query(sql, values);
    return result.affectedRows;
};

// ==========================================
// 7. XÓA VOUCHER
// ==========================================
const deleteVoucher = async (voucherId) => {
    const sql = `
        DELETE FROM voucher
        WHERE mavoucher = ?
    `;

    const [result] = await db.query(sql, [voucherId]);
    return result.affectedRows;
};

module.exports = {
    getAllVoucher,
    getAllVoucherAdmin,
    getVoucherById,
    findByCode,
    createVoucher,
    updateVoucher,
    deleteVoucher
};