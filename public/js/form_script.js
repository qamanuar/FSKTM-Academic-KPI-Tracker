const close = document.getElementById("close");
const modal = document.getElementById("myForm");
const submit = document.getElementById("submit");

document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const studentId = this.dataset.id;
    openEditForm(studentId);
  });
});

async function openEditForm(studentId) {
  try {
    const res = await fetch(`/lecturer-dashboard/student/${studentId}`);
    const html = await res.text();

    const modal = document.getElementById("myForm");
    if (!modal) {
      console.error("Modal with ID #myForm not found in the DOM");
      return;
    }

    const formContainer = modal.querySelector(".FormContainer");
    formContainer.innerHTML = `
            <div class="header">
                <h2 class="EditText">Edit</h2>
                <button class="close-btn" aria-label="Close" id="close">&times;</button>
            </div>
            ${html}
        `;

    const closeBtn = modal.querySelector(".close-btn"); // Select the button *inside* the now updated modal
    if (closeBtn) {
      closeBtn.onclick = () => (modal.style.display = "none");
    }

    modal.style.display = "flex";

    const fileInput = document.getElementById("fileUpload");
    const fileLabel = document.getElementById("custom-file-label");

    // Set label to existing filename if present
    const existingFileName = fileLabel.dataset.filename;
    if (existingFileName) {
      fileLabel.textContent = `📄 ${existingFileName}`;
    }

    fileInput.addEventListener("change", function () {
      const fileName = this.files[0]?.name;
      fileLabel.textContent = fileName
        ? `📄 ${fileName}`
        : "Add Supporting File (PDF/DOC)";
    });

    console.log("Editing student with ID:", studentId);

    const form = document.querySelector("form");
    form.onsubmit = function (e) {
      const confirmed = confirm("Submit the form?");
      if (!confirmed) {
        e.preventDefault();
        return;
      }
      closeEditForm();
      form.submit();
    };
  } catch (error) {
    console.error("Failed to load student form:", error);
  }
}

function closeEditForm() {
  modal.style.display = "none";
}

document.querySelector(".close-btn").addEventListener("click", () => {
  const choice = confirm(
    "Do you want to save your changes before closing?\nPress OK to save, Cancel to discard."
  );

  if (choice) {
    alert("Changes saved!");
    closeEditForm();
  } else {
    const discard = confirm("Are you sure you want to discard your changes?");
    if (discard) {
      alert("Changes discarded!");
      closeEditForm();
    }
  }
});
