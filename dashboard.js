// -------------------- AUTH / USER --------------------
async function getMe() {
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function avatarURL(path) {
  if (!path || path.length === 0) return `${API_BASE}/uploads/avatars/default.png`;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\/?/, "")}`;
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

// -------------------- ANNOUNCEMENTS --------------------
async function loadAnnouncement() {
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE}/api/announcement`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const box = document.getElementById("announcement");
    if (!box) return;

    if (data?.text) {
      box.style.display = "block";
      box.style.backgroundColor = data.bg_color || "#181818ff";
      box.style.color = data.text_color || "#ffffff";
      box.textContent = data.text;
    } else {
      box.style.display = "none";
    }
  } catch (err) {
    console.error("Failed to load announcement:", err);
  }
}

// -------------------- DELETE MODAL --------------------
function showDeleteModal(addonName, onConfirm) {
  const descEl = document.getElementById("del-confirm-desc");
  const overlay = document.getElementById("del-confirm-overlay");
  const box = document.getElementById("del-confirm-box");

  if (!descEl || !overlay || !box) return;

  descEl.textContent = `Are you sure you want to delete '${addonName}'?`;
  overlay.classList.add("show");
  overlay.style.opacity = "1";
  box.style.transform = "scale(1)";

  const yesBtn = document.getElementById("del-confirm-yes");
  const noBtn = document.getElementById("del-confirm-no");
  const closeBtn = document.getElementById("del-confirm-close");

  yesBtn.onclick = () => { closeDeleteModal(); onConfirm(); };
  noBtn.onclick = closeDeleteModal;
  closeBtn.onclick = closeDeleteModal;

  overlay.onclick = e => { if (e.target.id === "del-confirm-overlay") closeDeleteModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDeleteModal(); });
}

function closeDeleteModal() {
  const overlay = document.getElementById("del-confirm-overlay");
  const box = document.getElementById("del-confirm-box");
  if (!overlay || !box) return;

  overlay.style.opacity = "0";
  box.style.transform = "scale(0.5)";

  const handler = function(e) {
    if (e.propertyName === "opacity") {
      overlay.classList.remove("show");
      overlay.style.opacity = "";
      box.style.transform = "";
      overlay.removeEventListener("transitionend", handler);
    }
  };

  overlay.addEventListener("transitionend", handler);
}

