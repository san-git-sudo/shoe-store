import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Hiển thị toàn bộ voucher hoặc chỉ voucher tốt nhất
    const [showAllVouchers, setShowAllVouchers] = useState(false);
    const refreshCart = () => {
        const latestCart = getCart();
        setCartItems(Array.isArray(latestCart) ? latestCart : []);
        window.dispatchEvent(new Event("cart-updated"));
    };

    useEffect(() => {
        refreshCart();
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

    discount = Math.min(discount, subtotal);
    const total = Math.max(subtotal - discount, 0);

    const totalCartQuantity = cartItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
    );
    // ======================================================
    // Tính số tiền thực tế mà một voucher có thể giảm
    // Dùng để sắp xếp và hiển thị số tiền khách tiết kiệm
    // ======================================================
    const calculateVoucherDiscount = (voucher) => {
        if (!voucher) return 0;

        if (voucher.loaikhuyenmai === "percent") {
            let discountValue = (subtotal * Number(voucher.giatrigiam || 0)) / 100;
            const maxDiscount = Number(voucher.giantoida) || 0;

            if (maxDiscount > 0 && discountValue > maxDiscount) {
                discountValue = maxDiscount;
            }

            return discountValue;
        }

        if (voucher.loaikhuyenmai === "fixed") {
            return Math.min(Number(voucher.giatrigiam) || 0, subtotal);
        }

        return 0;
    };
    // ======================================================
    // Danh sách voucher phù hợp với đơn hàng hiện tại
    // Điều kiện:
    // 1. Đã tới ngày bắt đầu
    // 2. Chưa qua ngày kết thúc
    // 3. Đơn hàng đạt giá trị tối thiểu
    // ======================================================
    const availableVouchers = vouchers
        .filter((voucher) => {
            const now = new Date();

            const startDate = voucher.ngaybatdau
                ? new Date(voucher.ngaybatdau)
                : null;

            const endDate = voucher.ngayketthuc
                ? new Date(voucher.ngayketthuc)
                : null;

            const minimumOrder = Number(voucher.dontoithieu) || 0;

            const hasStarted = !startDate || startDate <= now;

            const hasNotExpired = !endDate || endDate >= now;

            const enoughOrderValue = subtotal >= minimumOrder;

            return hasStarted && hasNotExpired && enoughOrderValue;
        })
        .sort((a, b) => calculateVoucherDiscount(b) - calculateVoucherDiscount(a));
    // Khi chưa bấm "Xem tất cả", chỉ hiển thị voucher tiết kiệm nhất
    const displayedVouchers = showAllVouchers
        ? availableVouchers
        : availableVouchers.slice(0, 1);
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

    // ======================================================
    // Áp dụng nhanh voucher được đề xuất
    // ======================================================
    const applySuggestedVoucher = (voucher) => {
        setSelectedVoucher(voucher);
    };

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
            <section className="mx-auto max-w-7xl">
                <div className="mb-8 text-sm text-zinc-500">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-red-500 hover:underline"
                    >
                        Trang chủ
                    </button>{" "}
                    / Giỏ hàng ({totalCartQuantity})
                </div>

                <h1 className="text-center text-4xl font-black">Giỏ hàng</h1>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
                    <div>
                        {cartItems.length === 0 ? (
                            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-[2rem] border border-[#D6D3D1] bg-white px-6 py-16 text-center shadow-sm">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl">
                                    🛒
                                </div>
                                <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-[#DC2626]">
                                    KICKZONE
                                </p>
                                <h2 className="mt-3 text-3xl font-black">
                                    Giỏ hàng đang trống
                                </h2>
                                <p className="mt-3 max-w-md leading-7 text-zinc-500">
                                    Bạn chưa thêm sản phẩm nào vào giỏ. Hãy khám phá những mẫu giày phù hợp với phong cách của mình nhé.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="mt-8 rounded-xl bg-[#DC2626] px-8 py-4 font-bold text-white transition hover:bg-red-700"
                                >
                                    Khám phá sản phẩm
                                </button>
                            </div>
                        ) : (
                            <>
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
                                                    setSelectedVoucher(null);
                                                    setShowAllVouchers(false);
                                                    refreshCart();
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
                                                        if (Number(item.quantity) <= 1) return;
                                                        updateQuantity(item.mabienthe, Number(item.quantity) - 1);
                                                        setSelectedVoucher(null);
                                                        setShowAllVouchers(false);
                                                        refreshCart();
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <span className="font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => {
                                                        updateQuantity(item.mabienthe, Number(item.quantity) + 1);
                                                        setSelectedVoucher(null);
                                                        setShowAllVouchers(false);
                                                        refreshCart();
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10">
                                    <label className="text-xl font-bold">Ghi chú đơn hàng</label>
                                    <textarea
                                        className="mt-4 h-28 w-full resize-none rounded-2xl border border-[#D6D3D1] bg-white p-4 outline-none focus:border-red-500"
                                        placeholder="Nhập ghi chú cho đơn hàng..."
                                    />
                                </div>
                            </>
                        )}
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
                        {/* ======================================================
    Mỗi đơn hàng chỉ áp dụng một voucher
====================================================== */}
                        {cartItems.length > 0 && availableVouchers.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>🎁</span>

                                        <h3 className="font-bold">
                                            Voucher đề xuất
                                        </h3>
                                    </div>

                                    <span className="text-xs text-zinc-400">
                                        Chọn 1 trong {availableVouchers.length} mã
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {displayedVouchers.map((voucher, index) => {
                                        const voucherDiscount =
                                            calculateVoucherDiscount(voucher);

                                        const isSelected =
                                            selectedVoucher?.mavoucher === voucher.mavoucher;

                                        return (
                                            <div
                                                key={voucher.mavoucher}
                                                className={`rounded-xl border p-3 transition ${isSelected
                                                    ? "border-green-400 bg-green-50"
                                                    : "border-zinc-200 bg-zinc-50"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p
                                                                className={`font-black ${isSelected
                                                                    ? "text-green-700"
                                                                    : "text-red-500"
                                                                    }`}
                                                            >
                                                                {voucher.magiamgia}
                                                            </p>

                                                            {index === 0 && (
                                                                <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold uppercase text-yellow-700">
                                                                    Tốt nhất
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-sm text-zinc-600">
                                                            {voucher.loaikhuyenmai === "percent"
                                                                ? `Giảm ${voucher.giatrigiam}%`
                                                                : `Giảm ${formatPrice(
                                                                    Number(voucher.giatrigiam) || 0
                                                                )}`}
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-green-600">
                                                            Tiết kiệm{" "}
                                                            {formatPrice(voucherDiscount)}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            applySuggestedVoucher(voucher)
                                                        }
                                                        disabled={isSelected}
                                                        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${isSelected
                                                            ? "cursor-default bg-green-600 text-white"
                                                            : "bg-red-500 text-white hover:bg-red-600"
                                                            }`}
                                                    >
                                                        {isSelected
                                                            ? "✓ Đang dùng"
                                                            : selectedVoucher
                                                                ? "Chọn mã này"
                                                                : "Áp dụng"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {availableVouchers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAllVouchers(
                                                (previousValue) => !previousValue
                                            )
                                        }
                                        className="mt-3 w-full text-sm font-bold text-red-500 transition hover:text-red-600"
                                    >
                                        {showAllVouchers
                                            ? "Thu gọn"
                                            : `Xem thêm ${availableVouchers.length - 1
                                            } voucher`}
                                    </button>
                                )}

                                {selectedVoucher && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedVoucher(null)}
                                        className="mt-3 w-full text-sm font-bold text-zinc-500 transition hover:text-red-500"
                                    >
                                        Bỏ voucher đang áp dụng
                                    </button>
                                )}
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

                        <button
                            type="button"
                            disabled={cartItems.length === 0}
                            className={`mt-8 w-full rounded-2xl py-4 text-lg font-bold transition ${cartItems.length === 0
                                ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                                : "bg-[#18181B] text-white hover:bg-red-500"
                                }`}
                        >
                            {cartItems.length === 0 ? "Chưa có sản phẩm" : "Thanh toán"}
                        </button>

                        {cartItems.length > 0 && (
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <button className="rounded-xl border border-zinc-300 bg-white py-3 font-bold text-blue-500 transition hover:border-blue-500">
                                    ZaloPay
                                </button>

                                <button className="rounded-xl border border-zinc-300 bg-white py-3 font-bold text-green-600 transition hover:border-green-600">
                                    COD
                                </button>
                            </div>
                        )}

                    </aside>
                </div>
            </section>

        </main>
    );
}

export default Cart;