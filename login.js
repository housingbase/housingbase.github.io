const API_BASE = "https://bytebukkit-server.onrender.com";

document.getElementById("loginBtn").addEventListener("click", async () => {
  const usernameOrEmail = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const status = document.getElementById("status");

  if (!usernameOrEmail || !password) return showError("Please fill in all fields.");

  try {
    const hcaptchaToken = document.querySelector('[name="h-captcha-response"]')?.value;
    if (!hcaptchaToken) return showError("Please complete the CAPTCHA.");

    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password, hcaptchaToken })
    });
    const data = await res.json();
    if (!res.ok) return showError(data.error || "Invalid credentials.");

    localStorage.setItem("authToken", data.token);
    status.style.color = "green";
    status.textContent = "Login successful! Redirecting...";
    setTimeout(() => window.location.href = "/index.html", 1000);

  } catch (err) {
    showError("Login failed. " + err.message);
  }

  function showError(msg) {
    status.style.color = "#c62828";
    status.textContent = msg;
  }
});
