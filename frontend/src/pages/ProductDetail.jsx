import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProductDetail() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);

    const [selectedVariant, setSelectedVariant] = useState(null);

    const [selectedColor, setSelectedColor] = useState(null);

    const [loading, setLoading] = useState(true);
    useEffect(() => {

        fetchProduct();

    }, [id]);

    const fetchProduct = async () => {

        try {

            const res = await axios.get(`http://localhost:5000/api/products/${id}`);

            if (res.data.success) {

                const productData = res.data.data;

                setProduct(productData);

                if (productData.variants.length > 0) {

                    const firstVariant = productData.variants[0];

                    setSelectedVariant(firstVariant);

                    setSelectedColor(firstVariant.mausac);

                }

            }

        } catch (err) {

            console.error("Product Detail Error:", err);

        } finally {

            setLoading(false);

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
            <section className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6">
                    <div className="overflow-hidden rounded-[1.5rem] bg-white">
                        <img
                            src={
                                product.anhdaidien
                                    ? `http://localhost:5000/uploads/${product.anhdaidien}`
                                    : "https://placehold.co/600x600?text=No+Image"
                            }
                            alt={product.tensanpham}
                            className="h-[520px] w-full object-cover"
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="cursor-pointer rounded-2xl border border-zinc-700 bg-white p-2 transition hover:border-red-500"
                            >
                                <img
                                    src={
                                        product.anhdaidien
                                            ? `http://localhost:5000/uploads/${product.anhdaidien}`
                                            : "https://placehold.co/600x600?text=No+Image"
                                    }
                                    alt={product.tensanpham}
                                    className="h-24 w-full rounded-xl object-cover"
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
                                    onClick={() => {

                                        setSelectedVariant(variant);

                                        setSelectedColor(variant.mausac);

                                    }}
                                    className={`rounded-xl py-3 font-bold transition
            ${selectedVariant?.mabienthe === variant.mabienthe
                                            ? "bg-red-500 text-white border-red-500"
                                            : "border border-zinc-700 hover:border-red-500"
                                        }`}
                                >
                                    {variant.kichthuoc.tenkichthuoc}
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

                                        setSelectedColor(color);

                                        const firstSize = product.variants.find(
                                            variant => variant.mausac.mamausac === color.mamausac
                                        );

                                        if (firstSize) {
                                            setSelectedVariant(firstSize);
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
                        <button className="rounded-2xl bg-red-500 px-10 py-4 font-black uppercase text-white transition hover:bg-red-600">
                            Thêm vào giỏ hàng
                        </button>
                        <button className="rounded-2xl border border-zinc-700 px-10 py-4 font-black uppercase text-white transition hover:border-red-500 hover:text-red-500">
                            Mua ngay
                        </button>
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