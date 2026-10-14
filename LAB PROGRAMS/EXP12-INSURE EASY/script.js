
const KEYS = {
    users: "insureEasyUsers",
    session: "insureEasySession",
    policies: "insureEasyPolicies",
    customers: "insureEasyCustomers",
    reminders: "insureEasyReminders",
    favorites: "insureEasyFavorites",
    compare: "insureEasyCompare"
};

const $ = selector => document.querySelector(selector);

function getData(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function todayPlus(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[char]);
}

function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function showToast(message, error = false) {
    const toast = document.createElement("div");
    toast.className = "toast" + (error ? " error" : "");
    toast.textContent = message;
    $("#toastArea").appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

function currentUser() {
    return getData(KEYS.session, null);
}

/* Initial sample data */
function initialiseData() {
    if (!localStorage.getItem(KEYS.users)) {
        saveData(KEYS.users, [
            {
                name: "Demo Admin",
                email: "admin@insureeasy.demo",
                password: "admin123",
                role: "Admin",
                approved: true
            },
            {
                name: "Demo Agent",
                email: "agent@insureeasy.demo",
                password: "agent123",
                role: "Agent",
                approved: true
            },
            {
                name: "Demo Customer",
                email: "user@insureeasy.demo",
                password: "user123",
                role: "User",
                approved: true
            }
        ]);
    }

    if (!localStorage.getItem(KEYS.policies)) {
        saveData(KEYS.policies, [
            {
                id: 101,
                owner: "Demo Customer",
                email: "user@insureeasy.demo",
                name: "HealthCare Plus",
                type: "Health",
                premium: 899,
                coverage: "₹5 lakh",
                due: todayPlus(18),
                status: "Active"
            },
            {
                id: 102,
                owner: "Demo Customer",
                email: "user@insureeasy.demo",
                name: "DriveSafe Auto",
                type: "Auto",
                premium: 699,
                coverage: "₹8 lakh",
                due: todayPlus(5),
                status: "Active"
            }
        ]);
    }

    if (!localStorage.getItem(KEYS.customers)) {
        saveData(KEYS.customers, [
            {
                id: 201,
                name: "Ananya Rao",
                email: "ananya@example.com",
                phone: "9876543210",
                agent: "Demo Agent"
            },
            {
                id: 202,
                name: "Kiran Das",
                email: "kiran@example.com",
                phone: "9123456780",
                agent: "Demo Agent"
            }
        ]);
    }

    if (!localStorage.getItem(KEYS.reminders)) {
        saveData(KEYS.reminders, []);
    }
}

/* Sample insurance plans */
const plans = [
    {
        id: "health1",
        type: "Health",
        icon: "✚",
        name: "HealthCare Plus",
        price: 899,
        coverage: "₹5 lakh",
        description: "Everyday health protection for unexpected medical expenses.",
        benefits: ["Hospitalisation support", "Day-care procedures", "Annual health check-up"]
    },
    {
        id: "health2",
        type: "Health",
        icon: "♡",
        name: "Family Health Shield",
        price: 1499,
        coverage: "₹10 lakh",
        description: "A sample family health plan with a higher coverage limit.",
        benefits: ["Family coverage", "Preventive care", "Tele-consultation"]
    },
    {
        id: "auto1",
        type: "Auto",
        icon: "⌁",
        name: "DriveSafe Auto",
        price: 699,
        coverage: "₹8 lakh",
        description: "Sample vehicle protection for greater confidence on the road.",
        benefits: ["Accident damage cover", "Third-party liability", "Roadside assistance"]
    },
    {
        id: "auto2",
        type: "Auto",
        icon: "↗",
        name: "RoadReady Premium",
        price: 1099,
        coverage: "₹12 lakh",
        description: "An enhanced sample motor plan with additional benefits.",
        benefits: ["Own damage cover", "Garage support*", "Personal accident cover"]
    },
    {
        id: "home1",
        type: "Home",
        icon: "⌂",
        name: "Nest Secure",
        price: 499,
        coverage: "₹25 lakh",
        description: "Sample protection for your property and household belongings.",
        benefits: ["Structure protection", "Contents protection", "Fire protection"]
    },
    {
        id: "home2",
        type: "Home",
        icon: "⌂",
        name: "Home Complete",
        price: 799,
        coverage: "₹40 lakh",
        description: "A sample home plan with broader property protection.",
        benefits: ["Building and contents", "Burglary protection", "Additional assistance*"]
    }
];

let activeFilter = "All";
let compareList = getData(KEYS.compare, []);
let currentView = "overview";

/* Policy cards */
function renderPolicies() {
    const query = ($("#searchPolicy").value || "").toLowerCase().trim();
    const favorites = getData(KEYS.favorites, []);

    const filtered = plans.filter(plan => {
        const matchesType = activeFilter === "All" || plan.type === activeFilter;
        const matchesSearch =
            (plan.name + plan.type + plan.description).toLowerCase().includes(query);
        return matchesType && matchesSearch;
    });

    if (!filtered.length) {
        $("#policyGrid").innerHTML =
            '<div class="empty">No policies found. Try another search.</div>';
        return;
    }

    $("#policyGrid").innerHTML = filtered.map((plan, index) => `
        <article class="policy-card" style="animation-delay:${index * 60}ms">
            <div class="policy-icon">${plan.icon}</div>
            <span class="policy-type">${plan.type} INSURANCE</span>
            <h3>${plan.name}</h3>
            <p>${plan.description}</p>

            <div class="price">
                ${money(plan.price)} <small>/ month</small>
            </div>

            <p><strong>Sample coverage: ${plan.coverage}</strong></p>

            <ul>
                ${plan.benefits.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <div class="policy-actions">
                <button class="btn" onclick="applyPolicy('${plan.id}')">
                    Apply now ↗
                </button>

                <label>
                    <input type="checkbox" data-compare="${plan.id}"
                        ${compareList.includes(plan.id) ? "checked" : ""}>
                    Compare
                </label>
            </div>

            <button class="action-small" style="margin-top:12px"
                onclick="toggleFavorite('${plan.id}')">
                ${favorites.includes(plan.id) ? "♥ Saved" : "♡ Save plan"}
            </button>
        </article>
    `).join("");
}

/* Compare policies */
function renderComparison() {
    const selected = plans.filter(plan => compareList.includes(plan.id));
    const box = $("#compareBox");

    if (!selected.length) {
        box.classList.remove("show");
        $("#compareContent").innerHTML =
            "Select plans using the Compare checkbox.";
        return;
    }

    box.classList.add("show");
    $("#compareContent").innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    ${selected.map(p => `<th>${p.name}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                <tr><td>Category</td>${selected.map(p => `<td>${p.type}</td>`).join("")}</tr>
                <tr><td>Monthly premium</td>${selected.map(p => `<td>${money(p.price)}</td>`).join("")}</tr>
                <tr><td>Coverage</td>${selected.map(p => `<td>${p.coverage}</td>`).join("")}</tr>
                <tr><td>Benefits</td>${selected.map(p => `<td>${p.benefits.join("<br>")}</td>`).join("")}</tr>
            </tbody>
        </table>
    `;
}

$("#policyGrid").addEventListener("change", event => {
    if (!event.target.matches("[data-compare]")) return;

    const id = event.target.dataset.compare;

    if (event.target.checked) {
        if (compareList.length >= 3) {
            event.target.checked = false;
            showToast("Compare a maximum of three plans.", true);
            return;
        }
        compareList.push(id);
    } else {
        compareList = compareList.filter(item => item !== id);
    }

    saveData(KEYS.compare, compareList);
    renderComparison();
});

function toggleFavorite(id) {
    let favorites = getData(KEYS.favorites, []);

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
        showToast("Removed from favourites.");
    } else {
        favorites.push(id);
        showToast("Plan saved to favourites.");
    }

    saveData(KEYS.favorites, favorites);
    renderPolicies();
}

function applyPolicy(id) {
    const user = currentUser();

    if (!user) {
        showLogin();
        showToast("Log in before recording an application.");
        return;
    }

    const plan = plans.find(p => p.id === id);
    const policies = getData(KEYS.policies, []);

    if (policies.some(p => p.email === user.email && p.name === plan.name)) {
        showToast("This plan is already in your records.");
        return;
    }

    policies.push({
        id: Date.now(),
        owner: user.name,
        email: user.email,
        name: plan.name,
        type: plan.type,
        premium: plan.price,
        coverage: plan.coverage,
        due: todayPlus(30),
        status: "Pending"
    });

    saveData(KEYS.policies, policies);
    showToast("Sample application saved as Pending.");
    openView("policies");
    $("#dashboard").scrollIntoView({ behavior: "smooth" });
}

/* Login and registration */
function showLogin() {
    $("#modalTitle").textContent = "Welcome back";
    $("#modalDescription").textContent = "Log in to access your dashboard.";
    $("#modalForm").innerHTML = `
        <div class="demo-info">
            <strong>Demo accounts</strong><br>
            Admin: admin@insureeasy.demo / admin123<br>
            Agent: agent@insureeasy.demo / agent123<br>
            User: user@insureeasy.demo / user123
        </div>
        <form id="loginForm">
            <div class="field"><label>Email</label>
                <input name="email" type="email" required placeholder="you@example.com"></div>
            <div class="field"><label>Password</label>
                <input name="password" type="password" required placeholder="Password"></div>
            <button class="btn">Log in ↗</button>
        </form>`;

    $("#modalSwitch").innerHTML =
        'New here? <button class="text-link" onclick="showRegister()">Create an account</button>';

    $("#modalOverlay").classList.remove("hidden");
}

function showRegister() {
    $("#modalTitle").textContent = "Create your account";
    $("#modalDescription").textContent = "Start managing your insurance in one place.";
    $("#modalForm").innerHTML = `
        <form id="registerForm">
            <div class="field"><label>Full name</label>
                <input name="name" required maxlength="70" placeholder="Your name"></div>
            <div class="field"><label>Email</label>
                <input name="email" type="email" required placeholder="you@example.com"></div>
            <div class="field"><label>Password (minimum 6 characters)</label>
                <input name="password" type="password" minlength="6" required></div>
            <div class="field"><label>Account type</label>
                <select name="role">
                    <option value="User">Customer</option>
                    <option value="Agent">Agent</option>
                </select>
            </div>
            <button class="btn">Create account ↗</button>
        </form>
        <p class="helper">Agent accounts require admin approval. Use fictional details in this demo.</p>`;

    $("#modalSwitch").innerHTML =
        'Already registered? <button class="text-link" onclick="showLogin()">Log in</button>';

    $("#modalOverlay").classList.remove("hidden");
}

function closeModal() {
    $("#modalOverlay").classList.add("hidden");
}

$("#modalOverlay").addEventListener("click", event => {
    if (event.target.id === "modalOverlay") closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
});

$("#modalForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());

    if (form.id === "loginForm") {
        const users = getData(KEYS.users, []);
        const user = users.find(u =>
            u.email.toLowerCase() === data.email.toLowerCase() &&
            u.password === data.password
        );

        if (!user) {
            showToast("Incorrect email or password.", true);
            return;
        }

        if (user.role === "Agent" && !user.approved) {
            showToast("Your agent account awaits admin approval.", true);
            return;
        }

        saveData(KEYS.session, {
            name: user.name,
            email: user.email,
            role: user.role
        });

        closeModal();
        updateDashboard();
        showToast("Welcome, " + user.name + "!");
    }

    if (form.id === "registerForm") {
        const users = getData(KEYS.users, []);

        if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            showToast("This email is already registered.", true);
            return;
        }

        const user = {
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
            role: data.role,
            approved: data.role !== "Agent"
        };

        users.push(user);
        saveData(KEYS.users, users);

        if (user.role === "Agent") {
            closeModal();
            showToast("Agent registered. Admin approval is required.");
            return;
        }

        saveData(KEYS.session, {
            name: user.name,
            email: user.email,
            role: user.role
        });

        closeModal();
        updateDashboard();
        showToast("Account created successfully.");
    }
});

