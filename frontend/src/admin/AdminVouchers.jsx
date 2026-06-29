const vouchers = [
    ["KZSALE30", "Giảm 30%", "Đơn từ 1.000.000đ", "Đang chạy"],
    ["FREESHIP", "Miễn phí ship", "Đơn từ 500.000đ", "Đang chạy"],
    ["NEWUSER", "Giảm 15%", "Khách hàng mới", "Sắp hết hạn"],
    ["SUMMER10", "Giảm 10%", "Toàn bộ sản phẩm", "Tạm dừng"],
];

function AdminVouchers() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">Quản lý</p>
                    <h2 className="mt-2 text-5xl font-black">Voucher</h2>
                </div>
                <button className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white">
                    + Tạo voucher
                </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {vouchers.map((v) => (
                    <div key={v[0]} className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-[#DC2626]">{v[0]}</h3>
                                <p className="mt-2 text-xl font-bold">{v[1]}</p>
                                <p className="mt-2 text-zinc-500">{v[2]}</p>
                            </div>
                            <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-[#DC2626]">
                                {v[3]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default AdminVouchers;