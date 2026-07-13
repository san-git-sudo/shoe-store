// pages/SearchPage.jsx

import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
export default function SearchPage() {

    const [searchParams] = useSearchParams();


    const keyword = searchParams.get("q") || "";
    const brandParam = searchParams.get("brand") || "";
    const categoryParam = searchParams.get("category") || "";

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(false);
    // Danh sách hãng
    const [brands, setBrands] = useState([]);
    // Danh sách danh mục
    const [categories, setCategories] = useState([]);
    // Hãng đang chọn
    const [selectedBrand, setSelectedBrand] = useState("");
    // Danh mục đang chọn
    const [selectedCategory, setSelectedCategory] = useState("");
    //mỗi lần đổi radio đổi theo
    useEffect(() => {
        setSelectedBrand(brandParam);
        setSelectedCategory(categoryParam);
    }, [brandParam, categoryParam]);
    //thanh mới nhất, cũ nhất , sắp xếp
    const [sort, setSort] = useState("");
    //giá
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    // Danh sách size
    const [sizes, setSizes] = useState([]);
    // Danh sách màu
    const [colors, setColors] = useState([]);
    // Size đang chọn
    const [selectedSize, setSelectedSize] = useState("");
    // Màu đang chọn
    const [selectedColor, setSelectedColor] = useState("");
    const fetchProducts = async () => {

        try {

            setLoading(true);

            const params = {};

            if (selectedBrand || selectedCategory) {

                if (selectedBrand) params.brand = selectedBrand;

                if (selectedCategory) params.category = selectedCategory;

            } else {

                if (keyword) params.q = keyword;

            }

            if (selectedSize) params.size = selectedSize;

            if (selectedColor) params.color = selectedColor;

            if (minPrice) params.minPrice = minPrice;

            if (maxPrice) params.maxPrice = maxPrice;

            if (sort) params.sort = sort;
            const res = await axios.get(
                "http://localhost:5000/api/products",
                {
                    params
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

    }, [
        searchParams,
        selectedBrand,
        selectedCategory,
        selectedSize,
        selectedColor,
        minPrice,
        maxPrice,
        sort
    ]);
    useEffect(() => {

        fetchFilters();

    }, []);
    // ======================
    // Lấy dữ liệu Sidebar
    // ======================

    const fetchFilters = async () => {

        try {

            const [brandRes, categoryRes, sizeRes, colorRes] = await Promise.all([

                axios.get("http://localhost:5000/api/brands"),

                axios.get("http://localhost:5000/api/categories"),

                axios.get("http://localhost:5000/api/sizes"),

                axios.get("http://localhost:5000/api/colors")

            ]);
            if (sizeRes.data.success) {

                setSizes(sizeRes.data.data);

            }

            if (colorRes.data.success) {

                setColors(colorRes.data.data);

            }

            if (brandRes.data.success) {

                setBrands(brandRes.data.data);

            }

            if (categoryRes.data.success) {

                setCategories(categoryRes.data.data);

            }

        } catch (err) {

            console.error(err);

        }

    };
    const clearFilters = () => {

        setSelectedBrand("");
        setSelectedCategory("");
        setSelectedSize("");
        setSelectedColor("");
        setMinPrice("");
        setMaxPrice("");
        setSort("");

    };
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

                        <div className="mb-6 flex items-center justify-between">

                            <h3 className="text-xl font-bold text-white">
                                Bộ lọc
                            </h3>

                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-500 transition hover:text-red-400"
                            >
                                Xóa tất cả
                            </button>

                        </div>

                        <div className="space-y-6">

                            <div className="border-b border-zinc-700 pb-5">

                                <h4 className="mb-4 font-semibold text-white">
                                    Hãng
                                </h4>

                                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">

                                    <label className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500">

                                        <input
                                            type="radio"
                                            name="brand"
                                            checked={selectedBrand === ""}
                                            onChange={() => setSelectedBrand("")}
                                            className="accent-red-500"
                                        />

                                        Tất cả

                                    </label>

                                    {brands.map((brand) => (

                                        <label
                                            key={brand.mahang}
                                            className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500"
                                        >

                                            <input
                                                type="radio"
                                                name="brand"
                                                checked={selectedBrand === String(brand.mahang)}
                                                onChange={() => setSelectedBrand(String(brand.mahang))}
                                                className="accent-red-500"
                                            />

                                            {brand.tenhang}

                                        </label>

                                    ))}

                                </div>

                            </div>
                            <div className="border-b border-zinc-700 pb-5">

                                <h4 className="mb-4 font-semibold text-white">
                                    Danh mục
                                </h4>

                                <div className="max-h-56 space-y-3 overflow-y-auto pr-2">

                                    <label className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500">

                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === ""}
                                            onChange={() => setSelectedCategory("")}
                                            className="accent-red-500"
                                        />
                                        Tất cả

                                    </label>

                                    {categories.map((category) => (

                                        <label
                                            key={category.madanhmuc}
                                            className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500"
                                        >

                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === String(category.madanhmuc)}
                                                onChange={() => setSelectedCategory(String(category.madanhmuc))}
                                                className="accent-red-500"
                                            />
                                            {category.tendanhmuc}

                                        </label>

                                    ))}

                                </div>

                            </div>

                            <div className="border-b border-zinc-700 pb-5">

                                <h4 className="mb-4 font-semibold text-white">
                                    Giá
                                </h4>

                                <div className="space-y-3">

                                    <input
                                        type="number"
                                        placeholder="Từ"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="no-spinner mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-red-500"
                                    />

                                    <input
                                        type="number"
                                        placeholder="Đến"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="no-spinner mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-red-500"
                                    />

                                </div>

                            </div>

                            <div className="border-b border-zinc-700 pb-5">

                                <h4 className="mb-4 font-semibold text-white">
                                    Kích thước
                                </h4>

                                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">

                                    <label className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500">

                                        <input
                                            type="radio"
                                            name="size"
                                            checked={selectedSize === ""}
                                            onChange={() => setSelectedSize("")}
                                            className="accent-red-500"
                                        />

                                        Tất cả

                                    </label>

                                    {sizes.map((size) => (

                                        <label
                                            key={size.makichthuoc}
                                            className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500"
                                        >

                                            <input
                                                type="radio"
                                                name="size"
                                                checked={selectedSize === String(size.makichthuoc)}
                                                onChange={() => setSelectedSize(String(size.makichthuoc))}
                                                className="accent-red-500"
                                            />

                                            {size.tenkichthuoc}

                                        </label>

                                    ))}

                                </div>

                            </div>

                            <div className="border-b border-zinc-700 pb-5">

                                <h4 className="mb-4 font-semibold text-white">
                                    Màu sắc
                                </h4>

                                <div className="max-h-56 space-y-3 overflow-y-auto pr-2">

                                    <label className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500">

                                        <input
                                            type="radio"
                                            name="color"
                                            checked={selectedColor === ""}
                                            onChange={() => setSelectedColor("")}
                                            className="accent-red-500"
                                        />

                                        Tất cả

                                    </label>

                                    {colors.map((color) => (

                                        <label
                                            key={color.mamausac}
                                            className="flex cursor-pointer items-center gap-3 text-zinc-300 hover:text-red-500"
                                        >

                                            <input
                                                type="radio"
                                                name="color"
                                                checked={selectedColor === String(color.mamausac)}
                                                onChange={() => setSelectedColor(String(color.mamausac))}
                                                className="accent-red-500"
                                            />

                                            <span
                                                className="h-4 w-4 rounded-full border border-zinc-500"
                                                style={{ backgroundColor: color.hexcode }}
                                            />

                                            {color.tenmausac}

                                        </label>

                                    ))}

                                </div>

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

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-52 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500"
                            >
                                <option value="">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                <option value="name">Tên A → Z</option>
                                <option value="oldest">Cũ nhất</option>
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