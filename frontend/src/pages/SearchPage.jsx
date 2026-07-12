// pages/SearchPage.jsx

import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
export default function SearchPage() {

    const [searchParams] = useSearchParams();


    const keyword = searchParams.get("q") || "";

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(false);
    const fetchProducts = async () => {

        try {

            setLoading(true);

            const res = await axios.get(
                "http://localhost:5000/api/products",
                {
                    params: {
                        q: searchParams.get("q") || ""
                    }
                }
            );

            if (res.data.success) {

                setProducts(res.data.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };
    useEffect(() => {

        fetchProducts();

    }, [searchParams]);


    const totalProducts = products.length;
    return (
        <div className="min-h-screen bg-[#0F0F0F]">
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">

                {/* Breadcrumb */}
                <div className="mb-8 text-sm text-zinc-400">
                    <span className="text-red-500">Trang chủ</span>
                    <span className="mx-2">/</span>
                    <span>Tìm kiếm</span>
                </div>

                {/* Title */}
                <h1 className="mb-6 text-center text-4xl font-black uppercase text-white md:text-5xl">
                    KẾT QUẢ TÌM KIẾM
                </h1>
                {keyword && (
                    <div className="mb-12 text-center">
                        <p className="text-lg text-zinc-400">
                            Kết quả tìm kiếm cho
                        </p>

                        <h2 className="mt-2 text-4xl font-black text-red-500">
                            "{keyword}"
                        </h2>
                    </div>
                )}

                <div className="flex gap-12 items-start">

                    {/* Sidebar */}
                    <aside className="w-72 shrink-0 sticky top-28">

                        <h3 className="mb-6 text-xl font-bold text-white">
                            Bộ lọc
                        </h3>

                        <div className="space-y-6">

                            <div className="border-b border-zinc-700 pb-5">
                                <h4 className="font-semibold text-white">
                                    Hãng
                                </h4>
                            </div>

                            <div className="border-b border-zinc-700 pb-5">
                                <h4 className="font-semibold text-white">
                                    Danh mục
                                </h4>
                            </div>

                            <div className="border-b border-zinc-700 pb-5">
                                <h4 className="font-semibold text-white">
                                    Giá
                                </h4>
                            </div>

                            <div className="border-b border-zinc-700 pb-5">
                                <h4 className="font-semibold text-white">
                                    Kích thước
                                </h4>
                            </div>

                            <div className="border-b border-zinc-700 pb-5">
                                <h4 className="font-semibold text-white">
                                    Màu sắc
                                </h4>
                            </div>

                        </div>

                    </aside>

                    {/* Content */}
                    <section className="flex-1 min-w-0">

                        <div className="mb-10 flex items-center justify-between">

                            <p className="text-lg text-zinc-300">
                                Đã tìm thấy{" "}
                                <span className="font-bold text-red-500">
                                    {totalProducts}
                                </span>{" "}
                                sản phẩm
                            </p>

                            <select className="w-52 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500">
                                <option value="">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                        {/* Result Count */}

                        {loading && (

                            <div className="text-center py-20 text-white">

                                Đang tìm kiếm...

                            </div>

                        )}
                        {!loading && products.length === 0 && (

                            <div className="text-center py-20">

                                <h2 className="text-3xl font-bold text-white">

                                    Không tìm thấy sản phẩm

                                </h2>

                                <p className="text-gray-400 mt-3">

                                    Hãy thử từ khóa khác.

                                </p>

                            </div>

                        )}

                        {/* Product Grid */}

                        {!loading && products.length > 0 && (

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.map((item) => (
                                    <ProductCard key={item.masanpham} product={item} />
                                ))}
                            </div>

                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}