const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Kết nối database
require("./config/db");

const productRoutes = require("./routes/productRoutes"); //Product
const categoryRoutes = require("./routes/categoryRoutes"); //Category
const brandRoutes = require("./routes/brandRoutes");//Brand
const voucherRoutes = require("./routes/voucherRoutes");//Voucher
const uploadRoutes = require("./routes/uploadRoutes");//file upload
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

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});