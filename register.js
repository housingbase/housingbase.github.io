const API_BASE = "https://bytebukkit-server.onrender.com";

document.getElementById("registerBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const username = document.getElementById("username").value.trim();
  const displayName = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation
  if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) return showError("Usernames only support A-Z, 0-9 and _.");
  if (!displayName || displayName.length > 30) return showError("Display Name must be 1-30 characters.");
  if (!email || !email.includes("@")) return showError("Enter a valid email address.");
  if (!password || password.length < 6) return showError("Password must be at least 6 characters.");

  try {
    const hcaptchaToken = document.querySelector('[name="h-captcha-response"]')?.value;
    if (!hcaptchaToken) return showError("Please complete the CAPTCHA.");

    // Register
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, email, password, hcaptchaToken })
    });
    const data = await res.json();
    if (!res.ok) return showError(data.error || "Registration failed.");

    // Auto-login (no CAPTCHA needed)
    const loginRes = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) return showError("Account created, but login failed. Please log in manually.");

    localStorage.setItem("authToken", loginData.token);
    status.style.color = "green";
    status.textContent = "Account created! Logging in...";
    setTimeout(() => window.location.href = "/index.html", 1000);

  } catch (err) {
    showError("Oops! An error occurred: " + err.message);
  }

  function showError(msg) {
    status.style.color = "#c62828";
    status.textContent = msg;
  }
});
