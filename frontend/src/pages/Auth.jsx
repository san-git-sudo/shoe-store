import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Auth() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
            navigate("/profile", { replace: true });
        }
    }, [navigate]);
    // true: giao diện đăng nhập
    // false: giao diện đăng ký
    const [isLogin, setIsLogin] = useState(true);

    // Khi backend gửi OTP thành công thì chuyển sang bước nhập OTP
    const [isOtpStep, setIsOtpStep] = useState(false);

    // Trạng thái khi đang gọi API để tránh người dùng bấm nhiều lần
    const [loading, setLoading] = useState(false);

    // Mã OTP người dùng nhập
    const [otp, setOtp] = useState("");

    // Dữ liệu form đăng nhập và đăng ký
    const [form, setForm] = useState({
        hoten: "",
        email: "",
        matkhau: "",
        confirmPassword: "",
        sodienthoai: "",
        diachi: ""
    });

    // ======================================================
    // Xử lý nhập dữ liệu
    // ======================================================
    const handleChange = (e) => {
        let { name, value } = e.target;

        // Ô số điện thoại chỉ cho phép nhập số
        if (name === "sodienthoai") {
            value = value.replace(/\D/g, "");
        }

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    // ======================================================
    // Kiểm tra dữ liệu đăng ký ở frontend
    // Backend vẫn phải kiểm tra lại để đảm bảo an toàn
    // ======================================================
    const validateRegisterForm = () => {
        if (form.hoten.trim().length < 2) {
            alert("Họ tên không hợp lệ.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(form.email.trim())) {
            alert("Email không hợp lệ.");
            return false;
        }

        // Số điện thoại Việt Nam gồm 10 số,
        // bắt đầu bằng 03, 05, 07, 08 hoặc 09
        const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;

        if (!phoneRegex.test(form.sodienthoai)) {
            alert("Số điện thoại không hợp lệ.");
            return false;
        }

        if (!form.diachi.trim()) {
            alert("Vui lòng nhập địa chỉ.");
            return false;
        }

        if (form.matkhau.length < 6) {
            alert("Mật khẩu phải từ 6 ký tự trở lên.");
            return false;
        }

        if (form.matkhau !== form.confirmPassword) {
            alert("Mật khẩu nhập lại không khớp.");
            return false;
        }

        return true;
    };

    // ======================================================
    // Đăng ký bước 1: gửi thông tin và yêu cầu OTP
    // ======================================================
    const handleRegister = async () => {
        if (!validateRegisterForm()) return;

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    hoten: form.hoten.trim(),
                    email: form.email.trim().toLowerCase(),
                    matkhau: form.matkhau,
                    sodienthoai: form.sodienthoai,
                    diachi: form.diachi.trim()
                }
            );

            alert(res.data.message);

            // Không chuyển về đăng nhập ngay.
            // Chuyển sang giao diện nhập mã OTP.
            setIsOtpStep(true);
        } catch (err) {
            alert(err.response?.data?.message || "Không thể gửi mã OTP.");
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // Đăng ký bước 2: xác thực OTP
    // ======================================================
    const handleVerifyOtp = async () => {
        if (!/^\d{6}$/.test(otp)) {
            alert("Mã OTP phải gồm đúng 6 chữ số.");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:5000/api/auth/verify-register-otp",
                {
                    email: form.email.trim().toLowerCase(),
                    otp
                }
            );

            alert(res.data.message);

            // Xác thực thành công thì trở về màn hình đăng nhập
            setIsOtpStep(false);
            setIsLogin(true);
            setOtp("");

            // Giữ email để người dùng không phải nhập lại,
            // nhưng xóa các dữ liệu đăng ký nhạy cảm
            setForm((previousForm) => ({
                hoten: "",
                email: previousForm.email,
                matkhau: "",
                confirmPassword: "",
                sodienthoai: "",
                diachi: ""
            }));
        } catch (err) {
            alert(err.response?.data?.message || "Xác thực OTP thất bại.");
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // Gửi lại OTP
    // Có thể dùng lại API register vì backend cập nhật OTP mới
    // cho email đang chờ xác thực
    // ======================================================
    const handleResendOtp = async () => {
        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    hoten: form.hoten.trim(),
                    email: form.email.trim().toLowerCase(),
                    matkhau: form.matkhau,
                    sodienthoai: form.sodienthoai,
                    diachi: form.diachi.trim()
                }
            );

            setOtp("");
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Không thể gửi lại OTP.");
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // Đăng nhập
    // ======================================================
    const handleLogin = async () => {
        if (!form.email.trim() || !form.matkhau) {
            alert("Vui lòng nhập email và mật khẩu.");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: form.email.trim().toLowerCase(),
                    matkhau: form.matkhau
                }
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (res.data.user.vaitro === "admin") {
                navigate("/admin");
            } else {
                navigate("/profile");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Đăng nhập thất bại.");
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // Chuyển qua lại giữa đăng nhập và đăng ký
    // ======================================================
    const handleSwitchMode = () => {
        setIsLogin((previousValue) => !previousValue);
        setIsOtpStep(false);
        setOtp("");

        setForm({
            hoten: "",
            email: "",
            matkhau: "",
            confirmPassword: "",
            sodienthoai: "",
            diachi: ""
        });
    };

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-12 pt-28">
            <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl md:grid-cols-2">
                <div className="relative hidden overflow-hidden bg-[#18181B] p-10 text-white md:block">
                    {isLogin ? (
                        <>
                            <h1 className="text-5xl font-black italic">
                                KICK<span className="text-red-500">ZONE</span>
                            </h1>

                            <p className="mt-6 text-lg leading-8 text-zinc-300">
                                Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi riêng.
                            </p>

                            <div className="mt-12 rounded-[2rem] bg-red-500 p-8">
                                <p className="text-sm font-bold uppercase">Member Deal</p>
                                <h2 className="mt-2 text-5xl font-black">30% OFF</h2>
                                <p className="mt-3 text-red-100">
                                    Ưu đãi cho khách hàng mới tại KICKZONE.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full min-h-[520px] items-center justify-center">
                            <div className="flex items-center gap-10">
                                <h1 className="[writing-mode:vertical-rl] rotate-180 text-7xl font-black italic tracking-tight text-white">
                                    KICK<span className="text-red-500">ZONE</span>
                                </h1>

                                <div className="max-w-xs border-l border-zinc-700 pl-8">
                                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                                        New member
                                    </p>

                                    <h2 className="mt-4 text-3xl font-black leading-tight">
                                        Trở thành thành viên KICKZONE
                                    </h2>

                                    <p className="mt-5 leading-7 text-zinc-400">
                                        Tạo tài khoản để lưu sản phẩm yêu thích, quản lý thông tin cá nhân và nhận ưu đãi dành riêng cho thành viên.
                                    </p>

                                    <div className="mt-8 space-y-4 text-sm font-semibold text-zinc-300">
                                        <p>✓ Theo dõi đơn hàng nhanh chóng</p>
                                        <p>✓ Nhận mã giảm giá thành viên</p>
                                        <p>✓ Lưu sản phẩm yêu thích</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-7 md:p-9">
                    <p className="font-bold uppercase tracking-[0.3em] text-red-500">
                        Welcome
                    </p>

                    <h2 className="mt-2 text-4xl font-black">
                        {isOtpStep ? "Xác thực email" : isLogin ? "Đăng nhập" : "Đăng ký"}
                    </h2>

                    {isOtpStep && (
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Mã OTP gồm 6 chữ số đã được gửi tới{" "}
                            <span className="font-bold text-zinc-900">
                                {form.email}
                            </span>
                            . Mã có hiệu lực trong 5 phút.
                        </p>
                    )}

                    <form className="mt-6 space-y-3.5" onSubmit={(e) => e.preventDefault()}>
                        {isOtpStep ? (
                            <>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleVerifyOtp();
                                        }
                                    }}
                                    placeholder="Nhập mã OTP gồm 6 số"
                                    className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-red-500"
                                />

                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-red-500 py-3.5 font-black uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Đang xác thực..." : "Xác thực OTP"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    className="w-full rounded-2xl border border-zinc-300 py-4 font-bold text-zinc-700 transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Gửi lại mã OTP
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOtpStep(false);
                                        setOtp("");
                                    }}
                                    disabled={loading}
                                    className="w-full text-sm font-bold text-zinc-500 transition hover:text-red-500"
                                >
                                    Quay lại chỉnh thông tin đăng ký
                                </button>
                            </>
                        ) : (
                            <>
                                {!isLogin && (
                                    <input
                                        type="text"
                                        name="hoten"
                                        value={form.hoten}
                                        onChange={handleChange}
                                        placeholder="Họ và tên"
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                                    />
                                )}

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                                />

                                {!isLogin && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <input
                                            type="tel"
                                            name="sodienthoai"
                                            value={form.sodienthoai}
                                            onChange={handleChange}
                                            placeholder="Số điện thoại"
                                            maxLength={10}
                                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                                        />

                                        <input
                                            type="text"
                                            name="diachi"
                                            value={form.diachi}
                                            onChange={handleChange}
                                            placeholder="Địa chỉ"
                                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                                        />
                                    </div>
                                )}

                                <input
                                    type="password"
                                    name="matkhau"
                                    value={form.matkhau}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && isLogin) {
                                            handleLogin();
                                        }
                                    }}
                                    placeholder="Mật khẩu"
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                                />

                                {!isLogin && (
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập lại mật khẩu"
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                                    />
                                )}

                                {isLogin && (
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-2 text-zinc-500">
                                            <input type="checkbox" />
                                            Ghi nhớ đăng nhập
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => navigate("/forgot-password")}
                                            className="font-bold text-red-500"
                                        >
                                            Quên mật khẩu?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={isLogin ? handleLogin : handleRegister}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-red-500 py-3.5 font-black uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? isLogin
                                            ? "Đang đăng nhập..."
                                            : "Đang gửi OTP..."
                                        : isLogin
                                            ? "Đăng nhập"
                                            : "Tạo tài khoản"}
                                </button>
                            </>
                        )}
                    </form>

                    {!isOtpStep && (
                        <p className="mt-6 text-center text-zinc-500">
                            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}

                            <button
                                type="button"
                                onClick={handleSwitchMode}
                                className="font-bold text-red-500"
                            >
                                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                            </button>
                        </p>
                    )}
                </div>
            </section>
        </main >
    );
}

export default Auth;