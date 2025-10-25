const API_BASE = "https://bytebukkit-server.onrender.com";

document.getElementById("loginBtn").addEventListener("click", async () => {
  const usernameOrEmail = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const status = document.getElementById("status");

  if (!usernameOrEmail || !password) {
    status.style.color = "#c62828";
    status.textContent = "Please fill in all fields.";
    return;
  }

  status.style.color = "#000";
  status.textContent = "Signing in...";

  try {
    const hcaptchaToken = document.querySelector('[name="h-captcha-response"]').value;
    if (!hcaptchaToken) {
      status.style.color = "#c62828";
      status.textContent = "Please complete the CAPTCHA.";
      return;
    }

    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password, hcaptchaToken })
    });

    const data = await res.json();

    if (res.ok) {
      // Save the auth token to localStorage
      localStorage.setItem("authToken", data.token);

      status.style.color = "green";
      status.textContent = "Login successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);
    } else {
      status.style.color = "#c62828";
      status.textContent = data.error || "Invalid credentials.";
    }
  } catch (err) {
    console.error(err);
    status.style.color = "#c62828";
    status.textContent = "Login failed. Try again.";
  }
});
