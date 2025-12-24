// chuyendoi.js - QUẢN LÝ SẢN PHẨM, LỌC, SẮP XẾP, GIỎ HÀNG

// DỮ LIỆU SẢN PHẨM
let products = [];

async function loadProductsFromServer() {
    try {
        const res = await fetch("http://localhost:3000/products");
        products = await res.json();
        currentProducts = [...products];
        applyFiltersAndSorts();
    } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
    }
}

// DANH SÁCH SẢN PHẨM ĐANG HIỂN THỊ
let currentProducts = [...products];

// BỘ LỌC HIỆN TẠI
let currentFilter = {
    category: '🌐 Tất cả',
    priceRange: '',
    sortType: '',
    popular: false,
    newest: false
};

// HÀM LẤY KEY GIỎ HÀNG THEO USER
function getCurrentUserKey(suffix) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? `${suffix}_${currentUser.username}` : null;
}
window.getCurrentUserKey = getCurrentUserKey;

// LẤY DANH SÁCH SẢN PHẨM MỚI NHẤT
function getSourceProducts() {
    return products;
}


// HIỂN THỊ SẢN PHẨM RA GIAO DIỆN
function showProducts(productsArray) {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    if (productsArray.length === 0) {
        productList.innerHTML = '<p style="text-align:center; color:#ff5722;">Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    productsArray.forEach(product => {
        const formattedPrice = parseInt(product.price).toLocaleString('vi-VN') + '₫';
        const stars = '★'.repeat(Math.round(product.rate)) + '☆'.repeat(5 - Math.round(product.rate));

        productList.innerHTML += `
            <div class="product-card">
                <img src="${product.img}" alt="${product.name}" class="product-img">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formattedPrice}</p>
                <div class="product-info">
                    <p class="product-sold">Đã bán: ${product.sold}</p>
                    <p class="product-rating">${stars} (${product.rate})</p>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
            </div>
        `;
    });
}
window.showProducts = showProducts;

// ÁP DỤNG BỘ LỌC VÀ SẮP XẾP
function applyFiltersAndSorts() {
    let filteredProducts = getSourceProducts();

    if (currentFilter.category !== '🌐 Tất cả') {
        filteredProducts = filteredProducts.filter(p => p.category === currentFilter.category);
    }

    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    if (currentFilter.priceRange === 'low') filteredProducts = filteredProducts.filter(p => parseInt(p.price) < 3000000);
    if (currentFilter.priceRange === 'high') filteredProducts = filteredProducts.filter(p => parseInt(p.price) >= 3000000);

    if (currentFilter.popular) filteredProducts.sort((a, b) => b.sold - a.sold);
    else if (currentFilter.newest) filteredProducts.sort((a, b) => b.id - a.id);

    if (currentFilter.sortType === 'asc') filteredProducts.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    else if (currentFilter.sortType === 'desc') filteredProducts.sort((a, b) => parseInt(b.price) - parseInt(a.price));

    currentProducts = filteredProducts;
    showProducts(currentProducts);
}
window.applyFiltersAndSorts = applyFiltersAndSorts;

// TÌM KIẾM SẢN PHẨM
function searchProduct() { applyFiltersAndSorts(); }
window.searchProduct = searchProduct;

// SẮP XẾP THEO GIÁ
function sortProducts() {
    currentFilter.sortType = document.getElementById('sort-price').value;
    currentFilter.popular = false;
    currentFilter.newest = false;
    applyFiltersAndSorts();
}
window.sortProducts = sortProducts;

// LỌC THEO DANH MỤC
function filterCategory(category) {
    currentFilter.category = category;
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
    const activeEl = Array.from(document.querySelectorAll('.sidebar li')).find(el => el.textContent.includes(category));
    if (activeEl) activeEl.classList.add('active');
    applyFiltersAndSorts();
}
window.filterCategory = filterCategory;
window.showAll = () => filterCategory('🌐 Tất cả');

// LỌC NHANH (GIÁ / PHỔ BIẾN / MỚI)
function filterProducts(type = '') {
    const priceRangeValue = document.getElementById('filter-price-range').value;

    if (type === 'popular') { currentFilter.popular = true; currentFilter.newest = false; }
    else if (type === 'newest') { currentFilter.popular = false; currentFilter.newest = true; }
    else { currentFilter.priceRange = priceRangeValue; currentFilter.popular = false; currentFilter.newest = false; }

    applyFiltersAndSorts();
}
window.filterProducts = filterProducts;

// THÊM SẢN PHẨM VÀO GIỎ HÀNG
function addToCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!"); return; }

    const cartKey = getCurrentUserKey('cart');
    const product = getSourceProducts().find(p => p.id == productId);
    if (!product) { alert("Sản phẩm không tồn tại!"); return; }

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
        alert(`Đã cập nhật số lượng ${product.name} (x${existingItem.quantity})!`);
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price.replace(/\D/g, ''), img: product.img, quantity: 1 });
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    if (typeof loadCart === 'function') loadCart();
}
window.addToCart = addToCart;

// CẬP NHẬT SỐ LƯỢNG ĐÃ BÁN
async function updateProductSold(productId, quantity = 1) {
    const product = products.find(p => p.id == productId);
    if (!product) return false;

    const updatedSold = product.sold + quantity;

    await fetch(`http://localhost:3000/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold: updatedSold })
    });

    product.sold = updatedSold;
    applyFiltersAndSorts();
    return true;
}
window.updateProductSold = updateProductSold;


// LOAD SẢN PHẨM KHI MỞ TRANG
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromServer();
});

