import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/sizes";

const createEmptyFormData = () => ({
    tenkichthuoc: "",
    mota: ""
});

function AdminSizes() {
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSizeId, setEditingSizeId] = useState(null);
    const [formData, setFormData] = useState(createEmptyFormData);

    const getToken = () =>
        localStorage.getItem("adminToken") || localStorage.getItem("token");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    const fetchSizes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);

            if (response.data?.success) {
                setSizes(response.data.data || []);
            } else {
                setSizes([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách size:", error);
            setSizes([]);
            Swal.fire(
                "Không thể tải dữ liệu!",
                error.response?.data?.message || "Không thể lấy danh sách kích thước.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSizes();
    }, []);

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingSizeId(null);
        setFormData(createEmptyFormData());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;

        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingSizeId(null);
        setFormData(createEmptyFormData());
    };

    const handleOpenEditModal = async (sizeId) => {
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
                `${API_URL}/admin/${sizeId}`,
                getAuthConfig()
            );

            Swal.close();

            if (response.data?.success) {
                const size = response.data.data;

                setIsEditMode(true);
                setEditingSizeId(sizeId);
                setFormData({
                    tenkichthuoc: String(size.tenkichthuoc ?? ""),
                    mota: size.mota ?? ""
                });
                setIsModalOpen(true);
            }
        } catch (error) {
            Swal.close();
            console.error("Lỗi lấy chi tiết size:", error);
            Swal.fire(
                "Không thể mở form sửa!",
                error.response?.data?.message || "Không thể lấy thông tin kích thước.",
                "error"
            );
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const sizeText = String(formData.tenkichthuoc || "").trim();
        const description = String(formData.mota || "").trim();

        if (!sizeText) return "Tên kích thước không được để trống.";

        if (!/^\d{1,2}(\.\d)?$/.test(sizeText)) {
            return "Kích thước phải là số hợp lệ, ví dụ 38, 42 hoặc 38.5.";
        }

        const numericSize = Number(sizeText);

        if (!Number.isFinite(numericSize)) return "Kích thước không hợp lệ.";

        if (numericSize < 20 || numericSize > 60) {
            return "Kích thước giày phải nằm trong khoảng từ 20 đến 60.";
        }

        if (description.length > 250) {
            return "Mô tả không được vượt quá 250 ký tự.";
        }

        const normalizedSize = String(numericSize);
        const duplicated = sizes.some(
            (item) =>
                String(Number(item.tenkichthuoc)) === normalizedSize &&
                Number(item.makichthuoc) !== Number(editingSizeId)
        );

        if (duplicated) return `Size ${normalizedSize} đã tồn tại trong hệ thống.`;

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationMessage = validateForm();
        if (validationMessage) {
            return Swal.fire("Dữ liệu chưa hợp lệ!", validationMessage, "warning");
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
            tenkichthuoc: String(Number(formData.tenkichthuoc)),
            mota: formData.mota.trim()
        };

        try {
            setSubmitting(true);

            let response;

            if (isEditMode) {
                response = await axios.put(
                    `${API_URL}/admin/${editingSizeId}`,
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
                    isEditMode ? "Đã cập nhật kích thước." : "Đã thêm kích thước mới.",
                    "success"
                );

                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingSizeId(null);
                setFormData(createEmptyFormData());
                await fetchSizes();
            }
        } catch (error) {
            console.error("Lỗi lưu size:", error);
            Swal.fire(
                "Không thể lưu!",
                error.response?.data?.message || "Đã xảy ra lỗi khi xử lý kích thước.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (size) => {
        const token = getToken();

        if (!token) {
            return Swal.fire(
                "Phiên đăng nhập hết hạn!",
                "Vui lòng đăng nhập lại bằng tài khoản admin.",
                "warning"
            );
        }

        const confirmResult = await Swal.fire({
            title: `Xóa size ${size.tenkichthuoc}?`,
            text: "Size đang được biến thể sản phẩm sử dụng sẽ không thể xóa.",
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
                `${API_URL}/admin/${size.makichthuoc}`,
                getAuthConfig()
            );

            if (response.data?.success) {
                await Swal.fire(
                    "Đã xóa!",
                    response.data.message || `Đã xóa size ${size.tenkichthuoc}.`,
                    "success"
                );

                await fetchSizes();
            }
        } catch (error) {
            console.error("Lỗi xóa size:", error);
            Swal.fire(
                "Không thể xóa!",
                error.response?.data?.message || "Kích thước đang được sử dụng hoặc đã xảy ra lỗi.",
                "error"
            );
        }
    };

    const statistics = useMemo(() => {
        if (sizes.length === 0) {
            return { total: 0, smallest: "--", largest: "--", decimalCount: 0 };
        }

        const numericSizes = sizes
            .map((item) => Number(item.tenkichthuoc))
            .filter(Number.isFinite);

        return {
            total: sizes.length,
            smallest: numericSizes.length ? Math.min(...numericSizes) : "--",
            largest: numericSizes.length ? Math.max(...numericSizes) : "--",
            decimalCount: numericSizes.filter((value) => !Number.isInteger(value)).length
        };
    }, [sizes]);

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">
                        Quản lý thuộc tính
                    </p>
                    <h2 className="mt-2 text-5xl font-black">Size giày</h2>
                </div>

                <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
                >
                    + Thêm size
                </button>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-4">
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Tổng size</p>
                    <h3 className="mt-3 text-4xl font-black">{statistics.total}</h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Size nhỏ nhất</p>
                    <h3 className="mt-3 text-4xl font-black text-[#DC2626]">{statistics.smallest}</h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Size lớn nhất</p>
                    <h3 className="mt-3 text-4xl font-black">{statistics.largest}</h3>
                </div>

                <div className="rounded-[2rem] border border-[#D6D3D1] bg-white p-6">
                    <p className="text-sm font-bold text-zinc-500">Size số lẻ</p>
                    <h3 className="mt-3 text-4xl font-black">{statistics.decimalCount}</h3>
                </div>
            </section>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                {loading ? (
                    <div className="py-14 text-center font-bold text-zinc-500 animate-pulse">
                        Đang tải danh sách kích thước...
                    </div>
                ) : sizes.length === 0 ? (
                    <div className="py-14 text-center">
                        <p className="font-bold text-zinc-500">Chưa có kích thước nào trong hệ thống.</p>
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="mt-4 font-bold text-[#DC2626] hover:underline"
                        >
                            Tạo size đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-zinc-500">
                                <tr>
                                    <th className="py-4">Mã size</th>
                                    <th>Size</th>
                                    <th>Mô tả</th>
                                    <th>Ngày tạo</th>
                                    <th className="text-right">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sizes.map((item) => (
                                    <tr
                                        key={item.makichthuoc}
                                        className="border-t border-[#ECE7E1] transition-colors hover:bg-zinc-50"
                                    >
                                        <td className="py-5 font-bold text-zinc-500">#{item.makichthuoc}</td>
                                        <td>
                                            <span className="inline-block rounded-xl bg-[#F3F0EA] px-4 py-2 text-lg font-black text-[#DC2626]">
                                                {item.tenkichthuoc}
                                            </span>
                                        </td>
                                        <td className="max-w-md font-medium text-zinc-600">
                                            {item.mota || "Chưa có mô tả"}
                                        </td>
                                        <td className="font-medium text-zinc-500">
                                            {item.ngaytao
                                                ? new Date(item.ngaytao).toLocaleString("vi-VN")
                                                : "--"}
                                        </td>
                                        <td className="text-right space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(item.makichthuoc)}
                                                className="font-bold text-[#DC2626] hover:underline"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item)}
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-[2rem] border border-[#D6D3D1] bg-white p-7 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#DC2626]">
                                    Quản lý size
                                </p>
                                <h3 className="mt-1 text-3xl font-black">
                                    {isEditMode ? "Chỉnh sửa size" : "Thêm size mới"}
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

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Kích thước *
                                </label>

                                <input
                                    type="number"
                                    name="tenkichthuoc"
                                    value={formData.tenkichthuoc}
                                    onChange={handleInputChange}
                                    min="20"
                                    max="60"
                                    step="0.5"
                                    required
                                    placeholder="Ví dụ: 38 hoặc 42.5"
                                    className="w-full rounded-xl border border-zinc-300 p-3 text-sm font-bold focus:border-[#DC2626] focus:outline-none"
                                />

                                <p className="mt-2 text-[11px] text-zinc-400">
                                    Cho phép size từ 20 đến 60, bao gồm size lẻ như 38.5 hoặc 42.5.
                                </p>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Mô tả
                                    </label>
                                    <span className={`text-[11px] font-semibold ${formData.mota.length > 250 ? "text-red-600" : "text-zinc-400"}`}>
                                        {formData.mota.length}/250
                                    </span>
                                </div>

                                <textarea
                                    name="mota"
                                    rows="4"
                                    value={formData.mota}
                                    onChange={handleInputChange}
                                    maxLength={250}
                                    placeholder="Ví dụ: Size giày 38"
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
                                    {submitting ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thêm size"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminSizes;