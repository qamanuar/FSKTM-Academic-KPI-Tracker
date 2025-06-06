
let kpiOverview = document.querySelector("#kpi-overview");
let dashboardBtn = document.querySelector(".dashboardBtn");
let managementBtn = document.querySelector(".managementBtn");
let verificationBtn = document.querySelector(".verificationBtn");
let pendingVerificationItemsButton = document.querySelector("#pendingVerificationItemsButton");

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

// Pending Verification related functions
pendingVerificationItemsButton.onclick = function () {
  document
    .querySelector("#kpi-verification")
    .scrollIntoView({ behavior: "smooth" });
};

function rowCounter () {
  const rows = document.querySelectorAll('#kpi-verification tbody tr');
  document.getElementById('pendingVerificationItemsButton').textContent = rows.length + ' Pending Verification';
}

rowCounter();

