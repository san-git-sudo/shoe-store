import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/categories";

const createEmptyFormData = () => ({
    tendanhmuc: "",
    gioitinh: ""
});

function AdminCates() {
    const [categories, setCategories] = useState([]);
    const [genderFilter, setGenderFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
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
    // 1. LẤY DANH SÁCH DANH MỤC CHO ADMIN
    // ==========================================
    const fetchCategories = async () => {
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
                setCategories(response.data.data || []);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách danh mục:", error);
            setCategories([]);

            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message ||
                "Không thể lấy danh sách danh mục.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ==========================================
    // 2. LỌC VÀ THỐNG KÊ
    // ==========================================
    const filteredCategories = useMemo(() => {
        return categories.filter(
            (category) =>
                genderFilter === "all" ||
                category.gioitinh === genderFilter
        );
    }, [categories, genderFilter]);

    const statistics = useMemo(() => {
        return {
            total: categories.length,

            male: categories.filter(
                (category) => category.gioitinh === "Nam"
            ).length,

            female: categories.filter(
                (category) => category.gioitinh === "Nữ"
            ).length,

            products: categories.reduce(
                (total, category) =>
                    total + Number(category.sosanpham || 0),
                0
            )
        };
    }, [categories]);

    // ==========================================
    // 3. MỞ / ĐÓNG MODAL
    // ==========================================
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingCategoryId(null);
        setFormData(createEmptyFormData());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;

        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingCategoryId(null);
        setFormData(createEmptyFormData());
    };

    // Lấy chi tiết danh mục từ API trước khi mở form sửa
    const handleOpenEditModal = async (categoryId) => {
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
                `${API_URL}/admin/${categoryId}`,
                getAuthConfig()
            );

            Swal.close();

            if (response.data?.success) {
                const category = response.data.data;

                setIsEditMode(true);
                setEditingCategoryId(categoryId);

                setFormData({
                    tendanhmuc: category.tendanhmuc ?? "",
                    gioitinh: category.gioitinh ?? ""
                });

                setIsModalOpen(true);
            }
        } catch (error) {
            Swal.close();
            console.error("Lỗi lấy chi tiết danh mục:", error);

            Swal.fire(
                "Không thể mở form sửa!",
                error.response?.data?.message ||
                "Không thể lấy thông tin danh mục.",
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
        const categoryName = String(
            formData.tendanhmuc || ""
        )
            .trim()
            .replace(/\s+/g, " ");

        if (!categoryName) {
            return "Tên danh mục không được để trống.";
        }

        if (
            categoryName.length < 3 ||
            categoryName.length > 100
        ) {
            return "Tên danh mục phải có từ 3 đến 100 ký tự.";
        }

        if (
            !/^[\p{L}\p{N}\s&/-]+$/u.test(categoryName)
        ) {
            return "Tên danh mục chỉ được chứa chữ, số, khoảng trắng và các ký tự &, /, -.";
        }

        if (!["Nam", "Nữ"].includes(formData.gioitinh)) {
            return "Giới tính chỉ được là Nam hoặc Nữ.";
        }

        const normalizedName =
            categoryName.toLocaleLowerCase("vi-VN");

        const duplicated = categories.some(
            (category) =>
                String(category.tendanhmuc || "")
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLocaleLowerCase("vi-VN") ===
                normalizedName &&
                Number(category.madanhmuc) !==
                Number(editingCategoryId)
        );

        if (duplicated) {
            return `Danh mục "${categoryName}" đã tồn tại.`;
        }

        return null;
    };

    // ==========================================
    // 6. THÊM / SỬA DANH MỤC
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
            tendanhmuc: formData.tendanhmuc
                .trim()
                .replace(/\s+/g, " "),
            gioitinh: formData.gioitinh
        };

        try {
            setSubmitting(true);

            let response;

            if (isEditMode) {
                response = await axios.put(
                    `${API_URL}/admin/${editingCategoryId}`,
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
                        ? "Đã cập nhật danh mục."
                        : "Đã thêm danh mục mới."),
                    "success"
                );

                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingCategoryId(null);
                setFormData(createEmptyFormData());

                await fetchCategories();
            }
        } catch (error) {
            console.error("Lỗi lưu danh mục:", error);

            Swal.fire(
                "Không thể lưu!",
                error.response?.data?.message ||
                "Đã xảy ra lỗi khi xử lý danh mục.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // 7. XÓA DANH MỤC
    // Backend chặn nếu danh mục đang có sản phẩm
    // ==========================================
    const handleDelete = async (category) => {
        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        const result = await Swal.fire({
            title: `Xóa "${category.tendanhmuc}"?`,
            text:
                Number(category.sosanpham) > 0
                    ? `Danh mục đang có ${category.sosanpham} sản phẩm nên backend sẽ không cho xóa.`
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
                `${API_URL}/admin/${category.madanhmuc}`,
                getAuthConfig()
            );

            if (response.data?.success) {
                await Swal.fire(
                    "Đã xóa!",
                    response.data.message ||
                    "Danh mục đã được xóa.",
                    "success"
                );

                await fetchCategories();
            }
        } catch (error) {
            console.error("Lỗi xóa danh mục:", error);

            Swal.fire(
                "Không thể xóa!",
                error.response?.data?.message ||
                "Danh mục đang được sử dụng hoặc đã xảy ra lỗi.",
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
                        Danh mục
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                        Quản lý nhóm sản phẩm theo loại giày và giới tính để
                        việc tìm kiếm, lọc sản phẩm rõ ràng hơn.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="w-full sm:w-56">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Giới tính
                        </label>

                        <select
                            value={genderFilter}
                            onChange={(event) =>
                                setGenderFilter(event.target.value)
                            }
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold focus:border-[#DC2626] focus:outline-none"
                        >
                            <option value="all">
                                Tất cả danh mục
                            </option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
                    >
                        + Thêm danh mục
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Tổng danh mục
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.total}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Danh mục Nam
                    </p>
                    <h3 className="mt-3 text-4xl font-black text-[#DC2626]">
                        {statistics.male}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-zinc-500">
                        Danh mục Nữ
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.female}
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

            {/* Categories grid */}
            <section className="mt-8">
                {loading ? (
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center font-bold text-zinc-500 animate-pulse">
                        Đang tải danh sách danh mục...
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="rounded-[2rem] border border-[#D6D3D1] bg-white py-16 text-center">
                        <p className="font-bold text-zinc-500">
                            Không có danh mục phù hợp.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-2">
                        {filteredCategories.map((category) => (
                            <article
                                key={category.madanhmuc}
                                className="group overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-5 p-6">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEC] text-xl font-black text-[#DC2626]">
                                            {category.gioitinh === "Nam"
                                                ? "N"
                                                : "Nữ"}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-[#F3F0EA] px-3 py-1 text-xs font-black text-zinc-500">
                                                    #{category.madanhmuc}
                                                </span>

                                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#DC2626]">
                                                    {category.gioitinh}
                                                </span>
                                            </div>

                                            <h3 className="mt-3 text-2xl font-black">
                                                {category.tendanhmuc}
                                            </h3>

                                            {category.ngaytao && (
                                                <p className="mt-3 text-xs font-semibold text-zinc-400">
                                                    Ngày tạo:{" "}
                                                    {new Date(
                                                        category.ngaytao
                                                    ).toLocaleString("vi-VN")}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 rounded-2xl bg-[#F3F0EA] px-4 py-3 text-center">
                                        <p className="text-2xl font-black text-[#DC2626]">
                                            {Number(
                                                category.sosanpham || 0
                                            )}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                            Sản phẩm
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 border-t border-[#ECE7E1] px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenEditModal(
                                                category.madanhmuc
                                            )
                                        }
                                        className="font-bold text-[#DC2626] hover:underline"
                                    >
                                        Chỉnh sửa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(category)
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-[#D6D3D1] bg-white p-7 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                    Quản lý danh mục
                                </p>

                                <h3 className="mt-1 text-3xl font-black">
                                    {isEditMode
                                        ? "Chỉnh sửa danh mục"
                                        : "Thêm danh mục mới"}
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
                                    Tên danh mục *
                                </label>

                                <input
                                    type="text"
                                    name="tendanhmuc"
                                    value={formData.tendanhmuc}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    required
                                    placeholder="Ví dụ: Giày Chạy Bộ Nam"
                                    className="w-full rounded-xl border border-zinc-300 p-3 text-sm font-bold focus:border-[#DC2626] focus:outline-none"
                                />

                                <p className="mt-2 text-[11px] text-zinc-400">
                                    Từ 3 đến 100 ký tự; cho phép chữ, số,
                                    khoảng trắng và các ký tự &, /, -.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Giới tính *
                                </label>

                                <select
                                    name="gioitinh"
                                    value={formData.gioitinh}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm font-semibold focus:border-[#DC2626] focus:outline-none"
                                >
                                    <option value="">
                                        -- Chọn giới tính --
                                    </option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
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
                                            : "Thêm danh mục"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminCates;