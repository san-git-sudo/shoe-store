const products = [
    ["KZ Runner Pro", "Nike", "Running", "1.290.000đ", "86", "Đang bán"],
    ["KZ Cloud X", "Adidas", "Lifestyle", "1.190.000đ", "42", "Đang bán"],
    ["KZ Impact High", "Puma", "Training", "1.390.000đ", "55", "Đang bán"],
    ["KZ Street Lite", "New Balance", "Casual", "990.000đ", "18", "Sắp hết"],
];

function AdminProducts() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">Quản lý</p>
                    <h2 className="mt-2 text-5xl font-black">Sản phẩm</h2>
                </div>
                <button className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white">
                    + Thêm sản phẩm
                </button>
            </div>

            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                <table className="w-full text-left text-sm">
                    <thead className="text-zinc-500">
                        <tr>
                            <th className="py-4">Tên</th>
                            <th>Hãng</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr className="border-t border-[#ECE7E1]" key={p[0]}>
                                {p.map((x) => (
                                    <td className="py-4 font-medium" key={x}>{x}</td>
                                ))}
                                <td className="space-x-3 py-4">
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

export default AdminProducts;