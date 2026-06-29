const stats = [
    { title: "Doanh thu", value: "128.5M", desc: "+12% tháng này" },
    { title: "Đơn hàng", value: "1,248", desc: "86 đơn hôm nay" },
    { title: "Sản phẩm", value: "324", desc: "18 sản phẩm mới" },
    { title: "Khách hàng", value: "8,902", desc: "+240 người dùng" },
];

const orders = [
    {
        id: "#KZ1024",
        customer: "Nguyễn Thanh Hậu",
        product: "KZ Runner Pro",
        price: "1.290.000đ",
        status: "Đã giao",
    },
    {
        id: "#KZ1025",
        customer: "Trần Minh Anh",
        product: "KZ Cloud X",
        price: "1.190.000đ",
        status: "Đang xử lý",
    },
    {
        id: "#KZ1026",
        customer: "Lê Hoàng Nam",
        product: "KZ Impact High",
        price: "1.390.000đ",
        status: "Đang giao",
    },
    {
        id: "#KZ1027",
        customer: "Phạm Gia Bảo",
        product: "KZ Street Lite",
        price: "990.000đ",
        status: "Đã hủy",
    },
];

function AdminDashboard() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Luxury Admin
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                        Dashboard
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        placeholder="Tìm kiếm..."
                        className="w-72 rounded-2xl border border-[#D6D3D1] bg-white px-5 py-3 outline-none transition focus:border-[#DC2626]"
                    />

                    <button className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white shadow-lg shadow-red-500/20">
                        Tìm sản phẩm
                    </button>
                </div>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.title}
                        className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm font-bold text-zinc-500">
                            {item.title}
                        </p>

                        <h3 className="mt-3 text-4xl font-black">
                            {item.value}
                        </h3>

                        <p className="mt-2 text-sm text-[#DC2626]">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-black">
                            Đơn hàng gần đây
                        </h3>

                        <button className="font-bold text-[#DC2626]">
                            Xem tất cả
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-[#E7E2DA]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F8F5F1] text-zinc-500">
                                <tr>
                                    <th className="px-5 py-4">Mã đơn</th>
                                    <th className="px-5 py-4">Khách hàng</th>
                                    <th className="px-5 py-4">Sản phẩm</th>
                                    <th className="px-5 py-4">Giá</th>
                                    <th className="px-5 py-4">Trạng thái</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-t border-[#ECE7E1]"
                                    >
                                        <td className="px-5 py-4 font-bold">
                                            {order.id}
                                        </td>

                                        <td className="px-5 py-4">
                                            {order.customer}
                                        </td>

                                        <td className="px-5 py-4">
                                            {order.product}
                                        </td>

                                        <td className="px-5 py-4 font-bold text-[#DC2626]">
                                            {order.price}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#DC2626]">
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <h3 className="text-2xl font-black">
                        Sản phẩm bán chạy
                    </h3>

                    <div className="mt-6 space-y-5">
                        {["KZ Runner Pro", "KZ Cloud X", "KZ Impact High"].map(
                            (item, index) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-bold">{item}</p>

                                        <p className="text-sm text-zinc-500">
                                            {320 - index * 80} lượt bán
                                        </p>
                                    </div>

                                    <span className="rounded-xl bg-[#F3F0EA] px-3 py-2 font-black text-[#DC2626]">
                                        #{index + 1}
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    <div className="mt-8 rounded-[2rem] bg-[#DC2626] p-6 text-white">
                        <p className="text-sm font-bold uppercase">
                            Sale Campaign
                        </p>

                        <h4 className="mt-2 text-4xl font-black">
                            30% OFF
                        </h4>

                        <p className="mt-2 text-sm text-red-100">
                            Chiến dịch khuyến mãi đang hoạt động.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;