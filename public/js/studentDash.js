// Handles fetching and displaying student dashboard data

document.addEventListener("DOMContentLoaded", async () => {
  // Get user session from localStorage
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  if (!userSession || !userSession._id) {
    alert("User session not found. Please log in again.");
    window.location.href = "/General.html";
    return;
  }
  const studentId = userSession._id;

  // Set username in header
  document.getElementById("username").textContent = userSession.name || "Student";
  // Fetch and display notifications
try {
  const notificationsRes = await fetch(`/api/notifications/${studentId}`);
  const notifications = await notificationsRes.json();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.isAlert && !n.isRead).length;

  // Update the notification card
  document.querySelector('.kpi-card.bg-purple .card-body').innerHTML = `
    <h4>${notifications.length}</h4>
    <small>${unreadCount} unread, ${urgentCount} urgent</small>
  `;
} catch (err) {
  // Optionally handle error
}
  // Fetch and display dashboard summary
  try {
    const summaryRes = await fetch(`/api/student/${studentId}/summary`);
    const summary = await summaryRes.json();

    // Update KPI cards
    document.querySelector('.kpi-card.bg-lightblue h4').textContent = summary.pendingTasks ?? "-";
    document.querySelector('.kpi-card.bg-lightblue small').textContent = `${summary.dueToday ?? 0} due today`;
    document.querySelector('.kpi-card.bg-indigo h4').textContent = summary.upcomingDeadlines?.length ?? "-";
    document.querySelector('.kpi-card.bg-indigo small').textContent = summary.upcomingDeadlines?.join(", ") || "-";
    document.querySelector('.kpi-card.bg-warning h4').textContent = summary.latestGPA ?? "-";
  } catch (err) {
    // Optionally handle error
  }

  // Fetch and display KPIs
  try {
    const kpiRes = await fetch(`/api/student/${studentId}/kpis`);
    const kpis = await kpiRes.json();
    const tbody = document.querySelector(".table tbody");
    tbody.innerHTML = "";

    kpis.forEach(kpi => {
      let statusClass = "warning";
      if (kpi.status === "approved" || kpi.status === "accepted") statusClass = "success";
      else if (kpi.status === "rejected") statusClass = "danger";

      tbody.innerHTML += `
        <tr>
          <td>${kpi.title || "-"}</td>
          <td>${kpi.dueDate ? new Date(kpi.dueDate).toISOString().slice(0,10) : "-"}</td>
          <td><span class="badge bg-${statusClass}">${kpi.status || "Pending"}</span></td>
          <td>
            ${kpi.document ? 
              `<button class="btn btn-sm btn-outline-secondary" disabled>Uploaded</button>` :
              `<button class="btn btn-sm btn-outline-primary upload-btn" data-kpi-id="${kpi._id}" data-bs-toggle="modal" data-bs-target="#submitModal">Upload</button>`
            }
          </td>
        </tr>
      `;
    });

    // Attach click listeners for upload buttons
    document.querySelectorAll('.upload-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        window.selectedKpiId = this.getAttribute('data-kpi-id');
      });
    });
  } catch (err) {
    // Optionally handle error
  }

  // Handle KPI evidence upload
  document.querySelector('#submitModal form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const kpiId = window.selectedKpiId;
    if (!studentId || !kpiId) {
      alert("Missing student or KPI ID.");
      return;
    }

    const fileInput = document.getElementById('fileUpload');
    const remarks = document.getElementById('remarks').value;

    const formData = new FormData();
    formData.append('document', fileInput.files[0]);
    formData.append('remarks', remarks);

    try {
      const res = await fetch(`/api/student/${studentId}/kpis/${kpiId}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert('Evidence uploaded!');
        location.reload();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading evidence');
    }
  });
});