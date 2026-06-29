function Footer() {
    return (
        <footer className="border-t border-zinc-800 bg-black text-zinc-400">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
                <div>
                    <h2 className="text-3xl font-black italic text-white">
                        KICK<span className="text-red-500">ZONE</span>
                    </h2>
                    <p className="mt-4 text-sm leading-6">
                        Sneaker store cá tính - nổi bật - hiện đại. Nơi phong cách bắt đầu
                        từ từng bước chân.
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 font-bold uppercase text-white">Danh mục</h3>
                    <ul className="space-y-3 text-sm">
                        <li>Giày nam</li>
                        <li>Giày nữ</li>
                        <li>Phụ kiện</li>
                        <li>Khuyến mãi</li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-bold uppercase text-white">Hỗ trợ</h3>
                    <ul className="space-y-3 text-sm">
                        <li>Chính sách đổi trả</li>
                        <li>Hướng dẫn chọn size</li>
                        <li>Thanh toán</li>
                        <li>Liên hệ</li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-bold uppercase text-white">Liên hệ</h3>
                    <ul className="space-y-3 text-sm">
                        <li>📍 TP. Hồ Chí Minh</li>
                        <li>📞 0909 888 999</li>
                        <li>✉️ kickzone@gmail.com</li>
                        <li className="flex gap-3 pt-2 text-white">
                            <span>Facebook</span>
                            <span>Instagram</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-zinc-800 py-5 text-center text-sm">
                © 2026 KICKZONE. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;