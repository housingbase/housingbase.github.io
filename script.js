const API_BASE = "https://bytebukkit-server.onrender.com";

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

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value.trim();

      if (!email || !password) {
        alert("Please enter your email and password.");
        return;
      }

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
        }

      } catch (err) {
        alert(err.message);
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const token = localStorage.getItem("authToken");
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem("authToken");

      renderAuth(null);
      if (window.location.pathname !== "/index.html") window.location.href = "/index.html";
    });
  }
});
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
      box.style.backgroundColor = "#181818ff",
        box.style.color = "#ffffff",
        box.textContent = data.text;
    } else {
      box.style.display = "none";
    }
  } catch (err) {
    console.error("Failed to load announcement:", err);
  }
}

function renderFakeAnnouncement() {
  const box = document.getElementById("announcement");
  if (!box) return;


  const fakeData = {
    text: "Expecting downtime between 1:00PM EST and 9:00PM EST on October 26th for server maintenance.",
    bg_color: "#181818ff",
    text_color: "#ffffff"
  };

  box.style.display = "block";
  box.style.backgroundColor = fakeData.bg_color;
  box.style.color = fakeData.text_color;
  box.textContent = fakeData.text;
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
    if (e.target.id === "del-confirm-overlay") closeDeleteModal();
  };

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDeleteModal();
  });
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


async function loadAddons() {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/api/addons`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return;
  const addons = await res.json();
  const me = await getMe();
  const container = document.getElementById("addon-list");
  if (!container) return;
  container.innerHTML = "";

  addons.forEach(a => {
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
    avatarImg.src = avatarURL(a.avatar);
    avatarImg.width = 24;
    avatarImg.height = 24;
    avatarImg.alt = "Avatar";
    avatarImg.style.borderRadius = "4px";
    avatarImg.style.marginRight = "6px";
    avatarImg.className = "avatar-img";

    const userLink = document.createElement("a");
    userLink.href = `/profile.html?user=${a.username}`;
    userLink.textContent = "@" + (a.displayName || a.username);
    userLink.className = "user-link";

    const dateSpan = document.createElement("span");
    dateSpan.style.marginLeft = "8px";
    dateSpan.textContent = new Date(a.created_at).toLocaleString();

    meta.appendChild(avatarImg);
    meta.appendChild(userLink);
    meta.appendChild(dateSpan);
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
    if (me && (me.username === a.username || me.is_admin)) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.backgroundColor = "#c62828";
      delBtn.onclick = () => {
        showDeleteModal(a.name, async () => {
          const token = localStorage.getItem("authToken");
          const delRes = await fetch(`${API_BASE}/api/addons/${a.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (delRes.status === 204) loadAddons();
        });
      };

      btnContainer.appendChild(delBtn);
    }


    card.appendChild(btnContainer);
    card.addEventListener("click", async e => {
      if (e.target.closest("a") || e.target.tagName === "BUTTON") return;

      document.getElementById("modal-title").textContent = a.name;
      document.getElementById("modal-desc").textContent = a.description || "No description provided.";
      document.getElementById("modal-download").href = `${API_BASE}/api/addons/${a.id}/download`;

      const overlay = document.getElementById("modal-overlay");
      const box = document.getElementById("modal-box");
      const modalBody = document.querySelector(".modal-body");

      overlay.classList.add("show");
      overlay.style.opacity = "1";
      box.style.transform = "scale(1)";


      const oldPre = modalBody.querySelector("pre");
      if (oldPre) oldPre.remove();


      try {
        const res = await fetch(`${API_BASE}/api/addons/${a.id}/contents`);
        if (!res.ok) throw new Error("Failed to load addon contents.");
        const data = await res.json();


        const pre = document.createElement("pre");
        pre.textContent = data.content || "(empty file)";


        modalBody.appendChild(pre);
      } catch (err) {
        console.error("Error fetching file contents:", err);
      }
    });


    container.appendChild(card);
  });
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

  if (modalClose) {
    modalClose.onclick = closeModal;
  }
  if (modalOverlay) {
    modalOverlay.onclick = e => {
      if (e.target.id === "modal-overlay") {
        closeModal();
      }
    };
  }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("upload-form");
  if (!uploadForm) return;

  uploadForm.addEventListener("submit", async e => {
    e.preventDefault();
    const status = document.getElementById("upload-status");
    const name = document.getElementById("addonName")?.value.trim();
    const desc = document.getElementById("addonDesc")?.value.trim();
    const fileInput = document.getElementById("addonFile");
    const uploadBtn = document.getElementById("uploadBtn");

    if (!name || !fileInput?.files[0]) {
      if (status) { status.textContent = "Name and .htsl file are required."; status.className = "status-error"; }
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", desc || "");
    formData.append("file", file);

    if (uploadBtn) uploadBtn.disabled = true;
    if (status) { status.textContent = "Uploading..."; status.className = ""; }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/addons`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (status) { status.textContent = `Uploaded "${data.name}"! Redirecting...`; status.className = "status-ok"; }
        setTimeout(() => window.location.href = "/index.html", 1500);
      } else {
        if (status) { status.textContent = data.error || "Upload failed"; status.className = "status-error"; }
        if (uploadBtn) uploadBtn.disabled = false;
      }
    } catch (err) {
      if (status) { status.textContent = "Upload failed: " + err.message; status.className = "status-error"; }
      if (uploadBtn) uploadBtn.disabled = false;
    }
  });
});



const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  hamburger.classList.toggle("active");
});

document.addEventListener("DOMContentLoaded", async () => {
  // await loadAnnouncement();

  const me = await getMe();
  renderAuth(me);
  if (document.getElementById("addon-list")) loadAddons();

});
