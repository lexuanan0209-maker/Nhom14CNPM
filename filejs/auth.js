// auth.js - XÁC THỰC NGƯỜI DÙNG & QUẢN LÝ FORM

// CẤU HÌNH HẰNG SỐ
const AUTH_KEY = 'isAuthenticated';
const REDIRECT_PAGE = 'index.html';
const LOGIN_PAGE = 'dangnhap.html';

// DANH SÁCH TRANG BẮT BUỘC ĐĂNG NHẬP
const PROTECTED_PAGES = ['GDND.html', 'giohang.html'];

// KHỞI TẠO NGƯỜI DÙNG MẶC ĐỊNH
const defaultAdmin = { username: "admin", password: "123456", role: "admin" };
const defaultShipper = { username: "shipper", password: "123", role: "shipper" };

let users = JSON.parse(localStorage.getItem("users")) || [];
let shouldUpdateStorage = false;

// THÊM ADMIN NẾU CHƯA TỒN TẠI
if (!users.find(u => u.username === defaultAdmin.username)) {
    users.push(defaultAdmin);
    shouldUpdateStorage = true;
}

// THÊM SHIPPER NẾU CHƯA TỒN TẠI
if (!users.find(u => u.username === defaultShipper.username)) {
    users.push(defaultShipper);
    shouldUpdateStorage = true;
}

// CẬP NHẬT LOCALSTORAGE
if (shouldUpdateStorage) {
    localStorage.setItem("users", JSON.stringify(users));
}

// KIỂM TRA XÁC THỰC & PHÂN QUYỀN
function checkAuth(isLoginPage = false) {
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPath = window.location.pathname.split('/').pop();

    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');

    // CHẶN TRUY CẬP TRANG RIÊNG TƯ
    if (PROTECTED_PAGES.includes(currentPath) && !isLoggedIn) {
        alert("Bạn cần đăng nhập để truy cập trang này!");
        window.location.href = LOGIN_PAGE;
        return;
    }

    // ĐANG Ở TRANG ĐĂNG NHẬP
    if (isLoginPage) {
        if (isLoggedIn && currentUser) {
            window.location.href = currentUser.role === 'admin' ? 'admin.html' : REDIRECT_PAGE;
        }
        return;
    }

    // ẨN / HIỆN NÚT THEO TRẠNG THÁI ĐĂNG NHẬP
    if (!isLoggedIn || !currentUser) {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
    } else {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (adminBtn) {
            adminBtn.style.setProperty(
                'display',
                currentUser.role === 'admin' ? 'inline-block' : 'none',
                'important'
            );
        }
    }

    // BẢO VỆ TRANG ADMIN
    if (currentPath === 'admin.html' && (!currentUser || currentUser.role !== 'admin')) {
        alert("Bạn không có quyền truy cập trang Admin!");
        window.location.href = REDIRECT_PAGE;
    }
}
window.checkAuth = checkAuth;

// XỬ LÝ ĐĂNG NHẬP
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
        return;
    }

    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));

    if (user.role === 'admin') window.location.href = 'index.html';
    else if (user.role === 'shipper') window.location.href = 'shipper.html';
    else {
        const redirect = localStorage.getItem('redirectAfterLogin') || REDIRECT_PAGE;
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirect;
    }
}
window.handleLogin = handleLogin;

// XỬ LÝ ĐĂNG KÝ
function handleRegister(username, password, role) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.username === username)) {
        alert("Tên đăng nhập này đã tồn tại!");
        return false;
    }
    users.push({ username, password, role });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
    return true;
}
window.handleRegister = handleRegister;

// XỬ LÝ ĐĂNG XUẤT
function handleLogout() {
    localStorage.setItem(AUTH_KEY, 'false');
    localStorage.removeItem('currentUser');
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = REDIRECT_PAGE;
}
window.handleLogout = handleLogout;

// XỬ LÝ DOM & FORM
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoginPage = currentPage === LOGIN_PAGE;

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const showRegisterUserBtn = document.getElementById("showRegisterUser");
    const showRegisterShipperBtn = document.getElementById("showRegisterShipper");
    const backToLoginBtn = document.getElementById("backToLogin");
    const regRoleInput = document.getElementById("regRole");
    const registerRoleDisplay = document.getElementById("registerRoleDisplay");
    const registerOptionsDiv = document.querySelector(".register-options");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    function showRegisterForm(role) {
        if (loginSection) loginSection.style.display = "none";
        if (registerOptionsDiv) registerOptionsDiv.style.display = "none";
        if (registerSection) registerSection.style.display = "block";
        if (regRoleInput) regRoleInput.value = role;
        if (registerRoleDisplay)
            registerRoleDisplay.textContent = role === 'shipper' ? 'Người vận chuyển' : 'Người dùng';
    }

    if (showRegisterUserBtn)
        showRegisterUserBtn.addEventListener("click", e => {
            e.preventDefault();
            showRegisterForm('user');
        });

    if (showRegisterShipperBtn)
        showRegisterShipperBtn.addEventListener("click", e => {
            e.preventDefault();
            showRegisterForm('shipper');
        });

    if (backToLoginBtn)
        backToLoginBtn.addEventListener("click", e => {
            e.preventDefault();
            if (registerSection) registerSection.style.display = "none";
            if (loginSection) loginSection.style.display = "block";
            if (registerOptionsDiv) registerOptionsDiv.style.display = "block";
            if (registerForm) registerForm.reset();
        });

    if (registerForm) {
        registerForm.addEventListener("submit", e => {
            e.preventDefault();
            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const confirmPassword = document.getElementById("regConfirmPassword").value.trim();
            const role = document.getElementById("regRole").value;

            if (password !== confirmPassword) {
                alert("Mật khẩu và Xác nhận mật khẩu không khớp!");
                return;
            }

            const success = handleRegister(username, password, role);
            if (success) {
                registerForm.reset();
                registerSection.style.display = "none";
                loginSection.style.display = "block";
                registerOptionsDiv.style.display = "block";
            }
        });
    }

    checkAuth(isLoginPage);
});

// HÀM CHUYỂN TRANG
function goLogin() { window.location.href = LOGIN_PAGE; }
function goAdmin() { window.location.href = 'admin.html'; }

// BẮT BUỘC ĐĂNG NHẬP TRƯỚC KHI DÙNG TÍNH NĂNG
function requireLoginFeature(featureName = 'tính năng này') {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert(`Vui lòng đăng nhập để sử dụng ${featureName}!`);
        const currentPage = window.location.pathname.split('/').pop();
        localStorage.setItem('redirectAfterLogin', currentPage);
        window.location.href = LOGIN_PAGE;
        return false;
    }
    return true;
}
window.requireLoginFeature = requireLoginFeature;
