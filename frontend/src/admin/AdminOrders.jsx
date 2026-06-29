const orders = [
    ["#KZ1024", "Nguyễn Thanh Hậu", "KZ Runner Pro", "1.290.000đ", "Đã giao"],
    ["#KZ1025", "Trần Minh Anh", "KZ Cloud X", "1.190.000đ", "Đang xử lý"],
    ["#KZ1026", "Lê Hoàng Nam", "KZ Impact High", "1.390.000đ", "Đang giao"],
    ["#KZ1027", "Phạm Gia Bảo", "KZ Street Lite", "990.000đ", "Đã hủy"],
];

function AdminOrders() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">Quản lý</p>
            <h2 className="mt-2 text-5xl font-black">Đơn hàng</h2>

            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                <table className="w-full text-left text-sm">
                    <thead className="text-zinc-500">
                        <tr>
                            <th className="py-4">Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr className="border-t border-[#ECE7E1]" key={o[0]}>
                                {o.map((x) => (
                                    <td className="py-4 font-medium" key={x}>{x}</td>
                                ))}
                                <td>
                                    <select className="rounded-xl border border-[#D6D3D1] px-3 py-2">
                                        <option>Đang xử lý</option>
                                        <option>Đang giao</option>
                                        <option>Đã giao</option>
                                        <option>Đã hủy</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default AdminOrders;