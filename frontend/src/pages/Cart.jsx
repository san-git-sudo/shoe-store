import { useEffect, useState } from "react";

import {
    getCart,
    updateQuantity,
    removeCartItem
} from "../utils/cart";
import axios from "axios";
function formatPrice(value) {
    return value.toLocaleString("vi-VN") + "đ";
}

function Cart() {

    const [cartItems, setCartItems] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherCode, setVoucherCode] = useState("");
    useEffect(() => {
        setCartItems(getCart());
        fetchVouchers();
    }, []);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    let discount = 0;

    if (selectedVoucher) {

        if (subtotal >= selectedVoucher.dontoithieu) {

            if (selectedVoucher.loaikhuyenmai === "percent") {

                discount =
                    (subtotal * selectedVoucher.giatrigiam) / 100;

                if (
                    selectedVoucher.giantoida &&
                    discount > selectedVoucher.giantoida
                ) {
                    discount = selectedVoucher.giantoida;
                }

            } else if (selectedVoucher.loaikhuyenmai === "fixed") {

                discount = selectedVoucher.giatrigiam;

            }

        }

    }

    const total = subtotal - discount;
    const fetchVouchers = async () => {
        try {

            const res = await axios.get("http://localhost:5000/api/vouchers");

            if (res.data.success) {
                setVouchers(res.data.data);
            }

        } catch (err) {
            console.log(err);
        }
    };
    const applyVoucher = () => {

        const voucher = vouchers.find(
            item =>
                item.magiamgia.toLowerCase() ===
                voucherCode.trim().toLowerCase()
        );

        if (!voucher) {
            alert("Mã voucher không tồn tại!");
            return;
        }

        if (subtotal < voucher.dontoithieu) {
            alert(
                `Đơn hàng phải từ ${voucher.dontoithieu.toLocaleString("vi-VN")}đ`
            );
            return;
        }

        setSelectedVoucher(voucher);

        alert("Áp dụng voucher thành công!");
    };

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
                                key={item.mabienthe}
                                className="grid items-center gap-6 rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm md:grid-cols-[40px_120px_1fr_140px_150px]"
                            >
                                <button
                                    className="text-2xl text-zinc-400 hover:text-red-500"
                                    onClick={() => {
                                        removeCartItem(item.mabienthe);
                                        setCartItems(getCart());
                                    }}
                                >
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
                                    <button
                                        onClick={() => {
                                            updateQuantity(item.mabienthe, item.quantity - 1);
                                            setCartItems(getCart());
                                        }}
                                    >
                                        -
                                    </button>
                                    <span className="font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => {
                                            updateQuantity(item.mabienthe, item.quantity + 1);
                                            setCartItems(getCart());
                                        }}
                                    >
                                        +
                                    </button>
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

                    <aside className="h-fit rounded-[2rem] border border-[#D6D3D1] bg-white p-8 shadow-lg">

                        <h2 className="text-2xl font-black">
                            TÓM TẮT ĐƠN HÀNG
                        </h2>

                        <div className="mt-8 space-y-4">

                            <div className="flex justify-between text-zinc-600">
                                <span>Tạm tính</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            <div className="flex justify-between text-zinc-600">
                                <span>Giảm giá</span>
                                <span className="text-red-500">
                                    -{formatPrice(discount)}
                                </span>
                            </div>

                            <div className="flex justify-between text-zinc-600">
                                <span>Phí vận chuyển</span>
                                <span className="font-semibold text-green-600">
                                    Miễn phí
                                </span>
                            </div>

                        </div>

                        <div className="my-8 border-t border-dashed border-zinc-300" />

                        <label className="mb-3 block font-bold">
                            Mã giảm giá
                        </label>

                        <div className="flex gap-2">

                            <input
                                type="text"
                                placeholder="Nhập voucher..."
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                            />

                            <button
                                onClick={applyVoucher}
                                className="rounded-xl bg-red-500 px-5 font-bold text-white hover:bg-red-600"
                            >
                                Áp dụng
                            </button>

                        </div>

                        {selectedVoucher && (

                            <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">

                                <div className="font-bold text-green-700">
                                    {selectedVoucher.magiamgia}
                                </div>

                                <div className="mt-1 text-sm text-zinc-600">
                                    {selectedVoucher.mota}
                                </div>

                            </div>

                        )}

                        <div className="my-8 border-t border-dashed border-zinc-300" />

                        <div className="flex items-center justify-between">

                            <span className="text-xl font-bold">
                                Tổng thanh toán
                            </span>

                            <span className="text-3xl font-black text-red-500">
                                {formatPrice(total)}
                            </span>

                        </div>

                        <button className="mt-8 w-full rounded-2xl bg-[#18181B] py-4 text-lg font-bold text-white transition hover:bg-red-500">
                            Thanh Toán
                        </button>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                            <button className="rounded-xl border border-zinc-300 bg-white py-3 font-bold text-blue-500 transition hover:border-blue-500">
                                ZaloPay
                            </button>

                            <button className="rounded-xl border border-zinc-300 bg-white py-3 font-bold text-green-600 transition hover:border-green-600">
                                COD
                            </button>

                        </div>

                    </aside>
                </div>
            </section>

        </main>
    );
}

export default Cart;