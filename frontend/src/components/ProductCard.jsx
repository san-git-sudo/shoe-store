import { Link } from "react-router-dom";
function ProductCard({ product }) {
    return (
        <div className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-2 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/10">
            <div className="relative overflow-hidden rounded-2xl bg-white">
                <button className="absolute right-4 top-4 z-10 text-xl">♡</button>
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                />
            </div>

            <Link to={`/product/${product.id}`}>
                <h3 className="mt-5 text-lg font-bold text-white transition hover:text-red-500">
                    {product.name}
                </h3>
            </Link>

            <div className="mt-2 flex items-center gap-3">
                <span className="font-black text-red-500">{product.price}</span>
                <span className="text-sm text-zinc-500 line-through">
                    {product.oldPrice}
                </span>
            </div>

            <p className="mt-2 text-sm text-zinc-300">★★★★★ {product.rating}</p>

            <button className="mt-5 w-full rounded-xl bg-red-500 py-3 text-sm font-bold uppercase text-white transition hover:bg-red-600">
                Thêm vào giỏ 🛒
            </button>
        </div>
    );
}

export default ProductCard;