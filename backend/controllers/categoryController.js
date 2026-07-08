const Category = require("../models/categoryModel");

const getCategories = async (req, res) => {

    try {

        const results = await Category.getAllCategories();

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách danh mục thành công",
            data: results
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Lỗi lấy danh mục"
        });

    }

};

module.exports = {
    getCategories
};