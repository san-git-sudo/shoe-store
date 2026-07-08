const db = require("../config/db");

const getAllVoucher = async () => {

    const sql = `
        SELECT
            mavoucher,
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
            ngayketthuc
        FROM voucher
        WHERE trangthai = 1
        AND CURDATE() BETWEEN ngaybatdau AND ngayketthuc
        ORDER BY giatrigiam DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

module.exports = {
    getAllVoucher
};