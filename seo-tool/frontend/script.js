document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      message.style.color = "#00ff99";
      message.innerText = "✅ Login Successful!";
      
      // Save token in localStorage
      localStorage.setItem("token", data.token);

      // Redirect to tool page
      setTimeout(() => {
        window.location.href = "tool.html";
      }, 1500);
    } else {
      message.style.color = "#ff4d4d";
      message.innerText = data.message || "❌ Login Failed!";
    }
  } catch (error) {
    message.style.color = "#ff4d4d";
    message.innerText = "⚠️ Server Error!";
  }
});
