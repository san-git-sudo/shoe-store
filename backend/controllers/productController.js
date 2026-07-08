const Product = require("../models/productModel");

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {

    try {

        const results = await Product.getAllProducts();

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
            variants: []
        };

        results.forEach(item => {

            product.variants.push({

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

                hinhanh: item.urlhinhanh
                    ? [{
                        urlhinhanh: item.urlhinhanh,
                        stt: item.stt
                    }]
                    : []

            });

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