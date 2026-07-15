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
// ======================================================
// THÊM SẢN PHẨM MỚI (Dùng Transaction + Check trùng tên)
// ======================================================
const createProduct = async (productData) => {
    const {
        tensanpham, mota, chatlieu, kieudang, baoquan, anhdaidien, mahang, madanhmuc,
        variants
    } = productData;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Kiểm tra trùng tên sản phẩm trước khi chèn vào DB
        const [existingProduct] = await connection.query(
            "SELECT masanpham FROM sanpham WHERE tensanpham = ? LIMIT 1",
            [tensanpham.trim()]
        );

        if (existingProduct.length > 0) {
            throw new Error("Tên sản phẩm này đã tồn tại trong hệ thống rồi anh ơi!");
        }

        // 2. Thêm vào bảng sanpham
        const sqlProduct = `
            INSERT INTO sanpham (tensanpham, mota, chatlieu, kieudang, baoquan, anhdaidien, mahang, madanhmuc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [productResult] = await connection.query(sqlProduct, [
            tensanpham.trim(), mota, chatlieu, kieudang, baoquan, anhdaidien, mahang, madanhmuc
        ]);
        const masanpham = productResult.insertId;

        // 3. Thêm các biến thể bienthesanpham
        if (variants && variants.length > 0) {
            for (const variant of variants) {
                const sqlVariant = `
                    INSERT INTO bienthesanpham (masanpham, makichthuoc, mamausac, giaban, soluongton, trangthaihoatdongbtsp)
                    VALUES (?, ?, ?, ?, ?, 1)
                `;
                const [variantResult] = await connection.query(sqlVariant, [
                    masanpham, variant.makichthuoc, variant.mamausac, variant.giaban, variant.soluongton
                ]);
                const mabienthe = variantResult.insertId;

                // 4. Thêm hình ảnh của từng biến thể (nếu có)
                if (variant.hinhanh && variant.hinhanh.length > 0) {
                    const sqlImage = `
                        INSERT INTO hinhanh (mabienthe, urlhinhanh, stt)
                        VALUES (?, ?, ?)
                    `;
                    for (let i = 0; i < variant.hinhanh.length; i++) {
                        await connection.query(sqlImage, [mabienthe, variant.hinhanh[i], i + 1]);
                    }
                }
            }
        }

        await connection.commit();
        return { success: true, masanpham };
    } catch (error) {
        await connection.rollback();
        throw error; // Ném lỗi ra ngoài để Controller xử lý và phản hồi lại cho FE
    } finally {
        connection.release();
    }
};

// ======================================================
// CẬP NHẬT SẢN PHẨM (Nghiêm ngặt: Check trùng tên khác)
// ======================================================
const updateProduct = async (id, productData) => {
    const {
        tensanpham, mota, chatlieu, kieudang, baoquan, anhdaidien, mahang, madanhmuc,
        variants
    } = productData;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. RÀNG BUỘC NGHIÊM NGẶT: Kiểm tra xem tên mới có trùng với sản phẩm KHÁC không
        const [duplicateCheck] = await connection.query(
            "SELECT masanpham FROM sanpham WHERE tensanpham = ? AND masanpham != ? LIMIT 1",
            [tensanpham.trim(), id]
        );

        if (duplicateCheck.length > 0) {
            throw new Error("Tên sản phẩm này đã tồn tại ở một sản phẩm khác rồi anh ơi!");
        }

        // 2. Tiến hành cập nhật thông tin chung của sản phẩm
        const sqlUpdateProduct = `
            UPDATE sanpham 
            SET tensanpham = ?, mota = ?, chatlieu = ?, kieudang = ?, baoquan = ?, anhdaidien = ?, mahang = ?, madanhmuc = ?
            WHERE masanpham = ?
        `;
        await connection.query(sqlUpdateProduct, [
            tensanpham.trim(), mota, chatlieu, kieudang, baoquan, anhdaidien, mahang, madanhmuc, id
        ]);

        // 3. Xử lý các biến thể (variants) - GIỮ NGUYÊN SỰ LINH HOẠT
        const [existingVariants] = await connection.query(
            "SELECT mabienthe FROM bienthesanpham WHERE masanpham = ?", [id]
        );
        const existingIds = existingVariants.map(v => v.mabienthe);

        if (variants && variants.length > 0) {
            const incomingIds = variants.map(v => v.mabienthe).filter(Boolean);

            // Xóa các biến thể không còn trong danh sách mới
            const idsToDelete = existingIds.filter(x => !incomingIds.includes(x));
            if (idsToDelete.length > 0) {
                // Check xem biến thể định xóa đã có đơn hàng chưa
                const [orderCheck] = await connection.query(
                    "SELECT COUNT(*) as count FROM chitietdonhang WHERE mabienthe IN (?)", [idsToDelete]
                );
                if (orderCheck[0].count > 0) {
                    throw new Error("Không thể xóa biến thể cũ vì đã có đơn hàng đặt mua biến thể này!");
                }

                await connection.query("DELETE FROM hinhanh WHERE mabienthe IN (?)", [idsToDelete]);
                await connection.query("DELETE FROM bienthesanpham WHERE mabienthe IN (?)", [idsToDelete]);
            }

            // Duyệt danh sách gửi lên để Cập nhật hoặc Thêm mới
            for (const variant of variants) {
                if (variant.mabienthe) {
                    // Cập nhật biến thể có sẵn
                    const sqlUpdateVariant = `
                        UPDATE bienthesanpham 
                        SET giaban = ?, soluongton = ?, makichthuoc = ?, mamausac = ?
                        WHERE mabienthe = ? AND masanpham = ?
                    `;
                    await connection.query(sqlUpdateVariant, [
                        variant.giaban, variant.soluongton, variant.makichthuoc, variant.mamausac, variant.mabienthe, id
                    ]);

                    if (variant.hinhanh) {
                        await connection.query("DELETE FROM hinhanh WHERE mabienthe = ?", [variant.mabienthe]);
                        const sqlImage = `INSERT INTO hinhanh (mabienthe, urlhinhanh, stt) VALUES (?, ?, ?)`;
                        for (let i = 0; i < variant.hinhanh.length; i++) {
                            await connection.query(sqlImage, [variant.mabienthe, variant.hinhanh[i], i + 1]);
                        }
                    }
                } else {
                    // Thêm biến thể mới hoàn toàn
                    const sqlInsertVariant = `
                        INSERT INTO bienthesanpham (masanpham, makichthuoc, mamausac, giaban, soluongton, trangthaihoatdongbtsp)
                        VALUES (?, ?, ?, ?, ?, 1)
                    `;
                    const [insertResult] = await connection.query(sqlInsertVariant, [
                        id, variant.makichthuoc, variant.mamausac, variant.giaban, variant.soluongton
                    ]);
                    const newMabienthe = insertResult.insertId;

                    if (variant.hinhanh && variant.hinhanh.length > 0) {
                        const sqlImage = `INSERT INTO hinhanh (mabienthe, urlhinhanh, stt) VALUES (?, ?, ?)`;
                        for (let i = 0; i < variant.hinhanh.length; i++) {
                            await connection.query(sqlImage, [newMabienthe, variant.hinhanh[i], i + 1]);
                        }
                    }
                }
            }
        }

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// ======================================================
// 2. NÂNG CẤP HÀM XÓA SẢN PHẨM (Có ràng buộc chặt chẽ)
// ======================================================
const deleteProduct = async (id) => {
    const connection = await db.getConnection();
    try {
        // Ràng buộc: Kiểm tra xem sản phẩm này có biến thể nào đã nằm trong giỏ hàng hoặc đơn hàng chưa
        const sqlCheckOrder = `
            SELECT COUNT(*) AS count 
            FROM chitietdonhang ctdh
            INNER JOIN bienthesanpham btsp ON ctdh.mabienthe = btsp.mabienthe
            WHERE btsp.masanpham = ?
        `;
        const [orderCheck] = await connection.query(sqlCheckOrder, [id]);

        if (orderCheck[0].count > 0) {
            // Trả về false hoặc ném ra lỗi để thông báo không cho phép xóa vì có ràng buộc đơn hàng
            throw new Error("Không thể xóa sản phẩm này vì đã có khách hàng đặt mua!");
        }

        // Nếu không vướng đơn hàng -> Tiến hành xóa
        // Lưu ý: Do có quan hệ khóa ngoại nên ta phải xóa hình ảnh -> biến thể sản phẩm -> rồi mới xóa sản phẩm chính
        await connection.beginTransaction();

        // 1. Lấy danh sách mã biến thể của sản phẩm
        const [variants] = await connection.query("SELECT mabienthe FROM bienthesanpham WHERE masanpham = ?", [id]);
        const mabienthes = variants.map(v => v.mabienthe);

        if (mabienthes.length > 0) {
            // 2. Xóa hình ảnh
            await connection.query("DELETE FROM hinhanh WHERE mabienthe IN (?)", [mabienthes]);
            // 3. Xóa biến thể
            await connection.query("DELETE FROM bienthesanpham WHERE masanpham = ?", [id]);
        }

        // 4. Xóa sản phẩm chính
        const [result] = await connection.query("DELETE FROM sanpham WHERE masanpham = ?", [id]);

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
// ======================================================
// LẤY DANH SÁCH SẢN PHẨM ĐẦY ĐỦ CHO ADMIN (Có Hãng, Danh mục, Tồn kho)
// ======================================================
const getAdminProducts = async () => {
    const connection = await db.getConnection();
    try {
        // Query lấy thông tin sản phẩm kèm tên Hãng, tên Danh mục
        // Đồng thời tính tổng tồn kho từ bảng bienthesanpham bằng SUM
        // Lấy giá bán nhỏ nhất của sản phẩm bằng MIN
        const sql = `
            SELECT 
                sp.masanpham,
                sp.tensanpham,
                sp.anhdaidien,
                h.tenhang,
                dm.tendanhmuc,
                MIN(btsp.giaban) as giaban,
                SUM(btsp.soluongton) as tongkho
            FROM sanpham sp
            LEFT JOIN hang h ON sp.mahang = h.mahang
            LEFT JOIN danhmuc dm ON sp.madanhmuc = dm.madanhmuc
            LEFT JOIN bienthesanpham btsp ON sp.masanpham = btsp.masanpham
            GROUP BY sp.masanpham, h.tenhang, dm.tendanhmuc
            ORDER BY sp.masanpham DESC
        `;
        const [rows] = await connection.query(sql);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct,
    getAdminProducts
};