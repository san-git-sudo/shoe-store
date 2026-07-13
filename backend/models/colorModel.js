const db = require("../config/db");

const getAllColors = async () => {

    const sql = `
        SELECT
            mamausac,
            tenmausac,
            hexcode
        FROM mausac
        ORDER BY tenmausac ASC
    `;

    const [rows] = await db.query(sql);

    return rows;

};

module.exports = {
    getAllColors
};