const cartItems = [
    {
        id: 1,
        name: "KZ Runner Pro",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
        price: 1290000,
        size: "41",
        color: "Đỏ",
        quantity: 1,
    },
];

function formatPrice(value) {
    return value.toLocaleString("vi-VN") + "đ";
}

function Cart() {
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
            <section className="mx-auto max-w-7xl">
                <div className="mb-8 text-sm text-zinc-500">
                    <span className="text-red-500">Trang chủ</span> / Giỏ hàng (
                    {cartItems.length})
                </div>

                <h1 className="text-center text-4xl font-black">Giỏ hàng</h1>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-5">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="grid items-center gap-6 rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm md:grid-cols-[40px_120px_1fr_140px_150px]"
                            >
                                <button className="text-2xl text-zinc-400 hover:text-red-500">
                                    ×
                                </button>

                                <div className="h-24 w-24 overflow-hidden rounded-xl bg-zinc-100">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold">{item.name}</h3>
                                    <p className="mt-2 text-sm text-zinc-500">
                                        Size: {item.size} / Màu: {item.color}
                                    </p>
                                </div>

                                <p className="text-lg font-bold text-red-500">
                                    {formatPrice(item.price)}
                                </p>

                                <div className="flex h-11 w-36 items-center justify-between rounded-lg border border-zinc-300">
                                    <button className="h-full px-4 text-xl">−</button>
                                    <span className="font-bold">{item.quantity}</span>
                                    <button className="h-full px-4 text-xl">+</button>
                                </div>
                            </div>
                        ))}

                        <div className="mt-10">
                            <label className="text-xl font-bold">Ghi chú đơn hàng</label>
                            <textarea
                                className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#D6D3D1] bg-white p-4 outline-none focus:border-red-500"
                                placeholder="Nhập ghi chú cho đơn hàng..."
                            />
                        </div>
                    </div>

                    <aside className="h-fit rounded-[2rem] border border-[#D6D3D1] bg-[#ECE7E1] p-8 shadow-sm">
                        <label className="flex items-center gap-3 text-lg">
                            <input type="checkbox" className="h-5 w-5" />
                            Xuất hóa đơn công ty
                        </label>

                        <div className="mt-8 flex items-center justify-between">
                            <h2 className="text-2xl font-black">TỔNG CỘNG</h2>
                            <p className="text-2xl font-black text-red-500">
                                {formatPrice(subtotal)}
                            </p>
                        </div>

                        <p className="mt-2 text-right text-sm font-bold italic text-zinc-500">
                            Đã bao gồm VAT nếu có
                        </p>

                        <div className="my-8 border-t border-zinc-300" />

                        <div className="flex items-center justify-between">
                            <b>🎟 Mã giảm giá</b>
                            <button className="font-bold text-blue-600">
                                Chọn mã giảm giá ›
                            </button>
                        </div>

                        <button className="mt-8 w-full rounded-2xl bg-[#18181B] py-4 text-lg font-bold text-white transition hover:bg-red-600">
                            Thanh Toán
                        </button>
                        <div className="mt-6 flex gap-3">
                            <div className="flex h-12 w-28 items-center justify-center rounded-xl border border-[#D6D3D1] bg-white shadow-sm transition hover:border-blue-500">
                                <span className="font-black text-blue-500">
                                    ZaloPay
                                </span>
                            </div>

                            <div className="flex h-12 w-24 items-center justify-center rounded-xl border border-[#D6D3D1] bg-white shadow-sm transition hover:border-green-500">
                                <span className="font-black text-green-600">
                                    COD
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}

export default Cart;