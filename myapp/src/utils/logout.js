export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/signin"; // logout sonrası signin sayfasına atar
  }
  