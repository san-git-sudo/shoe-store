const CART_KEY = "shoe_cart";

export function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product) {
    const cart = getCart();

    const index = cart.findIndex(
        item =>
            item.mabienthe === product.mabienthe
    );

    if (index !== -1) {
        cart[index].quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
        });
    }

    saveCart(cart);
}

export function removeCartItem(mabienthe) {
    const cart = getCart().filter(
        item => item.mabienthe !== mabienthe
    );

    saveCart(cart);
}

export function updateQuantity(mabienthe, quantity) {
    const cart = getCart();

    const item = cart.find(i => i.mabienthe === mabienthe);

    if (!item) return;

    item.quantity = quantity;

    if (item.quantity <= 0) {
        removeCartItem(mabienthe);
        return;
    }

    saveCart(cart);
}