const orders = [
    {
        id: "#KZ1024",
        date: "25/05/2026",
        product: "KZ Runner Pro",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
        size: "41",
        color: "Đỏ",
        total: "1.290.000đ",
        status: "Đã giao",
    },
    {
        id: "#KZ1025",
        date: "24/05/2026",
        product: "KZ Cloud X",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700",
        size: "40",
        color: "Nâu",
        total: "1.190.000đ",
        status: "Đang giao",
    },
    {
        id: "#KZ1026",
        date: "22/05/2026",
        product: "KZ Impact High",
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700",
        size: "42",
        color: "Trắng",
        total: "1.390.000đ",
        status: "Đang xử lý",
    },
];

function OrderHistory() {
    return (
        <main className="min-h-screen bg-[#0F0F0F] px-6 pb-20 pt-32 text-white">
            <section className="mx-auto max-w-7xl">
                <p className="font-bold uppercase tracking-[0.35em] text-red-500">
                    Tài khoản của tôi
                </p>

                <h1 className="mt-3 text-5xl font-black uppercase">
                    Lịch sử đặt hàng
                </h1>

                <p className="mt-4 max-w-2xl text-zinc-400">
                    Theo dõi trạng thái đơn hàng, sản phẩm đã mua và thông tin giao dịch
                    của bạn tại KICKZONE.
                </p>

                <div className="mt-10 space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-5"
                        >
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div className="flex gap-5">
                                    <div className="h-28 w-28 overflow-hidden rounded-2xl bg-white">
                                        <img
                                            src={order.image}
                                            alt={order.product}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm text-zinc-400">{order.id}</p>
                                        <h3 className="mt-1 text-2xl font-black">
                                            {order.product}
                                        </h3>

                                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">
                                            <span>Ngày đặt: {order.date}</span>
                                            <span>•</span>
                                            <span>Size: {order.size}</span>
                                            <span>•</span>
                                            <span>Màu: {order.color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right">
                                    <p className="text-2xl font-black text-red-500">
                                        {order.total}
                                    </p>

                                    <span className="mt-3 inline-block rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500">
                                        {order.status}
                                    </span>

                                    <div className="mt-4 flex gap-3 md:justify-end">
                                        <button className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:border-red-500 hover:text-red-500">
                                            Xem chi tiết
                                        </button>
                                        <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold transition hover:bg-red-600">
                                            Mua lại
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default OrderHistory;