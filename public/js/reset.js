document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  const status = document.getElementById('status');

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    status.textContent = 'Invalid or missing token.';
    status.style.color = 'red';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok) {
        status.textContent = data.message;
        status.style.color = 'green';
        form.reset();
        form.style.display = 'none';
      } else {
        status.textContent = data.message;
        status.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong.';
      status.style.color = 'red';
    }
  });
});
