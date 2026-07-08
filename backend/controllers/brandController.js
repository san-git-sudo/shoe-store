const Brand = require("../models/brandModel");

const getBrands = async (req, res) => {

    try {

        const results = await Brand.getAllBrands();

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách hãng thành công",
            data: results
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Lỗi lấy hãng"
        });

    }

};

module.exports = {
    getBrands
};