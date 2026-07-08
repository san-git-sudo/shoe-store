const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");
//Lấy danh sách sản phẩm show ra trang chủ
router.get("/", productController.getProducts);
//Chi tiết sản phẩm
router.get("/:id", productController.getProductById);

module.exports = router;