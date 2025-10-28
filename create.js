(async function () {
  const API_BASE = "https://bytebukkit-server.onrender.com";

  // ----------------------- HELPERS -----------------------
  async function getMe() {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/me`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function getAvatarURL(avatarPath) {
    if (!avatarPath) return `${API_BASE}/api/avatar/default.png`;
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${API_BASE}${avatarPath}`;
  }

  function renderAuth(user) {
    const loggedOut = document.getElementById("logged-out");
    const loggedIn = document.getElementById("logged-in");
    const createBtn = document.getElementById("createAddonBtn");

    if (user) {
      if (loggedOut) loggedOut.style.display = "none";
      if (loggedIn) loggedIn.style.display = "inline-flex";
      if (createBtn) createBtn.style.display = "block";

      const avatarSmall = document.getElementById("avatarSmall");
      if (avatarSmall) {
        avatarSmall.src = getAvatarURL(user.avatar);
        avatarSmall.style.cursor = "pointer";
        avatarSmall.onclick = () => (window.location.href = `/users/${user.username}`);
      }

      const displayName = document.getElementById("displayName");
      if (displayName) {
        displayName.textContent = user.displayName || user.username;
        displayName.style.cursor = "pointer";
        displayName.onclick = () => (window.location.href = `/users/${user.username}`);
      }
    } else {
      if (loggedOut) loggedOut.style.display = "inline-flex";
      if (loggedIn) loggedIn.style.display = "none";
      if (createBtn) createBtn.style.display = "none";
    }
  }

  // ----------------------- MAIN -----------------------
  const me = await getMe();
  renderAuth(me);

  if (!me) {
    const overlay = document.getElementById("warn-overlay");
    const box = document.getElementById("warn-box");

    overlay.classList.add("show");
    overlay.style.opacity = "1";
    box.style.transform = "scale(1)";

    document.getElementById("warn-continue").onclick = () => {
      window.location.href = "/browser.html";
    };

    return;
  }

  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("addonFile");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileNameDisplay = document.getElementById("file-name");
  const status = document.getElementById("upload-status");
  const nameInput = document.getElementById("addonName");
  const descInput = document.getElementById("addonDesc");
  const nameCounter = document.getElementById("nameCounter");
  const descCounter = document.getElementById("descCounter");

  function sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.textContent;
  }

  function showStatus(message, type) {
    status.textContent = sanitize(message);
    status.className = type === "ok" ? "status-ok" : "status-error";
  }

  // ---------------- Drag & Drop ----------------
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('hover'));
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('hover'));
  });

  dropArea.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      fileNameDisplay.textContent = `Selected file: ${sanitize(files[0].name)}`;
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Selected file: ${sanitize(fileInput.files[0].name)}`;
    }
  });

  // ---------------- Character counters ----------------
  function updateCounter(input, counter, max) {
    counter.textContent = `${input.value.length} / ${max}`;
    counter.classList.toggle('full', input.value.length >= max);
  }

  nameInput.addEventListener('input', () => updateCounter(nameInput, nameCounter, 30));
  descInput.addEventListener('input', () => updateCounter(descInput, descCounter, 80));
  updateCounter(nameInput, nameCounter, 30);
  updateCounter(descInput, descCounter, 80);

  // ---------------- Upload logic ----------------
  uploadBtn.addEventListener("click", async () => {
    uploadBtn.disabled = true;

    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const file = fileInput.files[0];

    if (!name || !file) {
      showStatus("Project name or file is missing.", "error");
      uploadBtn.disabled = false;
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", desc);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE}/api/addons`, {
        method: "POST",
        body: formData,
        headers
      });

      if (res.ok) {
        const data = await res.json();
        showStatus(`Redirecting...`, "ok");
        setTimeout(() => window.location.href = "/index.html", 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        showStatus(data.error ? sanitize(data.error) : "Upload failed", "error");
        uploadBtn.disabled = false;
      }
    } catch (err) {
      showStatus("Upload failed: " + sanitize(err.message), "error");
      uploadBtn.disabled = false;
    }
  });

})();
