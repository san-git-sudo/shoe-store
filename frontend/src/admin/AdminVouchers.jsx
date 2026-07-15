import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:5000/api";

const createEmptyFormData = () => ({
    magiamgia: "",
    mota: "",
    loaikhuyenmai: "percent",
    giatrigiam: "",
    giantoida: "",
    dontoithieu: "0",
    phamvi: "all",
    masanpham: "",
    madanhmuc: "",
    mahang: "",
    ngaybatdau: "",
    ngayketthuc: "",
    trangthai: "hoạt động"
});

function AdminVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState(null);
    const [formData, setFormData] = useState(createEmptyFormData);

    const getToken = () =>
        localStorage.getItem("adminToken") || localStorage.getItem("token");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    const toDateTimeLocal = (value) => {
        if (!value) return "";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";

        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        }).format(Number(value) || 0);

    const formatDate = (value) => {
        if (!value) return "--";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "--";

        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    };

    const getScopeFromVoucher = (voucher) => {
        if (Number(voucher.apdungtoanbo) === 1) return "all";
        if (voucher.masanpham) return "product";
        if (voucher.madanhmuc) return "category";
        if (voucher.mahang) return "brand";
        return "all";
    };

    const getScopeLabel = (voucher) => {
        if (Number(voucher.apdungtoanbo) === 1) return "Toàn bộ cửa hàng";
        if (voucher.masanpham) {
            return `Sản phẩm: ${voucher.tensanpham || `#${voucher.masanpham}`}`;
        }
        if (voucher.madanhmuc) {
            return `Danh mục: ${voucher.tendanhmuc || `#${voucher.madanhmuc}`}`;
        }
        if (voucher.mahang) {
            return `Hãng: ${voucher.tenhang || `#${voucher.mahang}`}`;
        }
        return "Chưa xác định";
    };

    const getDisplayStatus = (voucher) => {
        const now = new Date();
        const startDate = new Date(voucher.ngaybatdau);
        const endDate = new Date(voucher.ngayketthuc);

        if (voucher.trangthai === "vô hiệu") {
            return {
                text: "Vô hiệu",
                className: "border-zinc-300 bg-zinc-100 text-zinc-600"
            };
        }

        if (!Number.isNaN(endDate.getTime()) && endDate < now) {
            return {
                text: "Hết hạn",
                className: "border-red-200 bg-red-50 text-red-600"
            };
        }

        if (!Number.isNaN(startDate.getTime()) && startDate > now) {
            return {
                text: "Sắp diễn ra",
                className: "border-amber-200 bg-amber-50 text-amber-700"
            };
        }

        return {
            text: "Đang hoạt động",
            className: "border-green-200 bg-green-50 text-green-700"
        };
    };

    const fetchInitialData = async () => {
        const token = getToken();

        if (!token) {
            setLoading(false);
            await Swal.fire("Cảnh báo!", "Phiên đăng nhập đã hết hạn.", "warning");
            return;
        }

        try {
            setLoading(true);

            const [voucherRes, productRes, categoryRes, brandRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/vouchers/admin/list`, getAuthConfig()),
                axios.get(`${API_BASE_URL}/products`).catch(() => null),
                axios.get(`${API_BASE_URL}/categories`).catch(() => null),
                axios.get(`${API_BASE_URL}/brands`).catch(() => null)
            ]);

            setVouchers(voucherRes.data?.success ? voucherRes.data.data : []);
            setProducts(productRes?.data?.success ? productRes.data.data : []);
            setCategories(categoryRes?.data?.success ? categoryRes.data.data : []);
            setBrands(brandRes?.data?.success ? brandRes.data.data : []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu voucher:", error);

            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message || "Vui lòng kiểm tra lại API hoặc phiên đăng nhập.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingVoucherId(null);
        setFormData(createEmptyFormData());
        setIsModalOpen(true);
    };

    const handleOpenEditModal = async (voucherId) => {
        try {
            Swal.fire({
                title: "Đang tải voucher...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await axios.get(
                `${API_BASE_URL}/vouchers/admin/${voucherId}`,
                getAuthConfig()
            );

            Swal.close();

            if (!response.data?.success) return;

            const voucher = response.data.data;

            setIsEditMode(true);
            setEditingVoucherId(voucherId);
            setFormData({
                magiamgia: voucher.magiamgia || "",
                mota: voucher.mota || "",
                loaikhuyenmai: voucher.loaikhuyenmai || "percent",
                giatrigiam: voucher.giatrigiam ?? "",
                giantoida: voucher.giantoida ?? "",
                dontoithieu: voucher.dontoithieu ?? "0",
                phamvi: getScopeFromVoucher(voucher),
                masanpham: voucher.masanpham ? String(voucher.masanpham) : "",
                madanhmuc: voucher.madanhmuc ? String(voucher.madanhmuc) : "",
                mahang: voucher.mahang ? String(voucher.mahang) : "",
                ngaybatdau: toDateTimeLocal(voucher.ngaybatdau),
                ngayketthuc: toDateTimeLocal(voucher.ngayketthuc),
                trangthai:
                    voucher.trangthai === "vô hiệu" ? "vô hiệu" : "hoạt động"
            });
            setIsModalOpen(true);
        } catch (error) {
            Swal.close();
            console.error("Lỗi tải chi tiết voucher:", error);
            Swal.fire(
                "Lỗi!",
                error.response?.data?.message || "Không thể tải chi tiết voucher.",
                "error"
            );
        }
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingVoucherId(null);
        setFormData(createEmptyFormData());
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        if (name === "magiamgia") {
            setFormData((previous) => ({
                ...previous,
                magiamgia: value.toUpperCase().replace(/\s+/g, "")
            }));
            return;
        }

        if (name === "loaikhuyenmai") {
            setFormData((previous) => ({
                ...previous,
                loaikhuyenmai: value,
                giantoida: value === "fixed" ? "" : previous.giantoida
            }));
            return;
        }

        if (name === "phamvi") {
            setFormData((previous) => ({
                ...previous,
                phamvi: value,
                masanpham: "",
                madanhmuc: "",
                mahang: ""
            }));
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const validateForm = () => {
        const code = formData.magiamgia.trim().toUpperCase();
        const discountValue = Number(formData.giatrigiam);
        const maxDiscount = Number(formData.giantoida);
        const minimumOrder = Number(formData.dontoithieu || 0);
        const startDate = new Date(formData.ngaybatdau);
        const endDate = new Date(formData.ngayketthuc);

        if (!code) return "Mã giảm giá không được để trống.";
        if (code.length < 3 || code.length > 30) {
            return "Mã giảm giá phải có từ 3 đến 30 ký tự.";
        }
        if (!/^[A-Z0-9-]+$/.test(code)) {
            return "Mã giảm giá chỉ được chứa chữ, số và dấu gạch ngang.";
        }
        if (!["percent", "fixed"].includes(formData.loaikhuyenmai)) {
            return "Loại khuyến mãi không hợp lệ.";
        }
        if (!Number.isFinite(discountValue) || discountValue <= 0) {
            return "Giá trị giảm phải lớn hơn 0.";
        }
        if (formData.loaikhuyenmai === "percent" && discountValue > 100) {
            return "Voucher phần trăm không được giảm quá 100%.";
        }
        if (
            formData.loaikhuyenmai === "percent" &&
            (!formData.giantoida || !Number.isFinite(maxDiscount) || maxDiscount <= 0)
        ) {
            return "Voucher phần trăm phải có mức giảm tối đa lớn hơn 0.";
        }
        if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
            return "Đơn tối thiểu không được là số âm.";
        }
        if (!formData.ngaybatdau || Number.isNaN(startDate.getTime())) {
            return "Ngày bắt đầu không hợp lệ.";
        }
        if (!formData.ngayketthuc || Number.isNaN(endDate.getTime())) {
            return "Ngày kết thúc không hợp lệ.";
        }
        if (endDate <= startDate) {
            return "Ngày kết thúc phải sau ngày bắt đầu.";
        }
        if (!["hoạt động", "vô hiệu"].includes(formData.trangthai)) {
            return "Trạng thái voucher không hợp lệ.";
        }

        if (formData.phamvi === "product" && !formData.masanpham) {
            return "Vui lòng chọn sản phẩm áp dụng.";
        }
        if (formData.phamvi === "category" && !formData.madanhmuc) {
            return "Vui lòng chọn danh mục áp dụng.";
        }
        if (formData.phamvi === "brand" && !formData.mahang) {
            return "Vui lòng chọn hãng áp dụng.";
        }
        if (!["all", "product", "category", "brand"].includes(formData.phamvi)) {
            return "Phạm vi áp dụng không hợp lệ.";
        }

        return null;
    };

    const buildPayload = () => ({
        magiamgia: formData.magiamgia.trim().toUpperCase(),
        mota: formData.mota.trim(),
        loaikhuyenmai: formData.loaikhuyenmai,
        giatrigiam: Number(formData.giatrigiam),
        giantoida:
            formData.loaikhuyenmai === "percent"
                ? Number(formData.giantoida)
                : null,
        dontoithieu: Number(formData.dontoithieu || 0),
        apdungtoanbo: formData.phamvi === "all" ? 1 : 0,
        masanpham:
            formData.phamvi === "product" ? Number(formData.masanpham) : null,
        madanhmuc:
            formData.phamvi === "category" ? Number(formData.madanhmuc) : null,
        mahang: formData.phamvi === "brand" ? Number(formData.mahang) : null,
        ngaybatdau: formData.ngaybatdau,
        ngayketthuc: formData.ngayketthuc,
        trangthai: formData.trangthai
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            return Swal.fire("Dữ liệu chưa hợp lệ!", validationError, "warning");
        }

        const token = getToken();
        if (!token) {
            return Swal.fire("Cảnh báo!", "Phiên đăng nhập đã hết hạn.", "warning");
        }

        try {
            setSubmitting(true);

            Swal.fire({
                title: isEditMode ? "Đang cập nhật voucher..." : "Đang tạo voucher...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const payload = buildPayload();

            const response = isEditMode
                ? await axios.put(
                    `${API_BASE_URL}/vouchers/admin/${editingVoucherId}`,
                    payload,
                    getAuthConfig()
                )
                : await axios.post(
                    `${API_BASE_URL}/vouchers/admin`,
                    payload,
                    getAuthConfig()
                );

            if (response.data?.success) {
                await Swal.fire(
                    "Thành công!",
                    isEditMode ? "Đã cập nhật voucher." : "Đã tạo voucher mới.",
                    "success"
                );

                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingVoucherId(null);
                setFormData(createEmptyFormData());
                await fetchInitialData();
            }
        } catch (error) {
            console.error("Lỗi lưu voucher:", error);

            Swal.fire(
                "Không thể lưu voucher!",
                error.response?.data?.message || "Đã xảy ra lỗi khi xử lý yêu cầu.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (voucher) => {
        const confirmResult = await Swal.fire({
            title: "Xóa voucher?",
            text: `Voucher “${voucher.magiamgia}” sẽ bị xóa khỏi hệ thống.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",
            confirmButtonText: "Đồng ý, xóa",
            cancelButtonText: "Hủy"
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/vouchers/admin/${voucher.mavoucher}`,
                getAuthConfig()
            );

            if (response.data?.success) {
                await Swal.fire("Đã xóa!", "Voucher đã được xóa.", "success");
                await fetchInitialData();
            }
        } catch (error) {
            console.error("Lỗi xóa voucher:", error);
            Swal.fire(
                "Không thể xóa!",
                error.response?.data?.message || "Đã xảy ra lỗi khi xóa voucher.",
                "error"
            );
        }
    };

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý
                    </p>
                    <h2 className="mt-2 text-5xl font-black">Voucher</h2>
                </div>

                <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
                >
                    + Tạo voucher
                </button>
            </div>

            <div className="mt-8">
                {loading ? (
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center font-bold text-zinc-500">
                        Đang tải danh sách voucher...
                    </div>
                ) : vouchers.length === 0 ? (
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center font-bold text-zinc-500">
                        Chưa có voucher nào trong hệ thống.
                    </div>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-2">
                        {vouchers.map((voucher) => {
                            const status = getDisplayStatus(voucher);

                            return (
                                <article
                                    key={voucher.mavoucher}
                                    className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-3xl font-black text-[#DC2626]">
                                                {voucher.magiamgia}
                                            </h3>

                                            <p className="mt-2 text-xl font-black text-zinc-900">
                                                {voucher.loaikhuyenmai === "percent"
                                                    ? `Giảm ${Number(voucher.giatrigiam)}%`
                                                    : `Giảm ${formatCurrency(voucher.giatrigiam)}`}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                                        >
                                            {status.text}
                                        </span>
                                    </div>

                                    <p className="mt-3 min-h-6 text-sm text-zinc-500">
                                        {voucher.mota || "Không có mô tả."}
                                    </p>

                                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                                        <div className="rounded-xl bg-zinc-50 p-3">
                                            <p className="text-xs font-bold uppercase text-zinc-400">
                                                Đơn tối thiểu
                                            </p>
                                            <p className="mt-1 font-bold text-zinc-800">
                                                {formatCurrency(voucher.dontoithieu)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-zinc-50 p-3">
                                            <p className="text-xs font-bold uppercase text-zinc-400">
                                                Giảm tối đa
                                            </p>
                                            <p className="mt-1 font-bold text-zinc-800">
                                                {voucher.loaikhuyenmai === "percent"
                                                    ? formatCurrency(voucher.giantoida)
                                                    : "Không áp dụng"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-zinc-50 p-3 sm:col-span-2">
                                            <p className="text-xs font-bold uppercase text-zinc-400">
                                                Phạm vi áp dụng
                                            </p>
                                            <p className="mt-1 font-bold text-zinc-800">
                                                {getScopeLabel(voucher)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-xl border border-dashed border-zinc-200 p-3 text-xs text-zinc-500">
                                        <p>
                                            <span className="font-bold text-zinc-700">Bắt đầu:</span>{" "}
                                            {formatDate(voucher.ngaybatdau)}
                                        </p>
                                        <p className="mt-1">
                                            <span className="font-bold text-zinc-700">Kết thúc:</span>{" "}
                                            {formatDate(voucher.ngayketthuc)}
                                        </p>
                                    </div>

                                    <div className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(voucher.mavoucher)}
                                            className="font-bold text-[#DC2626] hover:underline"
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(voucher)}
                                            className="font-bold text-zinc-400 transition-colors hover:text-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2.5rem] border border-[#D6D3D1] bg-white p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
                            <h3 className="text-3xl font-black text-zinc-900">
                                {isEditMode ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
                            </h3>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-400 hover:text-zinc-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Mã giảm giá *
                                    </label>
                                    <input
                                        type="text"
                                        name="magiamgia"
                                        value={formData.magiamgia}
                                        onChange={handleInputChange}
                                        maxLength={30}
                                        placeholder="Ví dụ: SALE10"
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm font-bold uppercase focus:border-[#DC2626] focus:outline-none"
                                        required
                                    />
                                    <p className="mt-1 text-[11px] text-zinc-400">
                                        Chỉ dùng chữ, số và dấu gạch ngang; từ 3–30 ký tự.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Trạng thái *
                                    </label>
                                    <select
                                        name="trangthai"
                                        value={formData.trangthai}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                    >
                                        <option value="hoạt động">Hoạt động</option>
                                        <option value="vô hiệu">Vô hiệu</option>
                                    </select>
                                    <p className="mt-1 text-[11px] text-zinc-400">
                                        Trạng thái hết hạn được suy ra tự động theo ngày kết thúc.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Mô tả
                                </label>
                                <textarea
                                    name="mota"
                                    rows="3"
                                    value={formData.mota}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả ngắn về chương trình khuyến mãi..."
                                    className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Loại khuyến mãi *
                                    </label>
                                    <select
                                        name="loaikhuyenmai"
                                        value={formData.loaikhuyenmai}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                    >
                                        <option value="percent">Giảm theo phần trăm</option>
                                        <option value="fixed">Giảm số tiền cố định</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Giá trị giảm *
                                    </label>
                                    <input
                                        type="number"
                                        name="giatrigiam"
                                        min="0"
                                        step="1"
                                        value={formData.giatrigiam}
                                        onChange={handleInputChange}
                                        placeholder={
                                            formData.loaikhuyenmai === "percent"
                                                ? "Ví dụ: 10"
                                                : "Ví dụ: 100000"
                                        }
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Giảm tối đa {formData.loaikhuyenmai === "percent" ? "*" : ""}
                                    </label>
                                    <input
                                        type="number"
                                        name="giantoida"
                                        min="0"
                                        step="1000"
                                        value={formData.giantoida}
                                        onChange={handleInputChange}
                                        disabled={formData.loaikhuyenmai === "fixed"}
                                        placeholder="Ví dụ: 100000"
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                                        required={formData.loaikhuyenmai === "percent"}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Đơn tối thiểu
                                    </label>
                                    <input
                                        type="number"
                                        name="dontoithieu"
                                        min="0"
                                        step="1000"
                                        value={formData.dontoithieu}
                                        onChange={handleInputChange}
                                        placeholder="0 = không giới hạn"
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Phạm vi áp dụng *
                                </label>

                                <select
                                    name="phamvi"
                                    value={formData.phamvi}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                >
                                    <option value="all">Toàn bộ cửa hàng</option>
                                    <option value="product">Theo sản phẩm</option>
                                    <option value="category">Theo danh mục</option>
                                    <option value="brand">Theo hãng</option>
                                </select>

                                {formData.phamvi === "product" && (
                                    <select
                                        name="masanpham"
                                        value={formData.masanpham}
                                        onChange={handleInputChange}
                                        className="mt-3 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {products.map((product) => (
                                            <option
                                                key={product.masanpham}
                                                value={String(product.masanpham)}
                                            >
                                                Mã {product.masanpham} — {product.tensanpham}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {formData.phamvi === "category" && (
                                    <select
                                        name="madanhmuc"
                                        value={formData.madanhmuc}
                                        onChange={handleInputChange}
                                        className="mt-3 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.madanhmuc}
                                                value={String(category.madanhmuc)}
                                            >
                                                Mã {category.madanhmuc} — {category.tendanhmuc}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {formData.phamvi === "brand" && (
                                    <select
                                        name="mahang"
                                        value={formData.mahang}
                                        onChange={handleInputChange}
                                        className="mt-3 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                        required
                                    >
                                        <option value="">-- Chọn hãng --</option>
                                        {brands.map((brand) => (
                                            <option key={brand.mahang} value={String(brand.mahang)}>
                                                Mã {brand.mahang} — {brand.tenhang}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Ngày bắt đầu *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="ngaybatdau"
                                        value={formData.ngaybatdau}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Ngày kết thúc *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="ngayketthuc"
                                        value={formData.ngayketthuc}
                                        onChange={handleInputChange}
                                        min={formData.ngaybatdau || undefined}
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-[#ECE7E1] pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="rounded-xl border border-[#D6D3D1] px-5 py-2.5 font-bold text-zinc-500 transition-all hover:bg-zinc-50 disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-[#DC2626] px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Đang xử lý..."
                                        : isEditMode
                                            ? "Lưu thay đổi"
                                            : "Tạo voucher"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminVouchers;