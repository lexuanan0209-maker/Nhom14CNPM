// shipper.js

const ORDER_STORAGE_KEY = 'userOrders';
const ORDER_RATING_KEY = 'orderRatings';

window.getCurrentShipperId = () => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    return u ? u.username : null;
};

const internalGetOrderRating = (orderId) => {
    const all = JSON.parse(localStorage.getItem(ORDER_RATING_KEY)) || {};
    return all[orderId] || { shop: null, shipper: null };
};
if (!window.getOrderRating) window.getOrderRating = internalGetOrderRating;

window.checkShipperRole = () => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.role !== 'shipper') { alert('Bạn không có quyền truy cập!'); window.location.href = 'index.html'; }
};

window.updateShipperStatus = (orderId, newStatus) => {
    let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const idx = orders.findIndex(o => o.id === orderId);
    const shipperId = getCurrentShipperId();
    if (idx === -1) return alert('Không tìm thấy đơn hàng.');
    if (!shipperId) return alert('Không tìm thấy Shipper ID.');

    if (!orders[idx].shipperId) orders[idx].shipperId = shipperId;

    let msg = '';
    if (newStatus === 'Đang giao') msg = `🚚 Đơn #${orderId} đang giao.`;
    else if (newStatus === 'Đã nhận hàng') {
        if (typeof updateProductSold === 'function') orders[idx].items.forEach(i => updateProductSold(i.id, i.quantity));
        msg = `✅ Đơn #${orderId} HOÀN TẤT. Kiểm tra tab "Đã HOÀN TẤT".`;
    } else if (newStatus === 'Đã hủy') {
        orders[idx].shipperId = null;
        orders[idx].status = 'Chờ xác nhận';
        msg = `❌ Đơn #${orderId} đã HỦY. Trả về chờ Admin.`;
    } else msg = `Đơn #${orderId} đã đổi trạng thái: ${newStatus}`;

    orders[idx].status = newStatus === 'Đã hủy' ? 'Chờ xác nhận' : newStatus;
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    alert(msg);
    window.dispatchEvent(new CustomEvent('orderUpdated', { detail: { newStatus } }));
};

window.calculateShipperRating = () => {
    const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const current = getCurrentShipperId();
    const completed = orders.filter(o => o.status === 'Đã nhận hàng' && o.shipperId === current);

    let total = 0, count = 0;
    completed.forEach(o => {
        const r = window.getOrderRating(o.id).shipper;
        if (r?.rating) { total += r.rating; count++; }
    });

    const avg = count ? (total / count).toFixed(1) : 0;
    const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    const el = document.getElementById('ratingSummary');
    if (el) el.innerHTML = `
        <h3>${avg} / 5.0 ${stars}</h3>
        <p style="font-size:16px;">(Dựa trên ${count} lượt đánh giá)</p>
        <p style="color:${avg>=4?'green':avg>=3?'#ff9800':'red'};font-weight:bold;">
            Trạng thái: ${avg>=4?'Tuyệt vời':avg>=3?'Ổn định':'Cần cải thiện'}
        </p>
    `;
};

window.changeShipperTab = (tab) => {
    const listDiv = document.getElementById('shipperOrderList');
    const ratingDiv = document.getElementById('shipperRatingContent');
    document.querySelectorAll('.shipper-tabs .tab-btn').forEach(b => b.classList.remove('active'));

    if (tab === 'rating') {
        document.getElementById('tabRatingSummary').classList.add('active');
        listDiv.style.display = 'none';
        ratingDiv.style.display = 'block';
        calculateShipperRating();
    } else {
        const el = document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}Orders`);
        if (el) el.classList.add('active');
        listDiv.style.display = 'block';
        ratingDiv.style.display = 'none';
        loadOrdersForShipper(tab);
    }
};

window.loadOrdersForShipper = (tab='pending') => {
    const list = document.getElementById('shipperOrderList');
    if (!list) return;
    list.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    const current = getCurrentShipperId();
    let filtered = [];

    if (tab==='pending') filtered = orders.filter(o => o.status==='Chờ lấy hàng' && !o.shipperId);
    else if (tab==='shipping') filtered = orders.filter(o => o.status==='Đang giao' && o.shipperId===current);
    else if (tab==='completed') filtered = orders.filter(o => o.status==='Đã nhận hàng' && o.shipperId===current);

    if (!filtered.length) {
        const msg = tab==='pending'?'Không có đơn chờ lấy':tab==='shipping'?'Chưa có đơn giao':'Chưa có đơn hoàn tất';
        list.innerHTML = `<p style="padding:20px;text-align:center;color:#999;">${msg}</p>`;
        return;
    }

    filtered.forEach(o => {
        const items = Array.isArray(o.items)?o.items:[];
        const itemNames = items.map(i=>`${i.name} (x${i.quantity})`).join(', ');
        let actions = '';
        if (o.status==='Chờ lấy hàng') actions = `<button class="shipper-btn start-shipping-btn" onclick="updateShipperStatus(${o.id}, 'Đang giao')">Bắt đầu giao hàng</button>`;
        else if (o.status==='Đang giao') actions = `
            <div class="shipper-btn-group">
                <button class="shipper-btn complete-btn" onclick="updateShipperStatus(${o.id}, 'Đã nhận hàng')">Hoàn tất giao hàng</button>
                <button class="shipper-btn cancel-btn" onclick="updateShipperStatus(${o.id}, 'Đã hủy')">Hủy đơn</button>
            </div>`;
        else if (o.status==='Đã nhận hàng') {
            const r = window.getOrderRating(o.id).shipper;
            actions = `<div class="shipper-feedback">${r?.rating?'<p style="color:gold;font-size:20px;">'+('★'.repeat(r.rating)+'☆'.repeat(5-r.rating))+'</p><small>'+ (r.comment||'Không có nhận xét')+'</small>':'<small>Chưa có đánh giá Shipper.</small>'}</div>`;
        }

        const color = o.status==='Đang giao'?'#2196F3':o.status==='Đã nhận hàng'?'#4CAF50':'#FF9800';

        list.innerHTML += `
            <div class="order-card">
                <h3>Đơn hàng #${o.id}</h3>
                <p><strong>Ngày đặt:</strong> ${o.date}</p>
                <p><strong>Trạng thái:</strong> <span style="color:${color}">${o.status}</span></p>
                <p><strong>Shipper ID:</strong> ${o.shipperId||'Chưa gán'}</p>
                <p><strong>Sản phẩm:</strong> ${itemNames}</p>
                <p><strong>Tổng tiền:</strong> ${parseInt(o.totalPrice).toLocaleString()}₫</p>
                <div style="margin-top:10px;">${actions}</div>
            </div>`;
    });
};

document.addEventListener('DOMContentLoaded', () => { checkShipperRole(); changeShipperTab('pending'); });
window.addEventListener('orderUpdated', e => {
    const s = e.detail?.newStatus;
    let tab = s==='Đang giao'?'shipping':s==='Đã nhận hàng'?'completed':s==='Đã hủy'?'shipping':'pending';
    changeShipperTab(tab);
});
