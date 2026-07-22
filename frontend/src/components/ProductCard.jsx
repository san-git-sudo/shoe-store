import {
    useEffect,
    useState
} from "react";
import { Link } from "react-router-dom";

import {
    isInWishlist,
    toggleWishlist
} from "../utils/wishlist";

function HeartIcon({ filled = false }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill={
                filled
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
    );
}

function ProductCard({ product }) {
    const [isFavorite, setIsFavorite] =
        useState(false);

    useEffect(() => {
        setIsFavorite(
            isInWishlist(
                product?.masanpham
            )
        );
    }, [product?.masanpham]);

    const handleToggleWishlist = (
        event
    ) => {
        /*
            Ngăn thao tác nút trái tim làm ảnh hưởng
            tới Link xem chi tiết nằm trong card.
        */
        event.preventDefault();
        event.stopPropagation();

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
                        product.anhdaidien,

                    giaban:
                        Number(
                            product.giaban
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

    const price =
        Number(product?.giaban) || 0;

    return (
        <div className="group relative rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-2 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/10">
            {/* Nút yêu thích theo sản phẩm */}
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
                className={`absolute right-8 top-8 z-10 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition ${isFavorite
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-zinc-200 bg-white/95 text-zinc-800 hover:border-red-500 hover:text-red-500"
                    }`}
            >
                <HeartIcon
                    filled={isFavorite}
                />
            </button>

            <Link
                to={`/product/${product.masanpham}`}
                className="block"
            >
                <div className="overflow-hidden rounded-2xl bg-white">
                    <img
                        src={
                            product.anhdaidien ||
                            "https://placehold.co/600x600?text=No+Image"
                        }
                        alt={
                            product.tensanpham
                        }
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                </div>
            </Link>

            <Link
                to={`/product/${product.masanpham}`}
            >
                <h3 className="mt-5 h-14 line-clamp-2 text-lg font-bold text-white transition hover:text-red-500">
                    {product.tensanpham}
                </h3>
            </Link>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-black text-red-500">
                    {price.toLocaleString(
                        "vi-VN"
                    )}
                    ₫
                </span>
            </div>

            {/*
                Không thêm giỏ trực tiếp tại ProductCard
                vì danh sách sản phẩm chưa chọn size và màu.
            */}
            <Link
                to={`/product/${product.masanpham}`}
                className="mt-5 block rounded-2xl bg-red-500 py-3 text-center font-bold text-white transition hover:bg-red-600"
            >
                Xem chi tiết
            </Link>
        </div>
    );
}

export default ProductCard;