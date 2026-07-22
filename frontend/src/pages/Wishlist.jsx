import {
    useEffect,
    useState
} from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";
import Swal from "sweetalert2";

import {
    clearWishlist,
    getWishlist,
    removeFromWishlist
} from "../utils/wishlist";

function formatPrice(value) {
    const numericValue =
        Number(value);

    return Number.isFinite(numericValue)
        ? numericValue.toLocaleString(
            "vi-VN"
        ) + "đ"
        : "0đ";
}

function Wishlist() {
    const navigate = useNavigate();

    const [products, setProducts] =
        useState([]);

    useEffect(() => {
        const loadWishlist = () => {
            setProducts(
                getWishlist()
            );
        };

        loadWishlist();

        window.addEventListener(
            "wishlist-updated",
            loadWishlist
        );

        window.addEventListener(
            "storage",
            loadWishlist
        );

        return () => {
            window.removeEventListener(
                "wishlist-updated",
                loadWishlist
            );

            window.removeEventListener(
                "storage",
                loadWishlist
            );
        };
    }, []);

    const handleRemove = async (
        product
    ) => {
        const result =
            await Swal.fire({
                title:
                    "Bỏ khỏi danh sách yêu thích?",
                text:
                    product.tensanpham,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Bỏ sản phẩm",
                cancelButtonText: "Giữ lại",
                confirmButtonColor:
                    "#DC2626"
            });

        if (!result.isConfirmed) {
            return;
        }

        const updatedProducts =
            removeFromWishlist(
                product.masanpham
            );

        setProducts(
            updatedProducts
        );
    };

    const handleClearAll = async () => {
        const result =
            await Swal.fire({
                title:
                    "Xóa toàn bộ sản phẩm yêu thích?",
                text:
                    "Thao tác này không thể hoàn tác.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText:
                    "Xóa tất cả",
                cancelButtonText: "Hủy",
                confirmButtonColor:
                    "#DC2626"
            });

        if (!result.isConfirmed) {
            return;
        }

        clearWishlist();
        setProducts([]);
    };

    if (products.length === 0) {
        return (
            <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
                <section className="mx-auto max-w-4xl rounded-[2rem] border border-[#D6D3D1] bg-white px-6 py-20 text-center shadow-sm">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl">
                        ♡
                    </div>

                    <h1 className="mt-7 text-4xl font-black">
                        Danh sách yêu thích đang trống
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-500">
                        Lưu lại những đôi giày bạn quan tâm để dễ dàng xem lại sau.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="mt-8 rounded-2xl bg-[#18181B] px-8 py-4 font-black text-white transition hover:bg-[#DC2626]"
                    >
                        Tiếp tục mua sắm
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F3F0EA] px-6 pb-20 pt-32 text-[#18181B]">
            <section className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#DC2626]">
                            KICKZONE
                        </p>

                        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                            Sản phẩm yêu thích
                        </h1>

                        <p className="mt-3 text-zinc-500">
                            Bạn đã lưu {products.length} sản phẩm.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-[#DC2626] transition hover:bg-red-50"
                    >
                        Xóa tất cả
                    </button>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map(
                        (product) => (
                            <article
                                key={
                                    product.masanpham
                                }
                                className="overflow-hidden rounded-[2rem] border border-[#D6D3D1] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <Link
                                    to={`/product/${product.masanpham}`}
                                    className="block h-72 bg-[#F8F6F2] p-5"
                                >
                                    <img
                                        src={
                                            product.anhdaidien ||
                                            "https://placehold.co/500x500?text=No+Image"
                                        }
                                        alt={
                                            product.tensanpham
                                        }
                                        className="h-full w-full object-contain"
                                    />
                                </Link>

                                <div className="p-5">
                                    <Link
                                        to={`/product/${product.masanpham}`}
                                        className="line-clamp-2 text-lg font-black transition hover:text-[#DC2626]"
                                    >
                                        {
                                            product.tensanpham
                                        }
                                    </Link>

                                    <p className="mt-3 text-xl font-black text-[#DC2626]">
                                        {formatPrice(
                                            product.giaban
                                        )}
                                    </p>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <Link
                                            to={`/product/${product.masanpham}`}
                                            className="rounded-xl bg-[#18181B] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#DC2626]"
                                        >
                                            Xem sản phẩm
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(
                                                    product
                                                )
                                            }
                                            className="rounded-xl border border-[#D6D3D1] px-4 py-3 text-sm font-bold text-zinc-600 transition hover:border-red-300 hover:bg-red-50 hover:text-[#DC2626]"
                                        >
                                            Bỏ yêu thích
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )
                    )}
                </div>
            </section>
        </main>
    );
}

export default Wishlist;