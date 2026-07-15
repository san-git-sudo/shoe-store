const db = require("../config/db");

// ==========================================
// 1. LẤY TOÀN BỘ MÀU SẮC
// Dùng cho khách hàng, bộ lọc và dropdown
// ==========================================
const getAllColors = async () => {
    const sql = `
        SELECT
            mamausac,
            tenmausac,
            mota,
            hexcode,
            ngaytao
        FROM mausac
        ORDER BY tenmausac ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ==========================================
// 2. LẤY MÀU THEO ID
// ==========================================
const getColorById = async (colorId) => {
    const sql = `
        SELECT
            mamausac,
            tenmausac,
            mota,
            hexcode,
            ngaytao
        FROM mausac
        WHERE mamausac = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [colorId]);

    return rows[0] || null;
};

// ==========================================
// 3. KIỂM TRA TÊN MÀU ĐÃ TỒN TẠI
// excludeId dùng khi sửa để bỏ qua chính màu hiện tại
// ==========================================
const findByName = async (colorName, excludeId = null) => {
    let sql = `
        SELECT
            mamausac,
            tenmausac
        FROM mausac
        WHERE LOWER(TRIM(tenmausac)) = LOWER(TRIM(?))
    `;

    const params = [colorName];

    if (excludeId !== null) {
        sql += ` AND mamausac <> ?`;
        params.push(excludeId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);

    return rows[0] || null;
};

// ==========================================
// 4. KIỂM TRA MÃ HEX ĐÃ TỒN TẠI
// ==========================================
const findByHexCode = async (hexCode, excludeId = null) => {
    let sql = `
        SELECT
            mamausac,
            tenmausac,
            hexcode
        FROM mausac
        WHERE UPPER(TRIM(hexcode)) = UPPER(TRIM(?))
    `;

    const params = [hexCode];

    if (excludeId !== null) {
        sql += ` AND mamausac <> ?`;
        params.push(excludeId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);

    return rows[0] || null;
};

// ==========================================
// 5. THÊM MÀU SẮC
// ==========================================
const createColor = async (colorData) => {
    const {
        tenmausac,
        mota,
        hexcode
    } = colorData;

    const sql = `
        INSERT INTO mausac (
            tenmausac,
            mota,
            hexcode
        )
        VALUES (?, ?, ?)
    `;

    const [result] = await db.query(sql, [
        tenmausac,
        mota,
        hexcode
    ]);

    return result.insertId;
};

// ==========================================
// 6. CẬP NHẬT MÀU SẮC
// ==========================================
const updateColor = async (colorId, colorData) => {
    const {
        tenmausac,
        mota,
        hexcode
    } = colorData;

    const sql = `
        UPDATE mausac
        SET
            tenmausac = ?,
            mota = ?,
            hexcode = ?
        WHERE mamausac = ?
    `;

    const [result] = await db.query(sql, [
        tenmausac,
        mota,
        hexcode,
        colorId
    ]);

    return result.affectedRows;
};

// ==========================================
// 7. KIỂM TRA MÀU CÓ ĐANG ĐƯỢC BIẾN THỂ DÙNG
// ==========================================
const countVariantsUsingColor = async (colorId) => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM bienthesanpham
        WHERE mamausac = ?
    `;

    const [rows] = await db.query(sql, [colorId]);

    return Number(rows[0]?.total || 0);
};

// ==========================================
// 8. XÓA MÀU SẮC
// ==========================================
const deleteColor = async (colorId) => {
    const sql = `
        DELETE FROM mausac
        WHERE mamausac = ?
    `;

    const [result] = await db.query(sql, [colorId]);

    return result.affectedRows;
};

module.exports = {
    getAllColors,
    getColorById,
    findByName,
    findByHexCode,
    createColor,
    updateColor,
    countVariantsUsingColor,
    deleteColor
};