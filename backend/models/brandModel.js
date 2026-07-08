const db = require("../config/db");

const getAllBrands = async () => {

    const sql = `
        SELECT
            mahang,
            tenhang
        FROM hang
        WHERE trangthai = 1
        ORDER BY tenhang ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

module.exports = {
    getAllBrands
};