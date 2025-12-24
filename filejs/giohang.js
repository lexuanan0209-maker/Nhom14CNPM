// giohang.js 
const ORDER_STORAGE_KEY = 'userOrders';

function getCurrentUserKey(suffix) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? `${suffix}_${user.username}` : 'cart';
}

function loadCart() {
    const cartKey = getCurrentUserKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartBody = document.getElementById("cartBody");
    const totalPriceEl = document.getElementById("totalPrice");

    if (!cart.length) {
        cartBody.innerHTML = "<tr><td colspan='6'>Giỏ hàng trống!</td></tr>";
        totalPriceEl.textContent = "0";
        return;
    }

    let total = 0;
    cartBody.innerHTML = '';
    
    // Tạo nội dung row từng item
    cart.forEach(item => {
        const price = parseInt(item.price.replace(/\D/g, ''));
        const itemTotal = price * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${item.img}" class="cart-img"></td>
            <td>${item.name}</td>
            <td>${price.toLocaleString('vi-VN')}₫</td>
            <td>
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                ${item.quantity}
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </td>
            <td>${itemTotal.toLocaleString('vi-VN')}₫</td>
            <td><button class="remove-btn" onclick="removeItem(${item.id})">🗑️</button></td>
        `;
        cartBody.appendChild(row);
    });

    totalPriceEl.textContent = total.toLocaleString('vi-VN');
}

window.loadCart = loadCart;

function changeQty(id, delta) {
    const cartKey = getCurrentUserKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const idx = cart.findIndex(i => Number(i.id) === Number(id));

    if (idx !== -1) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
    }
}

window.changeQty = changeQty;

function removeItem(id) {
    const cartKey = getCurrentUserKey('cart');
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const newCart = cart.filter(i => Number(i.id) !== Number(id));


    if (newCart.length !== cart.length) {
        localStorage.setItem(cartKey, JSON.stringify(newCart));
        loadCart();
    }
}

window.removeItem = removeItem;

function checkout() {
    if (!requireLoginFeature()) return;

    const cartKey = getCurrentUserKey('cart');
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!cart.length) {
        alert("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
        return;
    }

    let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const nextId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1000;
    const date = new Date().toISOString().substring(0,10);
    const totalPrice = parseInt(document.getElementById("totalPrice").textContent.replace(/\D/g,''));

    const newOrder = {
        id: nextId,
        username: user.username,
        items: cart.map(i => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price
        })),
        totalPrice,
        status: 'Chờ xác nhận',
        date
    };

    orders.push(newOrder);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    localStorage.removeItem(cartKey);

    alert("🎉 Thanh toán thành công! Đơn hàng đang ở trạng thái 'Chờ xác nhận'.");
    window.location.reload();
}

window.checkout = checkout;
