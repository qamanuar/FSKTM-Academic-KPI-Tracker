// Toggle between Register and Login forms
function toggleForm(formType) {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const registerTab = document.getElementById('registerTab');
  const loginTab = document.getElementById('loginTab');

  if (formType === 'register') {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
  } else {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    registerTab.classList.remove('active');
    loginTab.classList.add('active');
  }
}

// Register user by sending data to backend API
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const id = document.getElementById('id').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const country = await fetch('https://ipapi.co/json/')
  .then(res => res.json())
  .then(data => data.country_name)
  .catch(() => '-');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, id, email, password, country, timezone }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Registered successfully as ${name}`);
      event.target.reset();
      toggleForm('login'); // Switch to login form after successful registration
    } else {
      alert(`Registration failed: ${data.message}`);
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
    console.error('Register error:', error);
  }
}

// Login user by sending data to backend API
async function handleLogin(event) {
  event.preventDefault();

  const id = document.getElementById('loginId').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // In gscript.js (after successful login)
      localStorage.setItem("userSession", JSON.stringify({
        _id: data.user._id, //<-- add this MongoDB ID for password updates
        id: data.user.id,
        name: data.user.name
      }));

      localStorage.setItem("userId", data.user._id);


      window.location.href = "profile.html"; // redirect to profile
    }
    else if (response.status === 403 && data.message === "Account is deactivated") {
      const recover = confirm("This account is deactivated. Do you want to recover it?");
      if (recover) {
        const recoverRes = await fetch(`/api/auth/recover/${user._id}`, {
          method: "PUT",
        });

        const recoverData = await recoverRes.json();
        if (recoverRes.ok) {
          alert("Account recovered successfully. Please login again.");
          location.reload();
        } else {
          alert(recoverData.message || "Failed to recover account");
        }
      } else {
        alert("Login canceled.");
        location.reload();
      }
     } else {
      alert(`Login failed: ${data.message}`);
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
    console.error('Login error:', error);
  }
}

// Session timeout logic (logs out user after inactivity)
let timeoutDuration = 5 * 60 * 1000; // 5 minutes
let sessionTimer;

function resetSessionTimer() {
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(logoutUser, timeoutDuration);
}

function startSessionTracking() {
  document.addEventListener("mousemove", resetSessionTimer);
  document.addEventListener("keydown", resetSessionTimer);
  resetSessionTimer();
}

function logoutUser() {
  alert("You have been logged out due to inactivity.");
  localStorage.removeItem("userSession");
  window.location.reload();
}

// Start session tracking if user session exists on page load
window.onload = function () {
  const user = localStorage.getItem("userSession");
  if (user) {
    startSessionTracking();
  }
};
