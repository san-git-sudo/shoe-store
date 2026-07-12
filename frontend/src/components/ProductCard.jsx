import { Link } from "react-router-dom";
import { addToCart } from "../utils/cart";

function ProductCard({ product }) {

    const handleAdd = () => {

        addToCart({

            mabienthe: product.mabienthe || product.masanpham,

            masanpham: product.masanpham,

            name: product.tensanpham,

            image: product.anhdaidien,

            price: product.giaban,

            size: "",

            color: ""

        });

        alert("Đã thêm vào giỏ");

    };

    return (
        <div className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-2 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/10">

            <div className="overflow-hidden rounded-2xl bg-white">
                <img
                    src={
                        product.anhdaidien ||
                        "https://placehold.co/600x600?text=No+Image"
                    }
                    alt={product.tensanpham}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                />
            </div>

            <Link to={`/product/${product.masanpham}`}>
                <h3 className="mt-5 h-14 text-lg font-bold text-white transition hover:text-red-500 line-clamp-2">
                    {product.tensanpham}
                </h3>
            </Link>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-black text-red-500">
                    {product.giaban.toLocaleString("vi-VN")}₫
                </span>
            </div>

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