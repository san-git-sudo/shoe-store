const colorModel = require("../models/colorModel");

const getAllColors = async (req, res) => {

    try {

        const colors = await colorModel.getAllColors();

        res.status(200).json({
            success: true,
            message: "Lấy danh sách màu sắc thành công",
            data: colors
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
    getAllColors
};