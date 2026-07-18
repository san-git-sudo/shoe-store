import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL =
    "http://localhost:5000/api/auth/admin/customers";

function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [statusFilter, setStatusFilter] =
        useState("all");

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] =
        useState(null);

    const [selectedCustomer, setSelectedCustomer] =
        useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] =
        useState(false);

    // ==========================================
    // LẤY JWT CỦA ADMIN
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
    // XỬ LÝ LỖI XÁC THỰC
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
    // 1. LẤY DANH SÁCH KHÁCH HÀNG
    // GET /api/auth/admin/customers
    // ==========================================
    const fetchCustomers = async () => {
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

            const response = await axios.get(
                API_URL,
                getAuthConfig()
            );

            if (response.data?.success) {
                setCustomers(
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : []
                );
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách khách hàng:",
                error
            );

            setCustomers([]);

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message ||
                "Không thể lấy danh sách khách hàng.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // ==========================================
    // 2. LỌC THEO TRẠNG THÁI
    // ==========================================
    const filteredCustomers = useMemo(() => {
        if (statusFilter === "all") {
            return customers;
        }

        return customers.filter(
            (customer) =>
                customer.trangthai === statusFilter
        );
    }, [customers, statusFilter]);

    // ==========================================
    // 3. THỐNG KÊ
    // ==========================================
    const statistics = useMemo(() => {
        return {
            total: customers.length,

            active: customers.filter(
                (customer) =>
                    customer.trangthai === "hoạt động"
            ).length,

            inactive: customers.filter(
                (customer) =>
                    customer.trangthai ===
                    "không hoạt động"
            ).length,

            hasPhone: customers.filter(
                (customer) =>
                    String(
                        customer.sodienthoai || ""
                    ).trim() !== ""
            ).length
        };
    }, [customers]);

    // ==========================================
    // 4. XEM CHI TIẾT KHÁCH HÀNG
    // GET /api/auth/admin/customers/:id
    // ==========================================
    const handleViewDetail = async (customerId) => {
        if (
            !Number.isInteger(Number(customerId)) ||
            Number(customerId) <= 0
        ) {
            return Swal.fire(
                "Dữ liệu không hợp lệ!",
                "Mã khách hàng không hợp lệ.",
                "warning"
            );
        }

        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Chưa đăng nhập!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        try {
            Swal.fire({
                title: "Đang tải thông tin...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await axios.get(
                `${API_URL}/${customerId}`,
                getAuthConfig()
            );

            Swal.close();

            if (response.data?.success) {
                setSelectedCustomer(
                    response.data.data
                );

                setIsDetailModalOpen(true);
            }
        } catch (error) {
            Swal.close();

            console.error(
                "Lỗi lấy chi tiết khách hàng:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể mở chi tiết!",
                error.response?.data?.message ||
                "Không thể lấy thông tin khách hàng.",
                "error"
            );
        }
    };

    const handleCloseDetailModal = () => {
        if (updatingId !== null) return;

        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
    };

    // ==========================================
    // 5. KÍCH HOẠT / CHUYỂN KHÔNG HOẠT ĐỘNG
    // PUT /api/auth/admin/customers/:id/status
    // ==========================================
    const handleToggleStatus = async (customer) => {
        const customerId = Number(
            customer.manguoidung
        );

        if (
            !Number.isInteger(customerId) ||
            customerId <= 0
        ) {
            return Swal.fire(
                "Dữ liệu không hợp lệ!",
                "Mã khách hàng không hợp lệ.",
                "warning"
            );
        }

        const currentStatus =
            customer.trangthai;

        if (
            ![
                "hoạt động",
                "không hoạt động"
            ].includes(currentStatus)
        ) {
            return Swal.fire(
                "Trạng thái không hợp lệ!",
                "Tài khoản đang có trạng thái không được hệ thống hỗ trợ.",
                "warning"
            );
        }

        const nextStatus =
            currentStatus === "hoạt động"
                ? "không hoạt động"
                : "hoạt động";

        const isDeactivating =
            nextStatus === "không hoạt động";

        const result = await Swal.fire({
            title: isDeactivating
                ? `Chuyển "${customer.hoten || customer.email}" sang không hoạt động?`
                : `Kích hoạt "${customer.hoten || customer.email}"?`,

            text: isDeactivating
                ? "Khách hàng sẽ không thể đăng nhập cho đến khi được kích hoạt lại."
                : "Khách hàng sẽ có thể đăng nhập lại vào hệ thống.",

            icon: "warning",
            showCancelButton: true,

            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",

            confirmButtonText: isDeactivating
                ? "Không hoạt động"
                : "Kích hoạt",

            cancelButtonText: "Hủy"
        });

        if (!result.isConfirmed) return;

        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Chưa đăng nhập!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        try {
            setUpdatingId(customerId);

            const response = await axios.put(
                `${API_URL}/${customerId}/status`,
                {
                    trangthai: nextStatus
                },
                getAuthConfig()
            );

            if (response.data?.success) {
                const updatedCustomer =
                    response.data.data;

                // Cập nhật trực tiếp danh sách,
                // không cần tải lại toàn bộ trang
                setCustomers((prev) =>
                    prev.map((item) =>
                        Number(item.manguoidung) ===
                            customerId
                            ? {
                                ...item,
                                ...updatedCustomer
                            }
                            : item
                    )
                );

                // Nếu modal chi tiết đang mở,
                // cập nhật luôn dữ liệu trong modal
                setSelectedCustomer((prev) => {
                    if (
                        !prev ||
                        Number(prev.manguoidung) !==
                        customerId
                    ) {
                        return prev;
                    }

                    return {
                        ...prev,
                        ...updatedCustomer
                    };
                });

                await Swal.fire(
                    "Thành công!",
                    response.data.message ||
                    "Đã cập nhật trạng thái khách hàng.",
                    "success"
                );
            }
        } catch (error) {
            console.error(
                "Lỗi cập nhật trạng thái:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể cập nhật!",
                error.response?.data?.message ||
                "Không thể thay đổi trạng thái khách hàng.",
                "error"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================
    // 6. HÀM HIỂN THỊ
    // ==========================================
    const formatDate = (dateValue) => {
        if (!dateValue) return "Chưa cập nhật";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Không xác định";
        }

        return date.toLocaleString("vi-VN");
    };

    const getCustomerName = (customer) => {
        const fullName = String(
            customer.hoten || ""
        ).trim();

        return fullName || "Chưa cập nhật họ tên";
    };

    const getCustomerInitial = (customer) => {
        const name = getCustomerName(customer);

        if (name === "Chưa cập nhật họ tên") {
            return "KH";
        }

        const words = name
            .split(/\s+/)
            .filter(Boolean);

        if (words.length === 1) {
            return words[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    };

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            {/* Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                        Khách hàng
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                        Xem thông tin tài khoản và quản lý
                        trạng thái hoạt động của khách hàng.
                    </p>
                </div>

                <div className="w-full sm:w-64">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Trạng thái
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold focus:border-[#DC2626] focus:outline-none"
                    >
                        <option value="all">
                            Tất cả khách hàng
                        </option>

                        <option value="hoạt động">
                            Hoạt động
                        </option>

                        <option value="không hoạt động">
                            Không hoạt động
                        </option>
                    </select>
                </div>
            </div>

            {/* Thống kê */}
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Tổng khách hàng
                    </p>

                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.total}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Đang hoạt động
                    </p>

                    <h3 className="mt-3 text-4xl font-black text-[#DC2626]">
                        {statistics.active}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Không hoạt động
                    </p>

                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.inactive}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Có số điện thoại
                    </p>

                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.hasPhone}
                    </h3>
                </div>
            </section>

            {/* Danh sách khách hàng */}
            <section className="mt-8">
                {loading ? (
                    <div className="animate-pulse rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center font-bold text-zinc-500">
                        Đang tải danh sách khách hàng...
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center">
                        <p className="font-bold text-zinc-500">
                            Không có khách hàng phù hợp.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {filteredCustomers.map(
                            (customer) => {
                                const isActive =
                                    customer.trangthai ===
                                    "hoạt động";

                                const isUpdating =
                                    updatingId ===
                                    Number(
                                        customer.manguoidung
                                    );

                                return (
                                    <article
                                        key={
                                            customer.manguoidung
                                        }
                                        className="overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-5">
                                                <div className="flex min-w-0 items-start gap-4">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEC] text-lg font-black text-[#DC2626]">
                                                        {getCustomerInitial(
                                                            customer
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="rounded-full bg-[#F3F0EA] px-3 py-1 text-xs font-black text-zinc-500">
                                                                #
                                                                {
                                                                    customer.manguoidung
                                                                }
                                                            </span>

                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-black ${isActive
                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                        : "bg-zinc-100 text-zinc-500"
                                                                    }`}
                                                            >
                                                                {
                                                                    customer.trangthai
                                                                }
                                                            </span>
                                                        </div>

                                                        <h3 className="mt-3 break-words text-2xl font-black">
                                                            {getCustomerName(
                                                                customer
                                                            )}
                                                        </h3>

                                                        <p className="mt-2 break-all text-sm font-medium text-zinc-500">
                                                            {
                                                                customer.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                        Số điện
                                                        thoại
                                                    </p>

                                                    <p className="mt-2 font-bold text-zinc-700">
                                                        {customer.sodienthoai ||
                                                            "Chưa cập nhật"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                        Ngày tham
                                                        gia
                                                    </p>

                                                    <p className="mt-2 text-sm font-bold text-zinc-700">
                                                        {formatDate(
                                                            customer.ngaytao
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-[#ECE7E1] px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewDetail(
                                                        customer.manguoidung
                                                    )
                                                }
                                                className="font-bold text-[#DC2626] hover:underline"
                                            >
                                                Xem chi tiết
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    isUpdating
                                                }
                                                onClick={() =>
                                                    handleToggleStatus(
                                                        customer
                                                    )
                                                }
                                                className={`font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isActive
                                                        ? "text-zinc-500 hover:text-red-600"
                                                        : "text-emerald-700 hover:text-emerald-900"
                                                    }`}
                                            >
                                                {isUpdating
                                                    ? "Đang cập nhật..."
                                                    : isActive
                                                        ? "Không hoạt động"
                                                        : "Kích hoạt"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            {/* Modal chi tiết */}
            {isDetailModalOpen &&
                selectedCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-[2rem] border border-[#D6D3D1] bg-white p-7 shadow-2xl">
                            <div className="flex items-start justify-between gap-5 border-b border-[#ECE7E1] pb-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDECEC] text-xl font-black text-[#DC2626]">
                                        {getCustomerInitial(
                                            selectedCustomer
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                            Chi tiết khách
                                            hàng
                                        </p>

                                        <h3 className="mt-1 text-2xl font-black">
                                            {getCustomerName(
                                                selectedCustomer
                                            )}
                                        </h3>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseDetailModal
                                    }
                                    disabled={
                                        updatingId !== null
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-bold text-zinc-400 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Mã khách hàng
                                    </p>

                                    <p className="mt-2 font-black">
                                        #
                                        {
                                            selectedCustomer.manguoidung
                                        }
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Trạng thái
                                    </p>

                                    <p
                                        className={`mt-2 font-black ${selectedCustomer.trangthai ===
                                                "hoạt động"
                                                ? "text-emerald-700"
                                                : "text-zinc-500"
                                            }`}
                                    >
                                        {
                                            selectedCustomer.trangthai
                                        }
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Email
                                    </p>

                                    <p className="mt-2 break-all font-bold">
                                        {
                                            selectedCustomer.email
                                        }
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Số điện thoại
                                    </p>

                                    <p className="mt-2 font-bold">
                                        {selectedCustomer.sodienthoai ||
                                            "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8F6F2] p-4 sm:col-span-2">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Địa chỉ
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap font-bold">
                                        {selectedCustomer.diachi ||
                                            "Chưa cập nhật"}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Ngày tạo
                                    </p>

                                    <p className="mt-2 text-sm font-bold">
                                        {formatDate(
                                            selectedCustomer.ngaytao
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8F6F2] p-4">
                                    <p className="text-xs font-bold uppercase text-zinc-400">
                                        Cập nhật gần nhất
                                    </p>

                                    <p className="mt-2 text-sm font-bold">
                                        {formatDate(
                                            selectedCustomer.ngaycapnhat
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#ECE7E1] pt-5">
                                <button
                                    type="button"
                                    onClick={
                                        handleCloseDetailModal
                                    }
                                    disabled={
                                        updatingId !== null
                                    }
                                    className="rounded-xl border border-[#D6D3D1] px-5 py-2.5 font-bold text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Đóng
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        updatingId !== null
                                    }
                                    onClick={() =>
                                        handleToggleStatus(
                                            selectedCustomer
                                        )
                                    }
                                    className={`rounded-xl px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${selectedCustomer.trangthai ===
                                            "hoạt động"
                                            ? "bg-[#DC2626] hover:bg-red-700"
                                            : "bg-emerald-700 hover:bg-emerald-800"
                                        }`}
                                >
                                    {updatingId !== null
                                        ? "Đang cập nhật..."
                                        : selectedCustomer.trangthai ===
                                            "hoạt động"
                                            ? "Chuyển không hoạt động"
                                            : "Kích hoạt tài khoản"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </main>
    );
}

export default AdminCustomers;