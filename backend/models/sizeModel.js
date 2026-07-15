const db = require("../config/db");

// ==========================================
// 1. LẤY TOÀN BỘ KÍCH THƯỚC
// Dùng cho khách hàng và các dropdown
// ==========================================
const getAllSizes = async () => {
    const sql = `
        SELECT
            makichthuoc,
            tenkichthuoc,
            mota,
            ngaytao
        FROM kichthuoc
        ORDER BY CAST(tenkichthuoc AS DECIMAL(10, 1)) ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ==========================================
// 2. LẤY KÍCH THƯỚC THEO ID
// ==========================================
const getSizeById = async (sizeId) => {
    const sql = `
        SELECT
            makichthuoc,
            tenkichthuoc,
            mota,
            ngaytao
        FROM kichthuoc
        WHERE makichthuoc = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [sizeId]);

    return rows[0] || null;
};

// ==========================================
// 3. KIỂM TRA SIZE ĐÃ TỒN TẠI
// excludeId dùng khi sửa để bỏ qua chính dòng hiện tại
// ==========================================
const findByName = async (sizeName, excludeId = null) => {
    let sql = `
        SELECT
            makichthuoc,
            tenkichthuoc
        FROM kichthuoc
        WHERE TRIM(tenkichthuoc) = TRIM(?)
    `;

    const params = [sizeName];

    if (excludeId !== null) {
        sql += ` AND makichthuoc <> ?`;
        params.push(excludeId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);

    return rows[0] || null;
};

// ==========================================
// 4. THÊM KÍCH THƯỚC
// ==========================================
const createSize = async (sizeData) => {
    const {
        tenkichthuoc,
        mota
    } = sizeData;

    const sql = `
        INSERT INTO kichthuoc (
            tenkichthuoc,
            mota
        )
        VALUES (?, ?)
    `;

    const [result] = await db.query(sql, [
        tenkichthuoc,
        mota
    ]);

    return result.insertId;
};

// ==========================================
// 5. CẬP NHẬT KÍCH THƯỚC
// ==========================================
const updateSize = async (sizeId, sizeData) => {
    const {
        tenkichthuoc,
        mota
    } = sizeData;

    const sql = `
        UPDATE kichthuoc
        SET
            tenkichthuoc = ?,
            mota = ?
        WHERE makichthuoc = ?
    `;

    const [result] = await db.query(sql, [
        tenkichthuoc,
        mota,
        sizeId
    ]);

    return result.affectedRows;
};

// ==========================================
// 6. KIỂM TRA SIZE CÓ ĐANG ĐƯỢC SỬ DỤNG
// ==========================================
const countVariantsUsingSize = async (sizeId) => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM bienthesanpham
        WHERE makichthuoc = ?
    `;

    const [rows] = await db.query(sql, [sizeId]);

    return Number(rows[0]?.total || 0);
};

// ==========================================
// 7. XÓA KÍCH THƯỚC
// ==========================================
const deleteSize = async (sizeId) => {
    const sql = `
        DELETE FROM kichthuoc
        WHERE makichthuoc = ?
    `;

    const [result] = await db.query(sql, [sizeId]);

    return result.affectedRows;
};

module.exports = {
    getAllSizes,
    getSizeById,
    findByName,
    createSize,
    updateSize,
    countVariantsUsingSize,
    deleteSize
};