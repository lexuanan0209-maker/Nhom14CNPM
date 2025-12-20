// Local storage keys
const ORDER_STORAGE_KEY = 'userOrders';
const ORDER_RATING_KEY = 'orderRatings';
const UPDATED_PRODUCTS_KEY = 'updatedProducts'; // Sản phẩm đã cập nhật

// Kiểm tra quyền admin
function checkAdminRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = 'index.html';
    }
}
window.checkAdminRole = checkAdminRole;

// Quản lý tab admin
function showAdminTab(tabId, element) {
    // Ẩn tất cả tab
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');

    // Hiển thị tab được chọn
    document.getElementById(tabId).style.display = 'block';

    // Active navbar
    document.querySelectorAll('.navbar a').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Load dữ liệu theo tab
    if (tabId === 'orderManagement') loadOrdersForAdmin();
    else if (tabId === 'productManagement') loadProductManagement();
    else if (tabId === 'shopFeedback') loadShopFeedback();
}
window.showAdminTab = showAdminTab;

// Lấy đánh giá theo đơn hàng
function getOrderRating(orderId) {
    const allRatings = JSON.parse(localStorage.getItem(ORDER_RATING_KEY)) || {};
    return allRatings[orderId] || { shop: null };
}

// Quản lý đơn hàng
function loadOrdersForAdmin() {
    const orderListContainer = document.getElementById('orderList');
    if (!orderListContainer) return;

    orderListContainer.innerHTML = '';
    let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];

    // Sắp xếp đơn mới nhất
    orders.sort((a, b) => b.id - a.id);

    orders.forEach(order => {
        const itemNames = order.items
            .map(item => `${item.name} (x${item.quantity})`)
            .join('<br>');

        let actionButton = '';
        let statusDisplay = order.status;

        switch (order.status) {
            case 'Chờ xác nhận':
                actionButton = `
                    <button class="status-btn confirm" onclick="updateOrderStatus(${order.id}, 'Chờ lấy hàng')">Xác nhận đơn</button>
                    <button class="status-btn cancel" onclick="updateOrderStatus(${order.id}, 'Đã hủy')" style="background-color: #dc3545; margin-left: 5px;">Hủy đơn</button>
                `;
                break;
            case 'Chờ lấy hàng':
                actionButton = `Đang chờ Shipper lấy hàng...`;
                break;
            case 'Đang giao':
                actionButton = `Đã giao cho Shipper.`;
                break;
            case 'Đã nhận hàng':
                actionButton = `Đã giao thành công.`;
                break;
            case 'Đã hủy':
                actionButton = `Đơn hàng đã bị hủy.`;
                break;
            default:
                actionButton = statusDisplay;
        }

        orderListContainer.innerHTML += `
            <tr>
                <td>${order.userId || 'Khách (Ẩn danh)'}</td>
                <td>#${order.id}</td>
                <td>${itemNames}</td>
                <td>${parseInt(order.totalPrice).toLocaleString()}₫</td>
                <td>${order.date}</td>
                <td>${statusDisplay}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
}
window.loadOrdersForAdmin = loadOrdersForAdmin;

// Cập nhật trạng thái đơn hàng
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

// Quản lý sản phẩm
function getEditableProducts() {
    const storedProducts = localStorage.getItem(UPDATED_PRODUCTS_KEY);
    return storedProducts ? JSON.parse(storedProducts) : (window.products || []);
}

function loadProductManagement() {
    const container = document.getElementById('productListManagement');
    if (!container) return;

    container.innerHTML = '';
    const products = getEditableProducts();

    products.forEach(product => {
        container.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${parseInt(product.price).toLocaleString('vi-VN')}₫</td>
                <td>${product.category}</td>
                <td>
                    <button class="action-btn" onclick="editProduct(${product.id})">Sửa</button>
                    <button class="action-btn" onclick="deleteProduct(${product.id})" style="background-color: #dc3545;">Xóa</button>
                </td>
            </tr>
        `;
    });
}
window.loadProductManagement = loadProductManagement;

// Xử lý form sản phẩm
function handleProductFormSubmit(event) {
    event.preventDefault();
    let products = getEditableProducts();

    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const img = document.getElementById('productImg').value;
    const category = document.getElementById('productCategory').value;
    const origin = document.getElementById('productOrigin').value;

    if (id) {
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], name, price, img, category, origin };
            alert(`Đã cập nhật sản phẩm ID: ${id}`);
        }
    } else {
        const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, price, img, category, origin, sold: 0, rate: 5 });
        alert(`Đã thêm sản phẩm mới: ${name} (ID: ${newId})`);
    }

    localStorage.setItem(UPDATED_PRODUCTS_KEY, JSON.stringify(products));
    loadProductManagement();
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.querySelector('#productForm button[type="submit"]').textContent = 'Thêm Sản phẩm';
    document.getElementById('cancelEdit').style.display = 'none';
    window.dispatchEvent(new Event('productsUpdated'));
}

// Sửa sản phẩm
function editProduct(productId) {
    const product = getEditableProducts().find(p => p.id === productId);
    if (!product) return;

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImg').value = product.img;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productOrigin').value = product.origin;
    document.querySelector('#productForm button[type="submit"]').textContent = 'Cập nhật Sản phẩm';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    window.scrollTo(0, 0);
}
window.editProduct = editProduct;

// Hủy chỉnh sửa
function cancelEdit() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.querySelector('#productForm button[type="submit"]').textContent = 'Thêm Sản phẩm';
    document.getElementById('cancelEdit').style.display = 'none';
}

// Xóa sản phẩm
function deleteProduct(productId) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm ID: ${productId} này không?`)) return;
    let products = getEditableProducts().filter(p => p.id !== productId);
    localStorage.setItem(UPDATED_PRODUCTS_KEY, JSON.stringify(products));
    loadProductManagement();
    window.dispatchEvent(new Event('productsUpdated'));
    alert(`Đã xóa sản phẩm ID: ${productId}`);
}
window.deleteProduct = deleteProduct;

// Phản hồi shop
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

// Khởi tạo trang admin
document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAdminRole === 'function') checkAdminRole();
    loadOrdersForAdmin();

    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);

    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEdit);
});

// Lắng nghe sự kiện cập nhật
window.addEventListener('productsUpdated', () => {
    if (typeof applyFiltersAndSorts === 'function') applyFiltersAndSorts();
    const productTab = document.getElementById('productManagement');
    if (productTab && productTab.style.display === 'block') loadProductManagement();
});

window.addEventListener('orderUpdated', loadOrdersForAdmin);
