
console.log("read the functions in the sidebar");

// 1. Fake database (hardcoded data)
const fakeNotifications = [
  {
    id: 1,
    title: "Attendance dropped",
    category: "alerts",
    is_read: false,
    timestamp: "2025-04-27T09:00:00"
  },
  {
    id: 2,
    title: "GPA Goal Achieved! 🏆",
    category: "alerts",
    is_read: false,
    timestamp: "2025-04-26T15:30:00"
  },
  {
    id: 3,
    title: "Assignment missing! ⚠️",
    category: "achievements",
    is_read: false,
    timestamp: "2025-04-26T08:00:00"
  },
  {
    id: 4,
    title: "Completed 10 study",
    category: "achievements",
    is_read: false,
    timestamp: "2025-04-25T10:00:00"
  },
  {
    id: 5,
    title: "Completed an assignment",
    category: "achievements",
    is_read: false,
    timestamp: "2025-04-25T10:00:00"
  },{
    id: 1,
    title: "Attendance dropped",
    category: "alerts",
    is_read: false,
    timestamp: "2025-04-27T09:00:00"
  },
  {
    id: 2,
    title: "GPA Goal Achieved! 🏆",
    category: "alerts",
    is_read: false,
    timestamp: "2025-04-26T15:30:00"
  },
  {
    id: 3,
    title: "Assignment missing! ⚠️",
    category: "achievements",
    is_read: false,
    timestamp: "2025-04-26T08:00:00"
  },
  {
    id: 4,
    title: "Completed 10 study",
    category: "achievements",
    is_read: false,
    timestamp: "2025-04-25T10:00:00"
  },
  {
    id: 5,
    title: "Completed an assignment",
    category: "achievements",
    is_read: false,
    timestamp: "2025-04-25T10:00:00"
  }
];

console.log("read the hardcoded information");

// 2. Helper function
function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// 3. DOM references
const container = document.querySelector('.notification-container');
const noNotifications = document.querySelector('.no-notifications');
const tabs = document.querySelectorAll('.tab-btn');
const line = document.querySelector('.line');

// 4. Render notifications
function renderNotifications(notifications, filterType = 'all') {
  container.innerHTML = '';

  let hasNotifications = false;

  const sortedNotifications = [...notifications].sort((a, b) => {
    // First, prioritize unread (false comes before true)
    if (a.is_read !== b.is_read) {
      return a.is_read - b.is_read;
    }
    // If both have same is_read, sort by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  sortedNotifications.forEach(notification => {
    const matchCategory = (filterType === 'all') || (notification.category === filterType);
  
    if (matchCategory) {
      const div = document.createElement('div');
      div.className = 'notification p-3 mb-2 border rounded';
  
      if (notification.is_read) {
        div.classList.add('read'); // 👉 Add read class if notification is already read
      }
  
      div.setAttribute('data-category', notification.category || '');
      div.style.cursor = 'pointer';
      div.onclick = () => {
        notification.is_read = true; // Mark as read
        renderNotifications(fakeNotifications, filterType); // Re-render with the same filter
        location.href = '#'; // Navigate
      };
  
      div.innerHTML = `
        <div>${notification.title}</div>
        <small class="text-muted">${timeAgo(notification.timestamp)}</small>
      `;
  
      container.appendChild(div);
      hasNotifications = true;
    }
  });
  
  noNotifications.style.display = hasNotifications ? 'none' : 'block';
  
}

console.log("read the render notification");

// 5. Tab click
tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Move the underline
    line.style.width = e.target.offsetWidth + "px";
    line.style.left = e.target.offsetLeft + "px";

    const selectedType = tab.getAttribute('data-type');
    renderNotifications(fakeNotifications, selectedType);
  });
});

console.log("read the tab click");

// 6. Initial load
window.onload = () => {
  renderNotifications(fakeNotifications, 'all');
  
  // Also update underline line manually to match the "All" tab
  const activeTab = document.querySelector('.tab-btn.active');
  line.style.width = activeTab.offsetWidth + "px";
  line.style.left = activeTab.offsetLeft + "px";
};

console.log("read the initial laod");