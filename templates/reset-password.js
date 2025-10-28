// reset-password.js
// Helper: lấy query param từ URL
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Thay đổi đây nếu backend chạy ở host/port khác
const API_BASE =
  (window.__API_BASE__ && window.__API_BASE__) || "http://localhost:3000";

// Try to get token from ?token= first, then fall back to extracting
// it from the URL path (for example when server serves this file
// at /auth/resetpassword/<token> and the token is part of the path).
function getToken() {
  // 1) query param
  const q = getQueryParam("token");
  if (q) return q;

  // 2) try to extract from pathname
  // possible pathname examples:
  // - /auth/resetpassword/<token>
  // - /reset-password/<token>
  const path = window.location.pathname || "";
  // regex: capture last path segment after resetpassword or reset-password
  const m = path.match(/(?:resetpassword|reset-password)\/([^\/\?#]+)/i);
  if (m && m[1]) return decodeURIComponent(m[1]);

  // 3) as a last resort, take last segment of the path
  const parts = path.split("/").filter(Boolean);
  if (parts.length) return decodeURIComponent(parts[parts.length - 1]);

  return null;
}

const token = getToken();
const form = document.getElementById("resetForm");
const msg = document.getElementById("msg");

if (!token) {
  msg.innerText =
    "Không tìm thấy token trong URL. Vui lòng sử dụng liên kết từ email.";
  form.style.display = "none";
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  msg.className = "msg";
  msg.innerText = "Đang xử lý...";
  const newpassword = document.getElementById("newpassword").value;
  try {
    const endpoint = `${API_BASE}/auth/resetpassword/${encodeURIComponent(
      token
    )}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newpassword }),
    });
    const j = await res.json();
    if (j && j.success) {
      msg.className = "msg success";
      msg.innerText =
        "Đổi mật khẩu thành công. Bạn có thể đóng cửa sổ này và đăng nhập.";
      form.reset();
      form.style.display = "none";
    } else {
      msg.className = "msg";
      msg.innerText = "Lỗi: " + (j && j.data ? j.data : "Không xác định");
    }
  } catch (err) {
    msg.className = "msg";
    msg.innerText = "Lỗi kết nối: " + err.message;
  }
});
