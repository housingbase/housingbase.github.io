const API_BASE = "https://bytebukkit-server.onrender.com"

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
  const avatar = document.getElementById("avatarSmall");
  const displayName = document.getElementById("displayName");

  if (user) {
    // Show logged-in, hide logged-out
    if (loggedOut) loggedOut.style.display = "none";
    if (loggedIn) loggedIn.style.display = "flex"; // flex aligns nicely in nav

    // Update avatar
    if (avatar) {
      avatar.src = avatarURL(user.avatar);
      avatar.style.cursor = "pointer";
      avatar.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }

    // Update display name
    if (displayName) {
      displayName.textContent = user.displayName || user.username;
      displayName.style.display = "inline"; // show the span
      displayName.style.cursor = "pointer";
      displayName.onclick = () => window.location.href = `/profile.html?user=${user.username}`;
    }
  } else {
    // Show logged-out, hide logged-in
    if (loggedOut) loggedOut.style.display = "flex";
    if (loggedIn) loggedIn.style.display = "none";
    if (displayName) displayName.style.display = "none";
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
      box.style.marginTop = "5rem";
      box.style.textAlign = "center";
      box.style.fontWeight = "bold";


      box.style.backgroundColor = "#ff7300ff";
      box.style.color = "#ffffff";

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
    bg_color: "#ff7300ff",
    text_color: "#ffffff"
  };

  box.style.display = "block";
  box.style.marginTop = "5rem";
  box.style.backgroundColor = fakeData.bg_color;
  box.style.textAlign = "center";
  box.style.fontWeight = "bold";
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


