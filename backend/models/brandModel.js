const db = require("../config/db");

// ==========================================
// 1. PUBLIC: LẤY HÃNG ĐANG HOẠT ĐỘNG
// Dùng cho khách hàng, bộ lọc và form sản phẩm
// ==========================================
const getAllBrands = async () => {
    const sql = `
        SELECT
            mahang,
            tenhang
        FROM hang
        WHERE trangthai = 'hoạt động'
        ORDER BY tenhang ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ==========================================
// 2. ADMIN: LẤY TOÀN BỘ HÃNG
// Kèm số lượng sản phẩm thuộc từng hãng
// ==========================================
const getAllBrandsAdmin = async () => {
    const sql = `
        SELECT
            h.mahang,
            h.tenhang,
            h.mota,
            h.trangthai,
            h.ngaytao,
            COUNT(sp.masanpham) AS sosanpham
        FROM hang h
        LEFT JOIN sanpham sp
            ON h.mahang = sp.mahang
        GROUP BY
            h.mahang,
            h.tenhang,
            h.mota,
            h.trangthai,
            h.ngaytao
        ORDER BY h.mahang DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ==========================================
// 3. LẤY CHI TIẾT HÃNG THEO ID
// ==========================================
const getBrandById = async (brandId) => {
    const sql = `
        SELECT
            h.mahang,
            h.tenhang,
            h.mota,
            h.trangthai,
            h.ngaytao,
            COUNT(sp.masanpham) AS sosanpham
        FROM hang h
        LEFT JOIN sanpham sp
            ON h.mahang = sp.mahang
        WHERE h.mahang = ?
        GROUP BY
            h.mahang,
            h.tenhang,
            h.mota,
            h.trangthai,
            h.ngaytao
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [brandId]);

    return rows[0] || null;
};

// ==========================================
// 4. KIỂM TRA TÊN HÃNG ĐÃ TỒN TẠI
// excludeId dùng khi sửa để bỏ qua hãng hiện tại
// ==========================================
const findByName = async (
    brandName,
    excludeId = null
) => {
    let sql = `
        SELECT
            mahang,
            tenhang
        FROM hang
        WHERE LOWER(TRIM(tenhang)) =
              LOWER(TRIM(?))
    `;

    const params = [brandName];

    if (excludeId !== null) {
        sql += ` AND mahang <> ?`;
        params.push(excludeId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);

    return rows[0] || null;
};

// ==========================================
// 5. THÊM HÃNG
// ==========================================
const createBrand = async (brandData) => {
    const {
        tenhang,
        mota,
        trangthai
    } = brandData;

    const sql = `
        INSERT INTO hang (
            tenhang,
            mota,
            trangthai
        )
        VALUES (?, ?, ?)
    `;

    const [result] = await db.query(sql, [
        tenhang,
        mota,
        trangthai
    ]);

    return result.insertId;
};

// ==========================================
// 6. CẬP NHẬT HÃNG
// ==========================================
const updateBrand = async (
    brandId,
    brandData
) => {
    const {
        tenhang,
        mota,
        trangthai
    } = brandData;

    const sql = `
        UPDATE hang
        SET
            tenhang = ?,
            mota = ?,
            trangthai = ?
        WHERE mahang = ?
    `;

    const [result] = await db.query(sql, [
        tenhang,
        mota,
        trangthai,
        brandId
    ]);

    return result.affectedRows;
};

// ==========================================
// 7. ĐẾM SẢN PHẨM ĐANG DÙNG HÃNG
// ==========================================
const countProductsUsingBrand = async (
    brandId
) => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM sanpham
        WHERE mahang = ?
    `;

    const [rows] = await db.query(sql, [
        brandId
    ]);

    return Number(rows[0]?.total || 0);
};

// ==========================================
// 8. XÓA HÃNG
// ==========================================
const deleteBrand = async (brandId) => {
    const sql = `
        DELETE FROM hang
        WHERE mahang = ?
    `;

    const [result] = await db.query(sql, [
        brandId
    ]);

    return result.affectedRows;
};

module.exports = {
    getAllBrands,
    getAllBrandsAdmin,
    getBrandById,
    findByName,
    createBrand,
    updateBrand,
    countProductsUsingBrand,
    deleteBrand
};  