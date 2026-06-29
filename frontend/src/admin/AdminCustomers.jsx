const customers = [
    ["Nguyễn Thanh Hậu", "hau@gmail.com", "5 đơn", "6.450.000đ"],
    ["Trần Minh Anh", "minhanh@gmail.com", "3 đơn", "3.180.000đ"],
    ["Lê Hoàng Nam", "nam@gmail.com", "8 đơn", "9.900.000đ"],
    ["Phạm Gia Bảo", "bao@gmail.com", "2 đơn", "2.080.000đ"],
];

function AdminCustomers() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">Quản lý</p>
            <h2 className="mt-2 text-5xl font-black">Khách hàng</h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {customers.map((c) => (
                    <div key={c[1]} className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                        <h3 className="text-2xl font-black">{c[0]}</h3>
                        <p className="mt-2 text-zinc-500">{c[1]}</p>
                        <div className="mt-5 flex justify-between">
                            <span className="font-bold text-[#DC2626]">{c[2]}</span>
                            <span className="font-bold">{c[3]}</span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default AdminCustomers;