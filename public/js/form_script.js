const close = document.getElementById("close");
const modal = document.getElementById("myForm");
const submit = document.getElementById("submit");

document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const studentId = this.dataset.id;
    openEditForm(studentId);
  });
});

document.querySelector(".newBtn").addEventListener("click", function () {
  console.log("new student click")
  openEditForm();
});

async function openEditForm(studentId = null) {
  try {
    const url = studentId ? `/lecturer-dashboard/student/${studentId}` : `/lecturer-dashboard/student/new`;
    const res = await fetch(url);
    const html = await res.text();

    const modal = document.getElementById("myForm");
    if (!modal) return console.error("Modal #myForm not found");

    const formContainer = modal.querySelector(".FormContainer");
    formContainer.innerHTML = `
      <div class="header">
        <h2 class="EditText">${studentId ? "Edit Student" : "New Student"}</h2>
        <button class="close-btn" aria-label="Close" id="close">&times;</button>
      </div>
      ${html}
    `;

    modal.style.display = "flex";

    const closeBtn = modal.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.onclick = () => (modal.style.display = "none");
    }

    const fileInput = modal.querySelector("#fileUpload");
    const fileLabel = modal.querySelector("#custom-file-label");

    const existingFileName = fileLabel?.dataset.filename;
    if (existingFileName) {
      fileLabel.textContent = `📄 ${existingFileName}`;
    }

    fileInput?.addEventListener("change", function () {
      const fileName = this.files[0]?.name;
      fileLabel.textContent = fileName
        ? `📄 ${fileName}`
        : "Add Supporting File (PDF/DOC)";
    });

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
      form.submit();
    };
  } catch (error) {
    console.error("Failed to load form:", error);
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