/* Dashboard */
function openView(view, clickedButton) {
    currentView = view;

    document.querySelectorAll(".side-link").forEach(button => {
        button.classList.remove("active");
    });

    if (clickedButton) clickedButton.classList.add("active");
    else {
        const match = document.querySelector(`.side-link[onclick*="'${view}'"]`);
        if (match) match.classList.add("active");
    }

    renderDashboard(view);
}

function getVisiblePolicies() {
    const user = currentUser();
    const policies = getData(KEYS.policies, []);

    if (!user) return [];
    if (user.role === "Admin" || user.role === "Agent") return policies;

    return policies.filter(p => p.email === user.email);
}

function policyTable(policies) {
    if (!policies.length) {
        return '<div class="empty">No policies found. Apply for a sample plan to begin.</div>';
    }

    return `<div class="data-table"><table>
        <thead><tr><th>POLICY</th><th>TYPE</th><th>PREMIUM / MONTH</th><th>DUE DATE</th><th>STATUS</th></tr></thead>
        <tbody>${policies.map(p => `
            <tr>
                <td><strong>${escapeHTML(p.name)}</strong><br>${escapeHTML(p.owner)}</td>
                <td>${escapeHTML(p.type)}</td>
                <td>${money(p.premium)}</td>
                <td>${escapeHTML(p.due)}</td>
                <td><span class="badge ${p.status === "Pending" ? "pending" : ""}">${escapeHTML(p.status)}</span></td>
            </tr>`).join("")}
        </tbody>
    </table></div>`;
}

