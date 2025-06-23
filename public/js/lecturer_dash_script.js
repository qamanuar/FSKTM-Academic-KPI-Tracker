// For frontend UI
let kpiOverview = document.querySelector("#kpi-overview");
let dashboardBtn = document.querySelector(".dashboardBtn");
let managementBtn = document.querySelector(".managementBtn");
let verificationBtn = document.querySelector(".verificationBtn");

let pendingVerificationItemsButton = document.querySelector(
  "#pendingVerificationItemsButton"
);

// Pending Verification related functions
pendingVerificationItemsButton.onclick = function () {
  console.log("Pending Verification Click");
  document
    .querySelector("#kpi-verification")
    .scrollIntoView({ behavior: "smooth" });
};

// lecturer's dashboard buttons
dashboardBtn.onclick = function () {
  document
    .querySelector("#kpi-overview")
    .scrollIntoView({ behavior: "smooth" });
};

managementBtn.onclick = function () {
  document
    .querySelector("#kpi-management")
    .scrollIntoView({ behavior: "smooth" });
};

verificationBtn.onclick = function () {
  document
    .querySelector("#kpi-verification")
    .scrollIntoView({ behavior: "smooth" });
};

document.addEventListener("DOMContentLoaded", () => {
  rowCounter();
  showVerificationTable();
  calculateKpiPercentagesAchieved();
});

function calculateKpiPercentagesAchieved() {
  // Select all KPI rows
  const rows = document.querySelectorAll(".KPITable tbody tr");

  // Counters
  let totalGPA = 0, verifiedGPA = 0;
  let totalAttendance = 0, verifiedAttendance = 0;
  let totalEvent = 0, verifiedEvent = 0;

  rows.forEach(row => {
    const kpiType = row.dataset.kpitype;
    const verificationStatus = row.dataset.verificationstatus?.toLowerCase() || "";

    // Count total and verified by type
    if (kpiType.includes("GPA")) {
      totalGPA++;
      if (verificationStatus === "passed") verifiedGPA++;
    } else if (kpiType.includes("Attendance Percentage")) {
      totalAttendance++;
      if (verificationStatus === "passed") verifiedAttendance++;
    } else if (kpiType.includes("Event Engagement")) {
      totalEvent++;
      if (verificationStatus === "passed") verifiedEvent++;
    }
  });

  // Calculate percentages safely
  const gpaPercent = totalGPA ? Math.round((verifiedGPA / totalGPA) * 100) : 0;
  const attendancePercent = totalAttendance ? Math.round((verifiedAttendance / totalAttendance) * 100) : 0;
  const EventPercent = totalEvent ? Math.round((verifiedEvent / totalEvent) * 100) : 0;

  // Update HTML
  document.getElementById("gpaPercent").textContent = `GPA: ${gpaPercent}%`;
  document.getElementById("attendancePercent").textContent = `Attendance: ${attendancePercent}%`;
  document.getElementById("EventPercent").textContent = `Event Engagement: ${EventPercent}%`;
}

