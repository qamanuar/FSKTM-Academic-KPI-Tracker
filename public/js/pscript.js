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
   // Clear old/stale input values
  document.getElementById("currentPass").value = "";
  document.getElementById("newPass").value = "";
  document.getElementById("confirmPass").value = "";


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
    fetch(`/api/students/${session.id}`)
      .then(res => res.json())
      .then(data => {
        const user = data.user;
        if (!user) return alert("User not found");

        // Populate HTML with user details
        document.querySelector('.profile-pic').src = user.profilePic || 'assets/images/profile-pic.jpg';

        document.querySelector("#viewProfile p:nth-of-type(1)").textContent = `Name: ${user.name}`;
        document.querySelector("#viewProfile p:nth-of-type(2)").textContent = `Email: ${user.email}`;
        document.querySelector("#viewProfile p:nth-of-type(3)").textContent = `Country: ${user.country || "-"}`;
        document.querySelector("#viewProfile p:nth-of-type(4)").textContent = `Time Zone: ${user.timezone || "-"}`;
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
    const response = await fetch(`/api/students/${id}`, {
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
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  const userId = userSession?.id;
  const current = document.getElementById("currentPass").value;
  const newPass = document.getElementById("newPass").value;
  const confirm = document.getElementById("confirmPass").value;

  if (newPass !== confirm) {
    return alert("New passwords do not match!");
  }

  console.log("Changing password for users:", userId);

  try {
    const res = await fetch(`/api/auth/password/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, newPass }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Password updated successfully!");

      const updatedUser = await fetch('/api/students/${userId}')
      .then(res => res.json())
      .then(data => data.user);

      if(updatedUser){
        localStorage.setItem("userSession", JSON.stringify(updatedUser));
      }
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
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session?._id) return alert("No active user found");
    
    fetch(`/api/auth/deactivate/${session._id}`, {
      method: "PUT"
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Account deactivated.");
      localStorage.clear();
      document.body.innerHTML = "<h2>Account deactivated. Goodbye!</h2>";
    })
    .catch(err => {
      console.error(err);
      alert("Failed to deactivate account.");
    });
  }
}

// ======== PROFILE PICTURE CHANGE PREVIEW ========

function changeProfilePic(event) {
  const file = event.target.files[0];
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  const userId = userSession?._id;

  if (file) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64Img = e.target.result;
      document.querySelector('.profile-pic').src = base64Img;

      // Save to DB
      try {
        await fetch(`/api/auth/profile-pic/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePic: base64Img })
        });
      } catch (err) {
        alert("Failed to save profile picture.");
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  }
}
