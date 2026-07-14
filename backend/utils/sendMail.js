const nodemailer = require("nodemailer");

// Tạo bộ gửi email thông qua Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hàm dùng chung để gửi email
const sendMail = async ({ to, subject, html }) => {
    const info = await transporter.sendMail({
        from: `"KICKZONE" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });

    return info;
};

module.exports = sendMail;