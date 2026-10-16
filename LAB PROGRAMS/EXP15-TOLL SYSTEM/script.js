
const $ = id => document.getElementById(id);

const KEY = {
  users: "easy_users",
  current: "easy_current",
  balance: "easy_balance",
  passes: "easy_passes",
  transactions: "easy_transactions"
};

let mode = "register";
let currentUser = JSON.parse(localStorage.getItem(KEY.current) || "null");
let balance = Number(localStorage.getItem(KEY.balance) || 2450);

let passes = JSON.parse(localStorage.getItem(KEY.passes) || "null") || [
  { id: "ET-2048-8042", vehicle: "TN 09 AB 2048", status: "Active" },
  { id: "ET-7712-1905", vehicle: "TN 10 CD 7712", status: "Active" }
];

let transactions = JSON.parse(localStorage.getItem(KEY.transactions) || "null") || [
  { title: "Chennai Bypass", amount: -85, date: "Today, 10:42 AM" },
  { title: "Wallet top-up", amount: 1000, date: "Yesterday", type: "income" },
  { title: "GST Road Toll", amount: -65, date: "Oct 12" }
];

function money(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function save() {
  localStorage.setItem(KEY.balance, balance);
  localStorage.setItem(KEY.passes, JSON.stringify(passes));
  localStorage.setItem(KEY.transactions, JSON.stringify(transactions));
}

function safe(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function notify(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2800);
}

function openModal(newMode) {
  mode = newMode;
  $("modalBackdrop").classList.add("open");

  const registering = mode === "register";
  $("modalTitle").textContent = registering
    ? "Create your account" : "Welcome back";
  $("modalDescription").textContent = registering
    ? "A smoother journey starts with you."
    : "Login to continue your journey.";

  $("nameField").classList.toggle("hidden", !registering);
  $("vehicleField").classList.toggle("hidden", !registering);

  $("submitAccount").textContent = registering
    ? "Create account ↗" : "Login ↗";

  $("switchText").innerHTML = registering
    ? 'Already registered? <button id="switchMode">Login</button>'
    : 'New to EasyToll? <button id="switchMode">Register</button>';

  $("switchMode").onclick = () =>
    openModal(registering ? "login" : "register");
}

function closeModal() {
  $("modalBackdrop").classList.remove("open");
}

$("registerBtn").onclick = () => openModal("register");
$("loginBtn").onclick = () => openModal("login");
$("ctaRegister").onclick = () => openModal("register");
$("closeModal").onclick = closeModal;

$("modalBackdrop").onclick = e => {
  if (e.target === $("modalBackdrop")) closeModal();
};

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

function setUser(user) {
  currentUser = user;
  localStorage.setItem(KEY.current, JSON.stringify(user));
  updateDashboard();
}

$("accountForm").onsubmit = e => {
  e.preventDefault();

  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  let users = JSON.parse(localStorage.getItem(KEY.users) || "[]");

  if (mode === "register") {
    if (users.some(u => u.email === email)) {
      notify("This email is already registered.");
      return;
    }

    const user = {
      name: $("fullName").value.trim() || email.split("@")[0],
      email,
      password,
      vehicle: $("vehicle").value.trim().toUpperCase() || "TN 09 AB 2048",
      role: "user"
    };

    users.push(user);
    localStorage.setItem(KEY.users, JSON.stringify(users));
    setUser(user);
    notify("Account created successfully!");
  } else {
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      notify("Incorrect email or password.");
      return;
    }

    setUser(user);
    notify("Login successful!");
  }

  $("accountForm").reset();
  closeModal();
};

function updateDashboard() {
  const name = currentUser?.name || "Demo Driver";
  const role = $("roleSelect").value;

  $("profileName").textContent = name;
  $("avatar").textContent = name[0].toUpperCase();
  $("profileRole").textContent = {
    user: "Driver account",
    admin: "Administrator",
    officer: "Toll gate officer"
  }[role];

  $("balance").textContent = money(balance);
  $("heroBalance").textContent = money(balance) + ".00";
  $("passCount").textContent = String(
    passes.filter(p => p.status === "Active").length
  ).padStart(2, "0");
  $("tripCount").textContent = transactions.length;

  $("passId").textContent = passes[0]?.id || "No active pass";
  $("vehicleId").textContent =
    currentUser?.vehicle || passes[0]?.vehicle || "TN 09 AB 2048";

  $("greeting").textContent = {
    user: `Good day, ${name} 👋`,
    admin: "Admin control centre 👋",
    officer: "Toll gate operations 👋"
  }[role];

  renderTransactions();
}

