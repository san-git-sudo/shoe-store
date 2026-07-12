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

module.exports = {
    getProducts,
    getProductById
};