import { useEffect, useMemo, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { getCart } from "../utils/cart";


function formatPrice(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue)
        ? numberValue.toLocaleString("vi-VN") + "đ"
        : "0đ";
}

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        tennguoinhan: "",
        sodienthoai: "",
        diachigiao: "",
        ghichu: ""
    });

    const selectedVoucher =
        location.state?.selectedVoucher || null;

    const cartNote =
        location.state?.orderNote || "";

    useEffect(() => {
        const latestCart = getCart();

        setCartItems(
            Array.isArray(latestCart)
                ? latestCart
                : []
        );

        setFormData((previousData) => ({
            ...previousData,
            ghichu:
                previousData.ghichu ||
                cartNote
        }));
    }, [cartNote]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const subtotal = useMemo(
        () => cartItems.reduce(
            (sum, item) =>
                sum +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 0),
            0
        ),
        [cartItems]
    );

    const discount = useMemo(() => {
        if (!selectedVoucher || subtotal <= 0) return 0;

        const minimumOrder = Number(selectedVoucher.dontoithieu) || 0;
        if (subtotal < minimumOrder) return 0;

        let value = 0;

        if (selectedVoucher.loaikhuyenmai === "percent") {
            value =
                (subtotal * Number(selectedVoucher.giatrigiam || 0)) /
                100;

            const maxDiscount = Number(selectedVoucher.giantoida) || 0;
            if (maxDiscount > 0 && value > maxDiscount) {
                value = maxDiscount;
            }
        }

        if (selectedVoucher.loaikhuyenmai === "fixed") {
            value = Number(selectedVoucher.giatrigiam) || 0;
        }

        return Math.min(value, subtotal);
    }, [selectedVoucher, subtotal]);

    const totalPayment = Math.max(subtotal - discount, 0);

    const totalQuantity = useMemo(
        () => cartItems.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
        ),
        [cartItems]
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };
    //State loading hồ sơ
    const [profileLoading, setProfileLoading] =
        useState(true);
    //lấy token và cấu hình header
    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    //Lấy hồ sơ
    const fetchProfile = async () => {
        const token = getToken();

        if (!token) {
            setProfileLoading(false);

            await Swal.fire({
                title: "Vui lòng đăng nhập!",
                text:
                    "Bạn cần đăng nhập để tiếp tục thanh toán.",
                icon: "warning",
                confirmButtonColor: "#DC2626"
            });

            navigate("/auth", {
                state: {
                    from: "/checkout"
                },
                replace: true
            });

            return;
        }

        try {
            setProfileLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/auth/profile",
                getAuthConfig()
            );

            if (response.data?.success) {
                const user =
                    response.data.data || {};

                /*
                    Chỉ điền sẵn thông tin nhận hàng.
                    Khách vẫn được sửa ở Checkout.
                */
                setFormData((previousData) => ({
                    ...previousData,

                    tennguoinhan:
                        previousData.tennguoinhan ||
                        user.hoten ||
                        "",

                    sodienthoai:
                        previousData.sodienthoai ||
                        user.sodienthoai ||
                        "",

                    diachigiao:
                        previousData.diachigiao ||
                        user.diachi ||
                        ""
                }));
            }
        } catch (error) {
            console.error(
                "Lỗi lấy thông tin người dùng:",
                error
            );

            const status =
                error.response?.status;

            if (status === 401 || status === 403) {
                await Swal.fire({
                    title: "Phiên đăng nhập không hợp lệ!",
                    text:
                        error.response?.data?.message ||
                        "Vui lòng đăng nhập lại.",
                    icon: "warning",
                    confirmButtonColor:
                        "#DC2626"
                });

                localStorage.removeItem("token");
                localStorage.removeItem(
                    "accessToken"
                );

                navigate("/auth", {
                    state: {
                        from: "/checkout"
                    },
                    replace: true
                });

                return;
            }

            Swal.fire({
                title: "Không thể lấy thông tin!",
                text:
                    error.response?.data?.message ||
                    "Không thể tải thông tin tài khoản.",
                icon: "error",
                confirmButtonColor: "#DC2626"
            });
        } finally {
            setProfileLoading(false);
        }
    };
    const validateForm = () => {
        const name = formData.tennguoinhan.trim();
        const phone = formData.sodienthoai.trim();
        const address = formData.diachigiao.trim();

        if (cartItems.length === 0) return "Giỏ hàng đang trống.";
        if (name.length < 2 || name.length > 100) {
            return "Tên người nhận phải có từ 2 đến 100 ký tự.";
        }
        if (!/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
            return "Số điện thoại Việt Nam không hợp lệ.";
        }
        if (address.length < 10 || address.length > 500) {
            return "Địa chỉ giao hàng phải có từ 10 đến 500 ký tự.";
        }
        if (formData.ghichu.trim().length > 500) {
            return "Ghi chú không được vượt quá 500 ký tự.";
        }
        if (!["COD", "ZaloPay"].includes(paymentMethod)) {
            return "Vui lòng chọn phương thức thanh toán.";
        }

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) return;

        const validationError = validateForm();

        if (validationError) {
            return Swal.fire({
                title: "Thông tin chưa hợp lệ!",
                text: validationError,
                icon: "warning",
                confirmButtonColor: "#DC2626"
            });
        }

        const token = getToken();

        if (!token) {
            await Swal.fire({
                title: "Vui lòng đăng nhập!",
                text: "Phiên đăng nhập không tồn tại. Vui lòng đăng nhập lại.",
                icon: "warning",
                confirmButtonColor: "#DC2626"
            });

            navigate("/auth", {
                state: {
                    from: "/checkout"
                },
                replace: true
            });

            return;
        }

        const payload = {
            tennguoinhan: formData.tennguoinhan.trim(),
            sodienthoai: formData.sodienthoai.trim(),
            diachigiao: formData.diachigiao.trim(),
            ghichu: formData.ghichu.trim() || null,
            mavoucher: selectedVoucher?.mavoucher || null,
            items: cartItems.map((item) => ({
                mabienthe: Number(item.mabienthe),
                soluong: Number(item.quantity)
            }))
        };

        const hasInvalidItem =
            payload.items.some(
                (item) =>
                    !Number.isInteger(
                        item.mabienthe
                    ) ||
                    item.mabienthe <= 0 ||
                    !Number.isInteger(
                        item.soluong
                    ) ||
                    item.soluong <= 0
            );

        if (hasInvalidItem) {
            return Swal.fire({
                title: "Giỏ hàng chưa hợp lệ!",
                text:
                    "Có sản phẩm thiếu mã biến thể hoặc số lượng không hợp lệ.",
                icon: "warning",
                confirmButtonColor: "#DC2626"
            });
        }

        try {
            setSubmitting(true);

            const isZaloPay =
                paymentMethod === "ZaloPay";

            const endpoint = isZaloPay
                ? "http://localhost:5000/api/zalopay/create"
                : "http://localhost:5000/api/orders/checkout/cod";

            const response = await axios.post(
                endpoint,
                payload,
                getAuthConfig()
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    (isZaloPay
                        ? "Không thể khởi tạo thanh toán ZaloPay"
                        : "Không thể tạo đơn hàng COD")
                );
            }

            const createdOrder =
                response.data.data;

            if (isZaloPay) {
                const pendingOrder = {
                    madonhang:
                        Number(
                            createdOrder.madonhang
                        ),

                    app_trans_id:
                        createdOrder.app_trans_id,

                    hinhthucthanhtoan:
                        "ZaloPay",

                    dathanhtoan:
                        Number(
                            createdOrder.dathanhtoan
                        ) || 0,

                    tongthanhtoan:
                        Number(
                            createdOrder.tongthanhtoan
                        ) || 0,

                    trangthai:
                        createdOrder.trangthai ||
                        "chờ xác nhận"
                };

                if (
                    !pendingOrder.madonhang ||
                    !pendingOrder.app_trans_id ||
                    !createdOrder.order_url
                ) {
                    throw new Error(
                        "Dữ liệu thanh toán ZaloPay trả về chưa đầy đủ"
                    );
                }

                sessionStorage.setItem(
                    "pendingZaloPayOrder",
                    JSON.stringify(
                        pendingOrder
                    )
                );

                window.location.assign(
                    createdOrder.order_url
                );

                return;
            }

            localStorage.removeItem("shoe_cart");

            setCartItems([]);

            window.dispatchEvent(
                new Event("cart-updated")
            );

            navigate("/order-success", {
                replace: true,
                state: {
                    order: createdOrder
                }
            });
        } catch (error) {
            console.error(
                `Lỗi thanh toán ${paymentMethod}:`,
                error
            );

            const status =
                error.response?.status;

            if (
                status === 401 ||
                status === 403
            ) {
                await Swal.fire({
                    title: "Phiên đăng nhập không hợp lệ!",
                    text:
                        error.response?.data?.message ||
                        "Vui lòng đăng nhập lại.",
                    icon: "warning",
                    confirmButtonColor: "#DC2626"
                });

                localStorage.removeItem("token");
                localStorage.removeItem(
                    "accessToken"
                );

                navigate("/auth", {
                    state: {
                        from: "/checkout"
                    },
                    replace: true
                });

                return;
            }

            Swal.fire({
                title:
                    paymentMethod === "ZaloPay"
                        ? "Không thể mở thanh toán ZaloPay!"
                        : "Đặt hàng không thành công!",

                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể xử lý yêu cầu thanh toán.",

                icon: "error",

                confirmButtonColor:
                    paymentMethod === "ZaloPay"
                        ? "#2563EB"
                        : "#DC2626"
            });
        } finally {
            setSubmitting(false);
        }
    };
    if (profileLoading) {
        return (
            <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
                <section className="mx-auto max-w-4xl rounded-[2rem] border border-[#D6D3D1] bg-white py-20 text-center shadow-sm">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-[#DC2626]" />

                    <p className="mt-5 font-bold text-zinc-500">
                        Đang tải thông tin nhận hàng...
                    </p>
                </section>
            </main>
        );
    }
    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
                <section className="mx-auto max-w-4xl rounded-[2rem] border border-[#D6D3D1] bg-white px-6 py-20 text-center shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">🛒</div>
                    <h1 className="mt-6 text-3xl font-black">Không có sản phẩm để thanh toán</h1>
                    <p className="mt-3 text-zinc-500">Vui lòng thêm sản phẩm vào giỏ trước khi tiếp tục.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/cart")}
                        className="mt-7 rounded-xl bg-[#DC2626] px-7 py-3 font-bold text-white transition hover:bg-red-700"
                    >
                        Quay lại giỏ hàng
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
            <section className="mx-auto max-w-7xl">
                <div className="mb-8 text-sm text-zinc-500">
                    <button type="button" onClick={() => navigate("/")} className="text-[#DC2626] hover:underline">Trang chủ</button>
                    <span> / </span>
                    <button type="button" onClick={() => navigate("/cart")} className="text-[#DC2626] hover:underline">Giỏ hàng</button>
                    <span> / Thanh toán</span>
                </div>

                <div className="mb-10 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#DC2626]">KICKZONE CHECKOUT</p>
                    <h1 className="mt-3 text-4xl font-black sm:text-5xl">Thanh toán</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
                        Kiểm tra thông tin nhận hàng, sản phẩm và phương thức thanh toán trước khi xác nhận đơn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid items-start gap-8 lg:grid-cols-[1fr_420px]">
                    <div className="space-y-8">
                        <section className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC2626]">Bước 1</p>
                                    <h2 className="mt-2 text-2xl font-black">Thông tin nhận hàng</h2>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">📍</div>
                            </div>

                            <div className="mt-7 grid gap-5 md:grid-cols-2">
                                <div>
                                    <label htmlFor="tennguoinhan" className="mb-2 block text-sm font-bold">
                                        Họ tên người nhận <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <input
                                        id="tennguoinhan"
                                        name="tennguoinhan"
                                        value={formData.tennguoinhan}
                                        onChange={handleInputChange}
                                        maxLength={100}
                                        placeholder="Nhập họ tên người nhận"
                                        className="w-full rounded-xl border border-[#D6D3D1] px-4 py-3 outline-none focus:border-[#DC2626]"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="sodienthoai" className="mb-2 block text-sm font-bold">
                                        Số điện thoại <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <input
                                        id="sodienthoai"
                                        name="sodienthoai"
                                        type="tel"
                                        inputMode="numeric"
                                        value={formData.sodienthoai}
                                        onChange={(event) => {
                                            const onlyNumbers = event.target.value.replace(/\D/g, "");
                                            setFormData((previous) => ({
                                                ...previous,
                                                sodienthoai: onlyNumbers.slice(0, 11)
                                            }));
                                        }}
                                        placeholder="Ví dụ: 0909123456"
                                        className="w-full rounded-xl border border-[#D6D3D1] px-4 py-3 outline-none focus:border-[#DC2626]"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="diachigiao" className="mb-2 block text-sm font-bold">
                                        Địa chỉ giao hàng <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <textarea
                                        id="diachigiao"
                                        name="diachigiao"
                                        value={formData.diachigiao}
                                        onChange={handleInputChange}
                                        maxLength={500}
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        className="h-28 w-full resize-none rounded-xl border border-[#D6D3D1] px-4 py-3 outline-none focus:border-[#DC2626]"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="ghichu" className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
                                        <span>Ghi chú đơn hàng</span>
                                        <span className="text-xs font-medium text-zinc-400">{formData.ghichu.length}/500</span>
                                    </label>
                                    <textarea
                                        id="ghichu"
                                        name="ghichu"
                                        value={formData.ghichu}
                                        onChange={handleInputChange}
                                        maxLength={500}
                                        placeholder="Ví dụ: Gọi điện trước khi giao..."
                                        className="h-24 w-full resize-none rounded-xl border border-[#D6D3D1] px-4 py-3 outline-none focus:border-[#DC2626]"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC2626]">Bước 2</p>
                                    <h2 className="mt-2 text-2xl font-black">Phương thức thanh toán</h2>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">💳</div>
                            </div>

                            <div className="mt-7 grid gap-4 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`rounded-2xl border p-5 text-left transition ${paymentMethod === "COD" ? "border-[#DC2626] bg-red-50 ring-2 ring-red-100" : "border-[#D6D3D1] bg-white hover:border-zinc-400"}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black">Thanh toán COD</p>
                                            <p className="mt-2 text-sm leading-6 text-zinc-500">Thanh toán bằng tiền mặt khi nhận được sản phẩm.</p>
                                        </div>
                                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "COD" ? "border-[#DC2626] bg-[#DC2626] text-white" : "border-zinc-300"}`}>
                                            {paymentMethod === "COD" ? "✓" : ""}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("ZaloPay")}
                                    className={`rounded-2xl border p-5 text-left transition ${paymentMethod === "ZaloPay" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-[#D6D3D1] bg-white hover:border-zinc-400"}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black text-blue-600">ZaloPay</p>
                                            <p className="mt-2 text-sm leading-6 text-zinc-500">Thanh toán trực tuyến qua cổng ZaloPay Sandbox.</p>
                                        </div>
                                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "ZaloPay" ? "border-blue-500 bg-blue-500 text-white" : "border-zinc-300"}`}>
                                            {paymentMethod === "ZaloPay" ? "✓" : ""}
                                        </span>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-5 rounded-2xl bg-[#F8F6F2] p-4 text-sm leading-6 text-zinc-500">
                                {paymentMethod === "COD"
                                    ? "Đơn COD sẽ được tạo ở trạng thái chờ xác nhận và chưa thanh toán."
                                    : "Sau khi xác nhận, hệ thống sẽ chuyển bạn sang trang thanh toán ZaloPay."}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC2626]">Bước 3</p>
                                    <h2 className="mt-2 text-2xl font-black">Sản phẩm trong đơn</h2>
                                </div>
                                <span className="rounded-full bg-[#F3F0EA] px-4 py-2 text-sm font-bold text-zinc-500">{totalQuantity} sản phẩm</span>
                            </div>

                            <div className="mt-7 divide-y divide-[#ECE7E1]">
                                {cartItems.map((item) => (
                                    <div key={item.mabienthe} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#E7E2DA] bg-[#F8F6F2]">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-black">{item.name}</h3>
                                            <p className="mt-2 text-sm text-zinc-500">Size: {item.size || "—"} / Màu: {item.color || "—"}</p>
                                            <p className="mt-2 text-sm font-bold text-zinc-500">Số lượng: {Number(item.quantity) || 0}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm text-zinc-400">Thành tiền</p>
                                            <p className="mt-1 text-lg font-black text-[#DC2626]">
                                                {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="sticky top-28 rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-lg sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC2626]">Đơn hàng của bạn</p>
                                <h2 className="mt-2 text-2xl font-black">Tóm tắt thanh toán</h2>
                            </div>
                            <button type="button" onClick={() => navigate("/cart")} className="text-sm font-bold text-[#DC2626] hover:underline">Sửa giỏ hàng</button>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between text-zinc-600"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                            <div className="flex items-center justify-between text-zinc-600"><span>Giảm giá</span><span className="text-[#DC2626]">-{formatPrice(discount)}</span></div>
                            <div className="flex items-center justify-between text-zinc-600"><span>Phí vận chuyển</span><span className="font-bold text-emerald-600">Miễn phí</span></div>
                        </div>

                        {selectedVoucher && (
                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Voucher đã áp dụng</p>
                                <div className="mt-2 flex items-center justify-between gap-4">
                                    <strong className="text-emerald-700">{selectedVoucher.magiamgia}</strong>
                                    <span className="text-sm font-bold text-emerald-700">Tiết kiệm {formatPrice(discount)}</span>
                                </div>
                            </div>
                        )}

                        <div className="my-7 border-t border-dashed border-zinc-300" />

                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-zinc-500">Tổng thanh toán</p>
                                <p className="mt-1 text-xs text-zinc-400">Đã bao gồm giảm giá</p>
                            </div>
                            <strong className="text-right text-3xl font-black text-[#DC2626]">{formatPrice(totalPayment)}</strong>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`mt-8 w-full rounded-2xl py-4 text-lg font-black text-white transition ${submitting ? "cursor-wait bg-zinc-400" : paymentMethod === "ZaloPay" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#18181B] hover:bg-[#DC2626]"}`}
                        >
                            {submitting
                                ? "Đang xử lý..."
                                : paymentMethod === "ZaloPay"
                                    ? "Thanh toán bằng ZaloPay"
                                    : "Đặt hàng COD"}
                        </button>

                        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F8F6F2] p-4">
                            <span className="text-lg">🔒</span>
                            <p className="text-xs leading-5 text-zinc-500">
                                Giá và voucher sẽ được backend kiểm tra lại trước khi tạo đơn. Frontend không quyết định số tiền cuối cùng.
                            </p>
                        </div>
                    </aside>
                </form>
            </section>
        </main>
    );
}

export default Checkout;