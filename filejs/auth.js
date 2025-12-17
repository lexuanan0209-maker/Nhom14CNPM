const AUTH_KEY = 'isAuthenticated';
const REDIRECT_PAGE = 'index.html';
const LOGIN_PAGE = 'dangnhap.html';

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));

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
