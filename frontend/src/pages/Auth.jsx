import { useState } from "react";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pt-32 pb-20">
            <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl md:grid-cols-2">
                <div className="hidden bg-[#18181B] p-12 text-white md:block">
                    <h1 className="text-5xl font-black italic">
                        KICK<span className="text-red-500">ZONE</span>
                    </h1>

                    <p className="mt-6 text-lg text-zinc-300">
                        Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi riêng.
                    </p>

                    <div className="mt-12 rounded-[2rem] bg-red-500 p-8">
                        <p className="text-sm font-bold uppercase">Member Deal</p>
                        <h2 className="mt-2 text-5xl font-black">30% OFF</h2>
                        <p className="mt-3 text-red-100">
                            Ưu đãi cho khách hàng mới tại KICKZONE.
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <p className="font-bold uppercase tracking-[0.3em] text-red-500">
                        Welcome
                    </p>

                    <h2 className="mt-3 text-4xl font-black">
                        {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </h2>

                    <form className="mt-8 space-y-5">
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Họ và tên"
                                className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none focus:border-red-500"
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none focus:border-red-500"
                        />

                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none focus:border-red-500"
                        />

                        {!isLogin && (
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                className="w-full rounded-2xl border border-zinc-200 px-5 py-4 outline-none focus:border-red-500"
                            />
                        )}

                        {isLogin && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-zinc-500">
                                    <input type="checkbox" />
                                    Ghi nhớ đăng nhập
                                </label>

                                <button type="button" className="font-bold text-red-500">
                                    Quên mật khẩu?
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            className="w-full rounded-2xl bg-red-500 py-4 font-black uppercase text-white transition hover:bg-red-600"
                        >
                            {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-zinc-500">
                        {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-red-500"
                        >
                            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                        </button>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Auth;