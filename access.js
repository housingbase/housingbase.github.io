(async function () {
    const API_BASE = "https://bytebukkit-server.onrender.com";

    
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

    function renderAuth(user) {
        const loggedOut = document.getElementById("logged-out");
        const loggedIn = document.getElementById("logged-in");

        if (user) {
            if (loggedOut) loggedOut.style.display = "none";
            if (loggedIn) loggedIn.style.display = "inline-flex";
        } else {
            if (loggedOut) loggedOut.style.display = "inline-flex";
            if (loggedIn) loggedIn.style.display = "none";
        }
    }

    
    const me = await getMe();
    renderAuth(me);

    
    if (!me) {
        const overlay = document.getElementById("warn-overlay");
        const box = document.getElementById("warn-box");
        const continueBtn = document.getElementById("warn-continue");

        if (overlay && box) {
            overlay.classList.add("show");

            
            requestAnimationFrame(() => {
                overlay.style.opacity = "1";
                box.style.transform = "scale(1)";
            });
        }

        if (continueBtn) {
            continueBtn.onclick = () => {
                window.location.href = "/browser.html";
            };
        }

        return; 
    }

    
    console.log("User is authenticated:", me);
})();
