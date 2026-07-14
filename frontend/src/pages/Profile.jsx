import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
    const navigate = useNavigate();

    // Trạng thái tải thông tin tài khoản
    const [loading, setLoading] = useState(true);

    // Trạng thái đang lưu thông tin
    const [saving, setSaving] = useState(false);

    // Bật hoặc tắt chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);

    // Dữ liệu tài khoản
    const [form, setForm] = useState({
        hoten: "",
        email: "",
        sodienthoai: "",
        diachi: "",
        vaitro: ""
    });

    // Dùng để khôi phục dữ liệu nếu người dùng bấm Hủy
    const [originalForm, setOriginalForm] = useState({
        hoten: "",
        email: "",
        sodienthoai: "",
        diachi: "",
        vaitro: ""
    });

    // ======================================================
    // Lấy thông tin tài khoản khi mở trang Profile
    // ======================================================
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            // Chưa đăng nhập thì quay về trang đăng nhập
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const res = await axios.get(
                    "http://localhost:5000/api/auth/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const profileData = {
                    hoten: res.data.data.hoten || "",
                    email: res.data.data.email || "",
                    sodienthoai: res.data.data.sodienthoai || "",
                    diachi: res.data.data.diachi || "",
                    vaitro: res.data.data.vaitro || ""
                };

                setForm(profileData);
                setOriginalForm(profileData);
            } catch (error) {
                // Token hết hạn hoặc không hợp lệ
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    navigate("/login", { replace: true });
                    return;
                }

                alert(
                    error.response?.data?.message ||
                    "Không thể lấy thông tin tài khoản."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // ======================================================
    // Xử lý nhập dữ liệu
    // ======================================================
    const handleChange = (e) => {
        let { name, value } = e.target;

        // Chỉ cho nhập số ở ô số điện thoại
        if (name === "sodienthoai") {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    // ======================================================
    // Kiểm tra dữ liệu trước khi cập nhật
    // ======================================================
    const validateProfile = () => {
        if (form.hoten.trim().length < 2) {
            alert("Họ và tên không hợp lệ.");
            return false;
        }

        const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;

        if (!phoneRegex.test(form.sodienthoai)) {
            alert("Số điện thoại không hợp lệ.");
            return false;
        }

        if (!form.diachi.trim()) {
            alert("Vui lòng nhập địa chỉ.");
            return false;
        }

        return true;
    };

    // ======================================================
    // Cập nhật thông tin tài khoản
    // ======================================================
    const handleUpdate = async () => {
        if (!validateProfile()) return;

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            setSaving(true);

            const res = await axios.put(
                "http://localhost:5000/api/auth/profile",
                {
                    hoten: form.hoten.trim(),
                    sodienthoai: form.sodienthoai,
                    diachi: form.diachi.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const profileData = {
                hoten: res.data.data.hoten || "",
                email: res.data.data.email || "",
                sodienthoai: res.data.data.sodienthoai || "",
                diachi: res.data.data.diachi || "",
                vaitro: res.data.data.vaitro || ""
            };

            setForm(profileData);
            setOriginalForm(profileData);
            setIsEditing(false);

            // Cập nhật lại tên trong localStorage
            const oldUser = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...oldUser,
                    hoten: profileData.hoten,
                    email: profileData.email,
                    vaitro: profileData.vaitro
                })
            );

            alert(res.data.message);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", { replace: true });
                return;
            }

            alert(
                error.response?.data?.message ||
                "Cập nhật thông tin thất bại."
            );
        } finally {
            setSaving(false);
        }
    };

    // ======================================================
    // Hủy chỉnh sửa
    // Khôi phục lại dữ liệu ban đầu
    // ======================================================
    const handleCancelEdit = () => {
        setForm(originalForm);
        setIsEditing(false);
    };

    // ======================================================
    // Đăng xuất
    // ======================================================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
    };

    // Lấy chữ cái đầu để làm avatar
    const avatarLetter = form.hoten
        ? form.hoten.trim().charAt(0).toUpperCase()
        : "K";

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32">
                <div className="mx-auto max-w-7xl py-20 text-center">
                    <p className="font-bold text-zinc-700">
                        Đang tải thông tin tài khoản...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32">
            <section className="mx-auto max-w-7xl">
                {/* Tiêu đề trang */}
                <div className="mb-10">
                    <p className="font-bold uppercase tracking-[0.3em] text-red-500">
                        My account
                    </p>

                    <h1 className="mt-3 text-4xl font-black text-zinc-900">
                        Tài khoản của tôi
                    </h1>
                </div>

                <div className="grid items-start gap-10 lg:grid-cols-[280px_1fr]">
                    {/* ==================================================
                        SIDEBAR BÊN TRÁI
                    ================================================== */}
                    <aside className="rounded-[2rem] bg-white p-7 shadow-xl">
                        {/* Avatar */}
                        <div className="flex flex-col items-center border-b border-zinc-200 pb-7">
                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-500 text-5xl font-black text-white shadow-lg">
                                {avatarLetter}
                            </div>

                            <p className="mt-5 text-sm text-zinc-500">
                                Xin chào
                            </p>

                            <h2 className="mt-1 text-center text-xl font-black text-zinc-900">
                                {form.hoten || "Khách hàng KICKZONE"}
                            </h2>

                            <span className="mt-3 rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase text-red-500">
                                {form.vaitro === "admin" ? "Quản trị viên" : "Khách hàng"}
                            </span>
                        </div>

                        {/* Menu sidebar */}
                        <div className="mt-6 space-y-3">
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-xl bg-red-500 px-4 py-3 text-left font-bold text-white"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                    👤
                                </span>

                                Thông tin tài khoản
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-zinc-600 transition hover:bg-red-50 hover:text-red-500"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                                    ↪
                                </span>

                                Đăng xuất
                            </button>
                        </div>
                    </aside>

                    {/* ==================================================
                        NỘI DUNG BÊN PHẢI
                    ================================================== */}
                    <section className="rounded-[2rem] bg-white p-8 shadow-xl md:p-10">
                        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-7 md:flex-row md:items-center">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                                    Hồ sơ cá nhân
                                </p>

                                <h2 className="mt-2 text-3xl font-black text-zinc-900">
                                    Thông tin tài khoản
                                </h2>

                                <p className="mt-2 text-zinc-500">
                                    Quản lý và cập nhật thông tin cá nhân của bạn.
                                </p>
                            </div>

                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-xl bg-zinc-900 px-6 py-3 font-bold uppercase text-white transition hover:bg-red-500"
                                >
                                    Cập nhật thông tin
                                </button>
                            )}
                        </div>

                        {/* Chế độ xem thông tin */}
                        {!isEditing && (
                            <div className="mt-8 space-y-6">
                                <div className="grid gap-3 border-b border-zinc-100 pb-5 sm:grid-cols-[180px_1fr]">
                                    <p className="font-bold text-zinc-500">
                                        Họ và tên
                                    </p>

                                    <p className="font-semibold text-zinc-900">
                                        {form.hoten || "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div className="grid gap-3 border-b border-zinc-100 pb-5 sm:grid-cols-[180px_1fr]">
                                    <p className="font-bold text-zinc-500">
                                        Email
                                    </p>

                                    <p className="font-semibold text-zinc-900">
                                        {form.email}
                                    </p>
                                </div>

                                <div className="grid gap-3 border-b border-zinc-100 pb-5 sm:grid-cols-[180px_1fr]">
                                    <p className="font-bold text-zinc-500">
                                        Số điện thoại
                                    </p>

                                    <p className="font-semibold text-zinc-900">
                                        {form.sodienthoai || "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div className="grid gap-3 border-b border-zinc-100 pb-5 sm:grid-cols-[180px_1fr]">
                                    <p className="font-bold text-zinc-500">
                                        Địa chỉ
                                    </p>

                                    <p className="font-semibold leading-7 text-zinc-900">
                                        {form.diachi || "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-red-50 p-6">
                                    <p className="font-black text-zinc-900">
                                        Thành viên KICKZONE
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                                        Theo dõi các chương trình khuyến mãi và ưu đãi dành riêng cho thành viên.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chế độ chỉnh sửa */}
                        {isEditing && (
                            <div className="mt-8 space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-zinc-700">
                                        Họ và tên
                                    </label>

                                    <input
                                        type="text"
                                        name="hoten"
                                        value={form.hoten}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none transition focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-zinc-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={form.email}
                                        disabled
                                        className="w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-100 px-5 py-4 text-zinc-500"
                                    />

                                    <p className="mt-2 text-xs text-zinc-400">
                                        Email đăng nhập không thể thay đổi tại đây.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-zinc-700">
                                        Số điện thoại
                                    </label>

                                    <input
                                        type="tel"
                                        name="sodienthoai"
                                        value={form.sodienthoai}
                                        onChange={handleChange}
                                        maxLength={10}
                                        className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none transition focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-zinc-700">
                                        Địa chỉ
                                    </label>

                                    <textarea
                                        name="diachi"
                                        value={form.diachi}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full resize-none rounded-2xl border border-zinc-200 px-5 py-4 outline-none transition focus:border-red-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="rounded-xl border border-zinc-300 px-6 py-3 font-bold text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-60"
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className="rounded-xl bg-red-500 px-7 py-3 font-black uppercase text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
}

export default Profile;