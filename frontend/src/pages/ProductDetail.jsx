import { products } from "../data/products.jsx";

function ProductDetail() {
    const product = products[0];

    return (
        <main className="min-h-screen bg-[#0F0F0F] px-6 pb-20 pt-32 text-white">
            <section className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6">
                    <div className="overflow-hidden rounded-[1.5rem] bg-white">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-[520px] w-full object-cover"
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="cursor-pointer rounded-2xl border border-zinc-700 bg-white p-2 transition hover:border-red-500"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-24 w-full rounded-xl object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-3 font-bold uppercase tracking-[0.35em] text-red-500">
                        Sneaker Premium
                    </p>

                    <h1 className="text-5xl font-black uppercase leading-tight">
                        {product.name}
                    </h1>

                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-red-500">★★★★★</span>
                        <span className="text-zinc-400">{product.rating} / 5</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-400">Đã bán 1.2k</span>
                    </div>

                    <div className="mt-8 flex items-end gap-4">
                        <span className="text-4xl font-black text-red-500">
                            {product.price}
                        </span>
                        <span className="text-xl text-zinc-500 line-through">
                            {product.oldPrice}
                        </span>
                    </div>

                    <p className="mt-6 max-w-xl leading-8 text-zinc-300">
                        Mẫu giày được thiết kế cho phong cách đường phố hiện đại, form dáng
                        mạnh mẽ, đế êm, chất liệu bền bỉ và phù hợp cho cả đi học, đi chơi,
                        tập luyện nhẹ.
                    </p>

                    <div className="mt-8">
                        <h3 className="mb-4 font-bold uppercase">Chọn size</h3>
                        <div className="grid max-w-md grid-cols-5 gap-3">
                            {["38", "39", "40", "41", "42", "43", "44"].map((size) => (
                                <button
                                    key={size}
                                    className="rounded-xl border border-zinc-700 py-3 font-bold transition hover:border-red-500 hover:bg-red-500"
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-4 font-bold uppercase">Màu sắc</h3>
                        <div className="flex gap-3">
                            <button className="h-10 w-10 rounded-full border-2 border-white bg-red-500" />
                            <button className="h-10 w-10 rounded-full border border-zinc-600 bg-white" />
                            <button className="h-10 w-10 rounded-full border border-zinc-600 bg-zinc-900" />
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <button className="rounded-2xl bg-red-500 px-10 py-4 font-black uppercase text-white transition hover:bg-red-600">
                            Thêm vào giỏ hàng
                        </button>
                        <button className="rounded-2xl border border-zinc-700 px-10 py-4 font-black uppercase text-white transition hover:border-red-500 hover:text-red-500">
                            Mua ngay
                        </button>
                    </div>

                    <div className="mt-10 grid max-w-xl gap-4 text-sm text-zinc-300 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            🚚 Freeship từ 500k
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            🔁 Đổi trả 7 ngày
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            🛡 Chính hãng 100%
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ProductDetail;