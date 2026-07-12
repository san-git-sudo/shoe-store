const db = require("../config/db");

// ======================================================
// API dùng chung cho toàn bộ website
//
// Trang chủ
// Tìm kiếm
// Theo hãng
// Theo danh mục
// Theo giới tính
// Theo kích thước
// Theo màu sắc
// Theo khoảng giá
// Theo trạng thái còn hàng
//
// Frontend chỉ cần gọi:
//
// GET /api/products
//
// rồi truyền query:
//
// ?q=nike
// &brand=1
// &category=2
// &gender=Nam
// &size=40
// &color=1
// &minPrice=1000000
// &maxPrice=5000000
// &inStock=true
// &sort=price_desc
//
// ======================================================
const getAllProducts = async (filters) => {

    let sql = `
        SELECT
            sp.masanpham,
            sp.tensanpham,
            sp.anhdaidien,
            MIN(btsp.giaban) AS giaban
        FROM sanpham sp

       INNER JOIN bienthesanpham btsp
            ON sp.masanpham = btsp.masanpham
            AND btsp.trangthaihoatdongbtsp = 1

        LEFT JOIN hang h
            ON sp.mahang = h.mahang

        LEFT JOIN danhmuc dm
            ON sp.madanhmuc = dm.madanhmuc

        LEFT JOIN kichthuoc kt
            ON btsp.makichthuoc = kt.makichthuoc

        LEFT JOIN mausac ms
            ON btsp.mamausac = ms.mamausac

        WHERE 1 = 1
    `;

    const params = [];

    // ======================
    // Tìm kiếm thông minh (Smart Search)
    // ======================
    //
    // Ý tưởng:
    // - Người dùng có thể nhập nhiều từ khóa.
    // - Ví dụ:
    //      "nike trắng 42"
    // - Tách thành:
    //      ["nike", "trắng", "42"]
    // - Mỗi từ khóa sẽ tìm trong:
    //      + Tên sản phẩm
    //      + Hãng
    //      + Danh mục
    //      + Kích thước
    //      + Màu sắc
    //
    // Các từ khóa được nối bằng AND.
    // Điều đó có nghĩa:
    //      "nike trắng"
    // chỉ trả về sản phẩm vừa có "nike"
    // VÀ vừa có "trắng"
    //
    // Nếu dùng OR giữa các từ thì kết quả sẽ quá nhiều.
    //

    if (filters.q) {

        // Tách chuỗi theo khoảng trắng
        const keywords = filters.q.trim().split(/\s+/);

        keywords.forEach(keyword => {

            sql += `
            AND (
                sp.tensanpham LIKE ?
                OR h.tenhang LIKE ?
                OR dm.tendanhmuc LIKE ?
                OR kt.tenkichthuoc LIKE ?
                OR ms.tenmausac LIKE ?
            )
        `;

            params.push(
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`
            );

        });

    }

    // ======================
    // Hãng
    // ======================

    if (filters.brand) {

        sql += ` AND sp.mahang = ? `;
        params.push(filters.brand);

    }

    // ======================
    // Danh mục
    // ======================

    if (filters.category) {

        sql += ` AND sp.madanhmuc = ? `;
        params.push(filters.category);

    }

    // ======================
    // Giới tính
    // ======================

    if (filters.gender) {

        sql += ` AND dm.gioitinh = ? `;
        params.push(filters.gender);

    }

    // ======================
    // Size
    // ======================

    if (filters.size) {

        sql += ` AND kt.makichthuoc = ? `;
        params.push(filters.size);

    }

    // ======================
    // Màu
    // ======================

    if (filters.color) {

        sql += ` AND ms.mamausac = ? `;
        params.push(filters.color);

    }

    // ======================
    // Giá nhỏ nhất
    // ======================

    if (filters.minPrice) {

        sql += ` AND btsp.giaban >= ? `;
        params.push(filters.minPrice);

    }

    // ======================
    // Giá lớn nhất
    // ======================

    if (filters.maxPrice) {

        sql += ` AND btsp.giaban <= ? `;
        params.push(filters.maxPrice);

    }

    // ======================
    // Chỉ lấy sản phẩm còn hàng
    // ======================
    //
    // Nếu frontend truyền:
    // inStock=true
    //
    // thì chỉ lấy các biến thể còn tồn kho.
    //

    if (filters.inStock === "true") {

        sql += `
        AND btsp.soluongton > 0
    `;

    }
    // ======================
    // Gom các biến thể thành 1 sản phẩm
    // ======================
    //
    // Một sản phẩm có nhiều:
    // - Size
    // - Màu
    // - Giá
    //
    // Sau khi lọc xong sẽ gộp lại thành
    // đúng 1 sản phẩm.
    //
    // Giá hiển thị là giá thấp nhất.
    //

    sql += `
    GROUP BY
        sp.masanpham,
        sp.tensanpham,
        sp.anhdaidien
`;

    // ======================
    // Sắp xếp
    // ======================
    //
    // price_asc
    // price_desc
    // name
    // oldest
    // newest (default)
    //

    switch (filters.sort) {

        case "price_asc":
            sql += " ORDER BY giaban ASC";
            break;

        case "price_desc":
            sql += " ORDER BY giaban DESC";
            break;

        case "name":
            sql += " ORDER BY sp.tensanpham ASC";
            break;

        case "oldest":
            sql += " ORDER BY sp.ngaytao ASC";
            break;

        default:
            sql += " ORDER BY sp.ngaytao DESC";
            break;

    }
    const [rows] = await db.query(sql, params);

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

    sp.mahang,
    h.tenhang,

    sp.madanhmuc,
    dm.tendanhmuc,

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

LEFT JOIN hang h
ON sp.mahang = h.mahang

LEFT JOIN danhmuc dm
ON sp.madanhmuc = dm.madanhmuc

INNER JOIN bienthesanpham btsp
ON sp.masanpham = btsp.masanpham

INNER JOIN kichthuoc kt
ON btsp.makichthuoc = kt.makichthuoc

INNER JOIN mausac ms
ON btsp.mamausac = ms.mamausac

LEFT JOIN hinhanh ha
ON btsp.mabienthe = ha.mabienthe

WHERE sp.masanpham = ?

ORDER BY btsp.mabienthe,ha.stt;
    `;

    const [rows] = await db.query(sql, [id]);

    return rows;
};

module.exports = {
    getAllProducts,
    getProductById
};