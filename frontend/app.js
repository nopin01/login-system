// API_URL comes from config.js

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("message");
const registerMessage = document.getElementById("registerMessage");

// Already signed in? Go straight to the dashboard.
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `message ${type || ""}`;
}

function showView(view) {
  const showRegister = view === "register";
  loginView.classList.toggle("hidden", showRegister);
  registerView.classList.toggle("hidden", !showRegister);
  showMessage(loginMessage, "");
  showMessage(registerMessage, "");
  (showRegister ? document.getElementById("name") : document.getElementById("email")).focus();
}

document.getElementById("showRegister").addEventListener("click", (e) => {
  e.preventDefault();
  showView("register");
});

document.getElementById("showLogin").addEventListener("click", (e) => {
  e.preventDefault();
  showView("login");
});

async function postJSON(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

/* ---------- Register ---------- */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = registerForm.querySelector("button");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  if (!name || !email || !password) {
    return showMessage(registerMessage, "Fill in all fields.", "error");
  }
  if (password.length < 6) {
    return showMessage(registerMessage, "Password must be at least 6 characters.", "error");
  }

  button.disabled = true;
  showMessage(registerMessage, "Creating your account...");

  try {
    const { ok, data } = await postJSON("/api/register", { name, email, password });

    if (!ok) {
      return showMessage(registerMessage, data.message || "Registration failed.", "error");
    }

    registerForm.reset();
    showView("login");
    showMessage(loginMessage, "Account created. Sign in to continue.", "success");
  } catch (err) {
    showMessage(registerMessage, "Can't reach the server. Check that the API is running.", "error");
  } finally {
    button.disabled = false;
  }
});

/* ---------- Login ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = loginForm.querySelector("button");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    return showMessage(loginMessage, "Enter your email and password.", "error");
  }

  button.disabled = true;
  showMessage(loginMessage, "Signing in...");

  try {
    const { ok, data } = await postJSON("/api/login", { email, password });

    if (!ok) {
      return showMessage(loginMessage, data.message || "Sign in failed.", "error");
    }

    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } catch (err) {
    showMessage(loginMessage, "Can't reach the server. Check that the API is running.", "error");
  } finally {
    button.disabled = false;
  }
});
