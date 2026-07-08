const db = require("../config/db");

// ======================
// Lấy danh sách sản phẩm
// ======================
const getAllProducts = async () => {

    const sql = `
        SELECT
            sp.masanpham,
            sp.tensanpham,
            sp.anhdaidien,
            MIN(btsp.giaban) AS giaban
        FROM sanpham sp
        INNER JOIN bienthesanpham btsp
            ON sp.masanpham = btsp.masanpham
        GROUP BY
            sp.masanpham,
            sp.tensanpham,
            sp.anhdaidien
        ORDER BY sp.ngaytao DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

// ======================
// Lấy chi tiết sản phẩm
// ======================
const getProductById = async (id) => {

    const sql = `
        SELECT
            sp.masanpham,
            sp.tensanpham,
            sp.mota,
            sp.chatlieu,
            sp.kieudang,
            sp.baoquan,
            sp.anhdaidien,

            btsp.mabienthe,
            btsp.giaban,
            btsp.soluongton,

            kt.makichthuoc,
            kt.tenkichthuoc,

            ms.mamausac,
            ms.tenmausac,
            ms.hexcode,

            ha.urlhinhanh,
            ha.stt

        FROM sanpham sp

        INNER JOIN bienthesanpham btsp
            ON sp.masanpham = btsp.masanpham

        INNER JOIN kichthuoc kt
            ON btsp.makichthuoc = kt.makichthuoc

        INNER JOIN mausac ms
            ON btsp.mamausac = ms.mamausac

        LEFT JOIN hinhanh ha
            ON btsp.mabienthe = ha.mabienthe

        WHERE sp.masanpham = ?

        ORDER BY
            btsp.mabienthe,
            ha.stt;
    `;

    const [rows] = await db.query(sql, [id]);

    return rows;
};

module.exports = {
    getAllProducts,
    getProductById
};