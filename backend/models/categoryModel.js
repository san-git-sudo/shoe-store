const db = require("../config/db");

const getAllCategories = async () => {

    const sql = `
        SELECT
            madanhmuc,
            tendanhmuc,
            gioitinh
        FROM danhmuc
        ORDER BY tendanhmuc ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

module.exports = {
    getAllCategories
};