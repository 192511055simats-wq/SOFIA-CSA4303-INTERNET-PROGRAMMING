
const $ = id => document.getElementById(id);
const STORAGE = {
  users: "ce_users",
  current: "ce_current",
  complaints: "ce_complaints",
  feedback: "ce_feedback"
};

const demoComplaints = [
  {
    id: "CE-2026-0142",
    user: "demo@complainease.test",
    title: "Street light not working",
    category: "Public services",
    description: "The street light near the main road is not working.",
    location: "Main Road",
    evidence: "",
    status: "In Progress",
    proof: "",
    update: "Officer assigned. Inspection in progress.",
    date: new Date().toISOString()
  },
  {
    id: "CE-2026-0138",
    user: "demo@complainease.test",
    title: "Water leakage",
    category: "Water supply",
    description: "Water is leaking near the public tap.",
    location: "Market Street",
    evidence: "",
    status: "Resolved",
    proof: "Demo repair completed.",
    update: "Repair marked complete.",
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "CE-2026-0124",
    user: "demo@complainease.test",
    title: "Road damage",
    category: "Roads and transport",
    description: "A pothole requires inspection.",
    location: "Bus stand road",
    evidence: "",
    status: "Submitted",
    proof: "",
    update: "Complaint received.",
    date: new Date(Date.now() - 172800000).toISOString()
  }
];

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

let users = read(STORAGE.users, []);
let complaints = read(STORAGE.complaints, demoComplaints);
let feedback = read(STORAGE.feedback, []);
let currentUser = read(STORAGE.current, null);
let accountMode = "register";
let currentPage = "overview";
let editingId = null;

function persist() {
  localStorage.setItem(STORAGE.users, JSON.stringify(users));
  localStorage.setItem(STORAGE.complaints, JSON.stringify(complaints));
  localStorage.setItem(STORAGE.feedback, JSON.stringify(feedback));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function notify(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => $("toast").classList.remove("show"), 3000);
}

function role() {
  return $("roleSelect").value;
}

