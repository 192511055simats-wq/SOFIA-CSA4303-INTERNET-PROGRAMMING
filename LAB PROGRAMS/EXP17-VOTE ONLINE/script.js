
"use strict";

// Educational demo only: Local Storage is not secure enough for real elections.

const STORAGE_KEY = "voteOnlineDemo_v1";

const initialData = {
  candidates: [
    { id: "c1", name: "Aarav Sharma", party: "Progress Alliance", symbol: "🌟" },
    { id: "c2", name: "Diya Patel", party: "Unity Group", symbol: "🌿" },
    { id: "c3", name: "Rohan Kumar", party: "Future Front", symbol: "🚀" }
  ],
  voters: [
    { id: "VOTER101", name: "Demo Voter" },
    { id: "VOTER102", name: "Sample Voter" }
  ],
  votes: []
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialData);

    const data = JSON.parse(saved);

    if (
      !data ||
      !Array.isArray(data.candidates) ||
      !Array.isArray(data.voters) ||
      !Array.isArray(data.votes)
    ) {
      return structuredClone(initialData);
    }

    return data;
  } catch (error) {
    console.error("Could not load saved demo data:", error);
    return structuredClone(initialData);
  }
}

let db = loadData();
let demoOtp = null;
let otpVoter = null;
let otpExpires = 0;

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    showToast("Unable to save. Browser storage may be full.");
    return false;
  }
}

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

let toastTimer;

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function showMessage(message, type) {
  const box = $("voteMessage");
  box.textContent = message;
  box.className = "message show " + type;
}

function renderCandidates() {
  $("candidateGrid").innerHTML = db.candidates.map((c, i) => `
    <article class="candidate-card" style="animation-delay:${i * 80}ms">
      <div class="candidate-symbol">${escapeHTML(c.symbol)}</div>
      <h3>${escapeHTML(c.name)}</h3>
      <p>${escapeHTML(c.party)}</p>
      <button class="btn" data-select="${escapeHTML(c.id)}">
        Select Candidate
      </button>
    </article>
  `).join("") || "<p>No candidates available. Ask the admin to add candidates.</p>";

  $("candidateSelect").innerHTML =
    '<option value="">Choose a candidate</option>' +
    db.candidates.map(c => `
      <option value="${escapeHTML(c.id)}">
        ${escapeHTML(c.name)} — ${escapeHTML(c.party)}
      </option>
    `).join("");
}

function renderStats() {
  const validVotes = db.votes.filter(v =>
    db.candidates.some(c => c.id === v.candidateId)
  );

  $("voterCount").textContent = db.voters.length;
  $("candidateCount").textContent = db.candidates.length;
  $("voteCount").textContent = validVotes.length;

  const votedIds = new Set(validVotes.map(v => v.voterId));
  const percentage = db.voters.length
    ? Math.round(votedIds.size / db.voters.length * 100)
    : 0;

  $("turnout").textContent = percentage + "%";
}

