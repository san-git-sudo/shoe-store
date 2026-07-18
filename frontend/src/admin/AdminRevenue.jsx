import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL =
    "http://localhost:5000/api/orders/admin/revenue";

function AdminRevenue() {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] =
        useState(currentYear);

    const [availableYears, setAvailableYears] =
        useState([currentYear]);

    const [summary, setSummary] = useState({
        tongdoanhthu: 0,
        sodondagiao: 0,
        sodondahuy: 0,
        tongdontrongnam: 0,
        thangcaonhat: 0,
        doanhthucaonhat: 0
    });

    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () =>
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

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
    // GET /api/orders/admin/revenue?year=2026
    // ==========================================
    const fetchRevenue = async () => {
        const year = Number(selectedYear);

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100
        ) {
            return Swal.fire(
                "Năm không hợp lệ!",
                "Vui lòng chọn năm hợp lệ.",
                "warning"
            );
        }

        if (!getToken()) {
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
                {
                    ...getAuthConfig(),
                    params: {
                        year
                    }
                }
            );

            if (response.data?.success) {
                const data =
                    response.data.data || {};

                setSummary(data.summary || {});

                setMonths(
                    Array.isArray(data.months)
                        ? data.months
                        : []
                );

                setAvailableYears(
                    Array.isArray(
                        data.availableYears
                    ) &&
                        data.availableYears.length >
                        0
                        ? data.availableYears
                        : [year]
                );
            }
        } catch (error) {
            console.error(
                "Lỗi lấy thống kê doanh thu:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể tải doanh thu!",
                error.response?.data?.message ||
                "Không thể lấy thống kê doanh thu.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenue();
    }, [selectedYear]);

    const formatPrice = (value) =>
        Number(value || 0).toLocaleString(
            "vi-VN"
        ) + "đ";

    // Lấy doanh thu lớn nhất để tính độ rộng thanh
    const maxRevenue = useMemo(() => {
        const values = months.map((month) =>
            Number(month.doanhthu || 0)
        );

        return Math.max(...values, 0);
    }, [months]);

    const getProgressWidth = (revenue) => {
        const value = Number(revenue || 0);

        if (maxRevenue <= 0 || value <= 0) {
            return "0%";
        }

        const percentage =
            (value / maxRevenue) * 100;

        return `${Math.max(
            4,
            Math.min(percentage, 100)
        )}%`;
    };

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Thống kê
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                        Doanh thu
                    </h2>

                    <p className="mt-3 text-sm text-zinc-500">
                        Doanh thu chỉ tính từ các đơn
                        hàng đã giao.
                    </p>
                </div>

                <div className="w-full sm:w-48">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Năm thống kê
                    </label>

                    <select
                        value={selectedYear}
                        disabled={loading}
                        onChange={(event) =>
                            setSelectedYear(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                        className="w-full rounded-xl border border-[#D6D3D1] bg-white px-4 py-3 font-bold focus:border-[#DC2626] focus:outline-none disabled:opacity-50"
                    >
                        {availableYears.map((year) => (
                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Tổng doanh thu
                    </p>
                    <h3 className="mt-3 break-words text-3xl font-black text-[#DC2626]">
                        {formatPrice(
                            summary.tongdoanhthu
                        )}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Đơn đã giao
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {Number(
                            summary.sodondagiao || 0
                        )}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Đơn đã hủy
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {Number(
                            summary.sodondahuy || 0
                        )}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Tháng cao nhất
                    </p>

                    <h3 className="mt-3 text-3xl font-black">
                        {Number(
                            summary.thangcaonhat || 0
                        ) > 0
                            ? `Tháng ${summary.thangcaonhat}`
                            : "Chưa có"}
                    </h3>

                    <p className="mt-2 text-sm font-bold text-[#DC2626]">
                        {formatPrice(
                            summary.doanhthucaonhat
                        )}
                    </p>
                </div>
            </section>

            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-black">
                        Doanh thu theo tháng
                    </h3>

                    <span className="rounded-full bg-[#F3F0EA] px-4 py-2 text-sm font-bold text-zinc-500">
                        {summary.tongdontrongnam || 0} đơn
                        trong năm
                    </span>
                </div>

                {loading ? (
                    <div className="py-20 text-center font-bold text-zinc-500">
                        Đang tải thống kê doanh thu...
                    </div>
                ) : months.length === 0 ? (
                    <div className="py-20 text-center font-bold text-zinc-500">
                        Chưa có dữ liệu doanh thu.
                    </div>
                ) : (
                    <div className="mt-8 space-y-5">
                        {months.map((month) => (
                            <div key={month.thang}>
                                <div className="mb-2 flex flex-wrap justify-between gap-2 font-bold">
                                    <span>
                                        Tháng {month.thang}
                                    </span>

                                    <div className="text-right">
                                        <span className="text-[#DC2626]">
                                            {formatPrice(
                                                month.doanhthu
                                            )}
                                        </span>

                                        <span className="ml-3 text-xs text-zinc-400">
                                            {month.sodondagiao ||
                                                0}{" "}
                                            đơn đã giao
                                        </span>
                                    </div>
                                </div>

                                <div className="h-4 overflow-hidden rounded-full bg-[#ECE7E1]">
                                    <div
                                        className="h-4 rounded-full bg-[#DC2626] transition-all duration-500"
                                        style={{
                                            width:
                                                getProgressWidth(
                                                    month.doanhthu
                                                )
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default AdminRevenue;