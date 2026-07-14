const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Kết nối database
require("./config/db");
//các Routes của các chức năng
const productRoutes = require("./routes/productRoutes"); //Product
const categoryRoutes = require("./routes/categoryRoutes"); //Category
const brandRoutes = require("./routes/brandRoutes");//Brand
const voucherRoutes = require("./routes/voucherRoutes");//Voucher
const uploadRoutes = require("./routes/uploadRoutes");//file upload
const sizeRoutes = require("./routes/sizeRoutes");//Size
const colorRoutes = require("./routes/colorRoutes");//Color
const authRoutes = require("./routes/authRoutes");//đăng nhập, đăng ký, quên mật khẩu
const app = express();

app.use(cors());
app.use(express.json());
//Product
app.use("/api/products", productRoutes);
//Category
app.use("/api/categories", categoryRoutes);
//Brand
app.use("/api/brands", brandRoutes);
//Voucher
app.use("/api/vouchers", voucherRoutes);
const PORT = process.env.PORT || 5000;
//Upload
app.use("/api/upload", uploadRoutes);
//Size
app.use("/api/sizes", sizeRoutes);
//Color
app.use("/api/colors", colorRoutes);
//đăng nhập, đăng ký, quên mật khẩu
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});