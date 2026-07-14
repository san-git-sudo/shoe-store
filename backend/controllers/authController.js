const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Auth = require("../models/authModel");
const sendMail = require("../utils/sendMail");

// ======================================================
// Kiểm tra định dạng email cơ bản
// ======================================================
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ======================================================
// Kiểm tra số điện thoại Việt Nam
//
// Hợp lệ:
// 03xxxxxxxx
// 05xxxxxxxx
// 07xxxxxxxx
// 08xxxxxxxx
// 09xxxxxxxx
// ======================================================
const isValidVietnamesePhone = (phone) => {
    return /^0(3|5|7|8|9)\d{8}$/.test(phone);
};

// ======================================================
// Đăng ký bước 1: gửi OTP
//
// API:
// POST /api/auth/register
//
// Chưa tạo tài khoản trong bảng nguoidung.
// Chỉ lưu thông tin tạm vào xacthucemail.
// ======================================================
const register = async (req, res) => {
    try {
        let {
            hoten,
            email,
            matkhau,
            sodienthoai,
            diachi
        } = req.body;

        hoten = hoten?.trim();
        email = email?.trim().toLowerCase();
        sodienthoai = sodienthoai?.trim();
        diachi = diachi?.trim();

        // Kiểm tra các trường bắt buộc
        if (!hoten || !email || !matkhau || !sodienthoai || !diachi) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin."
            });
        }

        // Kiểm tra họ tên
        if (hoten.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Họ và tên không hợp lệ."
            });
        }

        // Kiểm tra định dạng email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ."
            });
        }

        // Kiểm tra số điện thoại Việt Nam
        if (!isValidVietnamesePhone(sodienthoai)) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ."
            });
        }

        // Kiểm tra độ dài mật khẩu
        if (matkhau.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự."
            });
        }

        // Không cho đăng ký nếu email đã tồn tại
        const existed = await Auth.checkEmail(email);

        if (existed) {
            return res.status(409).json({
                success: false,
                message: "Email đã tồn tại."
            });
        }

        // Sinh OTP ngẫu nhiên gồm 6 chữ số
        const otp = crypto.randomInt(100000, 1000000).toString();

        // OTP có hiệu lực trong 5 phút
        const thoigianhethan = new Date(Date.now() + 5 * 60 * 1000);

        // Hash mật khẩu trước khi lưu tạm
        const hashedPassword = await bcrypt.hash(matkhau, 10);

        // Lưu thông tin đăng ký tạm thời
        await Auth.saveRegisterOTP({
            email,
            otp,
            hoten,
            matkhau: hashedPassword,
            sodienthoai,
            diachi,
            thoigianhethan
        });

        try {
            // Gửi mã OTP tới email đăng ký
            await sendMail({
                to: email,
                subject: "Mã xác thực đăng ký KICKZONE",
                html: `
                    <div style="max-width: 560px; margin: auto; padding: 32px; font-family: Arial, sans-serif; background: #f4f4f5;">
                        <div style="padding: 32px; border-radius: 20px; background: #ffffff;">
                            <h1 style="margin: 0; color: #18181b;">
                                KICK<span style="color: #ef4444;">ZONE</span>
                            </h1>

                            <h2 style="margin-top: 28px; color: #18181b;">
                                Xác thực tài khoản
                            </h2>

                            <p style="color: #52525b;">
                                Xin chào ${hoten},
                            </p>

                            <p style="color: #52525b;">
                                Mã OTP đăng ký của bạn là:
                            </p>

                            <div style="margin: 24px 0; padding: 18px; border-radius: 12px; background: #18181b; color: #ffffff; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                                ${otp}
                            </div>

                            <p style="color: #71717a;">
                                Mã OTP có hiệu lực trong 5 phút. Không chia sẻ mã này cho người khác.
                            </p>
                        </div>
                    </div>
                `
            });
        } catch (mailError) {
            // Gửi mail lỗi thì xóa dữ liệu OTP tạm
            await Auth.deleteRegisterOTP(email);

            console.error("Send OTP error:", mailError);

            return res.status(500).json({
                success: false,
                message: "Không thể gửi OTP. Vui lòng thử lại."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mã OTP đã được gửi tới email của bạn.",
            requiresOtp: true,
            email
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi gửi mã OTP."
        });
    }
};