// -------------------- DASHBOARD / ADDONS --------------------
async function loadDashboard() {
  const me = await getMe();
  if (!me) return window.location.href = "/login.html";

  renderAuth(me);
  await loadAnnouncement();

  const container = document.getElementById("projects-dashboard");
  if (!container) return;
  container.innerHTML = "";

  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/api/addons`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return;

  const addons = await res.json();
  const myAddons = addons.filter(a => a.username === me.username);

  myAddons.forEach(a => {
    const card = document.createElement("div");
    card.className = "addon-card";

    // Title
    const title = document.createElement("h4");
    title.textContent = a.name;
    card.appendChild(title);

    // Description
    if (a.description) {
      const desc = document.createElement("p");
      desc.textContent = a.description;
      card.appendChild(desc);
    }

    // Meta
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

    const dateSpan = document.createElement("span");
    dateSpan.style.marginLeft = "8px";
    dateSpan.textContent = new Date(a.created_at).toLocaleString();

    meta.appendChild(avatarImg);
    meta.appendChild(userLink);
    meta.appendChild(dateSpan);
    card.appendChild(meta);

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "8px";

    // Download
    const manageBtn = document.createElement("a");
    manageBtn.href = `#edit=${a.name}`;
    const dlButton = document.createElement("button");
    dlButton.textContent = "Edit";
    dlButton.className = "edit-btn";
    manageBtn.appendChild(dlButton);
    btnContainer.appendChild(manageBtn);

    // Delete
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "del-btn";
    delBtn.onclick = () => showDeleteModal(a.name, async () => {
      const delRes = await fetch(`${API_BASE}/api/addons/${a.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (delRes.status === 204) loadDashboard();
    });
    btnContainer.appendChild(delBtn);

    card.appendChild(btnContainer);

    // Modal
    card.addEventListener("click", async e => {
      if (e.target.closest("a") || e.target.tagName === "BUTTON") return;

      const overlay = document.getElementById("modal-overlay");
      const box = document.getElementById("modal-box");
      const modalBody = document.querySelector(".modal-body");
      const modalTitle = document.getElementById("modal-title");
      const modalDesc = document.getElementById("modal-desc");
      const modalDownload = document.getElementById("modal-download");

      if (!overlay || !box || !modalBody || !modalTitle || !modalDesc || !modalDownload) return;

      modalTitle.textContent = a.name;
      modalDesc.textContent = a.description || "No description provided.";
      modalDownload.href = `${API_BASE}/api/addons/${a.id}/download`;
      modalDownload.style.display = "inline-block";

      overlay.classList.add("show");
      overlay.style.opacity = "1";
      box.style.transform = "scale(1)";

      const oldPre = modalBody.querySelector("pre");
      if (oldPre) oldPre.remove();

      try {
        const res = await fetch(`${API_BASE}/api/addons/${a.id}/contents`);
        const data = await res.json();
        const pre = document.createElement("pre");
        pre.textContent = data.content || "(empty file)";
        modalBody.appendChild(pre);
      } catch (err) {
        console.error("Failed to load addon content:", err);
      }
    });

    container.appendChild(card);
  });

  // Modal close logic
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalBox = document.getElementById("modal-box");

  function closeModal() {
    if (!modalOverlay || !modalBox) return;
    modalOverlay.style.opacity = "0";
    modalBox.style.transform = "scale(0.5)";

    const handler = function(e) {
      if (e.propertyName === "opacity") {
        modalOverlay.classList.remove("show");
        modalOverlay.style.opacity = "";
        modalBox.style.transform = "";
        modalOverlay.removeEventListener("transitionend", handler);
      }
    };

    modalOverlay.addEventListener("transitionend", handler);
  }

  if (modalClose) modalClose.onclick = closeModal;
  if (modalOverlay) modalOverlay.onclick = e => { if (e.target.id === "modal-overlay") closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}

function renderMockAddon() {
  const container = document.getElementById("projects-dashboard");
  if (!container) return;

  // Single fixed mock addon
  const mockAddon = {
    id: "mock-1",
    name: "Example Addon",
    description: "This is a demo addon.", // one-line description
    username: "admin",
    displayName: "Admin",
    avatar: "/uploads/avatars/default.png",
    created_at: new Date().toISOString(),
    content: "print('Hello from ByteBukkit!')\n# Example script\nprint('Addon loaded')" // multi-line
  };

  // Build card
  const card = document.createElement("div");
  card.className = "addon-card";

  const title = document.createElement("h4");
  title.textContent = mockAddon.name;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = mockAddon.description;
  card.appendChild(desc);

  const meta = document.createElement("p");
  meta.className = "meta";

  const avatarImg = document.createElement("img");
  avatarImg.src = avatarURL(mockAddon.avatar);
  avatarImg.width = 24;
  avatarImg.height = 24;
  avatarImg.alt = "Avatar";
  avatarImg.style.borderRadius = "4px";
  avatarImg.style.marginRight = "6px";

  const userLink = document.createElement("a");
  userLink.href = `/profile.html?user=${mockAddon.username}`;
  userLink.textContent = "@" + mockAddon.displayName;
  userLink.className = "user-link";

  const dateSpan = document.createElement("span");
  dateSpan.style.marginLeft = "8px";
  dateSpan.textContent = new Date(mockAddon.created_at).toLocaleString();

  meta.appendChild(avatarImg);
  meta.appendChild(userLink);
  meta.appendChild(dateSpan);
  card.appendChild(meta);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "8px";

  const manageBtn = document.createElement("a");
 manageBtn.href = `#edit=${mockAddon.name}`;
  const dlButton = document.createElement("button");
  dlButton.textContent = "Edit";
  dlButton.className = "edit-btn";
  manageBtn.appendChild(dlButton);
  btnContainer.appendChild(manageBtn);

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "del-btn";
  delBtn.onclick = () => {
    showDeleteModal(mockAddon.name, () => {
      alert(`Addon "${mockAddon.name}" deleted!`);
      card.remove();
    });
  };
  btnContainer.appendChild(delBtn);

  card.appendChild(btnContainer);

  // Card click opens modal
  card.addEventListener("click", e => {
    if (e.target.closest("a") || e.target.tagName === "BUTTON") return;

    document.getElementById("modal-title").textContent = mockAddon.name;
    document.getElementById("modal-desc").textContent = mockAddon.description;
    const modalDownload = document.getElementById("modal-download");
    modalDownload.href = "#";
    modalDownload.style.display = "inline-block";

    const overlay = document.getElementById("modal-overlay");
    const box = document.getElementById("modal-box");
    const modalBody = document.querySelector(".modal-body");

    overlay.classList.add("show");
    overlay.style.opacity = "1";
    box.style.transform = "scale(1)";

    const oldPre = modalBody.querySelector("pre");
    if (oldPre) oldPre.remove();

    const pre = document.createElement("pre");
    pre.textContent = mockAddon.content;
    modalBody.appendChild(pre);
  });

  container.appendChild(card);

  // Modal close logic
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalBox = document.getElementById("modal-box");

  function closeModal() {
    modalOverlay.style.opacity = "0";
    modalBox.style.transform = "scale(0.5)";
    modalOverlay.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "opacity") {
        modalOverlay.classList.remove("show");
        modalOverlay.style.opacity = "";
        modalBox.style.transform = "";
        modalOverlay.removeEventListener("transitionend", handler);
      }
    });
  }

  if (modalClose) modalClose.onclick = closeModal;
  if (modalOverlay) modalOverlay.onclick = e => {
    if (e.target.id === "modal-overlay") closeModal();
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}
