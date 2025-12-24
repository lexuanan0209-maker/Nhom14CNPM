// LOCAL STORAGE KEYS
const ORDER_STORAGE_KEY = 'userOrders';
const ORDER_RATING_KEY = 'orderRatings';

//KIỂM TRA ROLE ADMIN
function checkAdminRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = 'index.html';
    }
}
window.checkAdminRole = checkAdminRole;

//  QUẢN LÝ TAB ADMIN
function showAdminTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';

    document.querySelectorAll('.navbar a').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    if (tabId === 'orderManagement') loadOrdersForAdmin();
    else if (tabId === 'productManagement') loadProductManagement();
    else if (tabId === 'shopFeedback') loadShopFeedback();
}
window.showAdminTab = showAdminTab;

// QUẢN LÝ ĐƠN HÀNG
function loadOrdersForAdmin() {
    const orderListContainer = document.getElementById('orderList');
    if (!orderListContainer) return;

    orderListContainer.innerHTML = '';
    let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    orders.sort((a, b) => b.id - a.id);

    orders.forEach(order => {
        const itemNames = order.items.map(item => `${item.name} (x${item.quantity})`).join('<br>');

        let actionButton = '';
        switch (order.status) {
            case 'Chờ xác nhận':
                actionButton = `
                    <button class="status-btn confirm" onclick="updateOrderStatus(${order.id}, 'Chờ lấy hàng')">Xác nhận đơn</button>
                    <button class="status-btn cancel" onclick="updateOrderStatus(${order.id}, 'Đã hủy')" style="background-color: #dc3545; margin-left: 5px;">Hủy đơn</button>
                `;
                break;
            case 'Chờ lấy hàng':
                actionButton = 'Đang chờ Shipper lấy hàng...'; break;
            case 'Đang giao':
                actionButton = 'Đã giao cho Shipper.'; break;
            case 'Đã nhận hàng':
                actionButton = 'Đã giao thành công.'; break;
            case 'Đã hủy':
                actionButton = 'Đơn hàng đã bị hủy.'; break;
            default:
                actionButton = order.status;
        }

        orderListContainer.innerHTML += `
            <tr>
                <td>${order.userId || 'Khách (Ẩn danh)'}</td>
                <td>#${order.id}</td>
                <td>${itemNames}</td>
                <td>${parseInt(order.totalPrice).toLocaleString()}₫</td>
                <td>${order.date}</td>
                <td>${order.status}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
}
window.loadOrdersForAdmin = loadOrdersForAdmin;

function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return;

    if (newStatus === 'Đã hủy' && orders[index].shipperId) {
        orders[index].shipperId = null;
        alert(`Đơn hàng #${orderId} đã bị HỦY.`);
    } else {
        alert(`Đơn hàng #${orderId} đã chuyển sang trạng thái: ${newStatus}`);
    }

    orders[index].status = newStatus;
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('orderUpdated'));
    loadOrdersForAdmin();
}
window.updateOrderStatus = updateOrderStatus;

// QUẢN LÝ SẢN PHẨM 
const API_PRODUCTS = "http://localhost:3000/products"; // server JSON

async function loadProductManagement() {
    const container = document.getElementById('productListManagement');
    if (!container) return;
    container.innerHTML = '';

    try {
        const res = await fetch(API_PRODUCTS);
        const products = await res.json();

        products.forEach(p => {
            container.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${parseInt(p.price).toLocaleString('vi-VN')}₫</td>
                    <td>${p.category}</td>
                    <td>
                        <button class="action-btn" onclick="editProduct(${p.id})">Sửa</button>
                        <button class="action-btn" onclick="deleteProduct(${p.id})" style="background-color: #dc3545;">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Lỗi load sản phẩm:", e);
        container.innerHTML = '<tr><td colspan="5">Không thể tải sản phẩm từ server.</td></tr>';
    }
}
window.loadProductManagement = loadProductManagement;

async function handleProductFormSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        img: document.getElementById('productImg').value,
        category: document.getElementById('productCategory').value,
        origin: document.getElementById('productOrigin').value,
        sold: 0,
        rate: 5
    };

    try {
        if (id) {
            await fetch(`${API_PRODUCTS}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product)
            });
            alert("Đã cập nhật sản phẩm");
        } else {
            await fetch(API_PRODUCTS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product)
            });
            alert("Đã thêm sản phẩm mới");
        }

        loadProductManagement();
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    } catch (e) {
        console.error("Lỗi thao tác sản phẩm:", e);
    }
}
window.handleProductFormSubmit = handleProductFormSubmit;

async function editProduct(id) {
    try {
        const res = await fetch(`${API_PRODUCTS}/${id}`);
        const p = await res.json();
        document.getElementById('productId').value = p.id;
        document.getElementById('productName').value = p.name;
        document.getElementById('productPrice').value = p.price;
        document.getElementById('productImg').value = p.img;
        document.getElementById('productCategory').value = p.category;
        document.getElementById('productOrigin').value = p.origin;
    } catch (e) {
        console.error("Không thể load sản phẩm để edit:", e);
    }
}
window.editProduct = editProduct;

async function deleteProduct(id) {
    if (!confirm(`Xóa sản phẩm ID: ${id}?`)) return;
    try {
        await fetch(`${API_PRODUCTS}/${id}`, { method: "DELETE" });
        alert("Đã xóa sản phẩm");
        loadProductManagement();
    } catch (e) {
        console.error("Xóa sản phẩm thất bại:", e);
    }
}
window.deleteProduct = deleteProduct;

// PHẢN HỒI SHOP
function loadShopFeedback() {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList) return;

    feedbackList.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const allRatings = JSON.parse(localStorage.getItem(ORDER_RATING_KEY)) || {};

    const ratedOrders = orders
        .filter(o => o.status === 'Đã nhận hàng' && allRatings[o.id]?.shop)
        .sort((a, b) => b.id - a.id);

    if (!ratedOrders.length) {
        feedbackList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có phản hồi Shop nào được ghi nhận.</td></tr>';
        return;
    }

    ratedOrders.forEach(order => {
        const rating = allRatings[order.id].shop;
        const items = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
        const ratingDisplay = `<span style="color: gold;">${stars}</span> (${rating.rating}/5)`;

        feedbackList.innerHTML += `
            <tr>
                <td>#${order.id}</td>
                <td>${items}</td>
                <td>${ratingDisplay}</td>
                <td>${rating.comment || '<span style="color:#999;">Không có nhận xét.</span>'}</td>
                <td>${rating.userId}</td>
            </tr>
        `;
    });
}
window.loadShopFeedback = loadShopFeedback;

// INIT
document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAdminRole === 'function') checkAdminRole();
    loadOrdersForAdmin();

    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);

    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    });
});

// EVENT LISTENERS 
window.addEventListener('productsUpdated', () => {
    const productTab = document.getElementById('productManagement');
    if (productTab && productTab.style.display === 'block') loadProductManagement();
});

window.addEventListener('orderUpdated', loadOrdersForAdmin);