function renderResults() {
  const total = db.votes.filter(v =>
    db.candidates.some(c => c.id === v.candidateId)
  ).length;

  $("resultsList").innerHTML = db.candidates.map(c => {
    const count = db.votes.filter(v => v.candidateId === c.id).length;
    const percent = total ? Math.round(count / total * 100) : 0;

    return `
      <div class="result-row">
        <div class="result-info">
          <strong>${escapeHTML(c.symbol)} ${escapeHTML(c.name)}</strong>
          <span>${count} votes · ${percent}%</span>
        </div>
        <div class="bar">
          <div class="bar-fill" data-width="${percent}%"></div>
        </div>
      </div>
    `;
  }).join("") || "<p>No candidates available.</p>";

  requestAnimationFrame(() => {
    document.querySelectorAll(".bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  });
}

function renderAdmin() {
  $("adminCandidateList").innerHTML = db.candidates.map(c => `
    <div class="admin-row">
      <p>${escapeHTML(c.symbol)} <strong>${escapeHTML(c.name)}</strong>
        <br><span class="help">${escapeHTML(c.party)}</span></p>
      <div class="small-actions">
        <button data-edit="${escapeHTML(c.id)}">Edit</button>
        <button class="delete" data-delete="${escapeHTML(c.id)}">Delete</button>
      </div>
    </div>
  `).join("") || "<p>No candidates registered.</p>";

  $("adminVoterList").innerHTML = db.voters.map(v => `
    <div class="admin-row">
      <p><strong>${escapeHTML(v.name)}</strong>
        <br><span class="help">${escapeHTML(v.id)}</span></p>
      <div class="small-actions">
        <button class="delete" data-remove-voter="${escapeHTML(v.id)}">
          Remove
        </button>
      </div>
    </div>
  `).join("") || "<p>No voters registered.</p>";

  // Do not display voter identities alongside candidate choices.
  $("adminVoteList").innerHTML = db.votes.map((v, i) => {
    const candidate = db.candidates.find(c => c.id === v.candidateId);
    return `
      <div class="admin-row">
        <p><strong>Demo receipt ${escapeHTML(v.receipt)}</strong>
          <br><span class="help">${escapeHTML(v.date)}</span></p>
        <p>${escapeHTML(candidate ? candidate.name : "Candidate removed")}</p>
      </div>
    `;
  }).reverse().join("") || "<p>No demo votes submitted yet.</p>";
}

function renderAll() {
  renderCandidates();
  renderStats();
  renderResults();
  renderAdmin();
}

function invalidateOtp() {
  demoOtp = null;
  otpVoter = null;
  otpExpires = 0;
  $("otp").value = "";
  $("otpMessage").textContent = "";
}

function createId(prefix) {
  return prefix + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7);
}

// Candidate cards can preselect a candidate.
$("candidateGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-select]");
  if (!button) return;

  $("candidateSelect").value = button.dataset.select;
  $("vote").scrollIntoView({ behavior: "smooth" });
});

$("otpButton").addEventListener("click", () => {
  const voterId = $("voterId").value.trim().toUpperCase();
  const voter = db.voters.find(v => v.id.toUpperCase() === voterId);

  invalidateOtp();

  if (!voter) {
    $("otpMessage").textContent =
      "Voter ID not found. Register this demo voter in the Admin section.";
    return;
  }

  if (db.votes.some(v => v.voterId === voter.id)) {
    $("otpMessage").textContent = "This demo voter has already voted.";
    return;
  }

  // A predictable demo OTP is intentionally used for classroom testing.
  demoOtp = "123456";
  otpVoter = voter.id;
  otpExpires = Date.now() + 5 * 60 * 1000;

  $("otpMessage").textContent =
    "Demo OTP: 123456 (expires in 5 minutes).";
  showToast("Demo OTP generated.");
});

$("voteForm").addEventListener("submit", event => {
  event.preventDefault();

  const voterId = $("voterId").value.trim().toUpperCase();
  const voter = db.voters.find(v => v.id.toUpperCase() === voterId);
  const otp = $("otp").value.trim();
  const candidateId = $("candidateSelect").value;

  if (!voter) {
    showMessage("Voter ID is not registered.", "error");
    return;
  }

  if (db.votes.some(v => v.voterId === voter.id)) {
    showMessage("This voter has already submitted a demo vote.", "error");
    invalidateOtp();
    return;
  }

  if (
    !demoOtp ||
    otpVoter !== voter.id ||
    Date.now() > otpExpires ||
    otp !== demoOtp
  ) {
    showMessage("Generate a valid OTP for this voter before voting.", "error");
    return;
  }

  if (!db.candidates.some(c => c.id === candidateId)) {
    showMessage("Please select a valid candidate.", "error");
    return;
  }

  const receipt = "DEMO-" + createId("R").toUpperCase();

  db.votes.push({
    voterId: voter.id,
    candidateId,
    receipt,
    date: new Date().toLocaleString()
  });

  if (!saveData()) {
    db.votes.pop();
    return;
  }

  invalidateOtp();
  $("voteForm").reset();

  showMessage(
    "Demo vote recorded! Confirmation ID: " + receipt,
    "success"
  );

  renderAll();
  showToast("Your demo vote has been recorded.");
});

