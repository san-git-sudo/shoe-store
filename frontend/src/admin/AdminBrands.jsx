import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/brands";

const createEmptyFormData = () => ({
    tenhang: "",
    mota: "",
    trangthai: "hoạt động"
});

function AdminBrands() {
    const [brands, setBrands] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBrandId, setEditingBrandId] = useState(null);
    const [formData, setFormData] = useState(createEmptyFormData);

    const getToken = () =>
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    // ==========================================
    // 1. LẤY TOÀN BỘ HÃNG CHO ADMIN
    // ==========================================
    const fetchBrands = async () => {
        const token = getToken();

        if (!token) {
            setLoading(false);

            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/admin/list`,
                getAuthConfig()
            );

            if (response.data?.success) {
                setBrands(response.data.data || []);
            } else {
                setBrands([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách hãng:", error);
            setBrands([]);

            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message ||
                "Không thể lấy danh sách hãng.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    // ==========================================
    // 2. LỌC VÀ THỐNG KÊ
    // ==========================================
    const filteredBrands = useMemo(() => {
        return brands.filter(
            (brand) =>
                statusFilter === "all" ||
                brand.trangthai === statusFilter
        );
    }, [brands, statusFilter]);

    const statistics = useMemo(() => {
        return {
            total: brands.length,

            active: brands.filter(
                (brand) => brand.trangthai === "hoạt động"
            ).length,

            inactive: brands.filter(
                (brand) => brand.trangthai === "vô hiệu"
            ).length,

            products: brands.reduce(
                (total, brand) =>
                    total + Number(brand.sosanpham || 0),
                0
            )
        };
    }, [brands]);

    // ==========================================
    // 3. MỞ / ĐÓNG MODAL
    // ==========================================
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingBrandId(null);
        setFormData(createEmptyFormData());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;

        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingBrandId(null);
        setFormData(createEmptyFormData());
    };

    // Lấy chi tiết hãng theo ID trước khi mở form sửa
    const handleOpenEditModal = async (brandId) => {
        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        try {
            Swal.fire({
                title: "Đang tải dữ liệu...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await axios.get(
                `${API_URL}/admin/${brandId}`,
                getAuthConfig()
            );

            Swal.close();

            if (response.data?.success) {
                const brand = response.data.data;

                setIsEditMode(true);
                setEditingBrandId(brandId);

                setFormData({
                    tenhang: brand.tenhang ?? "",
                    mota: brand.mota ?? "",
                    trangthai: brand.trangthai ?? "hoạt động"
                });

                setIsModalOpen(true);
            }
        } catch (error) {
            Swal.close();
            console.error("Lỗi lấy chi tiết hãng:", error);

            Swal.fire(
                "Không thể mở form sửa!",
                error.response?.data?.message ||
                "Không thể lấy thông tin hãng.",
                "error"
            );
        }
    };

    // ==========================================
    // 4. THAY ĐỔI FORM
    // ==========================================
    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ==========================================
    // 5. RÀNG BUỘC FRONTEND
    // Đồng bộ với backend
    // ==========================================
    const validateForm = () => {
        const brandName = String(formData.tenhang || "")
            .trim()
            .replace(/\s+/g, " ");

        const description = String(formData.mota || "").trim();

        if (!brandName) {
            return "Tên hãng không được để trống.";
        }

        if (
            brandName.length < 2 ||
            brandName.length > 100
        ) {
            return "Tên hãng phải có từ 2 đến 100 ký tự.";
        }

        if (
            !/^[\p{L}\p{N}\s&.'/-]+$/u.test(
                brandName
            )
        ) {
            return "Tên hãng chỉ được chứa chữ, số, khoảng trắng và các ký tự &, ., ', /, -.";
        }

        if (description.length > 250) {
            return "Mô tả không được vượt quá 250 ký tự.";
        }

        if (
            !["hoạt động", "vô hiệu"].includes(
                formData.trangthai
            )
        ) {
            return "Trạng thái hãng chỉ được là hoạt động hoặc vô hiệu.";
        }

        const normalizedName =
            brandName.toLocaleLowerCase("vi-VN");

        const duplicated = brands.some(
            (brand) =>
                String(brand.tenhang || "")
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLocaleLowerCase("vi-VN") ===
                normalizedName &&
                Number(brand.mahang) !==
                Number(editingBrandId)
        );

        if (duplicated) {
            return `Hãng "${brandName}" đã tồn tại.`;
        }

        return null;
    };

    // ==========================================
    // 6. THÊM / SỬA HÃNG
    // ==========================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationMessage = validateForm();

        if (validationMessage) {
            return Swal.fire(
                "Dữ liệu chưa hợp lệ!",
                validationMessage,
                "warning"
            );
        }

        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        const payload = {
            tenhang: formData.tenhang
                .trim()
                .replace(/\s+/g, " "),
            mota: formData.mota.trim(),
            trangthai: formData.trangthai
        };

        try {
            setSubmitting(true);

            let response;

            if (isEditMode) {
                response = await axios.put(
                    `${API_URL}/admin/${editingBrandId}`,
                    payload,
                    getAuthConfig()
                );
            } else {
                response = await axios.post(
                    `${API_URL}/admin`,
                    payload,
                    getAuthConfig()
                );
            }

            if (response.data?.success) {
                await Swal.fire(
                    "Thành công!",
                    response.data.message ||
                    (isEditMode
                        ? "Đã cập nhật hãng."
                        : "Đã thêm hãng mới."),
                    "success"
                );

                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingBrandId(null);
                setFormData(createEmptyFormData());

                await fetchBrands();
            }
        } catch (error) {
            console.error("Lỗi lưu hãng:", error);

            Swal.fire(
                "Không thể lưu!",
                error.response?.data?.message ||
                "Đã xảy ra lỗi khi xử lý hãng.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // 7. XÓA HÃNG
    // Backend chặn nếu hãng đang có sản phẩm
    // ==========================================
    const handleDelete = async (brand) => {
        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        const result = await Swal.fire({
            title: `Xóa hãng "${brand.tenhang}"?`,
            text:
                Number(brand.sosanpham) > 0
                    ? `Hãng đang có ${brand.sosanpham} sản phẩm nên backend sẽ không cho xóa.`
                    : "Thao tác này không thể hoàn tác.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",
            confirmButtonText: "Đồng ý, xóa",
            cancelButtonText: "Hủy"
        });

        if (!result.isConfirmed) return;

        try {
            const response = await axios.delete(
                `${API_URL}/admin/${brand.mahang}`,
                getAuthConfig()
            );

            if (response.data?.success) {
                await Swal.fire(
                    "Đã xóa!",
                    response.data.message ||
                    "Hãng đã được xóa.",
                    "success"
                );

                await fetchBrands();
            }
        } catch (error) {
            console.error("Lỗi xóa hãng:", error);

            Swal.fire(
                "Không thể xóa!",
                error.response?.data?.message ||
                "Hãng đang được sử dụng hoặc đã xảy ra lỗi.",
                "error"
            );
        }
    };

    // ==========================================
    // 8. BẬT / TẮT TRẠNG THÁI HÃNG
    // Dùng lại API PUT đã có
    // ==========================================
    const handleToggleStatus = async (brand) => {
        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        const nextStatus =
            brand.trangthai === "hoạt động"
                ? "vô hiệu"
                : "hoạt động";

        const result = await Swal.fire({
            title:
                nextStatus === "vô hiệu"
                    ? `Vô hiệu hóa "${brand.tenhang}"?`
                    : `Kích hoạt "${brand.tenhang}"?`,
            text:
                nextStatus === "vô hiệu"
                    ? "Hãng sẽ không còn xuất hiện trong danh sách công khai."
                    : "Hãng sẽ được hiển thị trở lại trong danh sách công khai.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",
            confirmButtonText:
                nextStatus === "vô hiệu"
                    ? "Vô hiệu hóa"
                    : "Kích hoạt",
            cancelButtonText: "Hủy"
        });

        if (!result.isConfirmed) return;

        const payload = {
            tenhang: brand.tenhang,
            mota: brand.mota || "",
            trangthai: nextStatus
        };

        try {
            const response = await axios.put(
                `${API_URL}/admin/${brand.mahang}`,
                payload,
                getAuthConfig()
            );

            if (response.data?.success) {
                await Swal.fire(
                    "Thành công!",
                    `Đã chuyển hãng sang trạng thái "${nextStatus}".`,
                    "success"
                );

                await fetchBrands();
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái hãng:", error);

            Swal.fire(
                "Không thể cập nhật!",
                error.response?.data?.message ||
                "Không thể thay đổi trạng thái hãng.",
                "error"
            );
        }
    };

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            {/* Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý sản phẩm
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                        Hãng sản phẩm
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                        Quản lý thương hiệu, trạng thái hoạt động và số
                        lượng sản phẩm thuộc từng hãng.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="w-full sm:w-56">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Trạng thái
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold focus:border-[#DC2626] focus:outline-none"
                        >
                            <option value="all">
                                Tất cả hãng
                            </option>
                            <option value="hoạt động">
                                Hoạt động
                            </option>
                            <option value="vô hiệu">
                                Vô hiệu
                            </option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
                    >
                        + Thêm hãng
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Tổng hãng
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
                        Đã vô hiệu
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.inactive}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Tổng sản phẩm
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.products}
                    </h3>
                </div>
            </section>

            {/* Brand cards */}
            <section className="mt-8">
                {loading ? (
                    <div className="animate-pulse rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center font-bold text-zinc-500">
                        Đang tải danh sách hãng...
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center">
                        <p className="font-bold text-zinc-500">
                            Không có hãng phù hợp.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-2">
                        {filteredBrands.map((brand) => (
                            <article
                                key={brand.mahang}
                                className="overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-5 p-6">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEC] text-2xl font-black text-[#DC2626]">
                                            {String(brand.tenhang || "")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-[#F3F0EA] px-3 py-1 text-xs font-black text-zinc-500">
                                                    #{brand.mahang}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-black ${brand.trangthai ===
                                                            "hoạt động"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-zinc-100 text-zinc-500"
                                                        }`}
                                                >
                                                    {brand.trangthai}
                                                </span>
                                            </div>

                                            <h3 className="mt-3 text-2xl font-black">
                                                {brand.tenhang}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                                                {brand.mota ||
                                                    "Chưa có mô tả cho hãng này."}
                                            </p>

                                            <p className="mt-3 text-xs font-semibold text-zinc-400">
                                                Ngày tạo:{" "}
                                                {brand.ngaytao
                                                    ? new Date(
                                                        brand.ngaytao
                                                    ).toLocaleString(
                                                        "vi-VN"
                                                    )
                                                    : "--"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 rounded-2xl bg-[#F3F0EA] px-4 py-3 text-center">
                                        <p className="text-2xl font-black text-[#DC2626]">
                                            {Number(
                                                brand.sosanpham || 0
                                            )}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                            Sản phẩm
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-4 border-t border-[#ECE7E1] px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleStatus(brand)
                                        }
                                        className="font-bold text-zinc-500 transition-colors hover:text-[#DC2626]"
                                    >
                                        {brand.trangthai === "hoạt động"
                                            ? "Vô hiệu"
                                            : "Kích hoạt"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenEditModal(
                                                brand.mahang
                                            )
                                        }
                                        className="font-bold text-[#DC2626] hover:underline"
                                    >
                                        Chỉnh sửa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(brand)
                                        }
                                        className="font-bold text-zinc-500 transition-colors hover:text-red-600"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal thêm / sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-[#D6D3D1] bg-white p-7 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                    Quản lý hãng
                                </p>

                                <h3 className="mt-1 text-3xl font-black">
                                    {isEditMode
                                        ? "Chỉnh sửa hãng"
                                        : "Thêm hãng mới"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={submitting}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-bold text-zinc-400 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Tên hãng *
                                </label>

                                <input
                                    type="text"
                                    name="tenhang"
                                    value={formData.tenhang}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    required
                                    placeholder="Ví dụ: Nike"
                                    className="w-full rounded-xl border border-zinc-300 p-3 text-sm font-bold focus:border-[#DC2626] focus:outline-none"
                                />

                                <p className="mt-2 text-[11px] text-zinc-400">
                                    Từ 2 đến 100 ký tự; không được trùng
                                    với hãng đã có.
                                </p>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Mô tả
                                    </label>

                                    <span
                                        className={`text-[11px] font-semibold ${formData.mota.length > 250
                                                ? "text-red-600"
                                                : "text-zinc-400"
                                            }`}
                                    >
                                        {formData.mota.length}/250
                                    </span>
                                </div>

                                <textarea
                                    name="mota"
                                    rows="4"
                                    value={formData.mota}
                                    onChange={handleInputChange}
                                    maxLength={250}
                                    placeholder="Mô tả ngắn về hãng..."
                                    className="w-full resize-none rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Trạng thái *
                                </label>

                                <select
                                    name="trangthai"
                                    value={formData.trangthai}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm font-semibold focus:border-[#DC2626] focus:outline-none"
                                >
                                    <option value="hoạt động">
                                        Hoạt động
                                    </option>
                                    <option value="vô hiệu">
                                        Vô hiệu
                                    </option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-[#ECE7E1] pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="rounded-xl border border-[#D6D3D1] px-5 py-2.5 font-bold text-zinc-500 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Hủy bỏ
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-[#DC2626] px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Đang lưu..."
                                        : isEditMode
                                            ? "Lưu thay đổi"
                                            : "Thêm hãng"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminBrands;