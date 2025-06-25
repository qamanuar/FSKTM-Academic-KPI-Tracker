document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!id || !password) {
      return alert("Please enter both ID and password.");
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem("userSession", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id);

        // Redirect based on role
        if (data.user.role === "advisor") {
          window.location.href =  `/lecturer-dashboard?advisorId=${data.user._id}`;
        } else if (data.user.role === "student") {
          window.location.href = "Student_Dash.html";
        } else {
          window.location.href = "profile.html";
        }

      } else if (response.status === 403 && data.message === "Account is deactivated") {
        const recover = confirm("This account is deactivated. Do you want to recover it?");
        if (recover) {
          const recoverRes = await fetch(`/api/auth/recover/${id}`, {
            method: "PUT",
          });

          const recoverData = await recoverRes.json();
          if (recoverRes.ok) {
            alert("Account recovered successfully. Please login again.");
            location.reload();
          } else {
            alert(recoverData.message || "Failed to recover account.");
          }
        } else {
          alert("Login canceled.");
          location.reload();
        }

      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    }
  });
});
