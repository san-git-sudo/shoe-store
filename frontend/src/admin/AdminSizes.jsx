const sizes = [
    { id: 1, size: "38", type: "Nam/Nữ", products: 12, status: "Đang dùng" },
    { id: 2, size: "39", type: "Nam/Nữ", products: 18, status: "Đang dùng" },
    { id: 3, size: "40", type: "Nam", products: 24, status: "Đang dùng" },
    { id: 4, size: "41", type: "Nam", products: 20, status: "Đang dùng" },
    { id: 5, size: "42", type: "Nam", products: 16, status: "Đang dùng" },
    { id: 6, size: "43", type: "Nam", products: 9, status: "Sắp hết hàng" },
    { id: 7, size: "44", type: "Nam", products: 6, status: "Sắp hết hàng" },
];

function AdminSizes() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý thuộc tính
                    </p>
                    <h2 className="mt-2 text-5xl font-black">Size giày</h2>
                </div>

                <button className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white">
                    + Thêm size
                </button>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-4">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Tổng size</p>
                    <h3 className="mt-3 text-4xl font-black">7</h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Size phổ biến</p>
                    <h3 className="mt-3 text-4xl font-black text-[#DC2626]">40</h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Sản phẩm có size</p>
                    <h3 className="mt-3 text-4xl font-black">105</h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Sắp hết hàng</p>
                    <h3 className="mt-3 text-4xl font-black">2</h3>
                </div>
            </section>

            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                <table className="w-full text-left text-sm">
                    <thead className="text-zinc-500">
                        <tr>
                            <th className="py-4">ID</th>
                            <th>Size</th>
                            <th>Loại</th>
                            <th>Số sản phẩm</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sizes.map((item) => (
                            <tr key={item.id} className="border-t border-[#ECE7E1]">
                                <td className="py-4 font-bold">#{item.id}</td>
                                <td>
                                    <span className="rounded-xl bg-[#F3F0EA] px-4 py-2 text-lg font-black text-[#DC2626]">
                                        {item.size}
                                    </span>
                                </td>
                                <td className="font-medium">{item.type}</td>
                                <td className="font-medium">{item.products}</td>
                                <td>
                                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#DC2626]">
                                        {item.status}
                                    </span>
                                </td>
                                <td className="space-x-3">
                                    <button className="font-bold text-[#DC2626]">Sửa</button>
                                    <button className="font-bold text-zinc-500">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default AdminSizes;