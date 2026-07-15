import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State dành cho Hãng và Danh mục để hiển thị trong Select Option ---
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    // --- State dành cho kích thước  và màu sắc để hiển thị trong Select Option ---
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    // --- State điều khiển Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    // --- State quản lý File ảnh chọn từ máy & Link preview hiển thị tạm trên UI cho ảnh đại diện sản phẩm lớn ---
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    // ==========================================
    // FORM MẶC ĐỊNH (DÙNG CHO THÊM MỚI & RESET)
    // ==========================================
    const createEmptyFormData = () => ({
        tensanpham: "",
        mota: "",
        chatlieu: "",
        kieudang: "",
        baoquan: "",
        anhdaidien: "",
        mahang: "",
        madanhmuc: "",

        variants: [
            {
                mabienthe: null,
                makichthuoc: "",
                mamausac: "",
                giaban: "",
                soluongton: "",
                hinhanh: [],
                _files: []
            }
        ]
    });
    // --- State quản lý dữ liệu Form ---
    const [formData, setFormData] = useState(createEmptyFormData);

    // ==========================================
    // 1. LẤY DỮ LIỆU BAN ĐẦU (Sản phẩm, Hãng, Danh mục)
    // ==========================================
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

            const [prodRes, brandRes, catRes, sizeRes, colorRes] = await Promise.all([
                axios.get(
                    "http://localhost:5000/api/products/admin/list",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                ),

                axios.get("http://localhost:5000/api/brands")
                    .catch(() => null),

                axios.get("http://localhost:5000/api/categories")
                    .catch(() => null),

                axios.get("http://localhost:5000/api/sizes")
                    .catch(() => null),

                axios.get("http://localhost:5000/api/colors")
                    .catch(() => null)
            ]);

            if (prodRes && prodRes.data?.success) setProducts(prodRes.data.data);

            if (brandRes && brandRes.data?.success) {
                setBrands(brandRes.data.data);
            } else {
                setBrands([{ mahang: 1, tenhang: "Nike" }, { mahang: 2, tenhang: "Adidas" }]);
            }

            if (catRes && catRes.data?.success) {
                setCategories(catRes.data.data);
            } else {
                setCategories([{ madanhmuc: 1, tendanhmuc: "Giày Thể Thao" }, { madanhmuc: 2, tendanhmuc: "Giày Chạy Bộ" }]);
            }
            if (sizeRes?.data?.success) {
                setSizes(sizeRes.data.data);
            } else {
                setSizes([]);
            }

            if (colorRes?.data?.success) {
                setColors(colorRes.data.data);
            } else {
                setColors([]);
            }

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu hệ thống:", error);
            setBrands([{ mahang: 1, tenhang: "Nike" }, { mahang: 2, tenhang: "Adidas" }]);
            setCategories([{ madanhmuc: 1, tendanhmuc: "Giày Thể Thao" }, { madanhmuc: 2, tendanhmuc: "Giày Chạy Bộ" }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // ==========================================
    // 2. XỬ LÝ SỰ KIỆN CHỌN FILE ẢNH (ẢNH ĐẠI DIỆN CHÍNH)
    // ==========================================
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // ==========================================
    // 3. XỬ LÝ SỰ KIỆN CHỌN FILE ẢNH CHO TỪNG BIẾN THỂ (CHO PHÉP CHỌN NHIỀU ẢNH)
    // ==========================================
    const handleVariantFileChange = (index, e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const updatedVariants = [...formData.variants];

            // Lưu trữ files vật lý để chuẩn bị gửi lên API upload khi submit
            updatedVariants[index]._files = [...(updatedVariants[index]._files || []), ...files];

            // Tạo URL ảo từ file vật lý để hiển thị preview cho admin xem trước lập tức
            const previewUrls = files.map(file => URL.createObjectURL(file));
            updatedVariants[index].hinhanh = [...(updatedVariants[index].hinhanh || []), ...previewUrls];

            setFormData(prev => ({ ...prev, variants: updatedVariants }));
        }
    };

    // Hàm xóa ảnh khỏi danh sách preview (hủy chọn ảnh trước khi upload)
    const removeVariantImage = (variantIndex, imageIndex) => {
        const updatedVariants = [...formData.variants];

        // Xác định ảnh cần xóa là file mới chọn hay là link ảnh cũ trên database
        const filesCount = updatedVariants[variantIndex]._files?.length || 0;
        const totalImages = updatedVariants[variantIndex].hinhanh?.length || 0;
        const indexInFiles = imageIndex - (totalImages - filesCount);

        // Tiến hành xóa ảnh khỏi mảng preview
        updatedVariants[variantIndex].hinhanh = updatedVariants[variantIndex].hinhanh.filter((_, i) => i !== imageIndex);

        // Nếu ảnh đó nằm trong mảng file vật lý mới chọn, xóa nó khỏi mảng file luôn
        if (indexInFiles >= 0 && updatedVariants[variantIndex]._files) {
            updatedVariants[variantIndex]._files = updatedVariants[variantIndex]._files.filter((_, i) => i !== indexInFiles);
        }

        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    // ==========================================
    // 4. XỬ LÝ XÓA SẢN PHẨM 
    // ==========================================
    const handleDelete = async (id, name) => {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        if (!token) return Swal.fire("Cảnh báo!", "Phiên làm việc hết hạn.", "warning");

        const confirmResult = await Swal.fire({
            title: `Bạn có chắc chắn muốn xóa?`,
            text: `Hành động này sẽ xóa vĩnh viễn sản phẩm "${name}"!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#71717A",
            confirmButtonText: "Đồng ý, xóa đi!",
            cancelButtonText: "Hủy bỏ"
        });

        if (confirmResult.isConfirmed) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    Swal.fire("Đã xóa!", "Sản phẩm đã biến mất khỏi hệ thống.", "success");
                    fetchInitialData();
                }
            } catch (error) {
                Swal.fire("Thất bại!", error.response?.data?.message || "Không thể xóa sản phẩm.", "error");
            }
        }
    };
    // ==========================================
    // MỞ FORM THÊM SẢN PHẨM
    // ==========================================
    const handleOpenAddModal = () => {
        setIsEditMode(false);

        setEditingProductId(null);

        setImageFile(null);
        setImagePreview("");

        setFormData(createEmptyFormData());

        setIsModalOpen(true);
    };
    // ==========================================
    // 5. ĐIỀU KHIỂN MỞ FORM SỬA SẢN PHẨM (ĐÃ CHUẨN HÓA)
    // ==========================================
    const handleOpenEditModal = async (productId) => {
        try {
            // Hiển thị loading nhẹ nếu cần
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

            const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.success) {
                const prod = response.data.data;

                setIsEditMode(true);
                setEditingProductId(productId);
                setImagePreview(prod.anhdaidien || "");
                setImageFile(null); // Reset file upload vì đang sửa

                setFormData({
                    tensanpham: prod.tensanpham || "",
                    mota: prod.mota || "",
                    chatlieu: prod.chatlieu || "",
                    kieudang: prod.kieudang || "",
                    baoquan: prod.baoquan || "", // Lưu ý: file gốc của anh ghi là 'baquan' (thiếu chữ o), em sửa lại theo file gốc của anh nhé
                    anhdaidien: prod.anhdaidien || "",
                    mahang: prod.mahang || "",
                    madanhmuc: prod.madanhmuc || "",
                    variants: (prod.variants || []).map((v) => ({
                        mabienthe: v.mabienthe,

                        makichthuoc: String(
                            v.kichthuoc?.makichthuoc ?? ""
                        ),

                        mamausac: String(
                            v.mausac?.mamausac ?? ""
                        ),

                        giaban: v.giaban ?? "",
                        soluongton: v.soluongton ?? "",

                        hinhanh: Array.isArray(v.hinhanh)
                            ? [...v.hinhanh]
                                .sort((a, b) => Number(a.stt) - Number(b.stt))
                                .map((image) => image.urlhinhanh)
                                .filter(Boolean)
                            : [],

                        _files: []
                    }))
                });
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Lỗi!", "Không thể tải dữ liệu sản phẩm.", "error");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const addVariantRow = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { makichthuoc: 1, mamausac: 1, giaban: "", soluongton: "", hinhanh: [], _files: [] }]
        }));
    };

    const removeVariantRow = (index) => {
        if (formData.variants.length === 1) return;
        const updatedVariants = formData.variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    // ==========================================
    // 6. SUBMIT FORM (UPLOAD ẢNH SẢN PHẨM & ẢNH BIẾN THỂ LÊN CLOUDINARY)
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra validation cơ bản
        if (!formData.tensanpham.trim()) return Swal.fire("Nhắc nhở!", "Tên sản phẩm không được trống.", "warning");
        if (!formData.mahang) return Swal.fire("Nhắc nhở!", "Vui lòng chọn Hãng.", "warning");
        if (!formData.madanhmuc) return Swal.fire("Nhắc nhở!", "Vui lòng chọn Danh mục.", "warning");
        if (!formData.variants || formData.variants.length === 0) return Swal.fire("Nhắc nhở!", "Sản phẩm phải có ít nhất một biến thể.", "warning");

        for (let i = 0; i < formData.variants.length; i++) {
            const v = formData.variants[i];
            const displayIndex = i + 1;
            if (!v.makichthuoc || Number(v.makichthuoc) <= 0) return Swal.fire("Lỗi!", `Dòng ${displayIndex}: Size không hợp lệ.`, "warning");
            if (!v.mamausac || Number(v.mamausac) <= 0) return Swal.fire("Lỗi!", `Dòng ${displayIndex}: Màu không hợp lệ.`, "warning");
            if (v.giaban === "" || Number(v.giaban) < 0) return Swal.fire("Lỗi!", `Dòng ${displayIndex}: Giá bán trống hoặc âm.`, "warning");
            if (v.soluongton === "" || Number(v.soluongton) < 0) return Swal.fire("Lỗi!", `Dòng ${displayIndex}: Số lượng tồn âm.`, "warning");
        }

        Swal.fire({
            title: "Đang xử lý dữ liệu...",
            text: "Đang tải ảnh sản phẩm & ảnh biến thể lên Cloudinary...",
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        let finalImageUrl = formData.anhdaidien;

        try {
            // ==========================================
            // 🔥 BƯỚC 1: UPLOAD ẢNH ĐẠI DIỆN CHÍNH (Chỉ chạy khi có file thực sự)
            // ==========================================
            if (imageFile && imageFile instanceof File) {
                const uploadData = new FormData();
                uploadData.append("image", imageFile); // Đảm bảo key là "image" chuẩn chỉnh

                const uploadResponse = await axios.post("http://localhost:5000/api/upload", uploadData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (uploadResponse.data && uploadResponse.data.success) {
                    if (uploadResponse.data.imageUrls && uploadResponse.data.imageUrls.length > 0) {
                        finalImageUrl = uploadResponse.data.imageUrls[0];
                    }
                }
            }

            // ==========================================
            // 🔥 BƯỚC 2: UPLOAD ẢNH CHO TỪNG BIẾN THỂ (An toàn tuyệt đối)
            // ==========================================
            const updatedVariantsPayload = await Promise.all(
                formData.variants.map(async (variant) => {
                    let currentVariantImages = [...(variant.hinhanh || [])];

                    // Loại bỏ các link preview ảo dạng 'blob:' trước khi lưu database
                    currentVariantImages = currentVariantImages.filter(url => typeof url === "string" && !url.startsWith("blob:"));

                    // 🔒 CHẶN LỖI: Chỉ upload khi mảng _files thực sự có chứa các File hợp lệ
                    const validFilesToUpload = (variant._files || []).filter(file => file instanceof File);

                    if (validFilesToUpload.length > 0) {
                        const uploadPromises = validFilesToUpload.map(async (file) => {
                            const uploadData = new FormData();
                            uploadData.append("image", file); // Đảm bảo key là "image" khớp backend upload.array("image")

                            const res = await axios.post("http://localhost:5000/api/upload", uploadData, {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            if (res.data && res.data.success) {
                                if (res.data.imageUrls && res.data.imageUrls.length > 0) {
                                    return res.data.imageUrls[0];
                                }
                            }
                            return null;
                        });

                        const uploadedUrls = await Promise.all(uploadPromises);
                        const validUploadedUrls = uploadedUrls.filter(url => url !== null);

                        // Hợp nhất ảnh cũ và loạt ảnh mới vừa upload xong lên Cloudinary
                        currentVariantImages = [...currentVariantImages, ...validUploadedUrls];
                    }

                    // Trả về dữ liệu biến thể sạch sẽ để gửi xuống Database
                    return {
                        // Khi sửa, gửi mabienthe để backend UPDATE đúng dòng cũ.
                        // Khi thêm mới thì mabienthe chưa có, backend có thể INSERT.
                        ...(variant.mabienthe
                            ? { mabienthe: Number(variant.mabienthe) }
                            : {}),

                        makichthuoc: Number(variant.makichthuoc),
                        mamausac: Number(variant.mamausac),
                        giaban: Number(variant.giaban),
                        soluongton: Number(variant.soluongton),
                        hinhanh: currentVariantImages
                    };
                })
            );

            // ==========================================
            // 🔥 BƯỚC 3: GỬI PAYLOAD CUỐI CÙNG LÊN DATABASE
            // ==========================================
            const bodyData = {
                ...formData,
                anhdaidien: finalImageUrl,
                variants: updatedVariantsPayload
            };

            let response;
            if (isEditMode) {
                response = await axios.put(`http://localhost:5000/api/products/${editingProductId}`, bodyData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await axios.post("http://localhost:5000/api/products", bodyData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                Swal.fire("Thành công!", isEditMode ? "Đã cập nhật sản phẩm!" : "Đã thêm sản phẩm mới!", "success");
                setIsModalOpen(false);
                fetchInitialData();
            }
        } catch (error) {
            console.error("Lỗi xử lý:", error);
            Swal.fire("Thất bại!", error.response?.data?.message || "Lỗi xử lý yêu cầu.", "error");
        }
    };

    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    return (
        <main className="ml-72 min-h-screen bg-[#F3F0EA] p-8 text-[#18181B] relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold uppercase tracking-[0.35em] text-[#DC2626]">Quản lý</p>
                    <h2 className="mt-2 text-5xl font-black">Sản phẩm</h2>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="rounded-2xl bg-[#DC2626] px-6 py-3 font-bold text-white transition-all hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/20"
                >
                    + Thêm sản phẩm
                </button>
            </div>

            {/* Bảng Danh sách */}
            <div className="mt-8 rounded-[2rem] border border-[#D6D3D1] bg-white p-6 shadow-sm">
                {loading ? (
                    <div className="py-12 text-center font-bold text-zinc-500 animate-pulse">
                        Đang tải danh sách sản phẩm thật từ hệ thống quản trị...
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-12 text-center font-bold text-zinc-500">
                        Hệ thống trống trơn! Hãy bấm nút phía trên để thêm sản phẩm nhé anh.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-zinc-500 border-b border-[#ECE7E1]">
                            <tr>
                                <th className="py-4 pl-2">Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Hãng</th>
                                <th>Danh mục</th>
                                <th>Giá (Từ)</th>
                                <th>Tổng kho</th>
                                <th>Trạng thái</th>
                                <th className="text-right pr-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => {
                                const currentStock = Number(p.tongkho) || 0;
                                let statusText = "Đang bán";
                                let statusClass = "text-green-600 bg-green-50 border-green-200";

                                if (currentStock === 0) {
                                    statusText = "Hết hàng";
                                    statusClass = "text-red-600 bg-red-50 border-red-200";
                                } else if (currentStock <= 10) {
                                    statusText = "Sắp hết";
                                    statusClass = "text-amber-600 bg-amber-50 border-amber-200";
                                }

                                const displayedImage = p.anhdaidien || p.image || "";

                                return (
                                    <tr className="border-t border-[#ECE7E1] hover:bg-zinc-50 transition-colors" key={p.masanpham}>
                                        <td className="py-4 pl-2">
                                            <img
                                                src={displayedImage || "https://placehold.co/60x60?text=No+Image"}
                                                alt={p.tensanpham}
                                                className="h-12 w-12 rounded-xl object-cover border border-[#D6D3D1]"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://placehold.co/60x60?text=No+Image";
                                                }}
                                            />
                                        </td>
                                        <td className="py-4 font-bold text-zinc-800 max-w-xs truncate">{p.tensanpham}</td>
                                        <td className="py-4 font-semibold text-zinc-600">{p.tenhang || "Chưa rõ"}</td>
                                        <td className="py-4 font-semibold text-zinc-600">{p.tendanhmuc || "Chưa rõ"}</td>
                                        <td className="py-4 font-black text-zinc-900">{formatPrice(p.giaban)}</td>
                                        <td className="py-4 font-bold text-zinc-700">{currentStock} đôi</td>
                                        <td className="py-4">
                                            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>
                                                {statusText}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-2 space-x-3">
                                            <button onClick={() => handleOpenEditModal(p.masanpham)} className="font-bold text-[#DC2626] hover:underline">Sửa</button>
                                            <button onClick={() => handleDelete(p.masanpham, p.tensanpham)} className="font-bold text-zinc-400 hover:text-red-500 transition-colors">Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] p-8 shadow-2xl border border-[#D6D3D1]">

                        {/* Modal Title */}
                        <div className="flex items-center justify-between border-b border-[#ECE7E1] pb-4">
                            <h3 className="text-3xl font-black text-zinc-900">
                                {isEditMode ? "📝 Chỉnh sửa sản phẩm" : "✨ Thêm sản phẩm mới"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 font-bold text-2xl h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">

                            {/* --- Khu vực 1: Tải ảnh trực tiếp từ thiết bị & Xem Trước --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Hình ảnh sản phẩm (Chọn từ máy tính)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                                    />
                                    <p className="mt-2 text-[11px] text-zinc-400">Hệ thống sẽ tự động đồng bộ file này lên Cloudinary khi lưu.</p>
                                </div>
                                <div className="flex justify-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-24 w-24 rounded-2xl object-cover border-2 border-dashed border-[#DC2626] p-1 shadow-sm"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://placehold.co/100x100?text=No+Image";
                                                }}
                                            />
                                            <span className="absolute -top-2 -right-2 bg-[#DC2626] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Ảnh</span>
                                        </div>
                                    ) : (
                                        <div className="h-24 w-24 rounded-2xl bg-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-400 border-2 border-dashed border-zinc-300">
                                            Chưa có ảnh
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- Các thông tin text thông thường --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Tên sản phẩm *</label>
                                    <input
                                        type="text" name="tensanpham" required value={formData.tensanpham} onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:border-[#DC2626]"
                                        placeholder="Ví dụ: Nike Air Force 1 '07"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Hãng sản xuất *</label>
                                    <select
                                        name="mahang" value={formData.mahang} onChange={handleInputChange} required
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:border-[#DC2626]"
                                    >
                                        <option value="">-- Chọn Hãng --</option>
                                        {brands.map(b => <option key={b.mahang} value={b.mahang}>{b.tenhang}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Danh mục nhóm *</label>
                                    <select
                                        name="madanhmuc" value={formData.madanhmuc} onChange={handleInputChange} required
                                        className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:border-[#DC2626]"
                                    >
                                        <option value="">-- Chọn Danh mục --</option>
                                        {categories.map(c => <option key={c.madanhmuc} value={c.madanhmuc}>{c.tendanhmuc}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Chất liệu</label>
                                        <input type="text" name="chatlieu" value={formData.chatlieu} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 p-3 text-sm" placeholder="Da lộn..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Kiểu dáng</label>
                                        <input type="text" name="kieudang" value={formData.kieudang} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 p-3 text-sm" placeholder="Cổ thấp..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bảo quản</label>
                                        <input type="text" name="baoquan" value={formData.baoquan} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 p-3 text-sm" placeholder="Giặt nhẹ..." />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Mô tả sản phẩm</label>
                                <textarea
                                    name="mota" rows="3" value={formData.mota} onChange={handleInputChange}
                                    className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:border-[#DC2626]"
                                    placeholder="Nhập bài viết mô tả chi tiết..."
                                />
                            </div>

                            {/* --- Quản lý Biến thể (Variants) động --- */}
                            <div className="border-t border-[#ECE7E1] pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-black text-zinc-800">👟 Danh sách biến thể và hình ảnh riêng biệt</h4>
                                    <button
                                        type="button" onClick={addVariantRow}
                                        className="text-xs font-bold text-white bg-zinc-800 px-3 py-2 rounded-xl hover:bg-zinc-700 transition-all"
                                    >
                                        + Thêm dòng biến thể
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.variants.map((variant, index) => (
                                        <div key={index} className="flex flex-col gap-3 bg-zinc-50 p-4 rounded-3xl border border-zinc-200">
                                            {/* Phần thuộc tính cơ bản của biến thể */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-1/4">
                                                    <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">
                                                        Kích thước *
                                                    </label>

                                                    <select
                                                        required
                                                        value={variant.makichthuoc}
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                index,
                                                                "makichthuoc",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs focus:border-[#DC2626] focus:outline-none"
                                                    >
                                                        <option value="">
                                                            -- Chọn kích thước --
                                                        </option>

                                                        {sizes.map((size) => (
                                                            <option
                                                                key={size.makichthuoc}
                                                                value={String(size.makichthuoc)}
                                                            >
                                                                Mã {size.makichthuoc} — Size {size.tenkichthuoc}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-1/4">
                                                    <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">
                                                        Màu sắc *
                                                    </label>

                                                    <select
                                                        required
                                                        value={variant.mamausac}
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                index,
                                                                "mamausac",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs focus:border-[#DC2626] focus:outline-none"
                                                    >
                                                        <option value="">
                                                            -- Chọn màu sắc --
                                                        </option>

                                                        {colors.map((color) => (
                                                            <option
                                                                key={color.mamausac}
                                                                value={String(color.mamausac)}
                                                            >
                                                                Mã {color.mamausac} — {color.tenmausac}
                                                            </option>
                                                        ))}
                                                    </select>


                                                </div>
                                                <div className="w-1/4">
                                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Giá bán (VNĐ) *</label>
                                                    <input
                                                        type="number" required value={variant.giaban} onChange={(e) => handleVariantChange(index, "giaban", e.target.value)}
                                                        className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:outline-none font-bold text-zinc-800"
                                                    />
                                                </div>
                                                <div className="w-1/4">
                                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Số lượng kho *</label>
                                                    <input
                                                        type="number" required value={variant.soluongton} onChange={(e) => handleVariantChange(index, "soluongton", e.target.value)}
                                                        className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:outline-none"
                                                    />
                                                </div>
                                                {/* Nút xóa dòng biến thể */}
                                                <div className="pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantRow(index)}
                                                        className="h-8 w-8 rounded-full bg-zinc-200 text-zinc-600 font-bold text-xs flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Phần Upload nhiều hình ảnh dành riêng cho biến thể */}
                                            <div className="border-t border-dashed border-zinc-200 pt-3">
                                                {/* Đưa tiêu đề lên đầu làm một hàng chung, rõ ràng và sạch sẽ */}
                                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-wider mb-2">
                                                    Hình ảnh của biến thể này
                                                </label>

                                                {/* Sử dụng items-stretch để hai ô tự động cao bằng nhau dù nội dung dài hay ngắn */}
                                                <div className="flex flex-col md:flex-row gap-3 items-stretch">

                                                    {/* Ô chọn tệp - Căn giữa nội dung theo chiều dọc */}
                                                    <div className="w-full md:w-1/3 flex items-center bg-white rounded-xl border border-zinc-300 p-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => handleVariantFileChange(index, e)}
                                                            className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#18181B] file:text-white hover:file:bg-zinc-700 cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Ô hiển thị danh sách ảnh preview - Đồng bộ chiều cao, bo góc mềm mại */}
                                                    <div className="w-full md:w-2/3 flex flex-wrap gap-2 min-h-[46px] bg-white p-2 rounded-xl border border-zinc-200 items-center">
                                                        {variant.hinhanh && variant.hinhanh.length > 0 ? (
                                                            variant.hinhanh.map((imgUrl, imgIndex) => (
                                                                <div key={imgIndex} className="relative group h-10 w-10">
                                                                    <img
                                                                        src={imgUrl}
                                                                        alt="Variant Preview"
                                                                        className="h-full w-full object-cover rounded-lg border border-zinc-200"
                                                                    />
                                                                    {imgIndex === 0 && (
                                                                        <span className="absolute -top-1.5 -left-1.5 bg-[#DC2626] text-white text-[7px] px-1 py-0.2 rounded-full font-black uppercase">
                                                                            Đại Diện
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeVariantImage(index, imgIndex)}
                                                                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-[11px] text-zinc-400 italic font-semibold pl-2">
                                                                Chưa chọn ảnh nào cho biến thể này.
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Nút lưu Modal */}
                            <div className="flex items-center justify-end gap-3 border-t border-[#ECE7E1] pt-4">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-[#D6D3D1] px-5 py-2.5 font-bold text-zinc-500 hover:bg-zinc-50 active:scale-95 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#DC2626] px-5 py-2.5 font-bold text-white hover:bg-red-700 active:scale-95 shadow-md transition-all"
                                >
                                    {isEditMode ? "Lưu thay đổi" : "Tạo sản phẩm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminProducts;