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
  
  function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
  
    alert(`Registered successfully as ${username}`);
    event.target.reset();
  }
  
  function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
  
    alert(`Logged in as ${email}`);
    event.target.reset();
  }

  
// ---- SESSION TIMEOUT SETTINGS ----
let timeoutDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let sessionTimer;

function resetSessionTimer() {
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(logoutUser, timeoutDuration);
}

function startSessionTracking() {
  document.addEventListener("mousemove", resetSessionTimer);
  document.addEventListener("keydown", resetSessionTimer);
  resetSessionTimer(); // Start timer immediately
}

function logoutUser() {
  alert("You have been logged out due to inactivity.");
  localStorage.removeItem("userSession");
  window.location.reload(); // Or redirect to login page
}

// ---- MODIFY handleLogin() to start session ----
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  alert(`Logged in as ${email}`);
  localStorage.setItem("userSession", JSON.stringify({ email, timestamp: Date.now() }));
  startSessionTracking();
  event.target.reset();
}

// ---- Optional: Auto-check session on load ----
window.onload = function () {
  const user = localStorage.getItem("userSession");
  if (user) {
    startSessionTracking();
  }
};
