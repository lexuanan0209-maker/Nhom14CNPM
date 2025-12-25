// GDND.js - QUẢN LÝ NGƯỜI DÙNG

//KEY LOCAL
const ORDER_STORAGE_KEY = 'userOrders';

// SẢN PHẨM GỢI Ý 
const products = [
    { name: "Tai nghe Bluetooth", price: "350.000₫", img: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Tai+nghe" },
    { name: "Chuột không dây", price: "250.000₫", img: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Chuot" },
    { name: "Bàn phím cơ", price: "800.000₫", img: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Ban+phim" },
    { name: "Sạc dự phòng", price: "400.000₫", img: "https://via.placeholder.com/150/FFFF00/000000?text=Sac+du+phong" },
];

// HIỂN THỊ USER 
function displayUserName() {
    const userNameEl = document.getElementById('userNameDisplay');
    const userPhoneEl = document.getElementById('userPhoneDisplay');
    const avatarEl = document.querySelector('.avatar-large');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const name = currentUser.displayName || currentUser.username;

    if (userNameEl) {
        userNameEl.innerHTML = `${name} <span class="verified-icon">✅</span>`;
    }

    if (userPhoneEl) {
        userPhoneEl.innerHTML = `Số điện thoại: <b>${currentUser.phone || 'Chưa cập nhật'}</b>`;
    }

    if (avatarEl) {
        avatarEl.src = currentUser.avatarUrl || "https://via.placeholder.com/100/40e0d0/ffffff?text=AVT";
    }
}
window.displayUserName = displayUserName;

// HIỂN THỊ ĐƠN HÀNG 
function hienThiDonHang(status) {
    const orderContentEl = document.getElementById('order-content');
    if (!orderContentEl) return;

    // Active button
    document.querySelectorAll('.order-status button')
        .forEach(btn => btn.classList.toggle(
            'active-order-btn',
            btn.textContent.trim() === status
        ));

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        orderContentEl.innerHTML = `<p class="note">Vui lòng đăng nhập để xem đơn hàng</p>`;
        return;
    }

    let orders = (JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [])
        .filter(o => o.username === currentUser.username);

    if (status === 'Đánh giá') {
        orders = orders.filter(o => o.status === 'Đã nhận hàng');
    } else {
        orders = orders.filter(o => o.status === status);
    }

    if (!orders.length) {
        orderContentEl.innerHTML =
            `<p class="note">Không có đơn hàng nào ở trạng thái "${status}"</p>`;
        return;
    }

    orderContentEl.innerHTML = orders.reverse().map(order => {
        const itemsHTML = order.items
            .map(i => `${i.name} (x${i.quantity})`)
            .join('<br>');

        const total = Number(
            String(order.totalPrice).replace(/[^\d]/g, '')
        ).toLocaleString('vi-VN');

        const ratingHTML =
            order.status === 'Đã nhận hàng'
                ? (window.hienThiRating
                    ? window.hienThiRating(order.id)
                    : `<button class="rating-btn" onclick="openRatingModal('Sản phẩm trong đơn','${order.id}')">Đánh giá</button>`)
                : '';

        return `
            <div class="order-item">
                <p><strong>Mã đơn:</strong> #${order.id}</p>
                <p><strong>Ngày đặt:</strong> ${order.date}</p>
                <p><strong>Trạng thái:</strong>
                    <span class="status-badge status-${order.status.replace(/\s/g, '-')}">
                        ${order.status}
                    </span>
                </p>
                <p><strong>Sản phẩm:</strong><br>${itemsHTML}</p>
                <p><strong>Tổng tiền:</strong> ${total}₫</p>
                ${ratingHTML ? `<div class="rating-section">${ratingHTML}</div>` : ''}
            </div>
        `;
    }).join('');
}
window.hienThiDonHang = hienThiDonHang;

//  HỖ TRỢ NGƯỜI DÙNG
function hienThiHoTro(option) {
    const supportContent = document.getElementById('support-content');
    if (!supportContent) return;

    if (option === 'Trung tâm trợ giúp') {
        supportContent.innerHTML = `
            <h3>🔍 Các Chủ đề Trợ giúp</h3>
            <div class="support-topic">
                <h4>1. Đơn hàng & Vận chuyển</h4>
                <p>Theo dõi đơn hàng tại mục "Đơn mua"</p>
            </div>
            <div class="support-topic">
                <h4>2. Đổi trả & Hoàn tiền</h4>
                <p>Áp dụng trong 7 ngày kể từ khi nhận hàng</p>
            </div>
            <div class="support-topic">
                <h4>3. Tài khoản & Bảo mật</h4>
                <p>Chỉnh sửa thông tin trong Hồ sơ</p>
            </div>
        `;
    }
}
window.hienThiHoTro = hienThiHoTro;

//  KHỞI TẠO TRANG 
document.addEventListener('DOMContentLoaded', () => {
    displayUserName();
    hienThiDonHang('Chờ xác nhận');

    const suggestionsEl = document.getElementById('suggest-products');
    if (suggestionsEl) {
        suggestionsEl.innerHTML = products.map(p => `
            <div class="product">
                <img src="${p.img}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p>${p.price}</p>
            </div>
        `).join('');
    }
    });

//  SỰ KIỆN CẬP NHẬT 
window.addEventListener('orderUpdated', () => {
    const activeBtn = document.querySelector('.order-status button.active-order-btn');
    hienThiDonHang(activeBtn ? activeBtn.textContent.trim() : 'Chờ xác nhận');
});