function renderDashboard(view) {
    const user = currentUser();
    const role = user ? user.role : "Guest";
    const policies = getVisiblePolicies();
    const customers = getData(KEYS.customers, []);
    const reminders = getData(KEYS.reminders, []);
    const users = getData(KEYS.users, []);
    const agents = users.filter(u => u.role === "Agent");
    const dueSoon = policies.filter(p => {
        const days = (new Date(p.due + "T00:00:00") - new Date(new Date().toDateString())) / 86400000;
        return days >= 0 && days <= 30;
    });

    const settings = {
        overview: ["Overview", "Welcome to InsureEasy", "Your insurance workspace at a glance."],
        policies: ["My Policies", "Policy management", "Review policy records and upcoming premium dates."],
        customers: ["Customers", "Customer directory", "Add and maintain customer records."],
        agents: ["Agent Approvals", "Manage agent access", "Approve agents who register on the platform."],
        reminders: ["SMS Reminders", "Alerts and reminders", "Create simulated premium reminders."]
    }[view];

    $("#viewTitle").textContent = settings[1];
    $("#viewDescription").textContent = settings[2];

    const actionButton = $("#mainAction");
    actionButton.style.display = "block";
    actionButton.textContent = view === "customers" ? "+ Add Customer" :
        view === "reminders" ? "+ Create Reminder" :
        view === "agents" ? "Refresh" : "+ Add Policy";

    actionButton.onclick = () => {
        if (view === "customers") showAddCustomer();
        else if (view === "reminders") showReminderForm();
        else if (view === "agents") renderDashboard("agents");
        else showAddPolicy();
    };

    let html = "";

    if (view === "overview") {
        html = `
        <div class="dash-stats">
            <div class="dash-stat"><span>Policies in view</span><strong>${policies.length}</strong><small>Sample policy records</small></div>
            <div class="dash-stat"><span>Upcoming due dates</span><strong>${dueSoon.length}</strong><small>Next 30 days</small></div>
            <div class="dash-stat"><span>${role === "User" ? "Monthly premium" : "Customers"}</span>
                <strong>${role === "User" ? money(policies.reduce((sum,p)=>sum+Number(p.premium),0)) : customers.length}</strong>
                <small>Local demo data</small></div>
        </div>
        <div class="widget"><h4>Recent policy activity</h4>
            ${policies.length ? policies.slice(0,4).map(p => `
                <div class="activity"><span>${escapeHTML(p.name)} · ${escapeHTML(p.owner)}</span>
                <span class="badge ${p.status === "Pending" ? "pending" : ""}">${escapeHTML(p.status)}</span></div>
            `).join("") : '<div class="empty">Log in or apply for a sample policy to get started.</div>'}
        </div>`;
    }

    if (view === "policies") {
        html = `<div class="widget"><h4>Policy register</h4>${policyTable(policies)}</div>
        <p class="helper">Sample policy data only. No real policy is issued or modified.</p>`;
    }

    if (view === "customers") {
        if (role === "User" || role === "Guest") {
            html = '<div class="empty">Customer management is available to Agent and Admin demo accounts.</div>';
        } else {
            const visible = role === "Agent" ?
                customers.filter(c => c.agent === user.name) : customers;

            html = `<div class="widget"><h4>Customer records (${visible.length})</h4>
            ${visible.length ? `<div class="data-table"><table>
                <thead><tr><th>NAME</th><th>EMAIL</th><th>PHONE</th><th>AGENT</th><th>ACTION</th></tr></thead>
                <tbody>${visible.map(c => `<tr>
                    <td>${escapeHTML(c.name)}</td><td>${escapeHTML(c.email)}</td>
                    <td>${escapeHTML(c.phone)}</td><td>${escapeHTML(c.agent)}</td>
                    <td><button class="action-small" onclick="removeCustomer(${c.id})">Remove</button></td>
                </tr>`).join("")}</tbody></table></div>` : '<div class="empty">No customers found.</div>'}</div>`;
        }
    }

    if (view === "agents") {
        if (role !== "Admin") {
            html = '<div class="empty">Log in as Admin to approve agent registrations.</div>';
        } else {
            html = `<div class="widget"><h4>Registered agents</h4><div class="data-table"><table>
                <thead><tr><th>NAME</th><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr></thead>
                <tbody>${agents.map(a => `<tr>
                    <td>${escapeHTML(a.name)}</td><td>${escapeHTML(a.email)}</td>
                    <td><span class="badge ${a.approved ? "" : "pending"}">${a.approved ? "Approved" : "Pending"}</span></td>
                    <td>${a.approved ? "—" : `<button class="action-small" onclick="approveAgent('${escapeHTML(a.email)}')">Approve</button>`}</td>
                </tr>`).join("")}</tbody></table></div></div>`;
        }
    }

    if (view === "reminders") {
        const visible = role === "Admin" || role === "Agent" ?
            reminders : reminders.filter(r => r.email === user?.email);

        html = `
        <div class="widget"><h4>Reminder history</h4>
        ${visible.length ? visible.slice().reverse().map(r => `
            <div class="activity"><span><strong>${escapeHTML(r.title)}</strong><br>${escapeHTML(r.message)}<br><small>${escapeHTML(r.channel)} · ${escapeHTML(r.date)}</small></span><span class="badge">Saved</span></div>
        `).join("") : '<div class="empty">No reminders created yet.</div>'}
        </div>`;
    }

    $("#dashboardContent").innerHTML = html;
}

