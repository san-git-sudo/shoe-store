import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setMessage("Vui lòng nhập email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            setMessage("Email không hợp lệ.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await axios.post(
                "http://localhost:5000/api/auth/forgot-password",
                {
                    email: normalizedEmail
                }
            );

            setSent(true);
            setMessage(res.data.message);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Không thể gửi email đặt lại mật khẩu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32">
            <section className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl md:p-12">
                <p className="font-bold uppercase tracking-[0.3em] text-red-500">
                    KICKZONE
                </p>

                <h1 className="mt-3 text-4xl font-black text-zinc-900">
                    Quên mật khẩu
                </h1>

                <p className="mt-4 leading-7 text-zinc-500">
                    Nhập email đã đăng ký. KICKZONE sẽ gửi cho bạn liên kết đặt lại mật khẩu.
                </p>

                {!sent ? (
                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-zinc-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                autoComplete="email"
                                className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none transition focus:border-red-500"
                            />
                        </div>

                        {message && (
                            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-red-500 py-4 font-black uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                        </button>
                    </form>
                ) : (
                    <div className="mt-8 rounded-2xl bg-green-50 p-6">
                        <h2 className="text-xl font-black text-green-700">
                            Kiểm tra email của bạn
                        </h2>

                        <p className="mt-3 leading-7 text-green-700">
                            {message}
                        </p>

                        <p className="mt-3 text-sm text-green-600">
                            Liên kết chỉ có hiệu lực trong 15 phút.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSent(false);
                                setMessage("");
                            }}
                            className="mt-5 font-bold text-red-500"
                        >
                            Gửi lại bằng email khác
                        </button>
                    </div>
                )}

                <p className="mt-7 text-center text-zinc-500">
                    Đã nhớ mật khẩu?{" "}
                    <Link to="/login" className="font-bold text-red-500">
                        Quay lại đăng nhập
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default ForgotPassword;