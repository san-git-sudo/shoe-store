const Product = require("../models/productModel");

// Lấy danh sách sản phẩm + tìm kiếm + filter
const getProducts = async (req, res) => {

    try {

        const filters = {
            q: req.query.q,
            brand: req.query.brand,
            category: req.query.category,
            gender: req.query.gender,
            size: req.query.size,
            color: req.query.color,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            inStock: req.query.inStock,
            sort: req.query.sort
        };

        const results = await Product.getAllProducts(filters);

        const products = results.map(product => ({
            ...product,
            giaban: Number(product.giaban)
        }));

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công",
            data: products
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách sản phẩm"
        });

    }

};
// Chi tiết sản phẩm
const getProductById = async (req, res) => {

    try {

        const { id } = req.params;

        const results = await Product.getProductById(id);

        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });

        }

        const firstProduct = results[0];

        const product = {

            masanpham: firstProduct.masanpham,
            tensanpham: firstProduct.tensanpham,

            mota: firstProduct.mota,
            chatlieu: firstProduct.chatlieu,
            kieudang: firstProduct.kieudang,
            baoquan: firstProduct.baoquan,

            anhdaidien: firstProduct.anhdaidien,

            mahang: firstProduct.mahang,
            tenhang: firstProduct.tenhang,

            madanhmuc: firstProduct.madanhmuc,
            tendanhmuc: firstProduct.tendanhmuc,

            variants: []

        };

        results.forEach(item => {

            let variant = product.variants.find(
                v => v.mabienthe === item.mabienthe
            );

            if (!variant) {

                variant = {

                    mabienthe: item.mabienthe,

                    giaban: Number(item.giaban),

                    soluongton: item.soluongton,

                    kichthuoc: {
                        makichthuoc: item.makichthuoc,
                        tenkichthuoc: item.tenkichthuoc
                    },

                    mausac: {
                        mamausac: item.mamausac,
                        tenmausac: item.tenmausac,
                        hexcode: item.hexcode
                    },

                    hinhanh: []

                };

                product.variants.push(variant);

            }

            if (item.urlhinhanh) {

                variant.hinhanh.push({

                    urlhinhanh: item.urlhinhanh,
                    stt: item.stt

                });

            }

        });

        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết sản phẩm thành công",
            data: product
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Lỗi lấy chi tiết sản phẩm"
        });

    }

};


// Thêm sản phẩm mới (Đã bổ sung ràng buộc hợp lý)
const createProduct = async (req, res) => {
    try {
        const { tensanpham, mahang, madanhmuc, variants } = req.body;

        // 1. Kiểm tra các thông tin cơ bản bắt buộc
        if (!tensanpham || tensanpham.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Tên sản phẩm không được để trống."
            });
        }

        if (!mahang) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn hãng sản xuất."
            });
        }

        if (!madanhmuc) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn danh mục sản phẩm."
            });
        }

        // 2. Kiểm tra xem sản phẩm có ít nhất 1 biến thể (Size/Màu/Giá) không
        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Sản phẩm phải có ít nhất một biến thể (size, màu, giá bán)."
            });
        }

        // 3. Kiểm tra tính hợp lệ của từng biến thể
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            const variantIndex = i + 1;

            if (!variant.makichthuoc) {
                return res.status(400).json({
                    success: false,
                    message: `Biến thể thứ ${variantIndex}: Vui lòng chọn kích thước (size).`
                });
            }

            if (!variant.mamausac) {
                return res.status(400).json({
                    success: false,
                    message: `Biến thể thứ ${variantIndex}: Vui lòng chọn màu sắc.`
                });
            }

            // Giá bán phải là số và lớn hơn 0
            if (variant.giaban === undefined || variant.giaban === null || Number(variant.giaban) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Biến thể thứ ${variantIndex}: Giá bán phải lớn hơn 0đ.`
                });
            }

            // Số lượng tồn kho phải là số và không được âm (bằng 0 vẫn chấp nhận được - nghĩa là tạm hết hàng)
            if (variant.soluongton === undefined || variant.soluongton === null || Number(variant.soluongton) < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Biến thể thứ ${variantIndex}: Số lượng tồn kho không được nhỏ hơn 0.`
                });
            }
        }

        // Gọi Model để thực hiện lưu vào Database sau khi tất cả dữ liệu đã hợp lệ
        const result = await Product.createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "Thêm sản phẩm thành công!",
            data: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Lỗi khi thêm sản phẩm mới"
        });
    }
};
// Cập nhật sản phẩm (Ràng buộc nghiêm ngặt theo yêu cầu của anh yêu)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { tensanpham, mota, chatlieu, kieudang, baoquan, anhdaidien, mahang, madanhmuc, variants } = req.body;

        // 1. RÀNG BUỘC NGHIÊM NGẶT: Bắt buộc điền đầy đủ mọi thông tin sản phẩm
        if (!tensanpham || tensanpham.trim() === "") {
            return res.status(400).json({ success: false, message: "Tên sản phẩm không được để trống." });
        }
        if (!mota || mota.trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mô tả sản phẩm." });
        }
        if (!chatlieu || chatlieu.trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng nhập thông tin chất liệu." });
        }
        if (!kieudang || kieudang.trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng nhập kiểu dáng sản phẩm." });
        }
        if (!baoquan || baoquan.trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng nhập hướng dẫn bảo quản." });
        }
        if (!anhdaidien || anhdaidien.trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh đại diện cho sản phẩm." });
        }
        if (!mahang) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn hãng sản phẩm." });
        }
        if (!madanhmuc) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn danh mục sản phẩm." });
        }

        // 2. Kiểm tra giá trị các biến thể (Chỉ chặn số âm vô lý, giá bán phải lớn hơn 0)
        if (variants && variants.length > 0) {
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                const index = i + 1;

                if (v.giaban === undefined || v.giaban === null || Number(v.giaban) <= 0) {
                    return res.status(400).json({ success: false, message: `Biến thể thứ ${index}: Giá bán phải lớn hơn 0đ.` });
                }
                if (v.soluongton === undefined || v.soluongton === null || Number(v.soluongton) < 0) {
                    return res.status(400).json({ success: false, message: `Biến thể thứ ${index}: Số lượng tồn không được nhỏ hơn 0.` });
                }
            }
        }

        // Thực hiện lưu thay đổi vào DB
        await Product.updateProduct(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công!"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message || "Lỗi khi cập nhật thông tin sản phẩm"
        });
    }
};

// Cập nhật lại hàm deleteProduct trong Controller để bắt được lỗi ràng buộc đơn hàng ở Model quăng ra
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await Product.deleteProduct(id);

        if (!isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm để xóa"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Xóa sản phẩm thành công!"
        });
    } catch (err) {
        console.error(err);
        // Trả về thông báo lỗi ràng buộc cho FE biết (ví dụ: lỗi có đơn hàng đặt mua)
        return res.status(400).json({
            success: false,
            message: err.message || "Lỗi khi xóa sản phẩm"
        });
    }
};
// Lấy danh sách sản phẩm đầy đủ cho Admin
const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.getAdminProducts();
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm quản trị thành công",
            data: products
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách sản phẩm quản trị"
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct,
    getAdminProducts
};