function currentEmail() {
  return currentUser?.email || "demo@complainease.test";
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function isOfficer() {
  return currentUser?.role === "officer";
}

function canManageAccounts() {
  return role() === "admin" && isAdmin();
}

function canHandleComplaints() {
  return role() === "officer" && isOfficer();
}

function canSeeComplaint(c) {
  if (canManageAccounts() || canHandleComplaints()) return true;
  return c.user === currentEmail();
}

function makeId() {
  const year = new Date().getFullYear();
  let id;
  do {
    id = `CE-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (complaints.some(c => c.id === id));
  return id;
}

// ---------------- ACCOUNT MODAL ----------------

function openModal(mode) {
  accountMode = mode;
  $("modalBackdrop").classList.add("open");

  const registering = mode === "register";
  $("modalTitle").textContent = registering
    ? "Create your account"
    : "Welcome back";

  $("modalDescription").textContent = registering
    ? "Register to submit and track complaints."
    : "Login to continue to your account.";

  $("nameLabel").classList.toggle("hidden", !registering);
  $("submitAccount").textContent = registering
    ? "Create account ↗"
    : "Login ↗";

  $("switchText").innerHTML = registering
    ? 'Already registered? <button type="button" id="switchMode">Login</button>'
    : 'New here? <button type="button" id="switchMode">Register</button>';

  $("switchMode").onclick = () =>
    openModal(registering ? "login" : "register");
}

function closeModal() {
  $("modalBackdrop").classList.remove("open");
}

$("loginBtn").onclick = () => openModal("login");
$("registerBtn").onclick = () => openModal("register");
$("closeModal").onclick = closeModal;

$("modalBackdrop").onclick = event => {
  if (event.target === $("modalBackdrop")) closeModal();
};

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

$("accountForm").onsubmit = event => {
  event.preventDefault();

  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;

  if (accountMode === "register") {
    if (users.some(u => u.email === email)) {
      notify("An account with this email already exists.");
      return;
    }

    const user = {
      name: $("fullName").value.trim(),
      email,
      password,
      role: "user"
    };

    users.push(user);
    persist();
    loginUser(user);
    notify("Registration successful!");
  } else {
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      notify("Invalid email or password.");
      return;
    }

    loginUser(user);
    notify("Login successful!");
  }

  $("accountForm").reset();
  closeModal();
};

function loginUser(user) {
  currentUser = user;
  localStorage.setItem(STORAGE.current, JSON.stringify(user));

  // Display the role associated with the logged-in account.
  $("roleSelect").value = user.role;
  updateDashboard();
  showPage("overview");
}

$("logoutBtn").onclick = () => {
  currentUser = null;
  localStorage.removeItem(STORAGE.current);
  $("roleSelect").value = "user";
  updateDashboard();
  showPage("overview");
  notify("Logged out.");
};

// ---------------- DASHBOARD ----------------

function updateDashboard() {
  const name = currentUser?.name || "Guest User";
  const activeRole = role();

  $("profileName").textContent = name;
  $("avatar").textContent = name.charAt(0).toUpperCase();
  $("profileRole").textContent = {
    user: "User account",
    officer: "Officer account",
    admin: "Administrator"
  }[activeRole];

  $("greeting").textContent = {
    user: `Welcome back, ${name} 👋`,
    officer: "Officer workspace 👋",
    admin: "Admin control centre 👋"
  }[activeRole];

  const visible = complaints.filter(canSeeComplaint);
  $("totalCount").textContent = String(visible.length).padStart(2, "0");
  $("progressCount").textContent = String(
    visible.filter(c => c.status === "In Progress").length
  ).padStart(2, "0");
  $("resolvedCount").textContent = String(
    visible.filter(c => c.status === "Resolved").length
  ).padStart(2, "0");

  $("newComplaintBtn").classList.toggle("hidden", activeRole !== "user");
  $("heroReport").classList.toggle("hidden", false);

  document.querySelector('[data-page="submit"]').classList.toggle(
    "hidden", activeRole !== "user"
  );
  document.querySelector('[data-page="feedback"]').classList.toggle(
    "hidden", activeRole !== "user"
  );
  document.querySelector('[data-page="accounts"]').classList.toggle(
    "hidden", activeRole !== "admin"
  );

  renderComplaints();
  renderFeedbackOptions();
  renderAccounts();
  renderFeedback();
}

function statusClass(status) {
  return {
    "Submitted": "status-submitted",
    "In Progress": "status-progress",
    "Resolved": "",
    "Rejected": "status-rejected"
  }[status] ?? "";
}

function renderComplaints() {
  const search = $("searchInput").value.trim().toLowerCase();
  const status = $("statusFilter").value;

  const list = complaints.filter(c => {
    if (!canSeeComplaint(c)) return false;

    const matchesSearch = [
      c.id, c.title, c.category, c.location, c.description
    ].some(value => String(value || "").toLowerCase().includes(search));

    return matchesSearch && (status === "all" || c.status === status);
  });

  $("complaintList").innerHTML = list.map(c => {
    const owner = currentUser?.email === c.user;
    const officer = canHandleComplaints();
    const admin = canManageAccounts();

    return `
      <article class="complaint-item">
        <div class="complaint-item-top">
          <div>
            <h4>${escapeHTML(c.title)}</h4>
            <p>${escapeHTML(c.description)}</p>
          </div>
          <span class="status ${statusClass(c.status)}">${escapeHTML(c.status)}</span>
        </div>
        <div class="complaint-meta">
          <span>${escapeHTML(c.id)}</span>
          <span>${escapeHTML(c.category)}</span>
          <span>${escapeHTML(new Date(c.date).toLocaleDateString())}</span>
        </div>
        <p>⌖ ${escapeHTML(c.location || "Location not provided")}</p>
        ${c.update ? `<p><b>Latest update:</b> ${escapeHTML(c.update)}</p>` : ""}
        ${c.proof ? `<p><b>Proof of work:</b> ${escapeHTML(c.proof)}</p>` : ""}
        ${c.evidence ? `<p><a href="${escapeHTML(c.evidence)}" target="_blank" rel="noopener noreferrer">View evidence ↗</a></p>` : ""}
        <div class="item-actions">
          ${c.location ? `<button class="small-action" data-action="map" data-id="${escapeHTML(c.id)}">Open map</button>` : ""}
          ${owner && !officer && !admin ? `<button class="small-action" data-action="feedback" data-id="${escapeHTML(c.id)}">Feedback</button>` : ""}
          ${officer ? `<button class="small-action" data-action="update" data-id="${escapeHTML(c.id)}">Update status / proof</button>` : ""}
          ${admin ? `<button class="small-action danger" data-action="delete" data-id="${escapeHTML(c.id)}">Delete</button>` : ""}
        </div>
      </article>`;
  }).join("");

  $("emptyState").classList.toggle("hidden", list.length > 0);

  $("complaintList").querySelectorAll("button[data-action]").forEach(button => {
    button.onclick = () => handleComplaintAction(
      button.dataset.action, button.dataset.id
    );
  });
}

function handleComplaintAction(action, id) {
  const c = complaints.find(item => item.id === id);
  if (!c) return;

  if (action === "map") {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(c.location),
      "_blank",
      "noopener"
    );
  }

  if (action === "feedback") {
    showPage("feedback");
    $("feedbackComplaint").value = id;
  }

  if (action === "delete" && canManageAccounts()) {
    if (!confirm("Delete complaint " + id + "?")) return;

    complaints = complaints.filter(item => item.id !== id);
    persist();
    updateDashboard();
    notify("Complaint deleted.");
  }

  if (action === "update" && canHandleComplaints()) {
    const status = prompt(
      "Enter status: Submitted, In Progress, Resolved, or Rejected",
      c.status
    );

    if (status === null) return;

    const allowed = ["Submitted", "In Progress", "Resolved", "Rejected"];
    const matched = allowed.find(s => s.toLowerCase() === status.trim().toLowerCase());

    if (!matched) {
      notify("Please enter a valid status.");
      return;
    }

    const proof = prompt("Enter work proof, evidence URL, or update:", c.proof || "");
    if (proof === null) return;

    c.status = matched;
    c.proof = proof.trim();
    c.update = "Updated by officer on " + new Date().toLocaleString();

    persist();
    updateDashboard();
    notify("Complaint status updated.");
  }
}

$("searchInput").oninput = renderComplaints;
$("statusFilter").onchange = renderComplaints;
$("refreshBtn").onclick = () => {
  updateDashboard();
  notify("Dashboard refreshed.");
};

// ---------------- POST COMPLAINT ----------------

function showPage(page) {
  currentPage = page;

  const panels = {
    overview: "mainPanel",
    complaints: "mainPanel",
    submit: "formPanel",
    accounts: "accountsPanel",
    feedback: "feedbackPanel",
    help: "helpPanel"
  };

  Object.values(panels).forEach(id => $(id).classList.add("hidden"));
  $(panels[page] || "mainPanel").classList.remove("hidden");

  document.querySelectorAll(".side-link[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  if (page === "overview" || page === "complaints") {
    $("panelTitle").textContent =
      page === "overview" ? "Recent complaints" : "All complaints";
    $("panelDescription").textContent =
      canHandleComplaints() ? "Review complaints and update progress." :
      canManageAccounts() ? "View and manage all recorded complaints." :
      "Search and track your reported issues.";
    renderComplaints();
  }

  if (page === "submit") resetComplaintForm();
  if (page === "accounts") renderAccounts();
  if (page === "feedback") {
    renderFeedbackOptions();
    renderFeedback();
  }

  $("dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll(".side-link[data-page]").forEach(button => {
  button.onclick = () => showPage(button.dataset.page);
});

$("newComplaintBtn").onclick = () => showPage("submit");
$("heroReport").onclick = () => {
  if (!currentUser) {
    openModal("login");
    notify("Please log in to submit a complaint.");
    return;
  }
  if (currentUser.role !== "user") {
    notify("Log in with a user account to submit a complaint.");
    return;
  }
  showPage("submit");
};
$("ctaReport").onclick = () => $("heroReport").click();

function resetComplaintForm() {
  editingId = null;
  $("complaintForm").reset();
  $("formTitle").textContent = "Post a complaint";
}

$("mapBtn").onclick = () => {
  const location = $("complaintLocation").value.trim();

  if (!location) {
    notify("Enter a location first.");
    $("complaintLocation").focus();
    return;
  }

  window.open(
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(location),
    "_blank",
    "noopener"
  );
};

$("complaintForm").onsubmit = event => {
  event.preventDefault();

  if (!currentUser) {
    notify("Please register or log in first.");
    openModal("login");
    return;
  }

  if (currentUser.role !== "user") {
    notify("Only user accounts can post complaints.");
    return;
  }

  const title = $("complaintTitle").value.trim();
  const category = $("complaintCategory").value;
  const description = $("complaintDescription").value.trim();
  const location = $("complaintLocation").value.trim();
  const evidence = $("complaintEvidence").value.trim();

  if (!title || !category || !description) {
    notify("Complete the required fields.");
    return;
  }

  if (editingId) {
    const existing = complaints.find(c => c.id === editingId);
    if (!existing || existing.user !== currentEmail()) return;

    Object.assign(existing, { title, category, description, location, evidence });
    notify("Complaint details updated.");
  } else {
    complaints.unshift({
      id: makeId(),
      user: currentEmail(),
      title,
      category,
      description,
      location,
      evidence,
      status: "Submitted",
      proof: "",
      update: "Complaint received and awaiting review.",
      date: new Date().toISOString()
    });
    notify("Complaint submitted successfully!");
  }

  persist();
  resetComplaintForm();
  updateDashboard();
  showPage("complaints");
};

// ---------------- ROLE SELECTOR ----------------

$("roleSelect").onchange = () => {
  const selected = role();

  // Role switching is a demo convenience only. Real role permissions
  // must be enforced by a secure server after authentication.
  if (currentUser && currentUser.role !== selected) {
    notify("The selected role is a demo preview. Log in to use your assigned role.");
  }

  updateDashboard();
};

// ---------------- ADMIN: OFFICER ACCOUNTS ----------------

$("officerForm").onsubmit = event => {
  event.preventDefault();

  if (!canManageAccounts()) {
    notify("Log in with an administrator account first.");
    return;
  }

  const name = $("officerName").value.trim();
  const email = $("officerEmail").value.trim().toLowerCase();
  const password = $("officerPassword").value;

  if (users.some(u => u.email === email)) {
    notify("An account with this email already exists.");
    return;
  }

  users.push({ name, email, password, role: "officer" });
  persist();
  $("officerForm").reset();
  renderAccounts();
  notify("Officer account created.");
};

function renderAccounts() {
  if (!canManageAccounts()) {
    $("accountList").innerHTML =
      '<p class="empty-state">Log in with an admin account to manage accounts.</p>';
    return;
  }

  $("accountList").innerHTML = users.map((u, index) => `
    <div class="account-row">
      <div>
        <b>${escapeHTML(u.name)} — ${escapeHTML(u.role)}</b>
        <small>${escapeHTML(u.email)}</small>
      </div>
      <div class="item-actions">
        <button class="small-action" data-account-action="password" data-index="${index}">Change password</button>
        <button class="small-action danger" data-account-action="delete" data-index="${index}">Delete</button>
      </div>
    </div>`).join("");

  $("accountList").querySelectorAll("button").forEach(button => {
    button.onclick = () => {
      if (!canManageAccounts()) return;

      const index = Number(button.dataset.index);
      const user = users[index];
      if (!user) return;

      if (button.dataset.accountAction === "delete") {
        if (user.email === currentUser.email) {
          notify("You cannot delete the currently logged-in admin.");
          return;
        }

        if (!confirm("Delete account for " + user.email + "?")) return;

        users.splice(index, 1);
        persist();
        renderAccounts();
        notify("Account deleted.");
      }

      if (button.dataset.accountAction === "password") {
        const password = prompt("Enter a new demo password (minimum 4 characters):");

        if (password === null) return;
        if (password.length < 4) {
          notify("Password must contain at least 4 characters.");
          return;
        }

        user.password = password;
        persist();
        notify("Password updated.");
      }
    };
  });
}

// ---------------- FEEDBACK ----------------

function renderFeedbackOptions() {
  const visible = complaints.filter(c =>
    canManageAccounts() || canHandleComplaints() || c.user === currentEmail()
  );

  $("feedbackComplaint").innerHTML = visible.length
    ? visible.map(c => `<option value="${escapeHTML(c.id)}">${escapeHTML(c.id)} — ${escapeHTML(c.title)}</option>`).join("")
    : '<option value="">No complaints available</option>';
}

$("feedbackForm").onsubmit = event => {
  event.preventDefault();

  const complaint = complaints.find(c =>
    c.id === $("feedbackComplaint").value
  );

  if (!complaint || complaint.user !== currentEmail()) {
    notify("You can submit feedback only for your own complaints.");
    return;
  }

  feedback.unshift({
    id: "FB-" + Date.now(),
    complaintId: complaint.id,
    user: currentEmail(),
    rating: Number($("feedbackRating").value),
    comment: $("feedbackComment").value.trim(),
    date: new Date().toISOString()
  });

  persist();
  $("feedbackForm").reset();
  renderFeedbackOptions();
  renderFeedback();
  notify("Thank you for your feedback!");
};

function renderFeedback() {
  const visible = feedback.filter(f =>
    canManageAccounts() || f.user === currentEmail()
  );

  $("feedbackList").innerHTML = visible.map(f => `
    <article class="complaint-item">
      <h4>${escapeHTML(f.complaintId)} · ${"★".repeat(f.rating)}</h4>
      <p>${escapeHTML(f.comment)}</p>
      <div class="complaint-meta">${escapeHTML(new Date(f.date).toLocaleDateString())}</div>
    </article>`).join("");
}

// ---------------- STARTUP ----------------

function initialize() {
  if (currentUser) {
    const actualUser = users.find(u =>
      u.email === currentUser.email && u.role === currentUser.role
    );

    if (actualUser) {
      currentUser = actualUser;
      localStorage.setItem(STORAGE.current, JSON.stringify(actualUser));
      $("roleSelect").value = actualUser.role;
    } else {
      currentUser = null;
      localStorage.removeItem(STORAGE.current);
    }
  }

  updateDashboard();
  showPage("overview");
}

initialize();

// Reveal visual cards as they enter the viewport.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".feature-card, .steps > div, .metric").forEach(el => {
    observer.observe(el);
  });
}
