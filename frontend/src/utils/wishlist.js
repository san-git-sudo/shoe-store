const WISHLIST_KEY = "shoe_wishlist";

// ======================================================
// LẤY DANH SÁCH SẢN PHẨM YÊU THÍCH
//
// Dữ liệu được lưu trong localStorage dưới dạng JSON.
// Nếu chưa có dữ liệu hoặc dữ liệu lỗi thì trả về mảng rỗng.
// ======================================================
export function getWishlist() {
    try {
        const savedWishlist =
            localStorage.getItem(WISHLIST_KEY);

        if (!savedWishlist) {
            return [];
        }

        const parsedWishlist =
            JSON.parse(savedWishlist);

        return Array.isArray(parsedWishlist)
            ? parsedWishlist
            : [];
    } catch (error) {
        console.error(
            "Lỗi đọc wishlist:",
            error
        );

        return [];
    }
}

// ======================================================
// LƯU DANH SÁCH YÊU THÍCH
//
// Sau khi lưu sẽ phát sự kiện wishlist-updated
// để Navbar và trang Wishlist tự cập nhật lại.
// ======================================================
function saveWishlist(items) {
    const safeItems =
        Array.isArray(items) ? items : [];

    localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(safeItems)
    );

    window.dispatchEvent(
        new Event("wishlist-updated")
    );

    return safeItems;
}

// ======================================================
// KIỂM TRA SẢN PHẨM ĐÃ CÓ TRONG WISHLIST CHƯA
// ======================================================
export function isInWishlist(productId) {
    const id = Number(productId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return false;
    }

    return getWishlist().some(
        (item) =>
            Number(item.masanpham) === id
    );
}

// ======================================================
// THÊM SẢN PHẨM VÀO WISHLIST
//
// Không thêm trùng sản phẩm theo masanpham.
// Chỉ lưu những dữ liệu cần để hiển thị ở trang Wishlist.
// ======================================================
export function addToWishlist(product) {
    const productId =
        Number(product?.masanpham);

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new Error(
            "Mã sản phẩm không hợp lệ"
        );
    }

    const currentWishlist =
        getWishlist();

    if (isInWishlist(productId)) {
        return currentWishlist;
    }

    const newItem = {
        masanpham: productId,

        tensanpham:
            product?.tensanpham ||
            product?.name ||
            "",

        anhdaidien:
            product?.anhdaidien ||
            product?.image ||
            "",

        giaban:
            Number(
                product?.giaban ??
                product?.price
            ) || 0
    };

    return saveWishlist([
        ...currentWishlist,
        newItem
    ]);
}

// ======================================================
// XÓA MỘT SẢN PHẨM KHỎI WISHLIST
// ======================================================
export function removeFromWishlist(
    productId
) {
    const id = Number(productId);

    const updatedWishlist =
        getWishlist().filter(
            (item) =>
                Number(item.masanpham) !== id
        );

    return saveWishlist(
        updatedWishlist
    );
}

// ======================================================
// THÊM HOẶC BỎ YÊU THÍCH
//
// Nếu sản phẩm đã có thì xóa.
// Nếu chưa có thì thêm.
// ======================================================
export function toggleWishlist(product) {
    const productId =
        Number(product?.masanpham);

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new Error(
            "Mã sản phẩm không hợp lệ"
        );
    }

    if (isInWishlist(productId)) {
        const items =
            removeFromWishlist(productId);

        return {
            isFavorite: false,
            items
        };
    }

    const items =
        addToWishlist(product);

    return {
        isFavorite: true,
        items
    };
}

// ======================================================
// XÓA TOÀN BỘ DANH SÁCH YÊU THÍCH
// ======================================================
export function clearWishlist() {
    return saveWishlist([]);
}