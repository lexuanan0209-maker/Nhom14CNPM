// Biến toàn cục để lưu trữ danh sách sản phẩm mẫu.
const products = [
    {
        id: 1,
        name: "Điện thoại Samsung Galaxy S23",
        price: "21990000",
        img: "",
        category: "Điện thoại",
        origin: "Hàn Quốc",
        sold: 1532,
        rate: 4.8
    },
    {
        id: 2,
        name: "Điện thoại iPhone 15 Pro Max",
        price: "30990000",
        img: "",
        category: "Điện thoại",
        origin: "Mỹ",
        sold: 2541,
        rate: 4.9
    }
];


// Task: Lấy dữ liệu sản phẩm từ biến products hoặc updatedProducts trong localStorage
function getSourceProducts() {
    const storedProducts = localStorage.getItem('updatedProducts');
    return storedProducts ? JSON.parse(storedProducts) : products;
}


// Task: Hiển thị ảnh, tên, giá, số lượng đã bán, đánh giá (rating)
// Task: Thêm nút “Thêm vào giỏ” cho mỗi sản phẩm
function showProducts(productsArray) {
    const productList = document.getElementById('productList');
    if (!productList) return;


    productList.innerHTML = '';


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


//Tất cả sản phẩm hiển thị ngay khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    const dataToShow = getSourceProducts();
    showProducts(dataToShow);
});


// Hàm trống để tránh lỗi khi click
function addToCart(productId) {
    console.log("Thêm sản phẩm ID:", productId);
}