// Resetting student KPI function
function deleteStudentInfo(studentId, studentName) {
  if (
    !confirm("Are you sure you want to reset " + studentName + "’s KPI data?")
  )
    return;

  fetch(`/lecturer-dashboard/student/${studentId}?_method=DELETE`, {
    method: "POST", // because method-override requires POST with `_method=DELETE`
  })
    .then((res) => {
      if (res.ok) {
        alert("Student KPI data has been reset.");
        location.reload(); // Refresh the page to reflect the changes
      } else {
        alert("Failed to reset student data.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while resetting the data.");
    });
}

function rowCounter() {
  const rows = document.querySelectorAll("#kpi-verification tbody tr");
  const count = rows.length;
  document.getElementById("pendingVerificationItemsButton").textContent =
    count + " Pending Verification";
  console.log("Row count =", count);
  console.log("Rows:", rows);
  return count;
}

function showVerificationTable() {
  const count = rowCounter(); // updates the button label and returns row count
  const verificationTable = document.querySelector("#verificationTable");

  if (!verificationTable) return; // safety check

  if (count === 0) {
    verificationTable.style.display = "none";

    // Show a message somewhere
    const msgDiv = document.createElement("div");
    msgDiv.className = "text-center text-gray m-2 fs-5";
    msgDiv.id = "no-verification-msg";
    msgDiv.textContent = "No Pending Verification";

    // Insert message after the table container
    verificationTable.parentNode.insertBefore(
      msgDiv,
      verificationTable.nextSibling
    );
  } else {
    verificationTable.style.display = "block";

    // Remove the message if it exists
    const existingMsg = document.getElementById("no-verification-msg");
    if (existingMsg) {
      existingMsg.remove();
    }
  }
}

// ✅ Handle verification form submission
async function submitVerificationForm(studentId) {
  console.log("Submit button click!");

  // Look only inside #verificationTable tbody rows
  const row = document.querySelector(
    `#verificationTable tr[data-id="${studentId}"]`
  );
  if (!row) {
    console.warn(
      `Row not found for student ID: ${studentId} inside verification table`
    );
    return;
  }

  const verificationStatusSelect = row.querySelector("select");
  const commentInput = row.querySelector('input[type="text"]');
  const submitButton = row.querySelector("button.submit");

  if (!verificationStatusSelect) {
    console.error(
      `Select element not found within the row for student ID: ${studentId}.`
    );
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
  }

  const verificationStatus = verificationStatusSelect.value;
  console.log(verificationStatus);
  const comment = commentInput ? commentInput.value : "";

  try {
    const res = await fetch(`/lecturer-dashboard/student/${studentId}/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationStatus, comment }),
    });

    if (res.ok) {
      row.remove();
      const formSubmitToast = new bootstrap.Toast(
        document.getElementById("formSubmitToast")
      );
      formSubmitToast.show();
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      alert("Failed to submit verification");
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Something went wrong while submitting.");
  }
}

// Filtering by status, reset button and search

const assignedBtn = document.querySelector(".assignedBtn");
const notAssignedBtn = document.querySelector(".notAssignedBtn");
const rows = document.querySelectorAll(".KPITable tbody tr");
const resetBtn = document.querySelector(".resetBtn");
const searchInput = document.querySelector(".search"); 

let currentStatusFilter = ""; 

function filterTable() {
    const statusFilter = currentStatusFilter;
    const currentSearchQuery = searchInput.value.toLowerCase(); 
    const dropdownValue = document.getElementById("filterDropdown").value.toLowerCase();

    rows.forEach((row) => {
        const status = (row.dataset.status || "").toLowerCase();
        const name = (row.dataset.name || "").toLowerCase();
        const year = (row.dataset.studentyear || "").toLowerCase();
        const kpiType = (row.dataset.kpitype || "").toLowerCase();
        const session = (row.dataset.session || "").toLowerCase();

        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesDropdown = !dropdownValue || kpiType === dropdownValue || year === dropdownValue || session === dropdownValue;
        const matchesSearch = !currentSearchQuery || name.includes(currentSearchQuery) || year.includes(currentSearchQuery) || kpiType.includes(currentSearchQuery) || session.includes(currentSearchQuery);

        // A row should be displayed if it matches all active filters (status, dropdown, AND search)
        // OR if there's no search query and it matches status and dropdown.
        if (matchesStatus && matchesDropdown && matchesSearch) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Live search
document.querySelector(".search").addEventListener("input", () => {
    filterTable();
});

// Button filtering
assignedBtn.addEventListener("click", () => {
    currentStatusFilter = "assigned";
    filterTable();
});

notAssignedBtn.addEventListener("click", () => {
    currentStatusFilter = "not assigned";
    filterTable();
});

document.getElementById("filterDropdown").addEventListener("change", () => {
    filterTable();
});

resetBtn.addEventListener("click", () => {
    currentStatusFilter = "";
    document.getElementById("filterDropdown").value = "";
    searchInput.value = ""; // Clear the search input as well
    filterTable();
});