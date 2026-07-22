import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import axios from "axios";

function formatPrice(value) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return "0đ";
    }

    return numberValue.toLocaleString("vi-VN") + "đ";
}

function OrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    const [order, setOrder] = useState(
        location.state?.order || null
    );

    const [checkingPayment, setCheckingPayment] =
        useState(false);

    const [paymentError, setPaymentError] =
        useState("");

    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const getAuthConfig = () => ({
        headers: {
            Authorization:
                `Bearer ${getToken()}`
        }
    });

    useEffect(() => {
        const loadOrderResult = async () => {
            /*
                COD đi nội bộ bằng navigate state,
                nên đã có dữ liệu đơn ngay.
            */
            if (location.state?.order) {
                setOrder(location.state.order);
                return;
            }

            const savedValue =
                sessionStorage.getItem(
                    "pendingZaloPayOrder"
                );

            if (!savedValue) {
                return;
            }

            let pendingOrder;

            try {
                pendingOrder =
                    JSON.parse(savedValue);
            } catch {
                sessionStorage.removeItem(
                    "pendingZaloPayOrder"
                );
                return;
            }

            if (
                !pendingOrder?.app_trans_id ||
                !pendingOrder?.madonhang
            ) {
                sessionStorage.removeItem(
                    "pendingZaloPayOrder"
                );
                return;
            }

            /*
                Hiển thị dữ liệu tạm ngay lập tức,
                sau đó gọi backend xác minh trạng thái thật.
            */
            setOrder({
                ...pendingOrder,
                hinhthucthanhtoan:
                    "ZaloPay"
            });

            const token = getToken();

            if (!token) {
                setPaymentError(
                    "Không thể kiểm tra thanh toán vì phiên đăng nhập đã hết hạn."
                );
                return;
            }

            try {
                setCheckingPayment(true);
                setPaymentError("");

                const response = await axios.get(
                    `http://localhost:5000/api/zalopay/status/${encodeURIComponent(
                        pendingOrder.app_trans_id
                    )}`,
                    getAuthConfig()
                );

                if (!response.data?.success) {
                    throw new Error(
                        response.data?.message ||
                        "Không thể kiểm tra giao dịch ZaloPay"
                    );
                }

                const paymentData =
                    response.data.data || {};

                const verifiedOrder = {
                    madonhang:
                        Number(
                            paymentData.madonhang ||
                            pendingOrder.madonhang
                        ),

                    app_trans_id:
                        paymentData.app_trans_id ||
                        pendingOrder.app_trans_id,

                    zalopay_trans_id:
                        paymentData.zalopay_trans_id ||
                        null,

                    hinhthucthanhtoan:
                        "ZaloPay",

                    dathanhtoan:
                        Number(
                            paymentData.dathanhtoan
                        ) || 0,

                    tongthanhtoan:
                        Number(
                            paymentData.tongthanhtoan ??
                            pendingOrder.tongthanhtoan
                        ) || 0,

                    trangthai:
                        paymentData.trangthai ||
                        pendingOrder.trangthai ||
                        "chờ xác nhận"
                };

                setOrder(verifiedOrder);

                if (verifiedOrder.dathanhtoan === 1) {
                    localStorage.removeItem("shoe_cart");

                    window.dispatchEvent(
                        new Event("cart-updated")
                    );

                    sessionStorage.removeItem(
                        "pendingZaloPayOrder"
                    );
                }
            } catch (error) {
                console.error(
                    "Lỗi kiểm tra trạng thái ZaloPay:",
                    error
                );

                setPaymentError(
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể xác minh trạng thái thanh toán."
                );
            } finally {
                setCheckingPayment(false);
            }
        };

        loadOrderResult();
    }, [location.state]);

    const orderId = order?.madonhang;

    const paymentMethod =
        order?.hinhthucthanhtoan ||
        (order?.app_trans_id
            ? "ZaloPay"
            : "COD");

    const isPaid =
        Number(order?.dathanhtoan) === 1;

    const orderStatus =
        order?.trangthai || "chờ xác nhận";

    const displayStatus =
        paymentMethod === "ZaloPay"
            ? isPaid
                ? "Đã thanh toán - chờ xác nhận"
                : checkingPayment
                    ? "Đang xác minh thanh toán"
                    : "Chưa xác nhận thanh toán"
            : orderStatus;

    const totalPayment =
        Number(order?.tongthanhtoan) || 0;

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
            <section className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-[2.5rem] border border-[#D6D3D1] bg-white shadow-xl">
                    <div className="relative overflow-hidden px-6 py-14 text-center sm:px-10 sm:py-16">
                        <div className="absolute left-0 top-0 h-2 w-full bg-[#DC2626]" />

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-emerald-600"
                            >
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </div>

                        <p className="mt-8 text-xs font-black uppercase tracking-[0.32em] text-[#DC2626]">
                            KICKZONE
                        </p>

                        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                            Đặt hàng thành công
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                            Cảm ơn bạn đã mua sắm tại KICKZONE.
                            Đơn hàng đã được tiếp nhận và đang chờ
                            cửa hàng xác nhận.
                        </p>

                        {orderId ? (
                            <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 py-3">
                                <span className="text-sm font-bold text-zinc-500">
                                    Mã đơn hàng
                                </span>

                                <strong className="text-lg text-[#DC2626]">
                                    #{orderId}
                                </strong>
                            </div>
                        ) : (
                            <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700">
                                Không tìm thấy thông tin đơn trong phiên hiện tại.
                                Bạn vẫn có thể xem đơn vừa đặt trong lịch sử đơn hàng.
                            </div>
                        )}

                        {checkingPayment && (
                            <p className="mt-4 text-sm font-bold text-blue-600">
                                Đang xác minh giao dịch ZaloPay...
                            </p>
                        )}

                        {paymentError && (
                            <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                                {paymentError}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[#ECE7E1] bg-[#FBFAF8] px-6 py-8 sm:px-10">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-[#E7E2DA] bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Phương thức
                                </p>

                                <p className="mt-2 text-lg font-black">
                                    {paymentMethod}
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                    {paymentMethod === "COD"
                                        ? "Thanh toán khi nhận hàng"
                                        : isPaid
                                            ? "Đã thanh toán qua ZaloPay"
                                            : "Thanh toán trực tuyến qua ZaloPay"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#E7E2DA] bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Trạng thái
                                </p>

                                <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                                    {displayStatus}
                                </span>
                            </div>

                            <div className="rounded-2xl border border-[#E7E2DA] bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Tổng thanh toán
                                </p>

                                <p className="mt-2 text-2xl font-black text-[#DC2626]">
                                    {formatPrice(totalPayment)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#E7E2DA] bg-white p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl">
                                    📦
                                </div>

                                <div>
                                    <h2 className="font-black">
                                        Điều gì sẽ diễn ra tiếp theo?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                                        Cửa hàng sẽ kiểm tra đơn và cập nhật trạng thái.
                                        Bạn có thể theo dõi toàn bộ quá trình trong trang
                                        lịch sử đặt hàng.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={() => navigate("/orders")}
                                className="rounded-xl bg-[#18181B] px-7 py-3.5 font-bold text-white transition hover:bg-[#DC2626]"
                            >
                                Xem lịch sử đơn hàng
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="rounded-xl border border-[#D6D3D1] bg-white px-7 py-3.5 font-bold text-zinc-700 transition hover:border-[#DC2626] hover:text-[#DC2626]"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default OrderSuccess;