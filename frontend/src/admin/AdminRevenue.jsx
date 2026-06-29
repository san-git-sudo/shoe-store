const months = [
    ["Tháng 1", "18.5M"],
    ["Tháng 2", "24.2M"],
    ["Tháng 3", "31.8M"],
    ["Tháng 4", "28.9M"],
    ["Tháng 5", "42.6M"],
];

function AdminRevenue() {
    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">Thống kê</p>
            <h2 className="mt-2 text-5xl font-black">Doanh thu</h2>

            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-8">
                <h3 className="text-2xl font-black">Doanh thu theo tháng</h3>

                <div className="mt-8 space-y-5">
                    {months.map((m, index) => (
                        <div key={m[0]}>
                            <div className="mb-2 flex justify-between font-bold">
                                <span>{m[0]}</span>
                                <span className="text-[#DC2626]">{m[1]}</span>
                            </div>
                            <div className="h-4 rounded-full bg-[#ECE7E1]">
                                <div
                                    className="h-4 rounded-full bg-[#DC2626]"
                                    style={{ width: `${45 + index * 10}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default AdminRevenue;