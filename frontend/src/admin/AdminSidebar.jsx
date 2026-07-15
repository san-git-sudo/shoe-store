import { useNavigate } from "react-router-dom";

const menu = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Sản phẩm" },
    { key: "orders", label: "Đơn hàng" },
    { key: "customers", label: "Khách hàng" },
    { key: "revenue", label: "Doanh thu" },
    { key: "vouchers", label: "Khuyến mãi" },
    { key: "sizes", label: "Size giày" },
    { key: "colors", label: "Màu sắc" },
    { key: "cates", label: "Danh mục" },
    { key: "brands", label: "Hãng" }
];

function AdminSidebar({ activePage, setActivePage }) {
    const navigate = useNavigate();

    // ======================================================
    // Đăng xuất khỏi trang quản trị
    // ======================================================
    const handleLogout = () => {
        // Xóa JWT dùng để xác thực tài khoản
        localStorage.removeItem("token");

        // Xóa thông tin người dùng đang đăng nhập
        localStorage.removeItem("user");

        // Không xóa shoe_cart vì giỏ hàng có thể vẫn được giữ lại
        // cho người dùng trên cùng trình duyệt.

        // Chuyển về trang đăng nhập và không cho quay lại Admin
        // bằng nút Back của trình duyệt.
        navigate("/login", { replace: true });
    };

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-[#D6D3D1] bg-[#ECE7E1] px-6 py-6">
            {/* Logo luôn cố định ở phía trên */}
            <div className="shrink-0">
                <h1 className="text-3xl font-black italic text-[#18181B]">
                    KICK<span className="text-[#DC2626]">ZONE</span>
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                    Luxury Admin Panel
                </p>
            </div>

            {/* Chỉ phần menu được cuộn */}
            <nav className="mt-8 min-h-0 flex-1 space-y-2 overflow-y-auto pr-2 pb-4">
                {menu.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setActivePage(item.key)}
                        className={`w-full rounded-2xl px-4 py-3 text-left font-bold transition ${activePage === item.key
                                ? "bg-[#DC2626] text-white shadow-lg shadow-red-500/20"
                                : "text-zinc-700 hover:bg-white hover:text-[#DC2626]"
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Nút đăng xuất luôn cố định ở phía dưới */}
            <div className="shrink-0 border-t border-[#D6D3D1] pt-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl border border-[#D6D3D1] bg-white py-3 font-bold text-zinc-700 transition hover:border-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                >
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;