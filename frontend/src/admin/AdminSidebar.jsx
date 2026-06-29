const menu = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Sản phẩm" },
    { key: "orders", label: "Đơn hàng" },
    { key: "customers", label: "Khách hàng" },
    { key: "revenue", label: "Doanh thu" },
    { key: "vouchers", label: "Khuyến mãi" },
    { key: "sizes", label: "Size giày" },
    { key: "colors", label: "Màu sắc" },
];

function AdminSidebar({ activePage, setActivePage }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-72 border-r border-[#D6D3D1] bg-[#ECE7E1] px-6 py-6">
            <h1 className="text-3xl font-black italic text-[#18181B]">
                KICK<span className="text-[#DC2626]">ZONE</span>
            </h1>

            <p className="mt-1 text-sm text-zinc-500">Luxury Admin Panel</p>

            <nav className="mt-10 space-y-2">
                {menu.map((item) => (
                    <button
                        key={item.key}
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

            <div className="absolute bottom-6 left-6 right-6">
                <button className="w-full rounded-2xl border border-[#D6D3D1] bg-white py-3 font-bold text-zinc-700 transition hover:border-[#DC2626] hover:text-[#DC2626]">
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;