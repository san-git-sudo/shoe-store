const colors = [
    { id: 1, name: "Đỏ thể thao", code: "#DC2626", products: 18, status: "Đang dùng" },
    { id: 2, name: "Trắng basic", code: "#FFFFFF", products: 25, status: "Đang dùng" },
    { id: 3, name: "Xám khói", code: "#71717A", products: 14, status: "Đang dùng" },
    { id: 4, name: "Nâu beige", code: "#C2A878", products: 9, status: "Đang dùng" },
    { id: 5, name: "Xanh navy", code: "#1E3A8A", products: 7, status: "Ít sản phẩm" },
    { id: 6, name: "Kem vintage", code: "#F5E6C8", products: 11, status: "Đang dùng" },
];

function AdminColors() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý thuộc tính
                    </p>
                    <h2 className="mt-2 text-5xl font-black">Màu sắc</h2>
                </div>

                <button className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white">
                    + Thêm màu
                </button>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-3">
                {colors.slice(0, 3).map((item) => (
                    <div
                        key={item.id}
                        className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="h-14 w-14 rounded-2xl border border-[#D6D3D1]"
                                style={{ backgroundColor: item.code }}
                            />
                            <div>
                                <h3 className="text-xl font-black">{item.name}</h3>
                                <p className="text-sm text-zinc-500">{item.code}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                <table className="w-full text-left text-sm">
                    <thead className="text-zinc-500">
                        <tr>
                            <th className="py-4">ID</th>
                            <th>Màu</th>
                            <th>Mã màu</th>
                            <th>Số sản phẩm</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {colors.map((item) => (
                            <tr key={item.id} className="border-t border-[#ECE7E1]">
                                <td className="py-4 font-bold">#{item.id}</td>

                                <td>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-xl border border-[#D6D3D1]"
                                            style={{ backgroundColor: item.code }}
                                        />
                                        <span className="font-bold">{item.name}</span>
                                    </div>
                                </td>

                                <td className="font-medium text-zinc-500">{item.code}</td>
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

export default AdminColors;