function renderTransactions() {
  $("transactionList").innerHTML = transactions.slice(0, 6).map(t => {
    const income = t.amount > 0;

    return `
      <div class="transaction">
        <span class="transaction-icon ${income ? "income" : ""}">
          ${income ? "+" : "↗"}
        </span>
        <div class="transaction-info">
          <b>${safe(t.title)}</b>
          <small>${safe(t.date)}</small>
        </div>
        <strong class="amount ${income ? "income-text" : ""}">
          ${income ? "+" : "−"}${money(Math.abs(t.amount))}
        </strong>
      </div>`;
  }).join("");
}

function addTransaction(title, amount) {
  transactions.unshift({
    title,
    amount,
    date: new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  save();
  updateDashboard();
}

$("addMoneyBtn").onclick = () => {
  const value = prompt("Enter the amount to add to your demo wallet:");

  if (value === null) return;

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    notify("Enter a valid amount from ₹1 to ₹100,000.");
    return;
  }

  balance += amount;
  addTransaction("Wallet top-up", amount);
  notify(money(amount) + " added to demo wallet.");
};

$("applyPassBtn").onclick = () => {
  const vehicle = prompt(
    "Enter vehicle number:",
    currentUser?.vehicle || "TN 09 AB 2048"
  );

  if (!vehicle?.trim()) return;

  const id = "ET-" +
    Math.floor(1000 + Math.random() * 9000) + "-" +
    Math.floor(1000 + Math.random() * 9000);

  passes.unshift({
    id,
    vehicle: vehicle.trim().toUpperCase(),
    status: "Active"
  });

  if (currentUser) {
    currentUser.vehicle = vehicle.trim().toUpperCase();
    localStorage.setItem(KEY.current, JSON.stringify(currentUser));
  }

  save();
  updateDashboard();
  notify("Demo toll pass created: " + id);
};

$("refreshBtn").onclick = () => {
  updateDashboard();
  notify("Dashboard refreshed.");
};

$("viewAllBtn").onclick = () => showPage("transactions");
$("verifyShortcut").onclick = () => showPage("gate");

function showPage(page) {
  document.querySelectorAll(".side-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  $("extraPanel").classList.toggle(
    "hidden",
    !["passes", "transactions", "management"].includes(page)
  );
  $("verifyPanel").classList.toggle("hidden", page !== "gate");

  if (page === "passes") renderPasses();
  if (page === "transactions") renderAllTransactions();
  if (page === "management" || page === "overview") renderManagement();

  if (page === "gate") $("verifyInput").focus();
}

document.querySelectorAll(".side-link").forEach(button => {
  button.onclick = () => showPage(button.dataset.page);
});

$("roleSelect").onchange = () => {
  const role = $("roleSelect").value;

  $("applyPassBtn").classList.toggle("hidden", role !== "user");
  $("verifyShortcut").classList.toggle("hidden", role !== "officer");

  if (role === "admin") showPage("management");
  else if (role === "officer") showPage("gate");
  else showPage("overview");

  updateDashboard();
};

function renderManagement() {
  const role = $("roleSelect").value;
  $("extraHeading").textContent = {
    user: "User account tools",
    admin: "Administration tools",
    officer: "Toll gate operations"
  }[role];

  $("extraDescription").textContent =
    "Choose an action to continue.";

  let tools = [];

  if (role === "admin") {
    tools = [
      ["View accounts", "View locally registered demo users.", "users"],
      ["Manage toll gates", "Add a demo toll location.", "tolls"],
      ["Approve toll passes", "Review demo pass records.", "approvals"],
      ["Generate QR reference", "Display a pass reference.", "qr"],
      ["Change password", "Update your demo account password.", "password"],
      ["Feature visibility", "Hide or show the features section.", "features"]
    ];
  } else if (role === "officer") {
    tools = [
      ["Verify pass", "Check a pass ID.", "verify"],
      ["Verify ticket", "Check a demo ticket ID.", "verify"],
      ["Update toll location", "Set the displayed gate location.", "location"],
      ["Record toll crossing", "Record a demo ₹85 toll transaction.", "crossing"]
    ];
  } else {
    tools = [
      ["My profile", "View your account details.", "profile"],
      ["My passes", "Review your passes.", "passes"],
      ["Add money", "Recharge your demo wallet.", "wallet"],
      ["Transaction history", "View wallet activity.", "transactions"]
    ];
  }

  $("extraContent").innerHTML = tools.map(t => `
    <div class="tool-tile">
      <h4>${t[0]}</h4>
      <p>${t[1]}</p>
      <button data-action="${t[2]}">Open</button>
    </div>`).join("");

  $("extraContent").querySelectorAll("button").forEach(button => {
    button.onclick = () => runAction(button.dataset.action);
  });
}

function renderPasses() {
  $("extraContent").innerHTML = passes.map(p => `
    <div class="tool-tile">
      <h4>${safe(p.id)} — ${safe(p.status)}</h4>
      <p>Vehicle: ${safe(p.vehicle)}</p>
      <button data-id="${safe(p.id)}">Renew pass</button>
    </div>`).join("");

  $("extraContent").querySelectorAll("button").forEach(button => {
    button.onclick = () => {
      const pass = passes.find(p => p.id === button.dataset.id);
      if (!pass) return;

      pass.status = "Active";
      save();
      updateDashboard();
      notify("Pass renewed in demo.");
    };
  });
}

function renderAllTransactions() {
  $("extraContent").innerHTML = transactions.map(t => `
    <div class="tool-tile">
      <h4>${safe(t.title)} — ${t.amount > 0 ? "+" : "−"}${money(Math.abs(t.amount))}</h4>
      <p>${safe(t.date)}</p>
      <button data-title="${safe(t.title)}">View details</button>
    </div>`).join("");

  $("extraContent").querySelectorAll("button").forEach(button => {
    button.onclick = () => notify("Transaction: " + button.dataset.title);
  });
}

function runAction(action) {
  if (action === "wallet") return $("addMoneyBtn").click();
  if (action === "passes") return showPage("passes");
  if (action === "transactions") return showPage("transactions");
  if (action === "verify") return showPage("gate");

  if (action === "profile") {
    alert(
      "DEMO PROFILE\n" +
      "Name: " + (currentUser?.name || "Demo Driver") + "\n" +
      "Email: " + (currentUser?.email || "Not logged in") + "\n" +
      "Vehicle: " + (currentUser?.vehicle || "TN 09 AB 2048")
    );
    return;
  }

  if (action === "users") {
    const users = JSON.parse(localStorage.getItem(KEY.users) || "[]");

    alert(users.length
      ? users.map(u => `${u.name} — ${u.email}`).join("\n")
      : "No registered users yet."
    );
    return;
  }

  if (action === "tolls") {
    const name = prompt("Enter a demo toll gate location:");
    if (name) notify("Demo toll location added: " + name);
    return;
  }

  if (action === "approvals") {
    alert("Pass records:\n" + passes.map(p =>
      `${p.id} | ${p.vehicle} | ${p.status}`
    ).join("\n"));
    return;
  }

  if (action === "qr") {
    if (!passes.length) return notify("Create a pass first.");

    alert(
      "DEMO QR REFERENCE\n" +
      passes[0].id + "\n" +
      "Vehicle: " + passes[0].vehicle +
      "\nUse Gate Verification to check this ID."
    );
    return;
  }

  if (action === "password") {
    if (!currentUser) {
      notify("Register or log in first.");
      return;
    }

    const password = prompt("Enter a new password (at least 4 characters):");
    if (!password || password.length < 4) {
      notify("Password must contain at least 4 characters.");
      return;
    }

    const users = JSON.parse(localStorage.getItem(KEY.users) || "[]");
    const user = users.find(u => u.email === currentUser.email);

    if (user) {
      user.password = password;
      localStorage.setItem(KEY.users, JSON.stringify(users));
      notify("Demo password updated.");
    }
    return;
  }

  if (action === "features") {
    const section = document.querySelector(".features");
    section.classList.toggle("hidden");
    notify(section.classList.contains("hidden")
      ? "Features section hidden." : "Features section visible.");
    return;
  }

  if (action === "location") {
    const location = prompt("Enter toll gate location:");
    if (location) notify("Demo gate location set to " + location);
    return;
  }

  if (action === "crossing") {
    if (balance < 85) {
      notify("Insufficient wallet balance.");
      return;
    }

    balance -= 85;
    addTransaction("Toll gate crossing", -85);
    notify("Demo crossing recorded. ₹85 deducted.");
  }
}

$("verifyForm").onsubmit = e => {
  e.preventDefault();

  const id = $("verifyInput").value.trim().toUpperCase();
  const pass = passes.find(p => p.id.toUpperCase() === id);

  $("verifyResult").innerHTML = pass
    ? `<p style="color:#639341"><b>✓ Pass found</b></p>
       Pass ID: ${safe(pass.id)}<br>
       Vehicle: ${safe(pass.vehicle)}<br>
       Status: ${safe(pass.status)}`
    : `<p style="color:#bd634c"><b>✕ No matching pass found</b></p>
       Please check the ID and try again.`;
};

function goDashboard() {
  $("dashboard").scrollIntoView({ behavior: "smooth" });
}

$("roleSelect").value = "user";
renderManagement();
updateDashboard();

if (currentUser) {
  $("profileName").textContent = currentUser.name;
}

// Reveal sections when they enter the viewport.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "enterLeft .7s ease both";
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  ".feature, .steps > div, .stats, .panel, .metric"
).forEach(el => revealObserver.observe(el));