$("candidateForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("candidateName").value.trim();
  const party = $("candidateParty").value.trim();
  const symbol = $("candidateSymbol").value.trim();

  if (!name || !party || !symbol) return;

  db.candidates.push({
    id: createId("C"),
    name,
    party,
    symbol
  });

  if (!saveData()) {
    db.candidates.pop();
    return;
  }

  event.target.reset();
  $("candidateSymbol").value = "⭐";
  renderAll();
  showToast("Candidate added successfully.");
});

$("voterForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("newVoterId").value.trim().toUpperCase();
  const name = $("newVoterName").value.trim();

  if (db.voters.some(v => v.id.toUpperCase() === id)) {
    showToast("That voter ID already exists.");
    return;
  }

  db.voters.push({ id, name });

  if (!saveData()) {
    db.voters.pop();
    return;
  }

  event.target.reset();
  renderAll();
  showToast("Demo voter registered.");
});

$("adminCandidateList").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const candidate = db.candidates.find(c => c.id === editButton.dataset.edit);
    if (!candidate) return;

    const name = prompt("Candidate name:", candidate.name);
    if (name === null) return;
    const party = prompt("Party or group:", candidate.party);
    if (party === null) return;
    const symbol = prompt("Symbol or emoji:", candidate.symbol);
    if (symbol === null) return;

    if (!name.trim() || !party.trim() || !symbol.trim()) {
      showToast("Fields cannot be empty.");
      return;
    }

    const old = { ...candidate };
    Object.assign(candidate, {
      name: name.trim(),
      party: party.trim(),
      symbol: symbol.trim()
    });

    if (!saveData()) {
      Object.assign(candidate, old);
      return;
    }

    renderAll();
    showToast("Candidate updated.");
  }

  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    const candidate = db.candidates.find(c => c.id === id);
    if (!candidate) return;

    if (!confirm("Remove " + candidate.name + " from the demo election?")) {
      return;
    }

    const oldCandidates = db.candidates;
    db.candidates = db.candidates.filter(c => c.id !== id);

    if (!saveData()) {
      db.candidates = oldCandidates;
      return;
    }

    renderAll();
    showToast("Candidate removed.");
  }
});

$("adminVoterList").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-voter]");
  if (!button) return;

  const id = button.dataset.removeVoter;
  const voter = db.voters.find(v => v.id === id);
  if (!voter) return;

  if (db.votes.some(v => v.voterId === id)) {
    showToast("Cannot remove a voter who has already voted.");
    return;
  }

  if (!confirm("Remove demo voter " + voter.name + "?")) return;

  const previous = db.voters;
  db.voters = db.voters.filter(v => v.id !== id);

  if (!saveData()) {
    db.voters = previous;
    return;
  }

  if (otpVoter === id) invalidateOtp();

  renderAll();
  showToast("Demo voter removed.");
});

$("refreshResults").addEventListener("click", () => {
  renderResults();
  renderStats();
  showToast("Results refreshed.");
});

$("exportVotes").addEventListener("click", () => {
  const rows = [["Receipt ID", "Candidate", "Date"]];

  db.votes.forEach(v => {
    const candidate = db.candidates.find(c => c.id === v.candidateId);
    rows.push([
      v.receipt,
      candidate ? candidate.name : "Candidate removed",
      v.date
    ]);
  });

  const csv = rows.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\r\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = "voteonline-demo-results.csv";
  link.click();
  URL.revokeObjectURL(url);
});

$("resetDemo").addEventListener("click", () => {
  if (!confirm("Reset all demo candidates, voters and votes?")) return;

  const previous = db;
  db = structuredClone(initialData);

  if (!saveData()) {
    db = previous;
    return;
  }

  invalidateOtp();
  renderAll();
  showToast("Demo data reset.");
});

renderAll();
