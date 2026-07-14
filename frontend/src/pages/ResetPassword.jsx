import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        matkhau: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage("Liên kết đặt lại mật khẩu không hợp lệ.");
            return;
        }

        if (form.matkhau.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (form.matkhau !== form.confirmPassword) {
            setMessage("Mật khẩu nhập lại không khớp.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await axios.post(
                `http://localhost:5000/api/auth/reset-password/${token}`,
                {
                    matkhau: form.matkhau
                }
            );

            setSuccess(true);
            setMessage(res.data.message);

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        } catch (error) {
            setSuccess(false);

            setMessage(
                error.response?.data?.message ||
                "Không thể đặt lại mật khẩu."
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
                    Đặt lại mật khẩu
                </h1>

                <p className="mt-4 leading-7 text-zinc-500">
                    Nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-zinc-700">
                            Mật khẩu mới
                        </label>

                        <input
                            type="password"
                            name="matkhau"
                            value={form.matkhau}
                            onChange={handleChange}
                            placeholder="Tối thiểu 6 ký tự"
                            autoComplete="new-password"
                            disabled={success}
                            className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none transition focus:border-red-500 disabled:bg-zinc-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-zinc-700">
                            Nhập lại mật khẩu
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                            disabled={success}
                            className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none transition focus:border-red-500 disabled:bg-zinc-100"
                        />
                    </div>

                    {message && (
                        <p
                            className={`rounded-xl px-4 py-3 text-sm font-semibold ${success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-600"
                                }`}
                        >
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full rounded-2xl bg-red-500 py-4 font-black uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Đang cập nhật..."
                            : success
                                ? "Đã đổi mật khẩu"
                                : "Đổi mật khẩu"}
                    </button>
                </form>

                <p className="mt-7 text-center text-zinc-500">
                    <Link to="/login" className="font-bold text-red-500">
                        Quay lại đăng nhập
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default ResetPassword;