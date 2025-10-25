const API_BASE = "https://bytebukkit-server.onrender.com";

document.getElementById("registerBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const username = document.getElementById("username").value.trim();
  const displayName = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation
  if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
    status.textContent = "Usernames only support A-Z, 0-9 and _.";
    status.className = "status-msg status-error";
    return;
  }
  if (!displayName || displayName.length > 30) {
    status.textContent = "Display Name must be 1-30 characters.";
    status.className = "status-msg status-error";
    return;
  }
  if (!email || !email.includes("@")) {
    status.textContent = "Enter a valid email address.";
    status.className = "status-msg status-error";
    return;
  }
  if (!password || password.length < 6) {
    status.textContent = "Password must be at least 6 characters.";
    status.className = "status-msg status-error";
    return;
  }

  try {
    const hcaptchaToken = document.querySelector('[name="h-captcha-response"]')?.value;
    if (!hcaptchaToken) {
      status.textContent = "Please complete the verification.";
      status.className = "status-msg status-error";
      return;
    }

    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, email, password, hcaptchaToken })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Store token for auth
      localStorage.setItem("authToken", data.token);
      status.textContent = "Account created! Logging in...";
      status.className = "status-msg status-ok";
      setTimeout(() => window.location.href = "/index.html", 1000);
    } else {
      status.textContent = data.error || "Oops! Looks like something went wrong..";
      status.className = "status-msg status-error";
    }

  } catch (err) {
    status.textContent = "Oops! There's an issue here: " + err.message;
    status.className = "status-msg status-error";
  }
});
