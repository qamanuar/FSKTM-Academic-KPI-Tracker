// ======== PROFILE DISPLAY HANDLING ========

function showEdit() {
  const viewName = document.querySelector("#viewProfile p:nth-of-type(1)").textContent.split(": ")[1];
  const viewEmail = document.querySelector("#viewProfile p:nth-of-type(2)").textContent.split(": ")[1];
  const viewCountry = document.querySelector("#viewProfile p:nth-of-type(3)").textContent.split(": ")[1];
  const viewTimezone = document.querySelector("#viewProfile p:nth-of-type(4)").textContent.split(": ")[1];
  const viewRegistrationNo = document.querySelector("#viewProfile p:nth-of-type(5)").textContent.split(": ")[1];

  document.getElementById("editName").value = viewName;
  document.getElementById("editEmail").value = viewEmail;
  document.getElementById("editCountry").value = viewCountry;
  document.getElementById("editTimezone").value = viewTimezone;
  document.getElementById("editRegistrationNo").value = viewRegistrationNo;

  document.getElementById("viewProfile").classList.add("hidden");
  document.getElementById("editProfile").classList.remove("hidden");
  document.getElementById("settingsPanel").classList.add("hidden");
}

function cancelEdit() {
  document.getElementById("editProfile").classList.add("hidden");
  document.getElementById("viewProfile").classList.remove("hidden");
}

function showSettings() {
  document.getElementById("viewProfile").classList.add("hidden");
  document.getElementById("editProfile").classList.add("hidden");
  document.getElementById("settingsPanel").classList.remove("hidden");
}

function closeSettings() {
  document.getElementById("settingsPanel").classList.add("hidden");
  document.getElementById("viewProfile").classList.remove("hidden");
}

// ======== FETCH AND DISPLAY PROFILE ON PAGE LOAD ========

window.onload = function () {
  const session = JSON.parse(localStorage.getItem("userSession"));
  if (session && session.id) {
    fetch(`http://localhost:3000/api/students/${session.id}`)
      .then(res => res.json())
      .then(data => {
        const user = data.user;
        if (!user) return alert("User not found");

        // Populate HTML with user details
        document.querySelector("#viewProfile p:nth-of-type(1)").textContent = `Name: ${user.name}`;
        document.querySelector("#viewProfile p:nth-of-type(2)").textContent = `Email: ${user.email}`;
        document.querySelector("#viewProfile p:nth-of-type(3)").textContent = `Country: ${user.country}`;
        document.querySelector("#viewProfile p:nth-of-type(4)").textContent = `Time Zone: ${user.timezone}`;
        document.querySelector("#viewProfile p:nth-of-type(5)").textContent = `Registration No: ${user.id}`;
        document.getElementById("username").textContent = user.name;

        // Save again just in case
        localStorage.setItem("userId", user.id);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load profile.");
      });
  } else {
    alert("Not logged in");
    window.location.href = "General.html";
  }
};


// ======== UPDATE PROFILE ========

async function saveProfile() {
  const id = localStorage.getItem("userId");

  const updatedData = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    country: document.getElementById("editCountry").value,
    timezone: document.getElementById("editTimezone").value
  };

  try {
    const response = await fetch(`http://localhost:3000/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const data = await response.json();
    if (response.ok && data.user) {
      alert("Profile updated!");
      document.getElementById("viewProfile").classList.remove("hidden");
      document.getElementById("editProfile").classList.add("hidden");

      document.querySelector("#viewProfile p:nth-of-type(1)").textContent = `Name: ${data.user.name}`;
      document.querySelector("#viewProfile p:nth-of-type(2)").textContent = `Email: ${data.user.email}`;
      document.querySelector("#viewProfile p:nth-of-type(3)").textContent = `Country: ${data.user.country}`;
      document.querySelector("#viewProfile p:nth-of-type(4)").textContent = `Time Zone: ${data.user.timezone}`;
      document.querySelector("#viewProfile p:nth-of-type(5)").textContent = `Registration No: ${data.user.id}`;

      document.getElementById("username").textContent = data.user.name;
    } else {
      alert(data.message || "Failed to update profile.");
    }
  } catch (error) {
    console.error(error);
    alert("Server error.");
  }
}

// ======== CHANGE PASSWORD ========

async function changePassword() {
  const userId = localStorage.getItem("userId");
  const current = document.getElementById("currentPass").value;
  const newPass = document.getElementById("newPass").value;
  const confirm = document.getElementById("confirmPass").value;

  if (newPass !== confirm) {
    return alert("New passwords do not match!");
  }

  try {
    const res = await fetch(`http://localhost:3000/api/auth/password/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, newPass }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Password updated successfully!");
    } else {
      alert(data.message || "Failed to change password");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// ======== DEACTIVATE ACCOUNT UI ========

function deactivateAccount() {
  if (confirm("Are you sure you want to deactivate your account?")) {
    alert("Account has been deactivated.");
    document.getElementById("editProfile").classList.add("hidden");
    document.getElementById("viewProfile").classList.add("hidden");
    document.body.innerHTML = "<h2>Account deactivated. Goodbye!</h2>";
  }
}

// ======== PROFILE PICTURE CHANGE PREVIEW ========

function changeProfilePic(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.querySelector('.profile-pic').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
