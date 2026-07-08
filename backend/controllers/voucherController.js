const Voucher = require("../models/voucherModel");

const getVouchers = async (req, res) => {

    try {

        const results = await Voucher.getAllVoucher();

        const vouchers = results.map(voucher => ({
            ...voucher,
            giatrigiam: Number(voucher.giatrigiam),
            giantoida: Number(voucher.giantoida),
            dontoithieu: Number(voucher.dontoithieu)
        }));

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách voucher thành công",
            data: vouchers
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Lỗi lấy danh sách voucher"
        });

    }

};

module.exports = {
    getVouchers
};