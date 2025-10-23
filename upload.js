const API_BASE = "https://bytebukkit-server.onrender.com";

async function getMe() {
  try {
    const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function renderAuth(user) {
  const loggedOut = document.getElementById("logged-out");
  const loggedIn = document.getElementById("logged-in");
  const createBtn = document.getElementById("createAddonBtn");

  if (user) {
    if (loggedOut) loggedOut.style.display = "none";
    if (loggedIn) loggedIn.style.display = "inline-flex";
    if (createBtn) createBtn.style.display = "block";

    const avatar = document.getElementById("avatarSmall");
    if (avatar) {
      avatar.src = avatarURL(user.avatar);
      avatar.style.cursor = "pointer";
      avatar.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }

    const displayName = document.getElementById("displayName");
    if (displayName) {
      displayName.textContent = user.displayName || user.username;
      displayName.style.cursor = "pointer";
      displayName.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }
  } else {
    if (loggedOut) loggedOut.style.display = "inline-flex";
    if (loggedIn) loggedIn.style.display = "none";
    if (createBtn) createBtn.style.display = "none";
  }
}

function avatarURL(path) {
  if (!path) return `${API_BASE}/uploads/avatars/default.png`;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\/?/, "")}`;
}

(async function() {
  const me = await getMe();
  renderAuth(me);

  if (!me) {
    alert("You must be logged in to create an addon!");
    window.location.href = "/login.html";
    return;
  }

  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("addonFile");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileNameDisplay = document.getElementById("file-name");
  const status = document.getElementById("upload-status");
  const nameInput = document.getElementById("addonName");
  const descInput = document.getElementById("addonDesc");

  dropArea.addEventListener("click", () => fileInput.click());

  ["dragenter","dragover","dragleave","drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
  });

  ["dragenter","dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('hover'));
  });
  ["dragleave","drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('hover'));
  });

  dropArea.addEventListener("drop", e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      fileNameDisplay.textContent = `Selected file: ${files[0].name}`;
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Selected file: ${fileInput.files[0].name}`;
    }
  });

  function updateCounter(input, max) {
    const counter = input.nextElementSibling;
    counter.textContent = `${input.value.length} / ${max}`;
    counter.classList.toggle('full', input.value.length >= max);
  }

  nameInput.addEventListener("input", () => updateCounter(nameInput, 30));
  descInput.addEventListener("input", () => updateCounter(descInput, 80));
  updateCounter(nameInput, 30);
  updateCounter(descInput, 80);

  uploadBtn.addEventListener("click", async () => {
    const currentUser = await getMe();
    if (!currentUser) {
      alert("Session expired. Please log in again.");
      window.location.href = "/login.html";
      return;
    }

    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const file = fileInput.files[0];

    if (!name || !file) {
      status.textContent = "Addon name and .htsl file are required.";
      status.className = "status-error";
      return;
    }
    if (!file.name.toLowerCase().endsWith(".htsl")) {
      status.textContent = "File must be a .htsl addon file.";
      status.className = "status-error";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      status.textContent = "File size cannot exceed 5MB.";
      status.className = "status-error";
      return;
    }
    if (name.length > 30) {
      status.textContent = "Addon name cannot exceed 30 characters.";
      status.className = "status-error";
      return;
    }
    if (desc.length > 80) {
      status.textContent = "Description cannot exceed 80 characters.";
      status.className = "status-error";
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", desc);
    formData.append("file", file);

    uploadBtn.disabled = true;
    status.textContent = "Uploading...";
    status.className = "";

    try {
      const res = await fetch(`${API_BASE}/api/addons`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        status.textContent = `Addon "${data.name}" uploaded successfully! Redirecting...`;
        status.className = "status-ok";
        setTimeout(() => window.location.href = "/index.html", 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        status.textContent = data.error || "Upload failed.";
        status.className = "status-error";
        uploadBtn.disabled = false;
      }
    } catch (err) {
      status.textContent = "Upload failed: " + err.message;
      status.className = "status-error";
      uploadBtn.disabled = false;
    }
  });
})();
