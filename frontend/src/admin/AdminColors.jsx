import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/colors";

const createEmptyFormData = () => ({
    tenmausac: "",
    mota: "",
    hexcode: "#000000"
});

function AdminColors() {
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingColorId, setEditingColorId] = useState(null);

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
    // 1. LẤY DANH SÁCH MÀU
    // GET /api/colors là API công khai
    // ==========================================
    const fetchColors = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            if (response.data?.success) {
                setColors(response.data.data || []);
            } else {
                setColors([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách màu:", error);
            setColors([]);

            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message ||
                "Không thể lấy danh sách màu sắc.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColors();
    }, []);

    // ==========================================
    // 2. MỞ / ĐÓNG MODAL
    // ==========================================
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingColorId(null);
        setFormData(createEmptyFormData());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;

        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingColorId(null);
        setFormData(createEmptyFormData());
    };

    const handleOpenEditModal = async (colorId) => {
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
                `${API_URL}/admin/${colorId}`,
                getAuthConfig()
            );

            Swal.close();

            if (response.data?.success) {
                const color = response.data.data;

                setIsEditMode(true);
                setEditingColorId(colorId);
                setFormData({
                    tenmausac: color.tenmausac ?? "",
                    mota: color.mota ?? "",
                    hexcode: String(color.hexcode || "#000000").toUpperCase()
                });
                setIsModalOpen(true);
            }
        } catch (error) {
            Swal.close();
            console.error("Lỗi lấy chi tiết màu:", error);

            Swal.fire(
                "Không thể mở form sửa!",
                error.response?.data?.message ||
                "Không thể lấy thông tin màu sắc.",
                "error"
            );
        }
    };

    // ==========================================
    // 3. THAY ĐỔI FORM
    // ==========================================
    const handleInputChange = (event) => {
        const { name, value } = event.target;

        let nextValue = value;

        if (name === "hexcode") {
            nextValue = value.toUpperCase();
        }

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue
        }));
    };

    const handleColorPickerChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            hexcode: event.target.value.toUpperCase()
        }));
    };

    // ==========================================
    // 4. RÀNG BUỘC FRONTEND
    // Đồng bộ với backend
    // ==========================================
    const validateForm = () => {
        const colorName = String(formData.tenmausac || "")
            .trim()
            .replace(/\s+/g, " ");

        const description = String(formData.mota || "").trim();
        const hexCode = String(formData.hexcode || "")
            .trim()
            .toUpperCase();

        if (!colorName) {
            return "Tên màu không được để trống.";
        }

        if (colorName.length < 2 || colorName.length > 50) {
            return "Tên màu phải có từ 2 đến 50 ký tự.";
        }

        if (!/^[\p{L}\p{N}\s-]+$/u.test(colorName)) {
            return "Tên màu chỉ được chứa chữ, số, khoảng trắng và dấu gạch ngang.";
        }

        if (!hexCode) {
            return "Mã màu HEX không được để trống.";
        }

        if (!/^#[0-9A-F]{6}$/.test(hexCode)) {
            return "Mã HEX phải đúng định dạng #RRGGBB, ví dụ #000000.";
        }

        if (description.length > 250) {
            return "Mô tả không được vượt quá 250 ký tự.";
        }

        const normalizedName = colorName.toLocaleLowerCase("vi-VN");

        const duplicatedName = colors.some(
            (item) =>
                String(item.tenmausac || "")
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLocaleLowerCase("vi-VN") === normalizedName &&
                Number(item.mamausac) !== Number(editingColorId)
        );

        if (duplicatedName) {
            return `Màu "${colorName}" đã tồn tại trong hệ thống.`;
        }

        const duplicatedHex = colors.find(
            (item) =>
                String(item.hexcode || "").trim().toUpperCase() === hexCode &&
                Number(item.mamausac) !== Number(editingColorId)
        );

        if (duplicatedHex) {
            return `Mã màu ${hexCode} đã được sử dụng cho màu "${duplicatedHex.tenmausac}".`;
        }

        return null;
    };

    // ==========================================
    // 5. THÊM / SỬA MÀU
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
            tenmausac: formData.tenmausac
                .trim()
                .replace(/\s+/g, " "),
            mota: formData.mota.trim(),
            hexcode: formData.hexcode.trim().toUpperCase()
        };

        try {
            setSubmitting(true);

            let response;

            if (isEditMode) {
                response = await axios.put(
                    `${API_URL}/admin/${editingColorId}`,
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
                    isEditMode
                        ? "Đã cập nhật màu sắc."
                        : "Đã thêm màu sắc mới.",
                    "success"
                );

                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingColorId(null);
                setFormData(createEmptyFormData());

                await fetchColors();
            }
        } catch (error) {
            console.error("Lỗi lưu màu:", error);

            Swal.fire(
                "Không thể lưu!",
                error.response?.data?.message ||
                "Đã xảy ra lỗi khi xử lý màu sắc.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // 6. XÓA MÀU
    // Backend chặn nếu màu đang được biến thể sử dụng
    // ==========================================
    const handleDelete = async (color) => {
        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        const confirmResult = await Swal.fire({
            title: `Xóa màu "${color.tenmausac}"?`,
            text:
                "Màu đang được biến thể sản phẩm sử dụng sẽ không thể xóa.",
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
                `${API_URL}/admin/${color.mamausac}`,
                getAuthConfig()
            );

            if (response.data?.success) {
                await Swal.fire(
                    "Đã xóa!",
                    response.data.message ||
                    `Đã xóa màu "${color.tenmausac}".`,
                    "success"
                );

                await fetchColors();
            }
        } catch (error) {
            console.error("Lỗi xóa màu:", error);

            Swal.fire(
                "Không thể xóa!",
                error.response?.data?.message ||
                "Màu sắc đang được sử dụng hoặc đã xảy ra lỗi.",
                "error"
            );
        }
    };

    // ==========================================
    // 7. THỐNG KÊ NHẸ TỪ DỮ LIỆU HIỆN CÓ
    // ==========================================
    const statistics = useMemo(() => {
        const lightColors = colors.filter((item) => {
            const hex = String(item.hexcode || "").replace("#", "");

            if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return false;

            const red = parseInt(hex.slice(0, 2), 16);
            const green = parseInt(hex.slice(2, 4), 16);
            const blue = parseInt(hex.slice(4, 6), 16);

            const brightness =
                (red * 299 + green * 587 + blue * 114) / 1000;

            return brightness >= 180;
        }).length;

        return {
            total: colors.length,
            light: lightColors,
            dark: colors.length - lightColors
        };
    }, [colors]);

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý thuộc tính
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                        Màu sắc
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
                >
                    + Thêm màu
                </button>
            </div>

            {/* Thống kê */}
            <section className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">
                        Tổng màu
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.total}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">
                        Tông sáng
                    </p>
                    <h3 className="mt-3 text-4xl font-black text-[#DC2626]">
                        {statistics.light}
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">
                        Tông tối
                    </p>
                    <h3 className="mt-3 text-4xl font-black">
                        {statistics.dark}
                    </h3>
                </div>
            </section>

            {/* Xem nhanh một số màu */}
            {!loading && colors.length > 0 && (
                <section className="mt-8 grid gap-6 md:grid-cols-3">
                    {colors.slice(0, 3).map((item) => (
                        <div
                            key={item.mamausac}
                            className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-14 w-14 rounded-2xl border border-[#D6D3D1]"
                                    style={{
                                        backgroundColor: item.hexcode
                                    }}
                                />

                                <div>
                                    <h3 className="text-xl font-black">
                                        {item.tenmausac}
                                    </h3>

                                    <p className="text-sm text-zinc-500">
                                        {item.hexcode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* Bảng dữ liệu */}
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                {loading ? (
                    <div className="animate-pulse py-14 text-center font-bold text-zinc-500">
                        Đang tải danh sách màu sắc...
                    </div>
                ) : colors.length === 0 ? (
                    <div className="py-14 text-center">
                        <p className="font-bold text-zinc-500">
                            Chưa có màu sắc nào trong hệ thống.
                        </p>

                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="mt-4 font-bold text-[#DC2626] hover:underline"
                        >
                            Tạo màu đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-zinc-500">
                                <tr>
                                    <th className="py-4">Mã màu</th>
                                    <th>Màu sắc</th>
                                    <th>HEX</th>
                                    <th>Mô tả</th>
                                    <th>Ngày tạo</th>
                                    <th className="text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {colors.map((item) => (
                                    <tr
                                        key={item.mamausac}
                                        className="border-t border-[#ECE7E1] transition-colors hover:bg-zinc-50"
                                    >
                                        <td className="py-5 font-bold text-zinc-500">
                                            #{item.mamausac}
                                        </td>

                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-10 w-10 rounded-xl border border-[#D6D3D1]"
                                                    style={{
                                                        backgroundColor:
                                                            item.hexcode
                                                    }}
                                                />

                                                <span className="font-bold">
                                                    {item.tenmausac}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="font-mono font-bold text-zinc-500">
                                            {item.hexcode}
                                        </td>

                                        <td className="max-w-sm font-medium text-zinc-600">
                                            {item.mota ||
                                                "Chưa có mô tả"}
                                        </td>

                                        <td className="font-medium text-zinc-500">
                                            {item.ngaytao
                                                ? new Date(
                                                    item.ngaytao
                                                ).toLocaleString(
                                                    "vi-VN"
                                                )
                                                : "--"}
                                        </td>

                                        <td className="space-x-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenEditModal(
                                                        item.mamausac
                                                    )
                                                }
                                                className="font-bold text-[#DC2626] hover:underline"
                                            >
                                                Sửa
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                                className="font-bold text-zinc-500 transition-colors hover:text-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal thêm / sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-[2rem] border border-[#D6D3D1] bg-white p-7 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                    Quản lý màu sắc
                                </p>

                                <h3 className="mt-1 text-3xl font-black">
                                    {isEditMode
                                        ? "Chỉnh sửa màu"
                                        : "Thêm màu mới"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={submitting}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-bold text-zinc-400 hover:text-zinc-700 disabled:cursor-not-allowed"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-5"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Tên màu *
                                    </label>

                                    <input
                                        type="text"
                                        name="tenmausac"
                                        value={formData.tenmausac}
                                        onChange={handleInputChange}
                                        maxLength={50}
                                        required
                                        placeholder="Ví dụ: Xanh Dương"
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm font-bold focus:border-[#DC2626] focus:outline-none"
                                    />

                                    <p className="mt-2 text-[11px] text-zinc-400">
                                        Từ 2 đến 50 ký tự; cho phép chữ,
                                        số, khoảng trắng và dấu gạch ngang.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Mã màu HEX *
                                    </label>

                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={
                                                /^#[0-9A-F]{6}$/.test(
                                                    formData.hexcode
                                                )
                                                    ? formData.hexcode
                                                    : "#000000"
                                            }
                                            onChange={
                                                handleColorPickerChange
                                            }
                                            className="h-12 w-14 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1"
                                            title="Chọn màu"
                                        />

                                        <input
                                            type="text"
                                            name="hexcode"
                                            value={formData.hexcode}
                                            onChange={handleInputChange}
                                            maxLength={7}
                                            required
                                            placeholder="#000000"
                                            className="w-full rounded-xl border border-zinc-300 p-3 font-mono text-sm font-bold uppercase focus:border-[#DC2626] focus:outline-none"
                                        />
                                    </div>

                                    <p className="mt-2 text-[11px] text-zinc-400">
                                        Định dạng đầy đủ #RRGGBB, ví dụ
                                        #000000 hoặc #1E90FF.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#D6D3D1] bg-[#F8F6F2] p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Xem trước
                                </p>

                                <div className="mt-3 flex items-center gap-4">
                                    <div
                                        className="h-16 w-16 rounded-2xl border border-[#D6D3D1] shadow-sm"
                                        style={{
                                            backgroundColor:
                                                /^#[0-9A-F]{6}$/.test(
                                                    formData.hexcode
                                                )
                                                    ? formData.hexcode
                                                    : "transparent"
                                        }}
                                    />

                                    <div>
                                        <p className="text-lg font-black">
                                            {formData.tenmausac.trim() ||
                                                "Tên màu"}
                                        </p>

                                        <p className="font-mono text-sm font-bold text-zinc-500">
                                            {formData.hexcode ||
                                                "#000000"}
                                        </p>
                                    </div>
                                </div>
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
                                    placeholder="Ví dụ: Màu xanh dương năng động"
                                    className="w-full resize-none rounded-xl border border-zinc-300 p-3 text-sm focus:border-[#DC2626] focus:outline-none"
                                />
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
                                            : "Thêm màu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminColors;