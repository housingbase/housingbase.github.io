const API_BASE = "https://bytebukkit-server.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const status = document.getElementById("status");

  registerBtn.addEventListener("click", async () => {
    // Grab input values safely
    const username = document.getElementById("username")?.value?.trim();
    const displayName = document.getElementById("displayNameInput")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    // ----- Validation -----
    if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
      status.textContent = "Usernames only support A-Z, 0-9 and _.";
      status.style.color = "#c62828";
      return;
    }

    if (!displayName || displayName.length > 30) {
      status.textContent = "Display Name must be 1-30 characters.";
      status.style.color = "#c62828";
      return;
    }

    if (!email || !email.includes("@")) {
      status.textContent = "Enter a valid email address.";
      status.style.color = "#c62828";
      return;
    }

    if (!password || password.length < 6) {
      status.textContent = "Password must be at least 6 characters.";
      status.style.color = "#c62828";
      return;
    }

    // ----- hCaptcha -----
    const hcaptchaToken = document.querySelector('[name="h-captcha-response"]')?.value;
    if (!hcaptchaToken) {
      status.textContent = "Please complete the CAPTCHA.";
      status.style.color = "#c62828";
      return;
    }

    status.textContent = "Registering...";
    status.style.color = "#000";

    try {
      // ----- Register user -----
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, email, password, hcaptchaToken })
      });

      const data = await res.json();

      if (!res.ok) {
        status.textContent = data.error || "Something went wrong during registration.";
        status.style.color = "#c62828";
        return;
      }

      // ----- Auto-login -----
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: email, password, hcaptchaToken }) // hCaptcha optional for login
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        status.textContent = loginData.error || "Account created, but login failed. Please log in manually.";
        status.style.color = "#c62828";
        return;
      }

      // ----- Store token and redirect -----
      localStorage.setItem("authToken", loginData.token);
      status.textContent = "Account created! Logging in...";
      status.style.color = "green";

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);

    } catch (err) {
      console.error(err);
      status.textContent = "Oops! An error occurred: " + err.message;
      status.style.color = "#c62828";
    }
  });
});
