const db = require("../config/db");

// ==========================================
// 1. PUBLIC: LẤY DANH SÁCH DANH MỤC
// Dùng cho Navbar, bộ lọc và form sản phẩm
// ==========================================
const getAllCategories = async () => {
    const sql = `
        SELECT
            madanhmuc,
            tendanhmuc,
            gioitinh,
            ngaytao
        FROM danhmuc
        ORDER BY tendanhmuc ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ==========================================
// 2. ADMIN: LẤY DANH SÁCH KÈM SỐ SẢN PHẨM
// ==========================================
const getAllCategoriesAdmin = async () => {
    const sql = `
        SELECT
            dm.madanhmuc,
            dm.tendanhmuc,
            dm.gioitinh,
            dm.ngaytao,
            COUNT(sp.masanpham) AS sosanpham
        FROM danhmuc dm
        LEFT JOIN sanpham sp
            ON dm.madanhmuc = sp.madanhmuc
        GROUP BY
            dm.madanhmuc,
            dm.tendanhmuc,
            dm.gioitinh,
            dm.ngaytao
        ORDER BY dm.madanhmuc DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ==========================================
// 3. LẤY CHI TIẾT DANH MỤC THEO ID
// ==========================================
const getCategoryById = async (categoryId) => {
    const sql = `
        SELECT
            dm.madanhmuc,
            dm.tendanhmuc,
            dm.gioitinh,
            dm.ngaytao,
            COUNT(sp.masanpham) AS sosanpham
        FROM danhmuc dm
        LEFT JOIN sanpham sp
            ON dm.madanhmuc = sp.madanhmuc
        WHERE dm.madanhmuc = ?
        GROUP BY
            dm.madanhmuc,
            dm.tendanhmuc,
            dm.gioitinh,
            dm.ngaytao
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [categoryId]);

    return rows[0] || null;
};

// ==========================================
// 4. KIỂM TRA TÊN DANH MỤC ĐÃ TỒN TẠI
// excludeId dùng khi sửa để bỏ qua chính dòng hiện tại
// ==========================================
const findByName = async (
    categoryName,
    excludeId = null
) => {
    let sql = `
        SELECT
            madanhmuc,
            tendanhmuc,
            gioitinh
        FROM danhmuc
        WHERE LOWER(TRIM(tendanhmuc)) =
              LOWER(TRIM(?))
    `;

    const params = [categoryName];

    if (excludeId !== null) {
        sql += ` AND madanhmuc <> ?`;
        params.push(excludeId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);

    return rows[0] || null;
};

// ==========================================
// 5. THÊM DANH MỤC
// ==========================================
const createCategory = async (categoryData) => {
    const {
        tendanhmuc,
        gioitinh
    } = categoryData;

    const sql = `
        INSERT INTO danhmuc (
            tendanhmuc,
            gioitinh
        )
        VALUES (?, ?)
    `;

    const [result] = await db.query(sql, [
        tendanhmuc,
        gioitinh
    ]);

    return result.insertId;
};

// ==========================================
// 6. CẬP NHẬT DANH MỤC
// ==========================================
const updateCategory = async (
    categoryId,
    categoryData
) => {
    const {
        tendanhmuc,
        gioitinh
    } = categoryData;

    const sql = `
        UPDATE danhmuc
        SET
            tendanhmuc = ?,
            gioitinh = ?
        WHERE madanhmuc = ?
    `;

    const [result] = await db.query(sql, [
        tendanhmuc,
        gioitinh,
        categoryId
    ]);

    return result.affectedRows;
};

// ==========================================
// 7. ĐẾM SẢN PHẨM ĐANG DÙNG DANH MỤC
// ==========================================
const countProductsUsingCategory = async (
    categoryId
) => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM sanpham
        WHERE madanhmuc = ?
    `;

    const [rows] = await db.query(sql, [categoryId]);

    return Number(rows[0]?.total || 0);
};

// ==========================================
// 8. XÓA DANH MỤC
// ==========================================
const deleteCategory = async (categoryId) => {
    const sql = `
        DELETE FROM danhmuc
        WHERE madanhmuc = ?
    `;

    const [result] = await db.query(sql, [
        categoryId
    ]);

    return result.affectedRows;
};

module.exports = {
    getAllCategories,
    getAllCategoriesAdmin,
    getCategoryById,
    findByName,
    createCategory,
    updateCategory,
    countProductsUsingCategory,
    deleteCategory
};