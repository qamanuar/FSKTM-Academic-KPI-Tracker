const modal = document.getElementById("myForm");
const formContainer = modal?.querySelector(".FormContainer");

document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const studentId = btn.dataset.id;
    // When editing, you typically fetch existing data, so no advisorIdToSet/advisorNameToDisplay needed here
    openEditForm(studentId);
  });
});

document.querySelector(".newBtn").addEventListener("click", async () => {
  console.log("New student button clicked.");

  const tableRows = document.querySelectorAll(".KPITable tbody tr");
  const rowCount = tableRows.length;

  if (rowCount >= 5) {
    alert("You can only add up to 5 students.");
    return;
  }

  // --- Retrieve advisor info ---
  const userSessionString = localStorage.getItem("userSession");

  let userSession;
  try {
    userSession = JSON.parse(userSessionString);
  } catch (e) {
    alert("Error loading session. Please log in again.");
    return;
  }

  if (!userSession || !(userSession._id || userSession.id)) {
    alert("User session not found. Please log in first.");
    return;
  }

  const advisorId = userSession._id || userSession.id;
  const advisorName = userSession.name;

  // ✅ Open form
  openEditForm(null, advisorId, advisorName);
});

async function openEditForm(
  studentId = null,
  advisorIdToSet = null,
  advisorNameToDisplay = null
) {
  try {
    if (!modal || !formContainer) {
      console.error("Modal or form container not found");
      return;
    }

    const formUrl = studentId
      ? `/lecturer-dashboard/student/${studentId}`
      : `/lecturer-dashboard/student/uploadNew`;

    const studentsUrl = "/lecturer-dashboard/students";

    const [formRes, studentsRes] = await Promise.all([
      fetch(formUrl),
      fetch(studentsUrl),
    ]);

    if (!formRes.ok)
      throw new Error(`Failed to load form: ${formRes.statusText}`);
    if (!studentsRes.ok)
      throw new Error(
        `Failed to load students list: ${studentsRes.statusText}`
      );

    const html = await formRes.text();
    const students = await studentsRes.json();

    formContainer.innerHTML = `
            <div class="header">
                <h2 class="EditText">${
                  studentId ? "Edit Student" : "New Student"
                }</h2>
                <button class="close-btn" aria-label="Close" id="close">&times;</button>
            </div>
            ${html}
        `;

    modal.style.display = "flex";

    if (advisorIdToSet) {
      const hiddenAdvisorIdInput =
        formContainer.querySelector("#advisorIdHidden");
      if (hiddenAdvisorIdInput) {
        hiddenAdvisorIdInput.value = advisorIdToSet;
        console.log(
          "Hidden advisor ID input set to:",
          hiddenAdvisorIdInput.value
        );
      } else {
        console.error(
          "Hidden advisor ID input with ID 'advisorIdHidden' not found after form load."
        );
      }
    }

    // Set advisor Name for display (visible input: id="advisorNameDisplay")
    if (advisorNameToDisplay) {
      const displayAdvisorSpan = formContainer.querySelector(
        "#advisorNameDisplay"
      );
      if (displayAdvisorSpan) {
        displayAdvisorSpan.textContent = advisorNameToDisplay; // Use textContent for spans/labels
        console.log(
          "Displayed advisor name set to:",
          displayAdvisorSpan.textContent
        );
      } else {
        console.error(
          "Displayed advisor name span with ID 'advisorNameDisplay' not found after form load."
        );
      }
    }

    // Populate dropdown if exists (this logic is fine)
    const dropdown = modal.querySelector("#student");
    if (dropdown) {
      dropdown.innerHTML = '<option value="">-- Select Student --</option>';
      students.forEach((student) => {
        dropdown.innerHTML += `<option value="${student._id}">${student.id} - ${student.name}</option>`;
      });
    }

    // Setup close button behavior
    modal.querySelector(".close-btn")?.addEventListener("click", handleClose);

    // Setup file input label update
    setupFileInputLabel();

    // Setup form submission confirmation
    setupFormSubmission();
  } catch (error) {
    console.error("Failed to load form:", error);
  }
}

function handleClose() {
  const saveChanges = confirm(
    "Do you want to save your changes before closing?"
  );
  if (saveChanges) {
    alert("Changes saved!");
    closeEditForm();
  } else {
    const discardChanges = confirm(
      "Are you sure you want to discard your changes?"
    );
    if (discardChanges) {
      alert("Changes discarded!");
      closeEditForm();
    }
  }
}

/**
 * Set up file input label to show selected file name.
 */
function setupFileInputLabel() {
  const fileInput = modal.querySelector("#fileUpload");
  const fileLabel = modal.querySelector("#custom-file-label");

  if (!fileInput || !fileLabel) return;

  const existingFileName = fileLabel.dataset.filename;
  if (existingFileName) {
    fileLabel.textContent = `📄 ${existingFileName}`;
  }

  fileInput.addEventListener("change", () => {
    const fileName = fileInput.files[0]?.name;
    fileLabel.textContent = fileName
      ? `📄 ${fileName}`
      : "Add Supporting File (PDF/DOC)";
  });
}

/**
 * Setup form submission confirmation and modal close.
 */
function setupFormSubmission() {
  const form = modal.querySelector("form");
  if (!form) {
    console.error("Form not found inside modal");
    return;
  }

  form.onsubmit = function (e) {
    const confirmed = confirm("Submit the form?");
    if (!confirmed) {
      e.preventDefault();
      return;
    }
    closeEditForm();
  };
}

/**
 * Close the modal form.
 */
function closeEditForm() {
  if (modal) modal.style.display = "none";
}
