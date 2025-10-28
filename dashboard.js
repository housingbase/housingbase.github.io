
// dashboard.js
const API_BASE = "https://bytebukkit-server.onrender.com";

// -------------------- AUTH --------------------
async function getMe() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function renderAuth(user) {
  const loggedOut = document.getElementById("logged-out");
  const loggedIn = document.getElementById("logged-in");
  if (!loggedOut || !loggedIn) return;

  if (user) {
    loggedOut.style.display = "none";
    loggedIn.style.display = "inline-flex";

    const avatarSmall = document.getElementById("avatarSmall");
    if (avatarSmall) {
      avatarSmall.src = user.avatar || "/uploads/avatars/default.png";
      avatarSmall.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }

    const displayName = document.getElementById("displayName");
    if (displayName) {
      displayName.textContent = user.displayName || user.username;
      displayName.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }
  } else {
    loggedOut.style.display = "inline-flex";
    loggedIn.style.display = "none";
  }
}

// -------------------- ANNOUNCEMENT --------------------
async function loadAnnouncement() {
  const box = document.getElementById("announcement");
  if (!box) return;

  const res = await fetch(`${API_BASE}/api/announcement`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
  });
  if (!res.ok) return;

  const data = await res.json();
  if (data?.text) {
    box.style.display = "block";
    box.style.background = data.bg_color || "#fff3cd";
    box.style.color = data.text_color || "#000";
    box.style.padding = "10px";
    box.style.textAlign = "center";
    box.textContent = data.text;
  } else {
    box.style.display = "none";
  }
}

// -------------------- MODALS --------------------
function showModal(message, overlayId, boxId, btnId) {
  const overlay = document.getElementById(overlayId);
  const box = document.getElementById(boxId);
  const msg = document.getElementById(btnId + "-message");
  const btn = document.getElementById(btnId + "-continue");

  if (!overlay || !box || !msg || !btn) return;
  msg.textContent = message;
  overlay.classList.add("show");
  overlay.style.opacity = "1";
  box.style.transform = "scale(1)";

  btn.onclick = () => {
    overlay.style.opacity = "0";
    box.style.transform = "scale(0.5)";
    const handler = (e) => {
      if (e.propertyName === "opacity") {
        overlay.classList.remove("show");
        overlay.style.opacity = "";
        box.style.transform = "";
        overlay.removeEventListener("transitionend", handler);
      }
    };
    overlay.addEventListener("transitionend", handler);
  };
}

function showWarnModal(message) { showModal(message, "warn-overlay", "warn-box", "warn"); }
function showSuccessModal(message) { showModal(message, "success-overlay", "success-box", "success"); }

// -------------------- DASHBOARD CONTENT --------------------
function avatarURL(path) {
  if (!path) return `${API_BASE}/uploads/avatars/default.png`;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\/?/, "")}`;
}

async function loadDashboard() {
  const me = await getMe();
  if (!me) return window.location.href = "/login.html";

  renderAuth(me);
  await loadAnnouncement();

  const list = document.getElementById("addon-list");
  if (!list) return;
  list.innerHTML = "";

  (me.addons || []).forEach(addon => {
    const card = document.createElement("div");
    card.className = "addon-card";

    const title = document.createElement("h4");
    title.textContent = addon.name;
    card.appendChild(title);

    if (addon.description) {
      const desc = document.createElement("p");
      desc.textContent = addon.description;
      card.appendChild(desc);
    }

    const meta = document.createElement("p");
    meta.className = "meta";

    const avatarImg = document.createElement("img");
    avatarImg.src = avatarURL(me.avatar);
    avatarImg.width = 24;
    avatarImg.height = 24;
    avatarImg.alt = "Avatar";
    avatarImg.style.borderRadius = "4px";
    avatarImg.style.marginRight = "6px";

    const userLink = document.createElement("a");
    userLink.href = `/profile.html?user=${me.username}`;
    userLink.textContent = "@" + (me.displayName || me.username);
    userLink.className = "user-link";

    meta.appendChild(avatarImg);
    meta.appendChild(userLink);
    card.appendChild(meta);

    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "8px";

    const downloadBtn = document.createElement("a");
    downloadBtn.href = `${API_BASE}/api/addons/${addon._id}/download`;
    const dlButton = document.createElement("button");
    dlButton.textContent = "Download";
    dlButton.className = "blue-btn";
    downloadBtn.appendChild(dlButton);
    btnContainer.appendChild(downloadBtn);

    const canDelete = true; // always user's own addons
    if (canDelete) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.backgroundColor = "#c62828";
      delBtn.onclick = () => {
        showDeleteModal(addon.name, async () => {
          const r = await fetch(`${API_BASE}/api/addons/${addon._id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
          });
          if (r.status === 204) loadDashboard();
          else showWarnModal("Failed to delete this addon.");
        });
      };
      btnContainer.appendChild(delBtn);
    }

    card.appendChild(btnContainer);

    card.addEventListener("click", e => {
      if (e.target.closest("a") || e.target.tagName === "BUTTON") return;

      const overlay = document.getElementById("modal-overlay");
      const box = document.getElementById("modal-box");
      document.getElementById("modal-title").textContent = addon.name;
      document.getElementById("modal-desc").textContent = addon.description || "No description provided.";
      document.getElementById("modal-download").href = `${API_BASE}/api/addons/${addon._id}/download`;

      overlay.classList.add("show");
      overlay.style.opacity = "1";
      box.style.transform = "scale(1)";
    });

    list.appendChild(card);
  });
}

// -------------------- DELETE MODAL --------------------
function closeDeleteModal() {
  const overlay = document.getElementById("del-confirm-overlay");
  const box = document.getElementById("del-confirm-box");
  overlay.style.opacity = "0";
  box.style.transform = "scale(0.5)";
  overlay.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "opacity") {
      overlay.classList.remove("show");
      overlay.style.opacity = "";
      box.style.transform = "";
      overlay.removeEventListener("transitionend", handler);
    }
  });
}

function showDeleteModal(addonName, onConfirm) {
  document.getElementById("del-confirm-desc").textContent =
    `Are you sure you want to delete '${addonName}'?`;

  const overlay = document.getElementById("del-confirm-overlay");
  const box = document.getElementById("del-confirm-box");
  overlay.classList.add("show");
  overlay.style.opacity = "1";
  box.style.transform = "scale(1)";

  document.getElementById("del-confirm-yes").onclick = () => { closeDeleteModal(); onConfirm(); };
  document.getElementById("del-confirm-no").onclick = closeDeleteModal;
  document.getElementById("del-confirm-close").onclick = closeDeleteModal;
  overlay.onclick = e => { if (e.target.id === "del-confirm-overlay") closeDeleteModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDeleteModal(); });
}

// -------------------- INIT --------------------
(async function init() {
  await loadDashboard();
})();