function updateDashboard() {
    const user = currentUser();

    $("#profileName").textContent = user ? user.name : "Guest";
    $("#profileRole").textContent = user ? user.role + " account" : "Preview mode";
    $("#profileIcon").textContent = user ? user.name.trim()[0].toUpperCase() : "G";

    renderDashboard(currentView);
}

function logout() {
    localStorage.removeItem(KEYS.session);
    updateDashboard();
    showToast("You have logged out.");
}

/* Add policy form */
function showAddPolicy() {
    if (!currentUser()) {
        showLogin();
        showToast("Log in to add a policy.");
        return;
    }

    $("#dashboardContent").innerHTML = `
    <div class="form-panel">
        <h4 style="margin-bottom:18px">Add a policy record</h4>
        <form id="addPolicyForm">
            <div class="form-grid">
                <div class="field"><label>Policyholder name</label>
                    <input name="owner" required value="${escapeHTML(currentUser().name)}"></div>
                <div class="field"><label>Customer email</label>
                    <input name="email" type="email" required value="${escapeHTML(currentUser().email)}"></div>
                <div class="field"><label>Policy name</label><input name="name" required></div>
                <div class="field"><label>Policy type</label>
                    <select name="type"><option>Health</option><option>Auto</option><option>Home</option></select></div>
                <div class="field"><label>Monthly premium (₹)</label>
                    <input name="premium" type="number" min="1" required></div>
                <div class="field"><label>Coverage amount</label>
                    <input name="coverage" required placeholder="₹5 lakh"></div>
                <div class="field"><label>Due date</label>
                    <input name="due" type="date" min="${todayPlus(0)}" required></div>
                <div class="field"><label>Status</label>
                    <select name="status"><option>Active</option><option>Pending</option></select></div>
            </div>
            <p class="helper">This saves a sample record only. It does not issue an insurance policy.</p>
            <button class="btn">Save policy</button>
        </form>
    </div>`;
}

