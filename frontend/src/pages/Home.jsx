import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard.jsx";
import { products } from "../data/products";

function Home() {
    return (
        <main className="bg-[#0F0F0F]">
            <Hero />

            <section className="border-y border-zinc-200 bg-white py-8 shadow-sm">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
                    <div>
                        <b>🚚 Miễn phí giao hàng</b>
                        <p className="text-sm text-zinc-500">Cho đơn từ 500.000đ</p>
                    </div>
                    <div>
                        <b>🔁 Đổi trả dễ dàng</b>
                        <p className="text-sm text-zinc-500">Trong 7 ngày</p>
                    </div>
                    <div>
                        <b>🛡 Chính hãng 100%</b>
                        <p className="text-sm text-zinc-500">Cam kết chất lượng</p>
                    </div>
                    <div>
                        <b>🎧 Hỗ trợ 24/7</b>
                        <p className="text-sm text-zinc-500">Tận tâm phục vụ</p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="mb-10 flex items-center justify-between">
                    <h2 className="border-l-4 border-red-500 pl-4 text-3xl font-black uppercase text-white">
                        Sản phẩm nổi bật
                    </h2>
                    <a className="font-bold text-red-500" href="#">Xem tất cả →</a>
                </div>

                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((item) => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Home;