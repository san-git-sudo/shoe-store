import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { addToCart } from "../utils/cart";
import {
    isInWishlist,
    toggleWishlist
} from "../utils/wishlist";

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState([]);
    const [copiedVoucher, setCopiedVoucher] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const isVariantAvailable = (
        variant
    ) => {
        if (!variant) {
            return false;
        }

        const hasStock =
            Number(
                variant.soluongton
            ) > 0;

        const isActive =
            !variant.trangthaihoatdongbtsp ||
            variant.trangthaihoatdongbtsp ===
            "hoạt động";

        return hasStock && isActive;
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            return alert(
                "Vui lòng chọn biến thể sản phẩm."
            );
        }

        if (
            !isVariantAvailable(
                selectedVariant
            )
        ) {
            return alert(
                "Biến thể này hiện đã hết hàng hoặc ngừng bán."
            );
        }

        addToCart({
            mabienthe:
                selectedVariant.mabienthe,

            masanpham:
                product.masanpham,

            name:
                product.tensanpham,

            image:
                selectedVariant.hinhanh?.[0]
                    ?.urlhinhanh ||
                product.anhdaidien,

            price:
                Number(
                    selectedVariant.giaban
                ),

            size:
                selectedVariant.kichthuoc
                    ?.tenkichthuoc ||
                "",

            color:
                selectedVariant.mausac
                    ?.tenmausac ||
                ""
        });

        window.dispatchEvent(
            new Event("cart-updated")
        );

        alert("Đã thêm vào giỏ hàng");
    };

    const handleToggleWishlist = () => {
        if (!product?.masanpham) {
            return;
        }

        try {
            const result =
                toggleWishlist({
                    masanpham:
                        product.masanpham,

                    tensanpham:
                        product.tensanpham,

                    anhdaidien:
                        selectedVariant
                            ?.hinhanh?.[0]
                            ?.urlhinhanh ||
                        product.anhdaidien,

                    giaban:
                        Number(
                            selectedVariant
                                ?.giaban
                        ) || 0
                });

            setIsFavorite(
                result.isFavorite
            );
        } catch (error) {
            console.error(
                "Lỗi cập nhật yêu thích:",
                error
            );
        }
    };
    const handleCopyVoucher = async (code) => {
        try {
            await navigator.clipboard.writeText(code);

            setCopiedVoucher(code);

            setTimeout(() => {
                setCopiedVoucher(null);
            }, 2000);

        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {

        fetchProduct();

    }, [id]);

    const fetchProduct = async () => {

        try {

            const res = await axios.get(`http://localhost:5000/api/products/${id}`);

            if (res.data.success) {

                const productData = res.data.data;
                const voucherRes = await axios.get(
                    "http://localhost:5000/api/vouchers"
                );
                const now = new Date();
                const availableVoucher = voucherRes.data.data.filter(v => {

                    if (Number(v.apdungtoanbo) === 1)
                        return true;

                    if (Number(v.masanpham) === Number(productData.masanpham))
                        return true;

                    if (Number(v.mahang) === Number(productData.mahang))
                        return true;

                    if (Number(v.madanhmuc) === Number(productData.madanhmuc))
                        return true;

                    return false;
                });

                setVouchers(availableVoucher);

                setProduct(productData);

                setIsFavorite(
                    isInWishlist(
                        productData.masanpham
                    )
                );

                if (productData.variants.length > 0) {

                    const firstVariant = productData.variants[0];

                    setSelectedVariant(firstVariant);

                    setSelectedColor(firstVariant.mausac);

                    if (firstVariant.hinhanh?.length > 0) {
                        setSelectedImage(firstVariant.hinhanh[0].urlhinhanh);
                    }
                }

            }

        } catch (err) {

            console.error("Product Detail Error:", err);

        } finally {

            setLoading(false);

        }

    };
    const changeVariant = (variant) => {
        setSelectedVariant(variant);
        setSelectedColor(variant.mausac);

        if (variant.hinhanh?.length > 0) {
            setSelectedImage(variant.hinhanh[0].urlhinhanh);
        } else {
            setSelectedImage(product.anhdaidien);
        }
    };
    const colors = product
        ? [...new Map(
            product.variants.map(item => [
                item.mausac.mamausac,
                item.mausac
            ])
        ).values()]
        : [];
    const availableSizes = product
        ? product.variants.filter(
            item => item.mausac.mamausac === selectedColor?.mamausac
        )
        : [];
    const selectedVariantAvailable =
        isVariantAvailable(
            selectedVariant
        );

    const productHasStock =
        Array.isArray(product?.variants) &&
        product.variants.some(
            (variant) =>
                isVariantAvailable(
                    variant
                )
        );

    if (loading) {
        return (
            <div className="pt-40 text-center text-white">
                Đang tải sản phẩm...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pt-40 text-center text-red-500">
                Không tìm thấy sản phẩm.
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0F0F0F] px-6 pb-20 pt-32 text-white">
            <section
                className="
        mx-auto
        max-w-7xl
        grid
        gap-12
        lg:grid-cols-2
        lg:items-start
    "
            >
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6">
                    <div className="overflow-hidden rounded-[1.5rem] bg-white h-[520px]">
                        <img
                            src={
                                selectedImage ||
                                product.anhdaidien ||
                                "https://placehold.co/600x600?text=No+Image"
                            }
                            alt={product.tensanpham}
                            className="h-full w-full object-contain"
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-4">

                        {selectedVariant?.hinhanh?.map((image, index) => (

                            <div
                                key={index}
                                onClick={() => setSelectedImage(image.urlhinhanh)}
                                className={`cursor-pointer rounded-2xl border p-2 transition-all duration-300
${selectedImage === image.urlhinhanh
                                        ? "border-red-500 ring-2 ring-red-500/30"
                                        : "border-zinc-700 hover:border-red-400"
                                    }`}
                            >
                                <img
                                    src={image.urlhinhanh}
                                    alt=""
                                    className="h-24 w-full rounded-xl object-cover transition duration-300 hover:scale-105"
                                />
                            </div>

                        ))}

                    </div>
                </div>

                <div>
                    <p className="mb-3 font-bold uppercase tracking-[0.35em] text-red-500">
                        Sneaker Premium
                    </p>

                    <h1 className="text-5xl font-black uppercase leading-tight">
                        {product.tensanpham}
                    </h1>

                    <div className="mt-4">
                        <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold">
                            Chính hãng
                        </span>
                    </div>

                    <div className="mt-8 flex items-end gap-4">
                        <span className="text-4xl font-black text-red-500">
                            {selectedVariant?.giaban.toLocaleString("vi-VN")}đ
                        </span>
                    </div>

                    <p className="mt-6 max-w-xl leading-8 text-zinc-300">
                        {product.mota}
                    </p>

                    <div className="mt-8">
                        <h3 className="mb-4 font-bold uppercase">Chọn size</h3>
                        <div className="grid max-w-md grid-cols-5 gap-3">
                            {availableSizes.map((variant) => (

                                <button
                                    key={variant.mabienthe}
                                    type="button"
                                    onClick={() =>
                                        changeVariant(
                                            variant
                                        )
                                    }
                                    disabled={
                                        !isVariantAvailable(
                                            variant
                                        )
                                    }
                                    title={
                                        isVariantAvailable(
                                            variant
                                        )
                                            ? `Size ${variant.kichthuoc.tenkichthuoc}`
                                            : "Size này đã hết hàng"
                                    }
                                    className={`rounded-xl border py-3 font-bold transition ${!isVariantAvailable(
                                        variant
                                    )
                                            ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600 line-through"
                                            : selectedVariant?.mabienthe ===
                                                variant.mabienthe
                                                ? "border-red-500 bg-red-500 text-white"
                                                : "border-zinc-700 hover:border-red-500"
                                        }`}
                                >
                                    {
                                        variant.kichthuoc
                                            .tenkichthuoc
                                    }
                                </button>

                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-4 font-bold uppercase">Màu sắc</h3>
                        <div className="flex gap-3">

                            {colors.map((color) => (

                                <button
                                    key={color.mamausac}
                                    onClick={() => {
                                        const colorVariants =
                                            product.variants.filter(
                                                (item) =>
                                                    item.mausac.mamausac ===
                                                    color.mamausac
                                            );

                                        const firstSize =
                                            colorVariants.find(
                                                (item) =>
                                                    isVariantAvailable(
                                                        item
                                                    )
                                            ) ||
                                            colorVariants[0];

                                        if (firstSize) {
                                            changeVariant(
                                                firstSize
                                            );
                                        }
                                    }}
                                    className={`h-10 w-10 rounded-full border-2 transition ${selectedColor?.mamausac === color.mamausac
                                        ? "border-white"
                                        : "border-zinc-700"
                                        }`}
                                    style={{
                                        backgroundColor: color.hexcode
                                    }}
                                />

                            ))}

                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <button
                            type="button"
                            onClick={
                                handleAddToCart
                            }
                            disabled={
                                !selectedVariantAvailable
                            }
                            className={`flex-1 rounded-2xl px-10 py-4 font-bold transition ${selectedVariantAvailable
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                                }`}
                        >
                            {selectedVariantAvailable
                                ? "Thêm vào giỏ hàng"
                                : productHasStock
                                    ? "Biến thể đã hết hàng"
                                    : "Sản phẩm đã hết hàng"}
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleToggleWishlist
                            }
                            title={
                                isFavorite
                                    ? "Bỏ khỏi yêu thích"
                                    : "Thêm vào yêu thích"
                            }
                            aria-label={
                                isFavorite
                                    ? "Bỏ khỏi yêu thích"
                                    : "Thêm vào yêu thích"
                            }
                            className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl border px-5 font-bold transition sm:w-16 sm:px-0 ${isFavorite
                                    ? "border-red-500 bg-red-500 text-white"
                                    : "border-zinc-700 text-white hover:border-red-500 hover:text-red-500"
                                }`}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill={
                                    isFavorite
                                        ? "currentColor"
                                        : "none"
                                }
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                />
                            </svg>

                            <span className="sm:hidden">
                                {isFavorite
                                    ? "Đã yêu thích"
                                    : "Yêu thích"}
                            </span>
                        </button>
                    </div>
                    {/* Voucher áp dụng */}
                    <div className="mt-8">
                        <h3 className="mb-4 text-lg font-bold uppercase">
                            Voucher áp dụng
                        </h3>

                        {vouchers.length === 0 ? (
                            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-400">
                                Không có voucher áp dụng cho sản phẩm này.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {vouchers.map((voucher) => (
                                    <div
                                        key={voucher.mavoucher}
                                        className="rounded-2xl border border-red-500/40 bg-zinc-900 p-5"
                                    >
                                        <div className="flex items-center justify-between">

                                            <div>
                                                <span className="font-bold text-lg text-red-500">
                                                    {voucher.magiamgia}
                                                </span>

                                                <div className="mt-1 text-xs text-zinc-500">
                                                    Mã giảm giá
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">

                                                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                                    {voucher.loaikhuyenmai === "percent"
                                                        ? `-${voucher.giatrigiam}%`
                                                        : `-${voucher.giatrigiam.toLocaleString("vi-VN")}đ`}
                                                </span>

                                                <button
                                                    onClick={() => handleCopyVoucher(voucher.magiamgia)}
                                                    className={`
                rounded-lg
                border
                px-3
                py-1.5
                text-xs
                font-bold
                transition-all
                duration-300

                ${copiedVoucher === voucher.magiamgia
                                                            ? "border-green-500 bg-green-500 text-white"
                                                            : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                        }
            `}
                                                >
                                                    {copiedVoucher === voucher.magiamgia
                                                        ? "✓ Đã copy"
                                                        : "Copy"}
                                                </button>

                                            </div>

                                        </div>

                                        <p className="mt-2 text-zinc-300">
                                            {voucher.mota}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
                                            <span>
                                                Đơn tối thiểu:
                                                <b className="ml-1 text-white">
                                                    {voucher.dontoithieu.toLocaleString("vi-VN")}đ
                                                </b>
                                            </span>

                                            {voucher.giantoida > 0 && (
                                                <span>
                                                    Giảm tối đa:
                                                    <b className="ml-1 text-white">
                                                        {voucher.giantoida.toLocaleString("vi-VN")}đ
                                                    </b>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-10 grid max-w-xl gap-4 text-sm text-zinc-300 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            🚚 Freeship từ 500k
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            🔁 Đổi trả 7 ngày
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            🛡 Chính hãng 100%
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ProductDetail;