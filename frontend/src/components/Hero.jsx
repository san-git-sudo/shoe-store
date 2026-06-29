function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#0F0F0F] pt-28 text-white">
            <div className="mx-auto grid min-h-[620px] max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2">
                <div className="z-10">
                    <p className="mb-4 font-bold uppercase tracking-[0.4em] text-red-500">
                        New Collection
                    </p>

                    <h2 className="text-6xl font-black uppercase leading-none md:text-6xl md:text-7xl">
                        Bứt phá <br />
                        <span className="text-red-500">mọi giới hạn</span>
                    </h2>

                    <p className="mt-6 max-w-xl text-lg text-zinc-300">
                        Thiết kế cá tính, hiệu suất vượt trội, dành cho thế hệ yêu tốc độ
                        và phong cách.
                    </p>

                    <button className="mt-8 rounded-xl bg-red-500 px-8 py-4 font-bold uppercase text-white transition hover:bg-red-600">
                        Khám phá ngay →
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute left-20 top-40 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
                    <img
                        className="relative z-10 rotate-[-18deg] drop-shadow-[0_40px_60px_rgba(239,68,68,0.35)]"
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"
                        alt="Sneaker"
                    />
                </div>
            </div>
        </section>
    );
}

export default Hero;