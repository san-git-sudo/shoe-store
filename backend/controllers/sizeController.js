const sizeModel = require("../models/sizeModel");

const getAllSizes = async (req, res) => {

    try {

        const sizes = await sizeModel.getAllSizes();

        res.status(200).json({
            success: true,
            message: "Lấy danh sách kích thước thành công",
            data: sizes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });

    }

};

module.exports = {
    getAllSizes
};