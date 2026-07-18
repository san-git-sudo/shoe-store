import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL =
    "http://localhost:5000/api/orders/admin/dashboard";

function AdminDashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({
        summary: {
            doanhthu: 0,
            tongdonhang: 0,
            tongsanpham: 0,
            tongkhachhang: 0,
            donchoxacnhan: 0,
            donhuy: 0
        },
        recentOrders: [],
        bestSellingProducts: [],
        lowStockProducts: []
    });

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

    const fetchDashboard = async () => {
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
                getAuthConfig()
            );

            if (response.data?.success) {
                setDashboard({
                    summary:
                        response.data.data?.summary || {},
                    recentOrders:
                        response.data.data
                            ?.recentOrders || [],
                    bestSellingProducts:
                        response.data.data
                            ?.bestSellingProducts || [],
                    lowStockProducts:
                        response.data.data
                            ?.lowStockProducts || []
                });
            }
        } catch (error) {
            console.error(
                "Lỗi lấy dữ liệu Dashboard:",
                error
            );

            if (handleAuthError(error)) return;

            Swal.fire(
                "Không thể tải Dashboard!",
                error.response?.data?.message ||
                "Không thể lấy dữ liệu Dashboard.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const formatPrice = (value) =>
        Number(value || 0).toLocaleString(
            "vi-VN"
        ) + "đ";

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

    const stats = [
        {
            title: "Doanh thu",
            value: formatPrice(
                dashboard.summary.doanhthu
            ),
            desc: "Từ các đơn đã giao"
        },
        {
            title: "Đơn hàng",
            value: Number(
                dashboard.summary.tongdonhang || 0
            ).toLocaleString("vi-VN"),
            desc: `${dashboard.summary.donchoxacnhan || 0} đơn chờ xác nhận`
        },
        {
            title: "Sản phẩm",
            value: Number(
                dashboard.summary.tongsanpham || 0
            ).toLocaleString("vi-VN"),
            desc: `${dashboard.lowStockProducts.length} sản phẩm sắp hết`
        },
        {
            title: "Khách hàng",
            value: Number(
                dashboard.summary.tongkhachhang || 0
            ).toLocaleString("vi-VN"),
            desc: `${dashboard.summary.donhuy || 0} đơn đã hủy`
        }
    ];

    if (loading) {
        return (
            <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-20 text-center font-bold text-zinc-500">
                    Đang tải dữ liệu Dashboard...
                </div>
            </main>
        );
    }

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div>
                <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                    Luxury Admin
                </p>

                <h2 className="mt-2 text-5xl font-black">
                    Dashboard
                </h2>

                <p className="mt-3 text-sm text-zinc-500">
                    Tổng quan hoạt động của cửa hàng.
                </p>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.title}
                        className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm font-bold text-zinc-500">
                            {item.title}
                        </p>

                        <h3 className="mt-3 break-words text-3xl font-black">
                            {item.value}
                        </h3>

                        <p className="mt-2 text-sm text-[#DC2626]">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-black">
                            Đơn hàng gần đây
                        </h3>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/orders")
                            }
                            className="font-bold text-[#DC2626] hover:underline"
                        >
                            Xem tất cả
                        </button>
                    </div>

                    {dashboard.recentOrders.length ===
                        0 ? (
                        <div className="py-12 text-center font-bold text-zinc-400">
                            Chưa có đơn hàng.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-3xl border border-[#E7E2DA]">
                            <table className="w-full min-w-[750px] text-left text-sm">
                                <thead className="bg-[#F8F5F1] text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-4">
                                            Mã đơn
                                        </th>
                                        <th className="px-5 py-4">
                                            Khách hàng
                                        </th>
                                        <th className="px-5 py-4">
                                            Sản phẩm
                                        </th>
                                        <th className="px-5 py-4">
                                            Giá
                                        </th>
                                        <th className="px-5 py-4">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.recentOrders.map(
                                        (order) => (
                                            <tr
                                                key={
                                                    order.madonhang
                                                }
                                                className="border-t border-[#ECE7E1]"
                                            >
                                                <td className="px-5 py-4 font-black">
                                                    #
                                                    {
                                                        order.madonhang
                                                    }
                                                </td>

                                                <td className="px-5 py-4">
                                                    {order.tenkhachhang ||
                                                        order.tennguoinhan ||
                                                        "Khách hàng"}
                                                </td>

                                                <td className="max-w-[220px] truncate px-5 py-4">
                                                    {order.sanpham ||
                                                        "Chưa có sản phẩm"}
                                                </td>

                                                <td className="px-5 py-4 font-black text-[#DC2626]">
                                                    {formatPrice(
                                                        order.tongthanhtoan
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
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
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                        <h3 className="text-2xl font-black">
                            Sản phẩm bán chạy
                        </h3>

                        {dashboard.bestSellingProducts
                            .length === 0 ? (
                            <p className="mt-6 text-sm font-bold text-zinc-400">
                                Chưa có dữ liệu bán hàng.
                            </p>
                        ) : (
                            <div className="mt-6 space-y-5">
                                {dashboard.bestSellingProducts.map(
                                    (
                                        product,
                                        index
                                    ) => (
                                        <div
                                            key={`${product.masanpham}-${product.tensanpham}`}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                {product.anhdaidien && (
                                                    <img
                                                        src={
                                                            product.anhdaidien
                                                        }
                                                        alt={
                                                            product.tensanpham
                                                        }
                                                        className="h-12 w-12 rounded-xl object-cover"
                                                    />
                                                )}

                                                <div className="min-w-0">
                                                    <p className="truncate font-bold">
                                                        {
                                                            product.tensanpham
                                                        }
                                                    </p>

                                                    <p className="text-sm text-zinc-500">
                                                        {
                                                            product.soluongban
                                                        }{" "}
                                                        lượt bán
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-xl bg-[#F3F0EA] px-3 py-2 font-black text-[#DC2626]">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                        <h3 className="text-2xl font-black">
                            Sản phẩm sắp hết
                        </h3>

                        {dashboard.lowStockProducts
                            .length === 0 ? (
                            <p className="mt-6 text-sm font-bold text-emerald-700">
                                Tồn kho đang ổn định.
                            </p>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {dashboard.lowStockProducts.map(
                                    (product) => (
                                        <div
                                            key={
                                                product.masanpham
                                            }
                                            className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8F6F2] p-4"
                                        >
                                            <p className="truncate font-bold">
                                                {
                                                    product.tensanpham
                                                }
                                            </p>

                                            <span className="shrink-0 font-black text-[#DC2626]">
                                                {
                                                    product.tongtonkho
                                                }{" "}
                                                đôi
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;