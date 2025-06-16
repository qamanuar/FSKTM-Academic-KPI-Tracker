console.log("🔔 Notification script loaded");

const container = document.querySelector('.notification-container');
const noNotifications = document.querySelector('.no-notifications');
const tabs = document.querySelectorAll('.tab-btn');
const line = document.querySelector('.line');
const deleteAllBtn = document.querySelector('.btn-danger');

let allNotifications = [];

/* ===== Helper: Format Time ===== */
function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/js/sw.js").then(() => {
    console.log("✅ Service Worker registered");
  });
}


/* ===== Render Notifications List ===== */
function renderNotifications(data, filter = "all") {
  container.innerHTML = "";

  const filtered = data.filter(n => {
    if (filter === "all") return true;
    if (filter === "alerts") return n.isAlert;
    if (filter === "achievements") return n.isAchievement;
    return false;
  });

  if (!filtered.length) {
    noNotifications.style.display = "block";
    return;
  }

  noNotifications.style.display = "none";

  const sorted = filtered.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead - b.isRead;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  sorted.forEach(n => {
    const div = document.createElement("div");
    div.className = "notification group flex justify-between items-center w-full bg-purple-400 p-4 mb-2 rounded-md transition relative";
    if (n.isRead) div.classList.add("read");

    div.innerHTML = `
      <div class="text-md">
        <strong>${n.title}</strong><br/>
        <small class="text-muted">${timeAgo(n.createdAt)}</small>
      </div>
      <div class="absolute right-3 group-hover:block transition hidden">
        <button class="delete-btn bg-purple-300 text-white w-8 h-8 rounded-md text-2xl font-bold">×</button>
      </div>
    `;

    // Delete Button
    const deleteBtn = div.querySelector(".delete-btn");
    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Delete this notification?")) {
        await deleteNotification(n._id);
      }
    };

    // On Click Show Modal + Mark as Read
    div.onclick = async (e) => {
      if (e.target.closest("button")) return;
      if (!n.isRead) await markAsRead(n._id);
      showModal({ title: n.title, message: n.message, createdAt: n.createdAt });
    };

    container.appendChild(div);
  });

  updateUnreadBadge(data);
}

/* ===== Badge Counters ===== */
function updateUnreadBadge(data) {
  const totalUnread = data.filter(n => !n.isRead).length;
  const alertsUnread = data.filter(n => n.isAlert && !n.isRead).length;
  const achievementsUnread = data.filter(n => n.isAchievement && !n.isRead).length;

  const badges = {
    "unread-badge": totalUnread,
    "alerts-badge": alertsUnread,
    "achievements-badge": achievementsUnread
  };

  for (const id in badges) {
    const badge = document.getElementById(id);
    if (badge) {
      if (badges[id] > 0) {
        badge.textContent = badges[id];
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  }
}

/* ===== Modal Functions ===== */
function showModal({ title, message, createdAt }) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("modalTime").textContent = timeAgo(createdAt);

  const modal = document.getElementById("notificationModal");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  modal.addEventListener("click", (e) => {
    if (e.target.id === "notificationModal") closeModal();
  });
}

function closeModal() {
  document.getElementById("notificationModal").classList.add("hidden");
  document.body.style.overflow = "";
}

/* ===== API Requests ===== */
async function fetchNotifications() {
  if (!window.userId) return console.warn("❌ userId not found.");

  try {
    const res = await fetch(`http://localhost:3000/api/notifications/${window.userId}`);
    const data = await res.json();
    if (res.ok) {
      allNotifications = data;
      renderNotifications(allNotifications, getCurrentTab());
    }
  } catch (err) {
    console.error("❌ Fetch failed:", err);
  }
}

async function markAsRead(id) {
  try {
    await fetch(`http://localhost:3000/api/notifications/mark-read/${id}`, {
      method: "PUT"
    });
    allNotifications = allNotifications.map(n => n._id === id ? { ...n, isRead: true } : n);
    renderNotifications(allNotifications, getCurrentTab());
  } catch (err) {
    console.error("❌ Mark as read failed:", err);
  }
}

async function deleteNotification(id) {
  try {
    await fetch(`http://localhost:3000/api/notifications/${id}`, {
      method: "DELETE"
    });
    allNotifications = allNotifications.filter(n => n._id !== id);
    renderNotifications(allNotifications, getCurrentTab());
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
}

async function deleteAllNotifications() {
  if (!confirm("Delete all notifications?")) return;
  try {
    await fetch(`http://localhost:3000/api/notifications/delete-all/${window.userId}`, {
      method: "DELETE"
    });
    allNotifications = [];
    renderNotifications([], getCurrentTab());
  } catch (err) {
    console.error("❌ Delete all failed:", err);
  }
}

/* ===== Tabs ===== */
function getCurrentTab() {
  const active = document.querySelector('.tab-btn.active');
  return active ? active.getAttribute('data-type') : 'all';
}

tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    line.style.width = tab.offsetWidth + "px";
    line.style.left = tab.offsetLeft + "px";

    renderNotifications(allNotifications, getCurrentTab());
  });
});

if (deleteAllBtn) deleteAllBtn.addEventListener("click", deleteAllNotifications);

/* ===== Setup WebSocket ===== */
function initSocket(userId) {
  const socket = io(); // Auto-resolves localhost or deployed origin

  socket.on("connect", () => {
    console.log("✅ Socket connected");
    socket.emit("register", userId);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
  });

  socket.on("notification", (data) => {
    console.log("📥 New real-time notification:", data);

    // Ensure Notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") showBrowserNotification(data);
      });
    } else {
      showBrowserNotification(data);
    }

    allNotifications.unshift(data);
    renderNotifications(allNotifications, getCurrentTab());
  });
}

// 🔔 Show browser push notification
function showBrowserNotification(data) {
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(data);
    } else {
      new Notification(data.title || "🔔 New Notification", {
        body: data.message || "",
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
      });
    }
  } catch (err) {
    console.error("❌ Failed to show browser notification:", err);
  }
}



/* ===== Initialization ===== */
window.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("userSession"));
  if (!session || !session.id) {
    alert("No user session found.");
    window.location.href = "General.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/students/${session.id}`);
    const data = await res.json();

    if (res.ok && data.user) {
      document.getElementById("username").textContent = data.user.name;
      window.userId = data.user._id;
      console.log("✅ Loaded user:", window.userId);

      fetchNotifications();
      initSocket(window.userId);
    }
  } catch (err) {
    console.error("❌ Load user failed:", err);
    alert("Failed to load user info.");
  }
});

// Click "All" tab on load
window.onload = () => {
  const allTab = document.querySelector('.tab-btn[data-type="all"]');
  if (allTab) allTab.click();
};