async function loadAddons(useFake = false) {
  const me = await getMe();
  const container = document.getElementById("addon-list");
  if (!container) return;
  container.innerHTML = "";

  let addons = [];

  if (useFake) {
    const FAKE_ADDONS = [
      {
        id: "fake1",
        name: "§4Item§6Blocker §8- §aBlock Items easily",
        description: "§dAllows you to block certain unwanted items in your housing.",
        username: "demoUser",
        displayName: "Demo User",
        avatar: "/uploads/avatars/default.png",
        created_at: new Date().toISOString(),
        version: "1.2.3",
        downloads: 120,
        likes: 25,
        liked_by: [],
        content: "print('Hello, ByteBukkit!')\n# This is fake addon 1 content"
      },
      {
        id: "fake2",
        name: "Example Addon 2",
        description: "This is a preview of addon 2.",
        username: "demoUser",
        displayName: "Demo User",
        avatar: "/uploads/avatars/default.png",
        created_at: new Date().toISOString(),
        version: "0.9.1",
        downloads: 58,
        likes: 12,
        liked_by: [],
        content: "print('Addon 2 content')\n# More fake content here"
      }
    ];
    addons = FAKE_ADDONS;
  } else {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE}/api/addons`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      addons = await res.json();
    }
  }

  addons.forEach(a => {
    const card = document.createElement("div");
    card.className = "addon-card";

    // Top row: title + badges
    const topRow = document.createElement("div");
    topRow.style.display = "flex";
    topRow.style.justifyContent = "space-between";
    topRow.style.alignItems = "center";

    const title = document.createElement("h4");
    title.textContent = a.name;
    topRow.appendChild(title);

    const badges = document.createElement("div");
    badges.style.display = "flex";
    badges.style.gap = "6px";

    // Version badge
    const v = document.createElement("span");
    v.className = "cf-badge";
    v.textContent = a.version || "1.0.0";
    badges.appendChild(v);

    // Downloads badge
    const d = document.createElement("span");
    d.className = "cf-badge dl-badge";
    d.textContent = `⬇ ${a.downloads ?? 0}`;
    badges.appendChild(d);

    // Likes badge
    const l = document.createElement("span");
    l.className = "cf-badge like-badge";
    l.textContent = `❤ ${a.likes ?? 0}`;
    badges.appendChild(l);

    topRow.appendChild(badges);
    card.appendChild(topRow);

    // Description
    if (a.description) {
      const desc = document.createElement("p");
      desc.textContent = a.description;
      card.appendChild(desc);
    }

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "8px";

    // Download button
    const dlBtn = document.createElement("button");
    dlBtn.textContent = "Download";
    dlBtn.onclick = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_BASE}/api/addons/${a.id}/download`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error("Download failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const aLink = document.createElement("a");
        aLink.href = url;
        aLink.download = a.file_name || "addon.htsl";
        document.body.appendChild(aLink);
        aLink.click();
        aLink.remove();
        URL.revokeObjectURL(url);

        // Increment UI downloads
        a.downloads = (a.downloads ?? 0) + 1;
        d.textContent = `⬇ ${a.downloads}`;
      } catch (err) {
        console.error(err);
        alert("Failed to download addon");
      }
    };
    btnContainer.appendChild(dlBtn);

    // Like button
    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";

    function updateLikeBtn() {
      if (me && a.liked_by?.includes(me.username)) {
        likeBtn.textContent = "❤️ Liked";
      } else {
        likeBtn.textContent = "Like";
      }
      l.textContent = `❤ ${a.likes ?? 0}`;
    }
    updateLikeBtn();

    likeBtn.onclick = async () => {
      try {
        if (!me) {
          alert("You must be logged in to like addons.");
          return;
        }
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_BASE}/api/addons/${a.id}/like`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          a.likes = data.likes;
          a.liked_by = a.liked_by || [];
          if (!a.liked_by.includes(me.username)) a.liked_by.push(me.username);
          updateLikeBtn();
        } else {
          alert(data.error || "Failed to like addon");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to like addon.");
      }
    };
    btnContainer.appendChild(likeBtn);

    // Delete button if admin or owner
    if (useFake || (me && (me.username === a.username || me.is_admin))) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "del-btn";
      delBtn.onclick = () => {
        showDeleteModal(a.name, async () => {
          if (!useFake) {
            const token = localStorage.getItem("authToken");
            const delRes = await fetch(`${API_BASE}/api/addons/${a.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
            if (delRes.status === 204) loadAddons(useFake);
          } else {
            card.remove();
            alert(`Fake addon "${a.name}" deleted!`);
          }
        });
      };
      btnContainer.appendChild(delBtn);
    }

    card.appendChild(btnContainer);

    // Author & date
    const meta = document.createElement("p");
    meta.className = "meta";
    const avatarImg = document.createElement("img");
    avatarImg.src = avatarURL(a.avatar);
    avatarImg.width = 24;
    avatarImg.height = 24;
    avatarImg.alt = "Avatar";
    avatarImg.style.borderRadius = "4px";
    avatarImg.style.marginRight = "6px";

    const userLink = document.createElement("a");
    userLink.href = `/profile.html?user=${a.username}`;
    userLink.textContent = "@" + (a.displayName || a.username);

    const dateSpan = document.createElement("span");
    dateSpan.style.marginLeft = "8px";
    dateSpan.textContent = new Date(a.created_at).toLocaleString();

    meta.appendChild(avatarImg);
    meta.appendChild(userLink);
    meta.appendChild(dateSpan);
    card.appendChild(meta);

    container.appendChild(card);
  });
}



// Utility to remove Minecraft-style color codes
function stripColorCodes(text) {
  return text.replace(/§[0-9A-FK-ORa-fk-or]/g, '');
}
document.addEventListener("DOMContentLoaded", async () => {
  // --- Render authentication ---
  const me = await getMe();
  renderAuth(me);

  // --- Search functionality ---
  const searchInput = document.querySelector(".cf-search input");
  if (!searchInput) return;

  // store cached addons to avoid refetching
  let allAddons = [];

  async function initSearch() {
    // Wait until addons have loaded
    await loadAddons(false);
    allAddons = Array.from(document.querySelectorAll("#addon-list .addon-card"));
  }

  // Initialize cache
  await initSearch();

  // Live search
  searchInput.addEventListener("input", e => {
    const keyword = e.target.value.toLowerCase().trim();
    allAddons.forEach(card => {
      const titleEl = card.querySelector("h4");
      const metaUser = card.querySelector(".user-link");

      const titleText = stripColorCodes(titleEl?.textContent || "").toLowerCase();
      const userText = stripColorCodes(metaUser?.textContent || "").toLowerCase();

      // check partial includes
      const matches = keyword === "" ||
        titleText.includes(keyword) ||
        userText.includes(keyword);

      card.style.display = matches ? "" : "none";
    });
  });
});