function showAddCustomer() {
    const user = currentUser();

    if (!user || !["Admin", "Agent"].includes(user.role)) {
        showToast("Log in as Admin or Agent to add customers.", true);
        return;
    }

    $("#dashboardContent").innerHTML = `
    <div class="form-panel"><h4 style="margin-bottom:18px">Add customer</h4>
    <form id="addCustomerForm">
        <div class="field"><label>Full name</label><input name="name" required></div>
        <div class="field"><label>Email address</label><input name="email" type="email" required></div>
        <div class="field"><label>Phone number</label><input name="phone" required pattern="[0-9+ ()-]{7,18}"></div>
        <p class="helper">Use fictional customer information in this demo.</p>
        <button class="btn">Save customer</button>
    </form></div>`;
}

function showReminderForm() {
    const policies = getVisiblePolicies();

    if (!currentUser()) {
        showLogin();
        return;
    }

    $("#dashboardContent").innerHTML = `
    <div class="form-panel"><h4 style="margin-bottom:18px">Create a renewal reminder</h4>
    ${policies.length ? `<form id="reminderForm">
        <div class="field"><label>Policy</label><select name="policy" required>
            ${policies.map(p => `<option value="${p.id}">${escapeHTML(p.name)} — ${escapeHTML(p.owner)}</option>`).join("")}
        </select></div>
        <div class="field"><label>Reminder channel</label><select name="channel">
            <option>SMS (simulated)</option><option>Email (simulated)</option><option>Dashboard alert</option>
        </select></div>
        <div class="field"><label>Message</label><textarea name="message" rows="3" required>Your premium payment is due soon. Please review your policy details.</textarea></div>
        <p class="helper">This creates a local reminder entry only. It does not send a real SMS or email.</p>
        <button class="btn">Save reminder</button>
    </form>` : '<div class="empty">Add a policy before creating a reminder.</div>'}
    </div>`;
}

