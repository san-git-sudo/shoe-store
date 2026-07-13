const db = require("../config/db");

const getAllSizes = async () => {

    const sql = `
        SELECT
            makichthuoc,
            tenkichthuoc
        FROM kichthuoc
        ORDER BY tenkichthuoc ASC
    `;

    const [rows] = await db.query(sql);

    return rows;

};

module.exports = {
    getAllSizes
};