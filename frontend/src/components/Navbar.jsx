import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCart } from "../utils/cart";

function SearchIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
    );
}
function HistoryIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.05 11a9 9 0 1 1 2.64 6.36" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-6h6" />
        </svg>
    );
}
function UserIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
            />
        </svg>
    );
}
function BagIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1 13H7L6 8Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8a3 3 0 0 1 6 0" />
        </svg>
    );
}

function Navbar() {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        fetchNavbarData();

        const updateCartCount = () => {
            const cart = getCart();

            const totalQuantity = Array.isArray(cart)
                ? cart.reduce(
                    (sum, item) =>
                        sum + (Number(item.quantity) || 0),
                    0
                )
                : 0;

            setCartCount(totalQuantity);
        };

        updateCartCount();

        window.addEventListener(
            "cart-updated",
            updateCartCount
        );

        window.addEventListener(
            "storage",
            updateCartCount
        );

        return () => {
            window.removeEventListener(
                "cart-updated",
                updateCartCount
            );

            window.removeEventListener(
                "storage",
                updateCartCount
            );
        };
    }, []);

    const fetchNavbarData = async () => {

        try {

            const [categoryRes, brandRes] = await Promise.all([

                axios.get("http://localhost:5000/api/categories"),

                axios.get("http://localhost:5000/api/brands")

            ]);

            if (categoryRes.data.success) {
                setCategories(categoryRes.data.data);
            }

            if (brandRes.data.success) {
                setBrands(brandRes.data.data);
            }

        } catch (err) {

            console.error("Navbar Error:", err);

        }

    };
    //hàm tìm kiếm
    const handleSearch = () => {
        if (!keyword.trim()) return;

        navigate(`/search?q=${encodeURIComponent(keyword)}`);
    };
    const maleCategories = categories.filter(
        item => item.gioitinh === "Nam"
    );

    const femaleCategories = categories.filter(
        item => item.gioitinh === "Nữ"
    );

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                <Link to="/" className="text-3xl font-black italic tracking-tight text-white">
                    KICK<span className="text-red-500">ZONE</span>
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-bold uppercase text-white lg:flex">
                    <Link className="text-red-500" to="/">
                        Trang chủ
                    </Link>

                    {/* Sản phẩm */}
                    <div className="group relative">
                        <button className="flex items-center gap-1 uppercase transition hover:text-red-500">
                            Sản phẩm
                            <span className="text-xs">⌄</span>
                        </button>

                        <div className="invisible absolute left-1/2 top-8 w-56 -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 opacity-0 transition-all group-hover:visible group-hover:top-10 group-hover:opacity-100">

                            {categories.map((category) => (
                                <Link
                                    key={category.madanhmuc}
                                    to={`/search?category=${category.madanhmuc}`}
                                    className="block rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-red-500 hover:text-white"
                                >
                                    {category.tendanhmuc}
                                </Link>
                            ))}

                        </div>
                    </div>

                    {/* Hãng */}
                    <div className="group relative">
                        <button className="flex items-center gap-1 uppercase transition hover:text-red-500">
                            Hãng
                            <span className="text-xs">⌄</span>
                        </button>

                        <div className="invisible absolute left-1/2 top-8 w-56 -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 opacity-0 transition-all group-hover:visible group-hover:top-10 group-hover:opacity-100">

                            {brands.map((brand) => (
                                <Link
                                    key={brand.mahang}
                                    to={`/search?brand=${brand.mahang}`}
                                    className="block rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-red-500 hover:text-white"
                                >
                                    {brand.tenhang}
                                </Link>
                            ))}

                        </div>
                    </div>
                    {/* Menu Nam*/}
                    <div className="group relative">
                        <button className="flex items-center gap-1 uppercase transition hover:text-red-500">
                            Nam
                            <span className="text-xs">⌄</span>
                        </button>

                        <div className="invisible absolute left-1/2 top-8 w-56 -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 opacity-0 transition-all group-hover:visible group-hover:top-10 group-hover:opacity-100">

                            {maleCategories.map((category) => (
                                <Link
                                    key={category.madanhmuc}
                                    to={`/search?category=${category.madanhmuc}`}
                                    className="block rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-red-500 hover:text-white"
                                >
                                    {category.tendanhmuc}
                                </Link>
                            ))}

                        </div>
                    </div>
                    {/* Menu Nữ */}
                    <div className="group relative">
                        <button className="flex items-center gap-1 uppercase transition hover:text-red-500">
                            Nữ
                            <span className="text-xs">⌄</span>
                        </button>

                        <div
                            className="invisible absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100"
                        >
                            {femaleCategories.map((category) => (
                                <Link
                                    key={category.madanhmuc}
                                    to={`/search?category=${category.madanhmuc}`}
                                    className="block rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-red-500 hover:text-white"
                                >
                                    {category.tendanhmuc}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link className="transition hover:text-red-500" to="/vouchers">
                        Khuyến mãi
                    </Link>
                </nav>

                <div className="flex items-center gap-5 text-white">
                    <div className="hidden h-11 items-center gap-3 rounded-full bg-zinc-100 px-4 text-zinc-900 transition hover:bg-zinc-200 md:flex">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="hover:text-red-500 transition"
                        >
                            <SearchIcon />
                        </button>
                        <input
                            type="text"
                            placeholder="Search"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            className="w-32 bg-transparent text-base font-medium outline-none placeholder:text-zinc-500"
                        />
                    </div>
                    <Link title="Tài khoản" to="/login" className="transition hover:text-red-500">
                        <UserIcon />
                    </Link>
                    <button className="transition hover:text-red-500">
                        <HeartIcon />
                    </button>
                    <Link
                        title="Lịch sử đặt hàng"
                        to="/orders"
                        className="transition hover:text-red-500"
                    >
                        <HistoryIcon />
                    </Link>
                    <Link to="/cart" className="relative transition hover:text-red-500">
                        <BagIcon />

                        {cartCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Navbar;