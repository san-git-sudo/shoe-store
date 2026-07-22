import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL =
    "http://localhost:5000/api/orders/my-orders";

const ORDER_STATUSES = [
    "chờ xác nhận",
    "đang xử lý",
    "đang giao",
    "đã giao",
    "đã hủy"
];

function OrderHistory() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] =
        useState(false);

    const [detailLoading, setDetailLoading] =
        useState(false);

    // ==================================================
    // LẤY JWT CỦA KHÁCH HÀNG
    // ==================================================
    const getToken = () =>
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    // ==================================================
    // XỬ LÝ LỖI XÁC THỰC
    // ==================================================
    const handleAuthError = async (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            await Swal.fire({
                title: "Vui lòng đăng nhập!",
                text:
                    error.response?.data?.message ||
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                icon: "warning",
                confirmButtonColor: "#DC2626",
                confirmButtonText: "Đăng nhập"
            });

            navigate("/auth");

            return true;
        }

        return false;
    };

    // ==================================================
    // 1. LẤY LỊCH SỬ ĐƠN HÀNG
    //
    // GET /api/orders/my-orders
    // Backend tự lấy manguoidung từ JWT.
    // ==================================================
    const fetchMyOrders = async () => {
        const token = getToken();

        if (!token) {
            setLoading(false);

            const result = await Swal.fire({
                title: "Bạn chưa đăng nhập!",
                text:
                    "Vui lòng đăng nhập để xem lịch sử đặt hàng.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DC2626",
                cancelButtonColor: "#71717A",
                confirmButtonText: "Đăng nhập",
                cancelButtonText: "Để sau"
            });

            if (result.isConfirmed) {
                navigate("/auth");
            }

            return;
        }

        try {
            setLoading(true);

            const response = await axios.get(
                API_URL,
                getAuthConfig()
            );

            if (response.data?.success) {
                setOrders(
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : []
                );
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error(
                "Lỗi lấy lịch sử đơn hàng:",
                error
            );

            setOrders([]);

            if (await handleAuthError(error)) {
                return;
            }

            Swal.fire({
                title: "Không thể tải dữ liệu!",
                text:
                    error.response?.data?.message ||
                    "Không thể lấy lịch sử đặt hàng.",
                icon: "error",
                confirmButtonColor: "#DC2626"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, []);

    // ==================================================
    // 2. LỌC ĐƠN HÀNG
    //
    // Dùng chung một bộ lọc cho:
    // - Trạng thái xử lý đơn hàng
    // - Trạng thái thanh toán
    //
    // Chỉ lọc trên dữ liệu đã nhận, không gọi API lại.
    // ==================================================
    const filteredOrders = useMemo(() => {
        if (statusFilter === "all") {
            return orders;
        }

        if (statusFilter === "paid") {
            return orders.filter(
                (order) =>
                    Number(
                        order.dathanhtoan
                    ) === 1
            );
        }

        if (statusFilter === "unpaid") {
            return orders.filter(
                (order) =>
                    Number(
                        order.dathanhtoan
                    ) !== 1
            );
        }

        return orders.filter(
            (order) =>
                order.trangthai ===
                statusFilter
        );
    }, [orders, statusFilter]);

    // ==================================================
    // 3. THỐNG KÊ NHẸ
    // ==================================================
    const statistics = useMemo(() => {
        return {
            total: orders.length,

            processing: orders.filter(
                (order) =>
                    order.trangthai ===
                    "chờ xác nhận" ||
                    order.trangthai ===
                    "đang xử lý"
            ).length,

            delivering: orders.filter(
                (order) =>
                    order.trangthai === "đang giao"
            ).length,

            completed: orders.filter(
                (order) =>
                    order.trangthai === "đã giao"
            ).length
        };
    }, [orders]);

    // ==================================================
    // 4. XEM CHI TIẾT ĐƠN HÀNG
    //
    // GET /api/orders/my-orders/:id
    // ==================================================
    const handleViewDetail = async (orderId) => {
        const parsedOrderId = Number(orderId);

        if (
            !Number.isInteger(parsedOrderId) ||
            parsedOrderId <= 0
        ) {
            return Swal.fire({
                title: "Dữ liệu không hợp lệ!",
                text: "Mã đơn hàng không hợp lệ.",
                icon: "warning",
                confirmButtonColor: "#DC2626"
            });
        }

        if (!getToken()) {
            return Swal.fire({
                title: "Bạn chưa đăng nhập!",
                text:
                    "Vui lòng đăng nhập để xem chi tiết đơn hàng.",
                icon: "warning",
                confirmButtonColor: "#DC2626"
            });
        }

        try {
            setDetailLoading(true);

            Swal.fire({
                title: "Đang tải chi tiết đơn hàng...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await axios.get(
                `${API_URL}/${parsedOrderId}`,
                getAuthConfig()
            );

            Swal.close();

            if (response.data?.success) {
                setSelectedOrder(
                    response.data.data
                );

                setIsDetailModalOpen(true);
            }
        } catch (error) {
            Swal.close();

            console.error(
                "Lỗi lấy chi tiết đơn hàng:",
                error
            );

            if (await handleAuthError(error)) {
                return;
            }

            Swal.fire({
                title: "Không thể mở chi tiết!",
                text:
                    error.response?.data?.message ||
                    "Không thể lấy chi tiết đơn hàng.",
                icon: "error",
                confirmButtonColor: "#DC2626"
            });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        if (detailLoading) return;

        setIsDetailModalOpen(false);
        setSelectedOrder(null);
    };

    // ==================================================
    // 5. HÀM HIỂN THỊ
    // ==================================================
    const formatPrice = (value) => {
        const numberValue = Number(value);

        if (!Number.isFinite(numberValue)) {
            return "0đ";
        }

        return (
            numberValue.toLocaleString("vi-VN") +
            "đ"
        );
    };

    const formatDate = (value) => {
        if (!value) {
            return "Chưa cập nhật";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Không xác định";
        }

        return date.toLocaleString("vi-VN");
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "đã giao":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            case "đã hủy":
                return "bg-red-50 text-red-700 border-red-200";

            case "đang giao":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "đang xử lý":
                return "bg-amber-50 text-amber-700 border-amber-200";

            case "chờ xác nhận":
                return "bg-zinc-100 text-zinc-600 border-zinc-200";

            default:
                return "bg-zinc-100 text-zinc-600 border-zinc-200";
        }
    };

    const getPaymentClass = (isPaid) => {
        return Number(isPaid) === 1
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700";
    };

    const getFirstProductName = (order) => {
        const productName = String(
            order.tensanphamdau || ""
        ).trim();

        if (!productName) {
            return "Đơn hàng KICKZONE";
        }

        const remainingItems =
            Number(
                order.sodongchitiet || 0
            ) - 1;

        if (remainingItems > 0) {
            return `${productName} và ${remainingItems} sản phẩm khác`;
        }

        return productName;
    };

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
            <section className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                            Tài khoản của tôi
                        </p>

                        <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
                            Lịch sử đặt hàng
                        </h1>

                        <p className="mt-4 max-w-2xl text-zinc-500">
                            Theo dõi trạng thái đơn hàng,
                            sản phẩm đã mua và thông tin
                            giao dịch của bạn tại
                            KICKZONE.
                        </p>
                    </div>

                    <div className="w-full sm:w-72">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Lọc theo trạng thái
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-[#D6D3D1] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#DC2626]"
                        >
                            <option value="all">
                                Tất cả đơn hàng
                            </option>

                            <optgroup label="Trạng thái đơn hàng">
                                {ORDER_STATUSES.map(
                                    (status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    )
                                )}
                            </optgroup>

                            <optgroup label="Trạng thái thanh toán">
                                <option value="paid">
                                    Đã thanh toán
                                </option>

                                <option value="unpaid">
                                    Chưa thanh toán
                                </option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                {/* Thống kê */}
                <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        [
                            "Tổng đơn hàng",
                            statistics.total
                        ],
                        [
                            "Đang xử lý",
                            statistics.processing
                        ],
                        [
                            "Đang giao",
                            statistics.delivering
                        ],
                        [
                            "Đã giao",
                            statistics.completed
                        ]
                    ].map(([title, value]) => (
                        <div
                            key={title}
                            className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm"
                        >
                            <p className="text-sm font-bold text-zinc-500">
                                {title}
                            </p>

                            <h2 className="mt-3 text-4xl font-black">
                                {value}
                            </h2>
                        </div>
                    ))}
                </section>

                {/* Danh sách đơn */}
                <div className="mt-10">
                    {loading ? (
                        <div className="animate-pulse rounded-[2rem] border border-[#D6D3D1] bg-white py-20 text-center font-bold text-zinc-500">
                            Đang tải lịch sử đặt
                            hàng...
                        </div>
                    ) : filteredOrders.length ===
                        0 ? (
                        <div className="rounded-[2rem] border border-[#D6D3D1] bg-white px-6 py-20 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEC] text-2xl">
                                🛍️
                            </div>

                            <h2 className="mt-5 text-2xl font-black">
                                Chưa có đơn hàng
                            </h2>

                            <p className="mt-2 text-zinc-500">
                                {statusFilter === "all"
                                    ? "Bạn chưa có đơn hàng nào tại KICKZONE."
                                    : "Không có đơn hàng phù hợp với trạng thái đã chọn."}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/")
                                }
                                className="mt-6 rounded-xl bg-[#DC2626] px-6 py-3 font-bold text-white transition hover:bg-red-700"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.map(
                                (order) => (
                                    <article
                                        key={
                                            order.madonhang
                                        }
                                        className="rounded-[2rem] border border-[#D6D3D1] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row">
                                                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#E7E2DA] bg-[#F8F6F2]">
                                                    {order.anhdaidien ? (
                                                        <img
                                                            src={
                                                                order.anhdaidien
                                                            }
                                                            alt={getFirstProductName(
                                                                order
                                                            )}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-3xl text-zinc-300">
                                                            👟
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-[#F3F0EA] px-3 py-1 text-xs font-black text-zinc-500">
                                                            Đơn #
                                                            {
                                                                order.madonhang
                                                            }
                                                        </span>

                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                                                order.trangthai
                                                            )}`}
                                                        >
                                                            {
                                                                order.trangthai
                                                            }
                                                        </span>
                                                    </div>

                                                    <h3 className="mt-3 max-w-xl truncate text-2xl font-black">
                                                        {getFirstProductName(
                                                            order
                                                        )}
                                                    </h3>

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
                                                        <span>
                                                            Ngày
                                                            đặt:{" "}
                                                            {formatDate(
                                                                order.ngaytao
                                                            )}
                                                        </span>

                                                        <span className="hidden sm:inline">
                                                            •
                                                        </span>

                                                        <span>
                                                            {Number(
                                                                order.tongsoluongsanpham ||
                                                                0
                                                            )}{" "}
                                                            sản
                                                            phẩm
                                                        </span>

                                                        <span className="hidden sm:inline">
                                                            •
                                                        </span>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${getPaymentClass(
                                                                order.dathanhtoan
                                                            )}`}
                                                        >
                                                            {Number(
                                                                order.dathanhtoan
                                                            ) ===
                                                                1
                                                                ? "Đã thanh toán"
                                                                : "Chưa thanh toán"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-left md:text-right">
                                                <p className="text-sm font-bold text-zinc-400">
                                                    Tổng thanh
                                                    toán
                                                </p>

                                                <p className="mt-1 text-2xl font-black text-[#DC2626]">
                                                    {formatPrice(
                                                        order.tongthanhtoan
                                                    )}
                                                </p>

                                                <div className="mt-4 flex gap-3 md:justify-end">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            detailLoading
                                                        }
                                                        onClick={() =>
                                                            handleViewDetail(
                                                                order.madonhang
                                                            )
                                                        }
                                                        className="rounded-xl border border-[#D6D3D1] bg-white px-4 py-2 text-sm font-bold text-zinc-600 transition hover:border-[#DC2626] hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Xem chi
                                                        tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal chi tiết đơn hàng */}
            {isDetailModalOpen && selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            handleCloseDetailModal();
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-2xl sm:p-8">
                        {/* Modal header */}
                        <div className="flex items-start justify-between gap-5 border-b border-[#ECE7E1] pb-5">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                    Chi tiết đơn hàng
                                </p>

                                <h2 className="mt-2 text-3xl font-black">
                                    Đơn #
                                    {
                                        selectedOrder.madonhang
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-zinc-500">
                                    Đặt lúc{" "}
                                    {formatDate(
                                        selectedOrder.ngaytao
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCloseDetailModal
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-500 transition hover:bg-zinc-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Thông tin chung */}
                        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Trạng thái
                                </p>

                                <span
                                    className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                        selectedOrder.trangthai
                                    )}`}
                                >
                                    {
                                        selectedOrder.trangthai
                                    }
                                </span>
                            </div>

                            <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Thanh toán
                                </p>

                                <p
                                    className={`mt-2 font-black ${Number(
                                        selectedOrder.dathanhtoan
                                    ) === 1
                                        ? "text-emerald-700"
                                        : "text-amber-700"
                                        }`}
                                >
                                    {Number(
                                        selectedOrder.dathanhtoan
                                    ) === 1
                                        ? "Đã thanh toán"
                                        : "Chưa thanh toán"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Hình thức thanh
                                    toán
                                </p>

                                <p className="mt-2 font-black">
                                    {selectedOrder.hinhthucthanhtoan ||
                                        "Chưa cập nhật"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Voucher
                                </p>

                                <p className="mt-2 font-black">
                                    {selectedOrder.magiamgia ||
                                        "Không sử dụng"}
                                </p>
                            </div>
                        </div>

                        {/* Người nhận */}
                        <div className="mt-6 rounded-[2rem] border border-[#E7E2DA] p-5">
                            <h3 className="text-xl font-black">
                                Thông tin nhận hàng
                            </h3>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Người nhận
                                    </p>

                                    <p className="mt-1 font-bold">
                                        {selectedOrder.tennguoinhan ||
                                            "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Số điện thoại
                                    </p>

                                    <p className="mt-1 font-bold">
                                        {selectedOrder.sodienthoai ||
                                            "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Địa chỉ giao
                                    </p>

                                    <p className="mt-1 font-bold leading-6">
                                        {selectedOrder.diachigiao ||
                                            "Chưa cập nhật"}
                                    </p>
                                </div>

                                {selectedOrder.ngaydukiengiao && (
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-400">
                                            Ngày dự kiến
                                            giao
                                        </p>

                                        <p className="mt-1 font-bold">
                                            {formatDate(
                                                selectedOrder.ngaydukiengiao
                                            )}
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.donvivanchuyen && (
                                    <div>
                                        <p className="text-xs font-bold uppercase text-zinc-400">
                                            Thông tin vận
                                            chuyển
                                        </p>

                                        <p className="mt-1 font-bold">
                                            {
                                                selectedOrder.donvivanchuyen
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lý do hủy */}
                        {selectedOrder.lydo_huy && (
                            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                                <p className="text-xs font-bold uppercase text-red-500">
                                    Lý do hủy đơn
                                </p>

                                <p className="mt-2 font-bold text-red-700">
                                    {
                                        selectedOrder.lydo_huy
                                    }
                                </p>
                            </div>
                        )}

                        {/* Sản phẩm */}
                        <div className="mt-7 overflow-x-auto rounded-[2rem] border border-[#E7E2DA]">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-[#F8F5F1] text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-4">
                                            Sản phẩm
                                        </th>

                                        <th className="px-5 py-4">
                                            Phân loại
                                        </th>

                                        <th className="px-5 py-4">
                                            Số lượng
                                        </th>

                                        <th className="px-5 py-4">
                                            Đơn giá
                                        </th>

                                        <th className="px-5 py-4">
                                            Thành tiền
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(selectedOrder.items ||
                                        []).map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.machitietdonhang
                                                    }
                                                    className="border-t border-[#ECE7E1]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E7E2DA] bg-[#F8F6F2]">
                                                                {item.anhdaidien ? (
                                                                    <img
                                                                        src={
                                                                            item.anhdaidien
                                                                        }
                                                                        alt={
                                                                            item.tensanpham
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-xl text-zinc-300">
                                                                        👟
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <p className="font-black">
                                                                {item.tensanpham ||
                                                                    "Sản phẩm"}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-zinc-600">
                                                        Size{" "}
                                                        {item.kichthuoc ||
                                                            "—"}
                                                        <span className="mx-2">
                                                            ·
                                                        </span>
                                                        {item.mausac ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-5 py-4 font-bold">
                                                        {Number(
                                                            item.soluong ||
                                                            0
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 font-bold">
                                                        {formatPrice(
                                                            item.giasaukhuyenmai
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 font-black text-[#DC2626]">
                                                        {formatPrice(
                                                            item.thanhtien
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                </tbody>
                            </table>
                        </div>

                        {/* Tổng tiền */}
                        <div className="mt-6 ml-auto max-w-md rounded-[2rem] bg-[#F8F6F2] p-5">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">
                                    Tiền sản phẩm
                                </span>

                                <strong>
                                    {formatPrice(
                                        selectedOrder.tongtien
                                    )}
                                </strong>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-4">
                                <span className="text-zinc-500">
                                    Phí vận chuyển
                                </span>

                                <strong>
                                    {formatPrice(
                                        selectedOrder.phivanchuyen
                                    )}
                                </strong>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#DDD7CF] pt-4">
                                <span className="text-lg font-black">
                                    Tổng thanh toán
                                </span>

                                <strong className="text-xl text-[#DC2626]">
                                    {formatPrice(
                                        selectedOrder.tongthanhtoan
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-[#ECE7E1] pt-5">
                            <button
                                type="button"
                                onClick={
                                    handleCloseDetailModal
                                }
                                className="rounded-xl bg-[#18181B] px-6 py-3 font-bold text-white transition hover:bg-zinc-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default OrderHistory;