const vouchers = [
    {
        id: 1,
        code: "GIFT3000",
        name: "Gift Voucher 3.000.000 đồng",
        price: "3.000.000 đ",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900",
    },
    {
        id: 2,
        code: "GIFT500",
        name: "Gift Voucher 500.000 đồng",
        price: "500.000 đ",
        image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=900",
    },
    {
        id: 3,
        code: "GIFT2000",
        name: "Gift Voucher 2.000.000 đồng",
        price: "2.000.000 đ",
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900",
    },
];

function Vouchers() {
    return (
        <main className="min-h-screen bg-[#F8F5F1] px-6 pb-24 pt-32 text-black">
            <section className="mx-auto max-w-7xl">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold uppercase tracking-tight">
                        Gift Voucher
                    </h1>
                    <p className="mt-3 text-base text-black">Gift voucher</p>
                </div>

                <div className="mt-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h2 className="text-3xl font-normal uppercase">Gift Voucher</h2>
                        <span className="text-lg">3</span>
                    </div>

                    <div className="hidden items-center gap-8 md:flex">
                        <select className="h-14 w-24 bg-[#F1F1F1] px-5 outline-none">
                            <option>12</option>
                        </select>

                        <select className="h-14 w-56 bg-[#F1F1F1] px-5 outline-none">
                            <option>Mới nhất</option>
                            <option>Giá thấp đến cao</option>
                            <option>Giá cao đến thấp</option>
                        </select>
                    </div>
                </div>

                <div className="mt-10 grid gap-8 md:grid-cols-3">
                    {vouchers.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.1)]"
                        >
                            <div className="h-[390px] overflow-hidden bg-white">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="px-5 pb-6 pt-5">
                                <h3 className="text-xl font-normal leading-7">
                                    {item.name}
                                </h3>
                                <p className="mt-3 text-xl font-semibold text-black">
                                    {item.price}
                                </p>
                            </div>
                            <div className="mt-4 flex items-center overflow-hidden rounded-2xl border border-red-200 bg-[#FFF5F5]">
                                <div className="flex-1 px-5 py-4">
                                    <p className="text-xs font-medium text-zinc-400">Mã ưu đãi</p>
                                    <span className="mt-1 block font-black tracking-[0.25em] text-red-500">
                                        {item.code}
                                    </span>
                                </div>

                                <button className="h-full border-l border-dashed border-red-300 px-5 py-5 text-sm font-black uppercase text-[#18181B] transition hover:bg-red-500 hover:text-white">
                                    Copy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Vouchers;