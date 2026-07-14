require("dotenv").config();

const sendMail = require("./utils/sendMail");

const testMail = async () => {
    try {
        await sendMail({
            to: process.env.EMAIL_USER,
            subject: "Kiểm tra gửi mail KICKZONE",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2 style="color: #ef4444;">KICKZONE</h2>
                    <p>Hệ thống gửi email đã hoạt động thành công.</p>
                </div>
            `
        });

        console.log("Gửi email thành công");
    } catch (error) {
        console.error("Gửi email thất bại:", error.message);
    }
};

testMail();