// ======================================================
// Đăng ký bước 2: xác thực OTP
//
// API:
// POST /api/auth/verify-register-otp
// ======================================================
const verifyRegisterOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;

        email = email?.trim().toLowerCase();
        otp = otp?.trim();

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mã OTP."
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP phải gồm đúng 6 chữ số."
            });
        }

        const pendingUser = await Auth.findRegisterOTPByEmail(email);

        if (!pendingUser) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy yêu cầu đăng ký."
            });
        }

        if (String(pendingUser.otp) !== otp) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP không chính xác."
            });
        }

        if (new Date(pendingUser.thoigianhethan).getTime() < Date.now()) {
            await Auth.deleteRegisterOTP(email);

            return res.status(410).json({
                success: false,
                message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."
            });
        }

        // Kiểm tra lại email để tránh trường hợp trùng trong lúc chờ OTP
        const existed = await Auth.checkEmail(email);

        if (existed) {
            await Auth.deleteRegisterOTP(email);

            return res.status(409).json({
                success: false,
                message: "Email đã được sử dụng."
            });
        }

        const manguoidung = await Auth.completeRegister(pendingUser);

        return res.status(201).json({
            success: true,
            message: "Xác thực email và đăng ký thành công.",
            data: {
                manguoidung,
                email: pendingUser.email,
                hoten: pendingUser.hoten
            }
        });
    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xác thực OTP."
        });
    }
};

// ======================================================
// Đăng nhập
// ======================================================
const login = async (req, res) => {
    try {
        let { email, matkhau } = req.body;

        email = email?.trim().toLowerCase();

        if (!email || !matkhau) {
            return res.status(400).json({
                success: false,
                message: "Thiếu email hoặc mật khẩu."
            });
        }

        const user = await Auth.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác."
            });
        }

        const checkPassword = await bcrypt.compare(matkhau, user.matkhau);

        if (!checkPassword) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác."
            });
        }

        if (user.trangthai !== "hoạt động") {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa."
            });
        }

        const token = jwt.sign(
            {
                manguoidung: user.manguoidung,
                vaitro: user.vaitro
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công.",
            token,
            user: {
                manguoidung: user.manguoidung,
                hoten: user.hoten,
                email: user.email,
                vaitro: user.vaitro
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng nhập."
        });
    }
};
// ======================================================
// Lấy thông tin tài khoản đang đăng nhập
// ======================================================
const getProfile = async (req, res) => {
    try {
        const user = await Auth.findById(req.user.manguoidung);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng."
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin cá nhân."
        });
    }
};

// ======================================================
// Cập nhật thông tin tài khoản đang đăng nhập
// ======================================================
const updateProfile = async (req, res) => {
    try {
        let { hoten, sodienthoai, diachi } = req.body;

        hoten = hoten?.trim();
        sodienthoai = sodienthoai?.trim();
        diachi = diachi?.trim();

        if (!hoten || !sodienthoai || !diachi) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin."
            });
        }

        if (hoten.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Họ và tên không hợp lệ."
            });
        }

        if (!/^0(3|5|7|8|9)\d{8}$/.test(sodienthoai)) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ."
            });
        }

        await Auth.updateProfile(
            req.user.manguoidung,
            {
                hoten,
                sodienthoai,
                diachi
            }
        );

        const updatedUser = await Auth.findById(
            req.user.manguoidung
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thành công.",
            data: updatedUser
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật thông tin."
        });
    }
};
// ======================================================
// Quên mật khẩu
// ======================================================
const forgotPassword = async (req, res) => {

    try {

        let { email } = req.body;

        email = email?.trim().toLowerCase();

        if (!email) {

            return res.status(400).json({

                success: false,
                message: "Vui lòng nhập email."

            });

        }

        const user = await Auth.findByEmail(email);

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "Email không tồn tại."

            });

        }

        const token = crypto.randomBytes(32).toString("hex");

        const expire = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await Auth.saveResetToken(
            email,
            token,
            expire
        );

        const link =
            `http://localhost:5173/reset-password/${token}`;

        await sendMail({

            to: email,

            subject: "Đặt lại mật khẩu KICKZONE",

            html: `
                <h2>Đặt lại mật khẩu</h2>

                <p>Nhấn vào liên kết bên dưới:</p>

                <a href="${link}">
                    ${link}
                </a>

                <p>Liên kết có hiệu lực trong 15 phút.</p>
            `

        });

        return res.json({

            success: true,
            message: "Đã gửi email đặt lại mật khẩu."

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,
            message: "Lỗi server."

        });

    }

};
// ======================================================
// Đặt lại mật khẩu
// ======================================================
const resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const { matkhau } = req.body;

        const user =
            await Auth.findByResetToken(token);

        if (!user) {

            return res.status(400).json({

                success: false,
                message: "Token không hợp lệ."

            });

        }

        if (
            new Date(user.thoigianhethan).getTime()
            < Date.now()
        ) {

            return res.status(400).json({

                success: false,
                message: "Token đã hết hạn."

            });

        }

        const hash =
            await bcrypt.hash(matkhau, 10);

        await Auth.updatePassword(

            user.manguoidung,

            hash

        );

        return res.json({

            success: true,
            message: "Đổi mật khẩu thành công."

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,
            message: "Lỗi server."

        });

    }

};
module.exports = {

    register,

    verifyRegisterOTP,

    login,

    forgotPassword,

    resetPassword,

    getProfile,

    updateProfile

};