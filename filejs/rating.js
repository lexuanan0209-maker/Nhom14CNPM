// rating.js

const ORDER_RATING_KEY = 'orderRatings';

window.getOrderRating = (orderId) => {
    const allRatings = JSON.parse(localStorage.getItem(ORDER_RATING_KEY)) || {};
    return allRatings[orderId] || { shop: null, shipper: null };
};

window.saveOrderRating = (orderId, type, rating, comment) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { alert("Vui lòng đăng nhập để đánh giá!"); return false; }

    const allRatings = JSON.parse(localStorage.getItem(ORDER_RATING_KEY)) || {};
    allRatings[orderId] = allRatings[orderId] || { shop: null, shipper: null };
    allRatings[orderId][type] = {
        userId: currentUser.username,
        rating: parseInt(rating),
        comment: comment.trim(),
        date: new Date().toISOString().slice(0, 10)
    };
    localStorage.setItem(ORDER_RATING_KEY, JSON.stringify(allRatings));
    alert(`Đánh giá ${type==='shop'?'Shop':'Shipper'} cho đơn #${orderId} thành công!`);
    window.location.reload();
    return true;
};

window.hienThiRating = (orderId) => {
    const { shop, shipper } = getOrderRating(orderId);
    const createStars = r => '★'.repeat(r) + '☆'.repeat(5 - r);

    const createForm = (label, id, color, btnText) => `
        <div style="border: 1px dashed ${color}; padding:10px; margin-top:10px; border-radius:5px;">
            <p style="color:${color}; font-weight:bold;">${label}</p>
            <select id="${id}-rating">
                ${[5,4,3,2,1].map(v=>`<option value="${v}">${v} Sao</option>`).join('')}
            </select>
            <textarea id="${id}-comment" placeholder="Nhận xét..." rows="2" style="width:100%;margin-top:10px;"></textarea>
            <button onclick="saveOrderRating(${orderId},'${id}',document.getElementById('${id}-rating').value,document.getElementById('${id}-comment').value)"
                class="status-btn" style="background:${color};">${btnText}</button>
        </div>
    `;

    const createDisplay = (label, ratingObj, color) => `
        <div style="border:1px solid ${color}; padding:10px; margin-top:10px; border-radius:5px; background:${color}22;">
            <p style="color:${color}; font-weight:bold;">${label}</p>
            <p class="product-rating"><span class="stars" style="color:gold; font-size:18px;">${createStars(ratingObj.rating)}</span> (${ratingObj.rating}/5)</p>
            <p><strong>Nhận xét:</strong> ${ratingObj.comment||'Không có nhận xét.'}</p>
        </div>
    `;

    let html = '';
    html += shop ? createDisplay('1. Đã đánh giá SHOP:', shop, '#ff5722') : createForm('1. Đánh giá SHOP:', 'shop', '#ff5722', 'Gửi đánh giá Shop');
    html += shipper ? createDisplay('2. Đã đánh giá Shipper:', shipper, '#007bff') : createForm('2. Đánh giá Shipper:', 'shipper', '#007bff', 'Gửi đánh giá Shipper');
    if (shop && shipper) html = `<p style="color:green;font-weight:bold;text-align:center;">✅ Đã hoàn tất đánh giá cho đơn hàng này!</p>` + html;
    return html;
};
