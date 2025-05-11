function showEdit() {
  const viewName = document.querySelector("#viewProfile p:nth-of-type(1)").textContent;
  const viewEmail = document.querySelector("#viewProfile p:nth-of-type(2)").textContent.split(": ")[1];
  const viewCountry = document.querySelector("#viewProfile p:nth-of-type(3)").textContent.split(": ")[1];
  const viewTimezone = document.querySelector("#viewProfile p:nth-of-type(4)").textContent.split(": ")[1];
  const viewRegistrationNo = document.querySelector("#viewProfile p:nth-of-type(5)").textContent.split(": ")[1];


  // Populate the edit profile input fields
  document.getElementById("editName").value = viewName;
  document.getElementById("editEmail").value = viewEmail;
  document.getElementById("editCountry").value = viewCountry;
  document.getElementById("editTimezone").value = viewTimezone;
  document.getElementById("editRegistrationNo").value = viewRegistrationNo;

  // Show the edit profile section, hide others
  document.getElementById("viewProfile").classList.add("hidden");
  document.getElementById("editProfile").classList.remove("hidden");
  document.getElementById("settingsPanel").classList.add("hidden");
}
  
  function cancelEdit() {
    document.getElementById("editProfile").classList.add("hidden");
    document.getElementById("viewProfile").classList.remove("hidden");
  }
  
  function saveProfile() {
    alert("Profile saved!");
    // Get the new values from the edit profile section
    const newName = document.getElementById("editName").value;
    const newEmail = document.getElementById("editEmail").value;
    const newCountry = document.getElementById("editCountry").value;
    const newTimezone = document.getElementById("editTimezone").value;
    const newRegistrationNo = document.getElementById("editRegistrationNo").value;

  // Update the view profile section with the new values
    document.querySelector("#viewProfile p:nth-of-type(1)").textContent = newName;
    document.querySelector("#viewProfile p:nth-of-type(2)").textContent = `Email: ${newEmail}`;
    document.querySelector("#viewProfile p:nth-of-type(3)").textContent = `Country: ${newCountry}`;
    document.querySelector("#viewProfile p:nth-of-type(4)").textContent = `Time Zone: ${newTimezone}`;
    document.querySelector("#viewProfile p:nth-of-type(5)").textContent = `Registration No: ${newRegistrationNo}`;

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
  
  function changePassword() {
    const current = document.getElementById("currentPass").value;
    const newPass = document.getElementById("newPass").value;
    const confirm = document.getElementById("confirmPass").value;
  
    if (newPass !== confirm) {
      alert("New passwords do not match!");
      return;
    }
  
    alert("Password updated successfully!");
    document.getElementById("currentPass").value = '';
    document.getElementById("newPass").value = '';
    document.getElementById("confirmPass").value = '';

      // Switch back to view mode
    document.getElementById("editProfile").classList.add("hidden");
    document.getElementById("viewProfile").classList.remove("hidden");
  }
  
  function deactivateAccount() {
    if (confirm("Are you sure you want to deactivate your account?")) {
      alert("Account has been deactivated.");

      // Optional: hide all sections or redirect//ni mcm tk function jek
    document.getElementById("editProfile").classList.add("hidden");
    document.getElementById("viewProfile").classList.add("hidden");

        // You can also simulate logout or show a message
    document.body.innerHTML = "<h2>Account deactivated. Goodbye!</h2>";
    //or can back to login page or homepage :))
    }
  }
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
    
