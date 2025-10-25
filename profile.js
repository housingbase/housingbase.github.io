const API_BASE = "https://bytebukkit-server.onrender.com";

async function getMe() {
  try {
    const token = localStorage.getItem("authToken");
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
  const out = document.getElementById("logged-out");
  const inn = document.getElementById("logged-in");
  if (user) {
    out.style.display = "none";
    inn.style.display = "inline-flex";

    const avatarSmall = document.getElementById("avatarSmall");
    if (avatarSmall) avatarSmall.src = user.avatar || "/uploads/avatars/default.png";
    avatarSmall?.addEventListener("click", () => window.location.href = `/profile.html?user=${user.username}`);

    const displayName = document.getElementById("displayName");
    if (displayName) {
      displayName.textContent = user.displayName || user.username;
      displayName.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }
  } else {
    out.style.display = "inline-flex";
    inn.style.display = "none";
  }
}

function showWarnModal(message) {
  const overlay = document.getElementById("warn-overlay");
  const box = document.getElementById("warn-box");
  const msg = document.getElementById("warn-message");
  const btn = document.getElementById("warn-continue");

  msg.textContent = message;
  overlay.classList.add("show");
  overlay.style.opacity = "1";
  box.style.transform = "scale(1)";

  btn.onclick = () => {
    overlay.style.opacity = "0";
    box.style.transform = "scale(0.5)";

    const handler = function (e) {
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


const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    if (!email || !password) return alert("Please enter email and password.");

    try {
const res = await fetch(`${API_BASE}/api/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ usernameOrEmail: email, password })
});

const data = await res.json();
if (res.ok) {
  localStorage.setItem("authToken", data.token);
  renderAuth(data);
  window.location.href = "/index.html";
} else {
  throw new Error(data.error || "Login failed");
}
    } catch (err) {
      alert(err.message);
    }
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Remove token from localStorage
    localStorage.removeItem("authToken");
    // Update UI
    renderAuth(null);
    // Redirect if not on index
    if (window.location.pathname !== "/index.html") {
      window.location.href = "/index.html";
    }
  });
}

async function loadAnnouncement() {
  const box = document.getElementById("announcement");
  const res = await fetch(`${API_BASE}/api/announcement`, { headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
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

function setupAnnouncementAdmin(me) {
  if (!me?.is_admin) return;
  const box = document.getElementById("announcement-admin");
  box.style.display = "block";

  const save = document.getElementById("saveAnn");
  const clear = document.getElementById("clearAnn");
  const status = document.getElementById("annStatus");

  save.onclick = async () => {
    const text = document.getElementById("annText").value.trim();
    const bg = document.getElementById("annBg").value;
    const color = document.getElementById("annColor").value;
    const res = await fetch(`${API_BASE}/api/announcement`, {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("authToken")}`
}
,
      body: JSON.stringify({ text, bg_color: bg, text_color: color })
    });
    status.textContent = res.ok ? "Saved!" : "Error";
    await loadAnnouncement();
  };

  clear.onclick = async () => {
    const res = await fetch(`${API_BASE}/api/announcement`, {
      method: "POST",
     headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("authToken")}`
}

,
      body: JSON.stringify({ text: "" })
    });
    status.textContent = res.ok ? "Cleared!" : "Error";
    await loadAnnouncement();
  };
}

function closeModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalBox = document.getElementById("modal-box");

  modalOverlay.style.opacity = "0";
  modalBox.style.transform = "scale(0.5)";

  const handler = function (e) {
    if (e.propertyName === "opacity") {
      modalOverlay.classList.remove("show");
      modalOverlay.style.opacity = "";
      modalBox.style.transform = "";
      modalOverlay.removeEventListener("transitionend", handler);
    }
  };

  modalOverlay.addEventListener("transitionend", handler);
}
 
function showSuccessModal(message) {
  const overlay = document.getElementById("success-overlay");
  const box = document.getElementById("success-box");
  const msg = document.getElementById("success-message");
  const btn = document.getElementById("success-continue");

  msg.textContent = message;
  overlay.classList.add("show");
  overlay.style.opacity = "1";
  box.style.transform = "scale(1)";

  btn.onclick = () => {
    overlay.style.opacity = "0";
    box.style.transform = "scale(0.5)";

    const handler = function (e) {
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


function closeDeleteModal() {
  const modalOverlay = document.getElementById("del-confirm-overlay");
  const modalBox = document.getElementById("del-confirm-box");

  modalOverlay.style.opacity = "0";
  modalBox.style.transform = "scale(0.5)";

  const handler = function (e) {
    if (e.propertyName === "opacity") {
      modalOverlay.classList.remove("show");
      modalOverlay.style.opacity = "";
      modalBox.style.transform = "";
      modalOverlay.removeEventListener("transitionend", handler);
    }
  };

  modalOverlay.addEventListener("transitionend", handler);
}
function showDeleteModal(addonName, onConfirm) {
  document.getElementById("del-confirm-desc").textContent =
    `Are you sure you want to delete '${addonName}'?`;

  const overlay = document.getElementById("del-confirm-overlay");
  const box = document.getElementById("del-confirm-box");

  overlay.classList.add("show");
  overlay.style.opacity = "1";
  box.style.transform = "scale(1)";

  document.getElementById("del-confirm-yes").onclick = () => {
    closeDeleteModal();
    onConfirm();
  };

  document.getElementById("del-confirm-no").onclick = closeDeleteModal;
  document.getElementById("del-confirm-close").onclick = closeDeleteModal;
  overlay.onclick = e => {
    if (e.target.id === "del-confirm-overlay") {
      closeDeleteModal();
    }
  };

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeDeleteModal();
    }
  });
}


async function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("user");
  if (!username) {
    document.body.textContent = "No user specified.";
    return;
  }

  const res = await fetch(`${API_BASE}/api/users/${username}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
 });
  if (!res.ok) return document.body.textContent = "User not found";

  const data = await res.json();
  const me = await getMe();

  
  function avatarURL(path) {
    if (!path) return `${API_BASE}/uploads/avatars/default.png`;
    if (path.startsWith("http")) return path;
    return `${API_BASE}/${path.replace(/^\/?/, "")}`;
  }

  document.getElementById("avatar").src = avatarURL(data.avatar);
  document.getElementById("username").textContent = data.displayName || data.username;
  document.getElementById("bio").textContent = data.bio || "";
  document.getElementById("avatarEditOverlay").style.display =
  (me && (me.username === data.username || me.is_admin)) ? "flex" : "none";


  renderAuth(me);
  setupAnnouncementAdmin(me);

  // ---------------- OWNER CONTROLS ----------------
  if (me && me.username === data.username) {
    const box = document.getElementById("owner-controls");
    box.style.display = "block";
    const status = document.getElementById("ownerStatus");

    // Avatar upload
    const avatarFile = document.getElementById("avatarFile");
    const uploadAvatarBtn = document.getElementById("uploadAvatar");
    uploadAvatarBtn.onclick = async () => {
      const file = avatarFile.files[0];
      if (!file) return showWarnModal("Please select a valid image file.");
      const form = new FormData();
      form.append("avatar", file);
      const r = await fetch(`${API_BASE}/api/me/avatar`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
,
        body: form
      });
      const out = await r.json();
      if (r.ok) {
  showSuccessModal("Updated your avatar image!");
  window.location.reload();
} else {
  status.textContent = out.error || "Oops! Something went wrong.";
}

      if (r.ok) {
        document.getElementById("avatar").src = avatarURL(out.avatar);
        const headerAvatar = document.getElementById("avatarSmall");
        if (headerAvatar) headerAvatar.src = avatarURL(out.avatar);
      }
    };

    // Display name update
    const saveDisplayBtn = document.getElementById("saveDisplay");
    saveDisplayBtn.onclick = async () => {
      const newName = document.getElementById("displayInput").value.trim();
      if (!newName) return showWarnModal("Display Name cannot be empty.");
      const r = await fetch(`${API_BASE}/api/me/display-name`, {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("authToken")}`
}

,
        body: JSON.stringify({ displayName: newName })
      });
      const out = await r.json();
      if (r.ok) {
  showSuccessModal("Your Display name was updated!");
} else {
  status.textContent = out.error || "Error";
}

      if (r.ok) loadProfile();
    };

    // Bio update
    const saveBioBtn = document.getElementById("saveBio");
    saveBioBtn.onclick = async () => {
      const newBio = document.getElementById("bioInput").value.trim();
      const r = await fetch(`${API_BASE}/api/me/bio`, {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("authToken")}`
}

,
        body: JSON.stringify({ bio: newBio })
      });
      const out = await r.json();
      if (r.ok) {
  showSuccessModal("Your Bio was updated!");
} else {
  status.textContent = out.error || "Error";
}

      if (r.ok) loadProfile();
    };
  }

  // ---------------- ADDONS ----------------
  const list = document.getElementById("addon-list");
  list.innerHTML = "";

  data.addons.forEach(a => {
    a.id = a._id;

    const card = document.createElement("div");
    card.className = "addon-card";

    const title = document.createElement("h4");
    title.textContent = a.name;
    card.appendChild(title);

    if (a.description) {
      const desc = document.createElement("p");
      desc.textContent = a.description;
      card.appendChild(desc);
    }

    const meta = document.createElement("p");
    meta.className = "meta";

const avatarImg = document.createElement("img");
avatarImg.src = avatarURL(data.avatar);
avatarImg.width = 24;
avatarImg.height = 24;
avatarImg.alt = "Avatar";
avatarImg.style.borderRadius = "4px";
avatarImg.style.marginRight = "6px";
avatarImg.className = "avatar-img";

const userLink = document.createElement("a");
userLink.href = `/profile.html?user=${data.username}`;
userLink.textContent = "@" + (data.displayName || data.username);
userLink.className = "user-link";


    meta.appendChild(avatarImg);
    meta.appendChild(userLink);
    card.appendChild(meta);

    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "8px";

    const downloadBtn = document.createElement("a");
    downloadBtn.href = `${API_BASE}/api/addons/${a.id}/download`;
    const dlButton = document.createElement("button");
    dlButton.textContent = "Download";
    dlButton.className = "blue-btn";
    downloadBtn.appendChild(dlButton);
    btnContainer.appendChild(downloadBtn);

    const canDelete = me && (me.username === data.username || me.is_admin);
    if (canDelete) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.backgroundColor = "#c62828";
      delBtn.onclick = () => {
        showDeleteModal(a.name, async () => {
          const r = await fetch(`${API_BASE}/api/addons/${a.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }

          });
          if (r.status === 204) {
            loadProfile();
          } else {
            showWarnModal("Failed to delete this addon.")
          }
        });
      };
      btnContainer.appendChild(delBtn);
    }

    card.appendChild(btnContainer);
    card.addEventListener("click", e => {
      if (e.target.closest("a") || e.target.tagName === "BUTTON") return;

      document.getElementById("modal-title").textContent = a.name;
      document.getElementById("modal-desc").textContent = a.description || "No description provided.";
      document.getElementById("modal-download").href = `${API_BASE}/api/addons/${a.id}/download`;

      const overlay = document.getElementById("modal-overlay");
      const box = document.getElementById("modal-box");

      overlay.classList.add("show");
      overlay.style.opacity = "1";
      box.style.transform = "scale(1)";
    });

    list.appendChild(card);
  });

  const modalClose = document.getElementById("modal-close");
  const modalOverlay = document.getElementById("modal-overlay");

  if (modalClose) modalClose.onclick = closeModal;
  if (modalOverlay) {
    modalOverlay.onclick = e => {
      if (e.target.id === "modal-overlay") closeModal();
    };
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

// ----------------------- INIT -----------------------
(async function init() {
  try {
    await loadAnnouncement();
  } catch (err) {
    console.warn("Announcement load failed (ignored):", err);
  }
  await loadProfile();
})();
