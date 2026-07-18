import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL =
    "http://localhost:5000/api/orders/admin";

const ORDER_STATUSES = [
    "chờ xác nhận",
    "đang xử lý",
    "đang giao",
    "đã giao",
    "đã hủy"
];

const STATUS_TRANSITIONS = {
    "chờ xác nhận": [
        "đang xử lý",
        "đã hủy"
    ],
    "đang xử lý": [
        "đang giao",
        "đã hủy"
    ],
    "đang giao": [
        "đã giao"
    ],
    "đã giao": [],
    "đã hủy": []
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [paymentFilter, setPaymentFilter] =
        useState("all");

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] =
        useState(false);

    // ==========================================
    // JWT ADMIN
    // ==========================================
    const getToken = () =>
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    // ==========================================
    // XỬ LÝ LỖI 401 / 403
    // ==========================================
    const handleAuthError = (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            Swal.fire(
                "Không có quyền truy cập!",
                error.response?.data?.message ||
                "Phiên đăng nhập đã hết hạn hoặc tài khoản không có quyền admin.",
                "warning"
            );

            return true;
        }

        return false;
    };

    // ==========================================
    // LẤY DANH SÁCH ĐƠN HÀNG
    // GET /api/orders/admin/list
    // ==========================================
    const fetchOrders = async () => {
        const token = getToken();

        if (!token) {
            setLoading(false);

            return Swal.fire(
                "Chưa đăng nhập!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        try {
            setLoading(true);

            const params = {};

            if (statusFilter !== "all") {
                params.status = statusFilter;
            }

            if (paymentFilter !== "all") {
                params.payment = paymentFilter;
            }

            const response = await axios.get(
                `${API_URL}/list`,
                {
                    ...getAuthConfig(),
                    params
                }
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
                "Lỗi lấy danh sách đơn hàng:",
                error
            );

            setOrders([]);

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message ||
                "Không thể lấy danh sách đơn hàng.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter]);

    // ==========================================
    // THỐNG KÊ NHẸ TRÊN DANH SÁCH
    // ==========================================
    const statistics = useMemo(() => {
        return {
            total: orders.length,

            pending: orders.filter(
                (order) =>
                    order.trangthai === "chờ xác nhận"
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

    // ==========================================
    // XEM CHI TIẾT
    // GET /api/orders/admin/:id
    // ==========================================
    const handleViewDetail = async (orderId) => {
        const parsedOrderId = Number(orderId);

        if (
            !Number.isInteger(parsedOrderId) ||
            parsedOrderId <= 0
        ) {
            return Swal.fire(
                "Dữ liệu không hợp lệ!",
                "Mã đơn hàng không hợp lệ.",
                "warning"
            );
        }

        if (!getToken()) {
            return Swal.fire(
                "Chưa đăng nhập!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        try {
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
                setSelectedOrder(response.data.data);
                setIsDetailModalOpen(true);
            }
        } catch (error) {
            Swal.close();

            console.error(
                "Lỗi lấy chi tiết đơn hàng:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể mở chi tiết!",
                error.response?.data?.message ||
                "Không thể lấy chi tiết đơn hàng.",
                "error"
            );
        }
    };

    const handleCloseDetailModal = () => {
        if (updatingId !== null) return;

        setIsDetailModalOpen(false);
        setSelectedOrder(null);
    };

    // ==========================================
    // CẬP NHẬT LẠI ORDER TRÊN STATE
    // ==========================================
    const replaceUpdatedOrder = (updatedOrder) => {
        if (!updatedOrder) return;

        setOrders((previousOrders) =>
            previousOrders.map((order) =>
                Number(order.madonhang) ===
                    Number(updatedOrder.madonhang)
                    ? {
                        ...order,
                        ...updatedOrder
                    }
                    : order
            )
        );

        setSelectedOrder((previousOrder) => {
            if (
                !previousOrder ||
                Number(previousOrder.madonhang) !==
                Number(updatedOrder.madonhang)
            ) {
                return previousOrder;
            }

            return {
                ...previousOrder,
                ...updatedOrder
            };
        });
    };

    // ==========================================
    // CẬP NHẬT TRẠNG THÁI ĐƠN
    // PUT /api/orders/admin/:id/status
    // ==========================================
    const handleUpdateStatus = async (
        order,
        nextStatus
    ) => {
        const orderId = Number(order.madonhang);

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {
            return Swal.fire(
                "Dữ liệu không hợp lệ!",
                "Mã đơn hàng không hợp lệ.",
                "warning"
            );
        }

        if (!ORDER_STATUSES.includes(nextStatus)) {
            return Swal.fire(
                "Trạng thái không hợp lệ!",
                "Vui lòng chọn trạng thái được hệ thống hỗ trợ.",
                "warning"
            );
        }

        if (nextStatus === order.trangthai) {
            return;
        }

        const allowedStatuses =
            STATUS_TRANSITIONS[order.trangthai] || [];

        if (!allowedStatuses.includes(nextStatus)) {
            return Swal.fire(
                "Không thể cập nhật!",
                `Không thể chuyển đơn từ "${order.trangthai}" sang "${nextStatus}".`,
                "warning"
            );
        }

        let cancelReason = "";

        if (nextStatus === "đã hủy") {
            const cancelResult = await Swal.fire({
                title: "Lý do hủy đơn",
                input: "textarea",
                inputPlaceholder:
                    "Nhập lý do hủy đơn hàng...",
                inputAttributes: {
                    maxlength: "500"
                },
                showCancelButton: true,
                confirmButtonText: "Tiếp tục",
                cancelButtonText: "Đóng",
                confirmButtonColor: "#DC2626",
                inputValidator: (value) => {
                    const reason = String(
                        value || ""
                    ).trim();

                    if (!reason) {
                        return "Vui lòng nhập lý do hủy.";
                    }

                    if (reason.length < 5) {
                        return "Lý do hủy phải có ít nhất 5 ký tự.";
                    }

                    return undefined;
                }
            });

            if (!cancelResult.isConfirmed) {
                return;
            }

            cancelReason = String(
                cancelResult.value || ""
            ).trim();
        }

        const confirmResult = await Swal.fire({
            title:
                nextStatus === "đã hủy"
                    ? `Xác nhận hủy đơn #${orderId}?`
                    : `Chuyển đơn #${orderId} sang "${nextStatus}"?`,

            text:
                nextStatus === "đã hủy"
                    ? "Đơn đã hủy sẽ không thể khôi phục."
                    : "Trạng thái đơn hàng sẽ được cập nhật ngay.",

            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",
            confirmButtonText:
                nextStatus === "đã hủy"
                    ? "Hủy đơn"
                    : "Cập nhật",
            cancelButtonText: "Đóng"
        });

        if (!confirmResult.isConfirmed) return;

        try {
            setUpdatingId(orderId);

            const payload = {
                trangthai: nextStatus
            };

            if (nextStatus === "đã hủy") {
                payload.lydo_huy = cancelReason;
            }

            const response = await axios.put(
                `${API_URL}/${orderId}/status`,
                payload,
                getAuthConfig()
            );

            if (response.data?.success) {
                replaceUpdatedOrder(
                    response.data.data
                );

                await Swal.fire(
                    "Thành công!",
                    response.data.message ||
                    "Đã cập nhật trạng thái đơn hàng.",
                    "success"
                );
            }
        } catch (error) {
            console.error(
                "Lỗi cập nhật trạng thái đơn:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể cập nhật!",
                error.response?.data?.message ||
                "Không thể cập nhật trạng thái đơn hàng.",
                "error"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // CẬP NHẬT THANH TOÁN
    // PUT /api/orders/admin/:id/payment
    // ==========================================
    const handleUpdatePayment = async (
        order,
        nextPaymentStatus
    ) => {
        const orderId = Number(order.madonhang);
        const paymentValue = Number(
            nextPaymentStatus
        );

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {
            return Swal.fire(
                "Dữ liệu không hợp lệ!",
                "Mã đơn hàng không hợp lệ.",
                "warning"
            );
        }

        if (![0, 1].includes(paymentValue)) {
            return Swal.fire(
                "Dữ liệu không hợp lệ!",
                "Trạng thái thanh toán chỉ được là 0 hoặc 1.",
                "warning"
            );
        }

        if (
            Number(order.dathanhtoan) ===
            paymentValue
        ) {
            return;
        }

        if (
            order.trangthai === "đã hủy" &&
            paymentValue === 1
        ) {
            return Swal.fire(
                "Không thể cập nhật!",
                "Không thể xác nhận thanh toán cho đơn đã hủy.",
                "warning"
            );
        }

        const result = await Swal.fire({
            title:
                paymentValue === 1
                    ? `Xác nhận đơn #${orderId} đã thanh toán?`
                    : `Chuyển đơn #${orderId} về chưa thanh toán?`,

            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng"
        });

        if (!result.isConfirmed) return;

        try {
            setUpdatingId(orderId);

            const response = await axios.put(
                `${API_URL}/${orderId}/payment`,
                {
                    dathanhtoan: paymentValue
                },
                getAuthConfig()
            );

            if (response.data?.success) {
                replaceUpdatedOrder(
                    response.data.data
                );

                await Swal.fire(
                    "Thành công!",
                    response.data.message ||
                    "Đã cập nhật thanh toán.",
                    "success"
                );
            }
        } catch (error) {
            console.error(
                "Lỗi cập nhật thanh toán:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể cập nhật!",
                error.response?.data?.message ||
                "Không thể cập nhật thanh toán.",
                "error"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // HÀM HIỂN THỊ
    // ==========================================
    const formatPrice = (value) =>
        Number(value || 0).toLocaleString(
            "vi-VN"
        ) + "đ";

    const formatDate = (value) => {
        if (!value) return "Chưa cập nhật";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Không xác định";
        }

        return date.toLocaleString("vi-VN");
    };

    const getCustomerName = (order) =>
        order.tenkhachhang ||
        order.tennguoinhan ||
        "Khách hàng";

    const getStatusClass = (status) => {
        switch (status) {
            case "đã giao":
                return "bg-emerald-50 text-emerald-700";

            case "đã hủy":
                return "bg-red-50 text-red-700";

            case "đang giao":
                return "bg-blue-50 text-blue-700";

            case "đang xử lý":
                return "bg-amber-50 text-amber-700";

            default:
                return "bg-zinc-100 text-zinc-600";
        }
    };

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                        Đơn hàng
                    </h2>

                    <p className="mt-3 text-sm text-zinc-500">
                        Xem chi tiết, cập nhật trạng thái
                        và tình trạng thanh toán đơn hàng.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-[#D6D3D1] bg-white px-4 py-3 text-sm font-bold focus:border-[#DC2626] focus:outline-none"
                    >
                        <option value="all">
                            Tất cả trạng thái
                        </option>

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
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-[#D6D3D1] bg-white px-4 py-3 text-sm font-bold focus:border-[#DC2626] focus:outline-none"
                    >
                        <option value="all">
                            Tất cả thanh toán
                        </option>
                        <option value="0">
                            Chưa thanh toán
                        </option>
                        <option value="1">
                            Đã thanh toán
                        </option>
                    </select>
                </div>
            </div>

            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    [
                        "Tổng đơn",
                        statistics.total
                    ],
                    [
                        "Chờ xác nhận",
                        statistics.pending
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

                        <h3 className="mt-3 text-4xl font-black">
                            {value}
                        </h3>
                    </div>
                ))}
            </section>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                {loading ? (
                    <div className="py-16 text-center font-bold text-zinc-500">
                        Đang tải danh sách đơn hàng...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-16 text-center font-bold text-zinc-500">
                        Không có đơn hàng phù hợp.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-left text-sm">
                            <thead className="text-zinc-500">
                                <tr>
                                    <th className="py-4">
                                        Mã đơn
                                    </th>
                                    <th>Khách hàng</th>
                                    <th>Sản phẩm</th>
                                    <th>Tổng tiền</th>
                                    <th>Thanh toán</th>
                                    <th>Trạng thái</th>
                                    <th>Cập nhật</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => {
                                    const isUpdating =
                                        updatingId ===
                                        Number(
                                            order.madonhang
                                        );

                                    const nextStatuses =
                                        STATUS_TRANSITIONS[
                                        order.trangthai
                                        ] || [];

                                    return (
                                        <tr
                                            key={
                                                order.madonhang
                                            }
                                            className="border-t border-[#ECE7E1]"
                                        >
                                            <td className="py-4 font-black">
                                                #
                                                {
                                                    order.madonhang
                                                }
                                            </td>

                                            <td>
                                                <p className="font-bold">
                                                    {getCustomerName(
                                                        order
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-400">
                                                    {order.sodienthoai ||
                                                        order.emailkhachhang ||
                                                        "Chưa cập nhật"}
                                                </p>
                                            </td>

                                            <td>
                                                <p className="max-w-[230px] truncate font-medium">
                                                    {order.tongsoluongsanpham ||
                                                        0}{" "}
                                                    sản phẩm
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-400">
                                                    {order.sodongchitiet ||
                                                        0}{" "}
                                                    dòng chi tiết
                                                </p>
                                            </td>

                                            <td className="font-black text-[#DC2626]">
                                                {formatPrice(
                                                    order.tongthanhtoan
                                                )}
                                            </td>

                                            <td>
                                                <select
                                                    value={String(
                                                        Number(
                                                            order.dathanhtoan
                                                        )
                                                    )}
                                                    disabled={
                                                        isUpdating ||
                                                        order.trangthai ===
                                                        "đã hủy"
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleUpdatePayment(
                                                            order,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="rounded-xl border border-[#D6D3D1] bg-white px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="0">
                                                        Chưa thanh
                                                        toán
                                                    </option>
                                                    <option value="1">
                                                        Đã thanh
                                                        toán
                                                    </option>
                                                </select>
                                            </td>

                                            <td>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                                                        order.trangthai
                                                    )}`}
                                                >
                                                    {
                                                        order.trangthai
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {nextStatuses.length >
                                                    0 ? (
                                                    <select
                                                        value=""
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        onChange={(
                                                            event
                                                        ) => {
                                                            const value =
                                                                event
                                                                    .target
                                                                    .value;

                                                            if (
                                                                value
                                                            ) {
                                                                handleUpdateStatus(
                                                                    order,
                                                                    value
                                                                );
                                                            }
                                                        }}
                                                        className="rounded-xl border border-[#D6D3D1] bg-white px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <option value="">
                                                            Chọn trạng
                                                            thái
                                                        </option>

                                                        {nextStatuses.map(
                                                            (
                                                                status
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        status
                                                                    }
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {
                                                                        status
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs font-bold text-zinc-400">
                                                        Đã kết thúc
                                                    </span>
                                                )}
                                            </td>

                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewDetail(
                                                            order.madonhang
                                                        )
                                                    }
                                                    className="font-bold text-[#DC2626] hover:underline"
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isDetailModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
                        <div className="flex items-start justify-between border-b border-[#ECE7E1] pb-5">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                    Chi tiết đơn hàng
                                </p>

                                <h3 className="mt-2 text-3xl font-black">
                                    Đơn #
                                    {
                                        selectedOrder.madonhang
                                    }
                                </h3>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    updatingId !== null
                                }
                                onClick={
                                    handleCloseDetailModal
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-500 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                [
                                    "Người nhận",
                                    selectedOrder.tennguoinhan
                                ],
                                [
                                    "Số điện thoại",
                                    selectedOrder.sodienthoai
                                ],
                                [
                                    "Thanh toán",
                                    Number(
                                        selectedOrder.dathanhtoan
                                    ) === 1
                                        ? "Đã thanh toán"
                                        : "Chưa thanh toán"
                                ],
                                [
                                    "Trạng thái",
                                    selectedOrder.trangthai
                                ]
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-2xl bg-[#F8F6F2] p-4"
                                >
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        {label}
                                    </p>
                                    <p className="mt-2 font-black">
                                        {value ||
                                            "Chưa cập nhật"}
                                    </p>
                                </div>
                            ))}

                            <div className="rounded-2xl bg-[#F8F6F2] p-4 md:col-span-2">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Địa chỉ giao
                                </p>
                                <p className="mt-2 font-bold">
                                    {selectedOrder.diachigiao ||
                                        "Chưa cập nhật"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Ngày đặt
                                </p>
                                <p className="mt-2 text-sm font-bold">
                                    {formatDate(
                                        selectedOrder.ngaytao
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase text-zinc-400">
                                    Voucher
                                </p>
                                <p className="mt-2 font-bold">
                                    {selectedOrder.magiamgia ||
                                        "Không sử dụng"}
                                </p>
                            </div>
                        </div>

                        {selectedOrder.lydo_huy && (
                            <div className="mt-5 rounded-2xl bg-red-50 p-4">
                                <p className="text-xs font-bold uppercase text-red-500">
                                    Lý do hủy
                                </p>
                                <p className="mt-2 font-bold text-red-700">
                                    {
                                        selectedOrder.lydo_huy
                                    }
                                </p>
                            </div>
                        )}

                        <div className="mt-7 overflow-hidden rounded-3xl border border-[#E7E2DA]">
                            <table className="w-full text-left text-sm">
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
                                    {(selectedOrder.items || []).map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.machitietdonhang
                                                }
                                                className="border-t border-[#ECE7E1]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.anhdaidien && (
                                                            <img
                                                                src={
                                                                    item.anhdaidien
                                                                }
                                                                alt={
                                                                    item.tensanpham
                                                                }
                                                                className="h-12 w-12 rounded-xl object-cover"
                                                            />
                                                        )}

                                                        <p className="font-bold">
                                                            {
                                                                item.tensanpham
                                                            }
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    Size{" "}
                                                    {item.kichthuoc ||
                                                        "—"}{" "}
                                                    ·{" "}
                                                    {item.mausac ||
                                                        "—"}
                                                </td>

                                                <td className="px-5 py-4 font-bold">
                                                    {
                                                        item.soluong
                                                    }
                                                </td>

                                                <td className="px-5 py-4">
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

                        <div className="mt-6 ml-auto max-w-md space-y-3 rounded-2xl bg-[#F8F6F2] p-5">
                            <div className="flex justify-between">
                                <span>Tiền sản phẩm</span>
                                <strong>
                                    {formatPrice(
                                        selectedOrder.tongtien
                                    )}
                                </strong>
                            </div>

                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <strong>
                                    {formatPrice(
                                        selectedOrder.phivanchuyen
                                    )}
                                </strong>
                            </div>

                            <div className="flex justify-between border-t border-[#DDD7CF] pt-3 text-lg">
                                <span className="font-black">
                                    Tổng thanh toán
                                </span>
                                <strong className="text-[#DC2626]">
                                    {formatPrice(
                                        selectedOrder.tongthanhtoan
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminOrders;