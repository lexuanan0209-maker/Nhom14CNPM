const AUTH_KEY = 'isAuthenticated';
const REDIRECT_PAGE = 'index.html'; 
const LOGIN_PAGE = 'dangnhap.html';
// KHỞI TẠO DỮ LIỆU NGƯỜI DÙNG MẶC ĐỊNH
const defaultAdmin = { username: "admin", password: "123456", role: "admin" };
const defaultShipper = { username: "shipper", password: "123", role: "shipper" };

let users = JSON.parse(localStorage.getItem("users")) || [];
let shouldUpdateStorage = false;

// Thêm Admin 
if (!users.find(u => u.username === defaultAdmin.username)) {
    users.push(defaultAdmin);
    shouldUpdateStorage = true;
}

// Thêm Shipper 
if (!users.find(u => u.username === defaultShipper.username)) {
    users.push(defaultShipper);
    shouldUpdateStorage = true;
}

if (shouldUpdateStorage) {
    localStorage.setItem("users", JSON.stringify(users));
}

// CHỨC NĂNG XÁC THỰC
/**
 * Kiểm tra trạng thái đăng nhập VÀ vai trò
 * @param {boolean} isLoginPage - true nếu đang ở trang đăng nhập
 */
function checkAuth(isLoginPage = false) {
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPath = window.location.pathname.split('/').pop(); 

    if (isLoginPage) {
        // Nếu đã login và đang ở login page, chuyển về trang theo vai trò
        if (isLoggedIn && currentUser) {
             if (currentUser.role === 'admin') {
                 window.location.href = 'admin.html';
             } else if (currentUser.role === 'shipper') {
                 window.location.href = 'shipper.html';
             } else {
                 window.location.href = REDIRECT_PAGE; 
             }
        }
        return;
    }

    // --- LOGIC BẢO VỆ CÁC TRANG KHÔNG PHẢI ĐĂNG NHẬP ---
    
    // 1. Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
    if (!isLoggedIn || !currentUser) {
        if (currentPath !== LOGIN_PAGE) { 
            localStorage.setItem('redirectAfterLogin', currentPath);
        }
        window.location.href = LOGIN_PAGE;
        return;
    }

    // 2. Kiểm tra quyền truy cập dựa trên vai trò (Bảo mật)
    if (currentPath === 'admin.html' && currentUser.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang Admin!");
        window.location.href = REDIRECT_PAGE;
        return;
    }
    
    if (currentPath === 'shipper.html' && currentUser.role !== 'shipper') {
        alert("Bạn không có quyền truy cập trang Shipper!");
        window.location.href = REDIRECT_PAGE;
        return;
    }
}


/**
 * Xử lý đăng nhập
 */
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    
    const users = JSON.parse(localStorage.getItem("users")) || []; 

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // LOGIC CHUYỂN HƯỚNG DỰA TRÊN VAI TRÒ
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (user.role === 'shipper') {
            window.location.href = 'shipper.html';
        } else {
            const redirect = localStorage.getItem('redirectAfterLogin') || REDIRECT_PAGE;
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirect;
        }

    } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
}

/**
 * Xử lý đăng ký 
 */
function handleRegister(username, password, role) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.username === username)) {
        alert("Tên đăng nhập này đã tồn tại!");
        return false;
    }
    users.push({ username, password, role: role }); 
    localStorage.setItem("users", JSON.stringify(users));
    alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
    return true;
}

/**
 * Xử lý đăng xuất
 */
function handleLogout() {
    localStorage.setItem(AUTH_KEY, 'false');
    localStorage.removeItem('currentUser');
    alert("Bạn đã đăng xuất thành công!");
    window.location.href = LOGIN_PAGE;
}
// LOGIC XỬ LÝ DOM VÀ CHUYỂN ĐỔI FORM (ĐÃ SỬA LỖI ẨN/HIỆN)
const currentPage = window.location.pathname.split('/').pop();
const isLoginPage = currentPage === LOGIN_PAGE;

document.addEventListener('DOMContentLoaded', () => {
    
    // LẤY CÁC FORM BÊN TRONG
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    // LẤY CÁC SECTION BỌC NGOÀI (QUAN TRỌNG ĐỂ ẨN/HIỆN)
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    
    // LẤY CÁC NÚT VÀ INPUT KHÁC
    const showRegisterUserBtn = document.getElementById("showRegisterUser");
    const showRegisterShipperBtn = document.getElementById("showRegisterShipper");
    const backToLoginBtn = document.getElementById("backToLogin");
    const regRoleInput = document.getElementById("regRole");
    const registerRoleDisplay = document.getElementById("registerRoleDisplay");
    const registerOptionsDiv = document.querySelector(".register-options");
    
    // Xử lý form Login
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    /**
     * Hàm chung để chuyển sang form đăng ký và thiết lập vai trò
     * Thao tác trên Section để đảm bảo toàn bộ form được hiển thị
     */
    function showRegisterForm(role) {
        if (loginSection) loginSection.style.display = "none"; // ẨN SECTION Đăng nhập
        if (registerOptionsDiv) registerOptionsDiv.style.display = "none";
        if (registerSection) registerSection.style.display = "block"; // HIỆN SECTION Đăng ký
        
        if (regRoleInput) regRoleInput.value = role;
        if (registerRoleDisplay) {
            registerRoleDisplay.textContent = role === 'shipper' ? 'Người vận chuyển' : 'Người dùng';
        }
    }

    // Xử lý chuyển đổi khi nhấn các nút đăng ký
    if (showRegisterUserBtn && registerSection && loginSection) {
        showRegisterUserBtn.addEventListener("click", e => {
            e.preventDefault();
            showRegisterForm('user');
        });
    }
    
    if (showRegisterShipperBtn && registerSection && loginSection) {
         showRegisterShipperBtn.addEventListener("click", e => {
             e.preventDefault();
             showRegisterForm('shipper');
         });
    }

    // Xử lý nút Quay lại đăng nhập
    if (backToLoginBtn && registerSection && loginSection) {
        backToLoginBtn.addEventListener("click", e => {
            e.preventDefault();
            if (registerSection) registerSection.style.display = "none"; // ẨN SECTION Đăng ký
            if (loginSection) loginSection.style.display = "block"; // HIỆN SECTION Đăng nhập
            if (registerOptionsDiv) registerOptionsDiv.style.display = "block"; 
            if (registerForm) registerForm.reset();
        });
    }


    // Xử lý form Register Submission 
    if (registerForm) {
        registerForm.addEventListener("submit", e => {
            e.preventDefault();
            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const confirmPassword = document.getElementById("regConfirmPassword").value.trim(); 
            const role = document.getElementById("regRole").value; 
            
            // KIỂM TRA XÁC NHẬN MẬT KHẨU
            if (password !== confirmPassword) {
                alert("Mật khẩu và Xác nhận mật khẩu không khớp!");
                return; 
            }

            const success = handleRegister(username, password, role);

            // Đăng ký xong (thành công), quay lại đăng nhập
            if (success) {
                if (registerForm) registerForm.reset();
                if (registerSection) registerSection.style.display = "none"; // ẨN SECTION
                if (loginSection) loginSection.style.display = "block"; // HIỆN SECTION
                if (registerOptionsDiv) registerOptionsDiv.style.display = "block"; 
            }
        });
    }

    // GỌI HÀM KIỂM TRA XÁC THỰC
    if (isLoginPage) {
        checkAuth(true); 
    } else {
        checkAuth(false);
    }
});