function mainAction() {
    if (currentView === "customers") showAddCustomer();
    else if (currentView === "reminders") showReminderForm();
    else if (currentView === "agents") renderDashboard("agents");
    else showAddPolicy();
}

function approveAgent(email) {
    if (currentUser()?.role !== "Admin") {
        showToast("Only the Admin can approve agents.", true);
        return;
    }

    const users = getData(KEYS.users, []).map(user =>
        user.email === email ? { ...user, approved: true } : user
    );

    saveData(KEYS.users, users);
    renderDashboard("agents");
    showToast("Agent approved successfully.");
}

function removeCustomer(id) {
    if (!["Admin", "Agent"].includes(currentUser()?.role)) {
        showToast("You do not have permission to remove customers.", true);
        return;
    }

    saveData(KEYS.customers,
        getData(KEYS.customers, []).filter(customer => customer.id !== id)
    );

    renderDashboard("customers");
    showToast("Customer removed from local demo records.");
}

/* Handle dashboard forms */
$("#dashboardContent").addEventListener("submit", event => {
    event.preventDefault();

    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());

    if (form.id === "addPolicyForm") {
        const policies = getData(KEYS.policies, []);

        policies.push({
            id: Date.now(),
            owner: data.owner,
            email: data.email,
            name: data.name,
            type: data.type,
            premium: Number(data.premium),
            coverage: data.coverage,
            due: data.due,
            status: data.status
        });

        saveData(KEYS.policies, policies);
        openView("policies");
        showToast("Policy record saved.");
    }

    if (form.id === "addCustomerForm") {
        const customers = getData(KEYS.customers, []);

        if (customers.some(c => c.email.toLowerCase() === data.email.toLowerCase())) {
            showToast("This customer email already exists.", true);
            return;
        }

        customers.push({
            id: Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            agent: currentUser().name
        });

        saveData(KEYS.customers, customers);
        openView("customers");
        showToast("Customer record saved.");
    }

    if (form.id === "reminderForm") {
        const policy = getData(KEYS.policies, []).find(p => String(p.id) === data.policy);

        if (!policy) {
            showToast("Policy not found.", true);
            return;
        }

        const reminders = getData(KEYS.reminders, []);
        reminders.push({
            id: Date.now(),
            email: policy.email,
            title: "Premium reminder: " + policy.name,
            message: data.message,
            channel: data.channel,
            date: new Date().toISOString().slice(0, 10)
        });

        saveData(KEYS.reminders, reminders);
        openView("reminders");
        showToast("Reminder saved locally. No message was sent.");
    }
});

/* Navigation and filters */
$("#searchPolicy").addEventListener("input", renderPolicies);

$("#categoryFilter").addEventListener("change", event => {
    activeFilter = event.target.value;
    renderPolicies();
});

document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
        const nav = document.querySelector("nav");
        nav.classList.remove("open");
    });
});

/* Scroll reveal animation */
function setupAnimations() {
    const elements = document.querySelectorAll(
        ".hero-copy, .hero-visual, .stats, .section-heading, .policy-card, .steps article"
    );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    elements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(14px)";
        element.style.transition = "opacity .65s ease, transform .65s ease";
        observer.observe(element);
    });
}

/* Start application */
initialiseData();
renderPolicies();
renderComparison();
updateDashboard();
setupAnimations();
