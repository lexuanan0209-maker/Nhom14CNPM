/*KHAI BÁO BIẾN DOM*/
const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");

const registerSection = document.getElementById("registerSection");
const registerOptionsDiv = document.querySelector(".register-options");

const showRegisterUserBtn = document.getElementById("showRegisterUser");
const showRegisterShipperBtn = document.getElementById("showRegisterShipper");

const regRoleInput = document.getElementById("regRole");
const registerRoleDisplay = document.getElementById("registerRoleDisplay");


/* HẰNG SỐ XÁC THỰC*/
const AUTH_KEY = 'isAuthenticated';
const REDIRECT_PAGE = 'index.html';
const LOGIN_PAGE = 'dangnhap.html';


/*HIỂN THỊ FORM ĐĂNG KÝ*/
function showRegisterForm(role) {
    // Ẩn đăng nhập + lựa chọn đăng ký
    loginSection.style.display = "none";
    registerOptionsDiv.style.display = "none";

    // Hiện form đăng ký
    registerSection.style.display = "block";

    // Gán vai trò
    regRoleInput.value = role;
    registerRoleDisplay.textContent =
        role === 'shipper' ? 'Người vận chuyển' : 'Người dùng';
}

// Bắt sự kiện chọn loại tài khoản
showRegisterUserBtn.addEventListener("click", () => {
    showRegisterForm('user');
});

showRegisterShipperBtn.addEventListener("click", () => {
    showRegisterForm('shipper');
});


/*XỬ LÝ ĐĂNG NHẬP*/
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (user) {
        // Lưu trạng thái đăng nhập
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Điều hướng theo role
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (user.role === 'shipper') {
            window.location.href = 'shipper.html';
        } else {
            const redirect =
                localStorage.getItem('redirectAfterLogin') || REDIRECT_PAGE;

            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirect;
        }
    } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
}


/*GÁN SỰ KIỆN FORM*/
loginForm.addEventListener("submit", handleLogin);
