
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

  let role = '';
  if (/^L\d{8}$/.test(id)) {
    role = 'advisor';
  } else if (/^2\d{7}$/.test(id)) {
    role = 'student';
  } else {
    alert('Invalid ID format. Use 2XXXXXXX for students or LXXXXXXXX for advisors.');
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
      body: JSON.stringify({ name, id, email, password, country, timezone, role }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Registered successfully. Please check your email to verify your account.`);
      event.target.reset();
      toggleForm('login');
    } else {
      alert(`Registration failed: ${data.message}`);
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
    console.error('Register error:', error);
  }
}

// Trigger forgot password flow
async function handleForgotPassword() {
  const email = prompt("Enter your registered email address:");
  if (!email) return;

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
<<<<<<< HEAD
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
=======
      alert("Password reset email has been sent. Please check your inbox.");
    } else {
      alert(data.message || "Failed to send reset email.");
>>>>>>> ae927a3fc9bfd54f5fd9dfd44b9bf4aff0a09293
    }
  } catch (error) {
    alert("An error occurred. Please try again.");
    console.error("Forgot Password Error:", error);
  }
}
