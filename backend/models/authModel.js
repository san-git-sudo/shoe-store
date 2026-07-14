const db = require("../config/db");

const Auth = {};

// ======================================================
// Kiểm tra email đã có trong bảng người dùng hay chưa
// ======================================================
Auth.checkEmail = async (email) => {
    const [rows] = await db.query(
        `
        SELECT manguoidung
        FROM nguoidung
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows.length > 0;
};

// ======================================================
// Tìm người dùng theo email
// Dùng cho chức năng đăng nhập
// ======================================================
Auth.findByEmail = async (email) => {
    const [rows] = await db.query(
        `
        SELECT *
        FROM nguoidung
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0];
};

// ======================================================
// Lưu thông tin đăng ký và OTP vào bảng xacthucemail
//
// ON DUPLICATE KEY UPDATE:
// Nếu email đã yêu cầu OTP trước đó thì cập nhật OTP mới,
// không tạo thêm một dòng trùng email.
// ======================================================
Auth.saveRegisterOTP = async (user) => {
    const {
        email,
        otp,
        hoten,
        matkhau,
        sodienthoai,
        diachi,
        thoigianhethan
    } = user;

    await db.query(
        `
        INSERT INTO xacthucemail
        (
            email,
            otp,
            hoten,
            matkhau,
            sodienthoai,
            diachi,
            thoigianhethan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE
            otp = VALUES(otp),
            hoten = VALUES(hoten),
            matkhau = VALUES(matkhau),
            sodienthoai = VALUES(sodienthoai),
            diachi = VALUES(diachi),
            thoigianhethan = VALUES(thoigianhethan),
            ngaytao = CURRENT_TIMESTAMP
        `,
        [
            email,
            otp,
            hoten,
            matkhau,
            sodienthoai,
            diachi,
            thoigianhethan
        ]
    );
};

// ======================================================
// Tìm thông tin đăng ký đang chờ xác thực theo email
// ======================================================
Auth.findRegisterOTPByEmail = async (email) => {
    const [rows] = await db.query(
        `
        SELECT *
        FROM xacthucemail
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0];
};

// ======================================================
// Hoàn tất đăng ký
//
// Dùng transaction để đảm bảo:
// 1. Tạo người dùng thành công
// 2. Xóa OTP thành công
//
// Nếu một bước lỗi thì rollback toàn bộ.
// ======================================================
Auth.completeRegister = async (pendingUser) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            INSERT INTO nguoidung
            (
                email,
                matkhau,
                hoten,
                sodienthoai,
                diachi,
                vaitro,
                trangthai
            )
            VALUES (?, ?, ?, ?, ?, 'client', 'hoạt động')
            `,
            [
                pendingUser.email,
                pendingUser.matkhau,
                pendingUser.hoten,
                pendingUser.sodienthoai,
                pendingUser.diachi
            ]
        );

        await connection.query(
            `
            DELETE FROM xacthucemail
            WHERE email = ?
            `,
            [pendingUser.email]
        );

        await connection.commit();

        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// ======================================================
// Xóa OTP đang chờ xác thực
// Dùng khi gửi mail thất bại hoặc muốn hủy yêu cầu
// ======================================================
Auth.deleteRegisterOTP = async (email) => {
    await db.query(
        `
        DELETE FROM xacthucemail
        WHERE email = ?
        `,
        [email]
    );
};

// ======================================================
// Lưu reset token cho chức năng quên mật khẩu
// ======================================================
Auth.saveResetToken = async (email, token, expire) => {
    await db.query(
        `
        UPDATE nguoidung
        SET resettoken = ?, thoigianhethan = ?
        WHERE email = ?
        `,
        [token, expire, email]
    );
};

// ======================================================
// Tìm người dùng theo reset token
// ======================================================
Auth.findByResetToken = async (token) => {
    const [rows] = await db.query(
        `
        SELECT *
        FROM nguoidung
        WHERE resettoken = ?
        LIMIT 1
        `,
        [token]
    );

    return rows[0];
};

// ======================================================
// Đổi mật khẩu và xóa reset token sau khi sử dụng
// ======================================================
Auth.updatePassword = async (id, password) => {
    await db.query(
        `
        UPDATE nguoidung
        SET
            matkhau = ?,
            resettoken = NULL,
            thoigianhethan = NULL
        WHERE manguoidung = ?
        `,
        [password, id]
    );
};
// ======================================================
// Lấy thông tin người dùng theo mã người dùng
// Không lấy mật khẩu và các token nhạy cảm
// ======================================================
Auth.findById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            manguoidung,
            email,
            hoten,
            sodienthoai,
            diachi,
            vaitro,
            trangthai,
            ngaytao,
            ngaycapnhat
        FROM nguoidung
        WHERE manguoidung = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];
};

// ======================================================
// Cập nhật thông tin cá nhân
// Không cho người dùng tự thay đổi email, vai trò, trạng thái
// ======================================================
Auth.updateProfile = async (id, user) => {
    const { hoten, sodienthoai, diachi } = user;

    const [result] = await db.query(
        `
        UPDATE nguoidung
        SET
            hoten = ?,
            sodienthoai = ?,
            diachi = ?,
            ngaycapnhat = CURRENT_TIMESTAMP
        WHERE manguoidung = ?
        `,
        [hoten, sodienthoai, diachi, id]
    );

    return result.affectedRows;
};
module.exports = Auth;