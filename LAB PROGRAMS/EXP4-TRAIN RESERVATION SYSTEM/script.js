
const STORAGE = {
  users: "railease_users",
  trains: "railease_trains",
  bookings: "railease_bookings",
  currentUser: "railease_current_user"
};

const classes = {
  "Sleeper": { multiplier: 1, code: "SL" },
  "AC 3 Tier": { multiplier: 2, code: "3A" },
  "AC 2 Tier": { multiplier: 3, code: "2A" },
  "AC First Class": { multiplier: 4, code: "1A" },
  "Chair Car": { multiplier: 1.5, code: "CC" }
};

const initialTrains = [
  { id: 101, number: "12601", name: "Chennai Express", from: "Chennai", to: "Bengaluru", departure: "06:00", arrival: "11:00", fare: 350, seats: 48 },
  { id: 102, number: "12602", name: "Southern Intercity", from: "Chennai", to: "Coimbatore", departure: "07:15", arrival: "14:00", fare: 420, seats: 36 },
  { id: 103, number: "12603", name: "Vaigai Express", from: "Chennai", to: "Madurai", departure: "13:30", arrival: "21:00", fare: 390, seats: 30 },
  { id: 104, number: "12604", name: "Kaveri Express", from: "Bengaluru", to: "Chennai", departure: "08:00", arrival: "13:15", fare: 360, seats: 42 },
  { id: 105, number: "12605", name: "Deccan Express", from: "Mumbai", to: "Hyderabad", departure: "09:00", arrival: "18:00", fare: 500, seats: 40 },
  { id: 106, number: "12606", name: "Capital Express", from: "Delhi", to: "Mumbai", departure: "17:00", arrival: "08:00", fare: 650, seats: 50 },
  { id: 107, number: "12607", name: "Malabar Express", from: "Kochi", to: "Coimbatore", departure: "10:00", arrival: "15:30", fare: 300, seats: 28 },
  { id: 108, number: "12608", name: "Cauvery Express", from: "Trichy", to: "Chennai", departure: "06:30", arrival: "12:00", fare: 280, seats: 32 },
  { id: 109, number: "12609", name: "Salem Intercity", from: "Salem", to: "Chennai", departure: "07:45", arrival: "13:00", fare: 310, seats: 34 },
  { id: 110, number: "12610", name: "Hyderabad Express", from: "Hyderabad", to: "Bengaluru", departure: "20:00", arrival: "06:00", fare: 480, seats: 44 }
];

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return loadData(STORAGE.users, []);
}

function getTrains() {
  return loadData(STORAGE.trains, initialTrains);
}

function getBookings() {
  return loadData(STORAGE.bookings, []);
}

function getCurrentUser() {
  return loadData(STORAGE.currentUser, null);
}

function money(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function setMessage(elementId, message, error = false) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.classList.toggle("error", error);
}

function setInitialData() {
  if (!localStorage.getItem(STORAGE.trains)) {
    saveData(STORAGE.trains, initialTrains);
  }

  const dateInput = document.getElementById("journeyDate");
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  dateInput.min = localDate;
  dateInput.value = localDate;
}

function swapStations() {
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  const temporary = from.value;
  from.value = to.value;
  to.value = temporary;
}

function showAuth(mode) {
  document.getElementById("authModal").hidden = false;

  const register = mode === "register";
  document.getElementById("authTitle").textContent =
    register ? "Create your account" : "Welcome back";
  document.getElementById("authSubmit").textContent =
    register ? "Create Account" : "Login";
  document.getElementById("nameField").hidden = !register;
  document.getElementById("fullName").required = register;
  document.getElementById("password").autocomplete =
    register ? "new-password" : "current-password";

  document.getElementById("loginTab").classList.toggle("active", !register);
  document.getElementById("registerTab").classList.toggle("active", register);
  setMessage("authMessage", "");

  document.getElementById("authForm").dataset.mode = mode;
}

function closeAuth() {
  document.getElementById("authModal").hidden = true;
}

document.getElementById("authForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const mode = this.dataset.mode || "login";
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const users = getUsers();

  if (mode === "register") {
    const name = document.getElementById("fullName").value.trim();

    if (name.length < 2) {
      setMessage("authMessage", "Enter your full name.", true);
      return;
    }

    if (users.some(user => user.email === email)) {
      setMessage("authMessage", "This email is already registered.", true);
      return;
    }

    users.push({ name, email, password });
    saveData(STORAGE.users, users);
    saveData(STORAGE.currentUser, { name, email });

    closeAuth();
    updateAuthUI();
    alert("Registration successful. You are now logged in.");
  } else {
    const user = users.find(
      item => item.email === email && item.password === password
    );

    if (!user) {
      setMessage("authMessage", "Invalid email or password.", true);
      return;
    }

    saveData(STORAGE.currentUser, { name: user.name, email: user.email });
    closeAuth();
    updateAuthUI();
    alert("Login successful. Welcome, " + user.name + "!");
  }
});

function updateAuthUI() {
  const user = getCurrentUser();
  const buttons = document.querySelector(".auth-buttons");

  if (!user) {
    buttons.innerHTML = `
      <button class="btn btn-light" onclick="showAuth('login')">Login</button>
      <button class="btn btn-primary" onclick="showAuth('register')">Register</button>`;
    return;
  }

  buttons.innerHTML = `
    <span class="muted">Hi, ${escapeHTML(user.name)}</span>
    <button class="btn btn-light" onclick="logout()">Logout</button>`;
}

function logout() {
  localStorage.removeItem(STORAGE.currentUser);
  updateAuthUI();
  alert("You have logged out.");
}

document.getElementById("searchForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("journeyDate").value;
  const travelClass = document.getElementById("travelClass").value;

  if (from.toLowerCase() === to.toLowerCase()) {
    setMessage("searchMessage", "Departure and arrival stations must differ.", true);
    return;
  }

  if (!date || date < document.getElementById("journeyDate").min) {
    setMessage("searchMessage", "Choose today or a future journey date.", true);
    return;
  }

  const results = getTrains().filter(train =>
    train.from.toLowerCase() === from.toLowerCase() &&
    train.to.toLowerCase() === to.toLowerCase()
  );

  setMessage(
    "searchMessage",
    results.length
      ? `${results.length} demo train(s) found for ${date}.`
      : "No matching demo trains found. Try another route or check the station spelling."
  );

  renderTrains(results, date, travelClass);
});

function renderTrains(trains, date, selectedClass) {
  const container = document.getElementById("trainResults");
  container.innerHTML = "";

  if (!trains.length) {
    container.innerHTML = `
      <div class="train-card">
        <h3>No trains found</h3>
        <p class="muted">Try a route listed in the sample train data.</p>
      </div>`;
    return;
  }

  trains.forEach(train => {
    const fare = Math.round(train.fare * classes[selectedClass].multiplier);
    const card = document.createElement("article");
    card.className = "train-card";

    card.innerHTML = `
      <div class="train-top">
        <div>
          <h3>${escapeHTML(train.name)}</h3>
          <span class="train-number">Train No. ${escapeHTML(train.number)}</span>
        </div>
        <span class="tag">${escapeHTML(selectedClass)}</span>
      </div>

      <div class="route">
        <div>
          <strong>${escapeHTML(train.departure)}</strong>
          <small>${escapeHTML(train.from)}</small>
        </div>
        <div class="route-line"></div>
        <div>
          <strong>${escapeHTML(train.arrival)}</strong>
          <small>${escapeHTML(train.to)}</small>
        </div>
      </div>

      <div class="class-options">
        ${Object.keys(classes).map(name => `
          <button type="button"
            class="class-chip ${name === selectedClass ? "selected" : ""}"
            data-class="${escapeHTML(name)}">
            ${escapeHTML(name)}
            <br>${money(Math.round(train.fare * classes[name].multiplier))}
          </button>
        `).join("")}
      </div>

      <div class="train-bottom">
        <div>
          <strong>${money(fare)}</strong>
          <div class="seat-status">${train.seats} demo seats available</div>
          <div class="small-note">${escapeHTML(date)}</div>
        </div>
        <button class="btn btn-primary book-train">Book this train</button>
      </div>`;

    card.querySelectorAll(".class-chip").forEach(button => {
      button.addEventListener("click", () => {
        renderTrains([train], date, button.dataset.class);
      });
    });

    card.querySelector(".book-train").addEventListener("click", () => {
      openBooking(train, date, selectedClass);
    });

    container.appendChild(card);
  });
}

let selectedBooking = null;

function openBooking(train, date, travelClass) {
  const user = getCurrentUser();

  if (!user) {
    showAuth("login");
    setMessage("authMessage", "Please log in before booking.");
    return;
  }

  selectedBooking = { train, date, travelClass };

  document.getElementById("selectedTrainSummary").innerHTML = `
    <strong>${escapeHTML(train.name)}</strong>
    <p>${escapeHTML(train.from)} → ${escapeHTML(train.to)}</p>
    <p>${escapeHTML(date)} | ${escapeHTML(travelClass)}</p>
    <p>Departure: ${escapeHTML(train.departure)} · Arrival: ${escapeHTML(train.arrival)}</p>`;

  document.getElementById("passengerName").value = user.name;
  document.getElementById("passengerEmail").value = user.email;
  document.getElementById("passengerAge").value = "";
  document.getElementById("passengerGender").value = "";
  document.getElementById("passengerCount").value = "1";
  document.getElementById("paymentMethod").value = "Online (demo)";
  setMessage("bookingMessage", "");
  updateBookingTotal();

  document.getElementById("bookingModal").hidden = false;
}

function closeBooking() {
  document.getElementById("bookingModal").hidden = true;
}

function calculateFare() {
  if (!selectedBooking) return 0;

  const count = Number(document.getElementById("passengerCount").value);
  const base = selectedBooking.train.fare *
    classes[selectedBooking.travelClass].multiplier;

  return Math.round(base * count);
}

function updateBookingTotal() {
  document.getElementById("bookingTotal").textContent = money(calculateFare());
}

document.getElementById("passengerCount").addEventListener("change", updateBookingTotal);

document.getElementById("bookingForm").addEventListener("submit", function(event) {
  event.preventDefault();

  if (!selectedBooking) return;

  const user = getCurrentUser();
  if (!user) {
    setMessage("bookingMessage", "Please log in again.", true);
    return;
  }

  const train = selectedBooking.train;
  const count = Number(document.getElementById("passengerCount").value);
  const passengerName = document.getElementById("passengerName").value.trim();
  const passengerAge = Number(document.getElementById("passengerAge").value);
  const passengerGender = document.getElementById("passengerGender").value;
  const passengerEmail = document.getElementById("passengerEmail").value.trim();

  if (!passengerName || !passengerGender || !passengerEmail ||
      passengerAge < 1 || passengerAge > 120) {
    setMessage("bookingMessage", "Enter valid passenger details.", true);
    return;
  }

  if (train.seats < count) {
    setMessage("bookingMessage", "Not enough demo seats available.", true);
    return;
  }

  const total = calculateFare();
  const bookings = getBookings();
  const pnr = String(Math.floor(1000000000 + Math.random() * 9000000000));
  const status = train.seats - count >= 5 ? "Confirmed" : "Waiting List";

  const booking = {
    id: Date.now(),
    pnr,
    userEmail: user.email,
    passengerName,
    passengerAge,
    passengerGender,
    passengerEmail,
    trainId: train.id,
    trainNumber: train.number,
    trainName: train.name,
    from: train.from,
    to: train.to,
    departure: train.departure,
    arrival: train.arrival,
    date: selectedBooking.date,
    travelClass: selectedBooking.travelClass,
    passengers: count,
    fare: total,
    paymentMethod: document.getElementById("paymentMethod").value,
    paymentStatus: document.getElementById("paymentMethod").value === "Pay at counter"
      ? "Pending"
      : "Demo payment — not collected",
    status,
    refund: 0,
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  saveData(STORAGE.bookings, bookings);

  const updatedTrains = getTrains().map(item =>
    item.id === train.id
      ? { ...item, seats: item.seats - count }
      : item
  );
  saveData(STORAGE.trains, updatedTrains);

  closeBooking();
  renderBookings();
  document.getElementById("pnrInput").value = pnr;
  displayPNR(booking);

  alert(
    `Demo booking created!\nPNR: ${pnr}\nStatus: ${status}\nTotal: ${money(total)}`
  );

  document.getElementById("bookings").scrollIntoView({ behavior: "smooth" });
});

function renderBookings() {
  const container = document.getElementById("bookingList");
  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <div class="booking-card">
        <p>Please log in to view your bookings.</p>
        <button class="btn btn-primary" onclick="showAuth('login')">Login</button>
      </div>`;
    return;
  }

  const bookings = getBookings().filter(item => item.userEmail === user.email);

  if (!bookings.length) {
    container.innerHTML = `
      <div class="booking-card">
        <p>No bookings yet. Search for a train to get started.</p>
      </div>`;
    return;
  }

  container.innerHTML = bookings.slice().reverse().map(booking => `
    <article class="booking-card">
      <div class="booking-top">
        <div>
          <h3>${escapeHTML(booking.trainName)}</h3>
          <span class="muted">PNR: ${escapeHTML(booking.pnr)}</span>
        </div>
        <span class="status ${statusClass(booking.status)}">${escapeHTML(booking.status)}</span>
      </div>

      <div class="route">
        <div>
          <strong>${escapeHTML(booking.departure)}</strong>
          <small>${escapeHTML(booking.from)}</small>
        </div>
        <div class="route-line"></div>
        <div>
          <strong>${escapeHTML(booking.arrival)}</strong>
          <small>${escapeHTML(booking.to)}</small>
        </div>
      </div>

      <p><b>Journey:</b> ${escapeHTML(booking.date)}</p>
      <p><b>Passenger:</b> ${escapeHTML(booking.passengerName)} (${booking.passengers} passenger(s))</p>
      <p><b>Class:</b> ${escapeHTML(booking.travelClass)}</p>
      <p><b>Fare:</b> ${money(booking.fare)}</p>
      <p><b>Payment:</b> ${escapeHTML(booking.paymentStatus)}</p>
      ${booking.status === "Cancelled"
        ? `<p><b>Demo refund:</b> ${money(booking.refund)}</p>`
        : ""}

      <div class="ticket-actions">
        <button class="btn btn-light" onclick="printTicket('${booking.pnr}')">Print Ticket</button>
        ${booking.status !== "Cancelled"
          ? `<button class="cancel-btn" onclick="cancelBooking('${booking.pnr}')">Cancel Booking</button>`
          : ""}
      </div>
      <div id="ticket-${booking.pnr}" class="ticket" hidden></div>
    </article>
  `).join("");
}

function statusClass(status) {
  if (status === "Cancelled") return "cancelled";
  if (status === "Waiting List" || status === "RAC") return "waiting";
  return "";
}

function displayPNR(booking) {
  const result = document.getElementById("pnrResult");
  result.innerHTML = `
    <div class="booking-card">
      <h3>PNR: ${escapeHTML(booking.pnr)}</h3>
      <p><b>Train:</b> ${escapeHTML(booking.trainName)} (${escapeHTML(booking.trainNumber)})</p>
      <p><b>Route:</b> ${escapeHTML(booking.from)} → ${escapeHTML(booking.to)}</p>
      <p><b>Date:</b> ${escapeHTML(booking.date)}</p>
      <p><b>Class:</b> ${escapeHTML(booking.travelClass)}</p>
      <p><b>Status:</b> <span class="status ${statusClass(booking.status)}">${escapeHTML(booking.status)}</span></p>
    </div>`;
}

document.getElementById("pnrForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const pnr = document.getElementById("pnrInput").value.trim();
  const booking = getBookings().find(item => item.pnr === pnr);

  if (!booking) {
    setMessage("pnrResult", "PNR not found in this browser's demo records.", true);
    return;
  }

  displayPNR(booking);
});

function cancelBooking(pnr) {
  const user = getCurrentUser();
  if (!user) return;

  const bookings = getBookings();
  const booking = bookings.find(item =>
    item.pnr === pnr && item.userEmail === user.email
  );

  if (!booking || booking.status === "Cancelled") return;

  if (!confirm(`Cancel booking ${pnr}? This will calculate a demo refund.`)) {
    return;
  }

  const journeyTime = new Date(booking.date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysBefore = Math.floor((journeyTime - today) / 86400000);

  // Example academic-project refund policy, not an official railway policy.
  let refundRate = 0;

  if (daysBefore >= 2) {
    refundRate = 0.80;
  } else if (daysBefore >= 1) {
    refundRate = 0.50;
  } else if (daysBefore === 0) {
    refundRate = 0.25;
  }

  booking.refund = booking.paymentStatus === "Pending"
    ? 0
    : Math.round(booking.fare * refundRate);
  booking.status = "Cancelled";
  booking.cancelledAt = new Date().toISOString();

  saveData(STORAGE.bookings, bookings);

  const trains = getTrains().map(train =>
    train.id === booking.trainId
      ? { ...train, seats: train.seats + booking.passengers }
      : train
  );
  saveData(STORAGE.trains, trains);

  renderBookings();
  alert(
    `Booking cancelled.\nDemo refund: ${money(booking.refund)}\n` +
    `Refund policy used: ${Math.round(refundRate * 100)}%.`
  );
}

function printTicket(pnr) {
  const user = getCurrentUser();
  const booking = getBookings().find(item =>
    item.pnr === pnr && user && item.userEmail === user.email
  );

  if (!booking) {
    alert("Ticket not found.");
    return;
  }

  const ticket = document.getElementById("ticket-" + pnr);

  ticket.innerHTML = `
    <h3>🚆 RailEase — Demo E-Ticket</h3>
    <p><b>PNR:</b> ${escapeHTML(booking.pnr)}</p>
    <p><b>Booking status:</b> ${escapeHTML(booking.status)}</p>
    <hr>
    <p><b>Train:</b> ${escapeHTML(booking.trainName)} (${escapeHTML(booking.trainNumber)})</p>
    <p><b>From:</b> ${escapeHTML(booking.from)} at ${escapeHTML(booking.departure)}</p>
    <p><b>To:</b> ${escapeHTML(booking.to)} at ${escapeHTML(booking.arrival)}</p>
    <p><b>Journey date:</b> ${escapeHTML(booking.date)}</p>
    <p><b>Class:</b> ${escapeHTML(booking.travelClass)}</p>
    <p><b>Passenger:</b> ${escapeHTML(booking.passengerName)}</p>
    <p><b>Age / Gender:</b> ${booking.passengerAge} / ${escapeHTML(booking.passengerGender)}</p>
    <p><b>Passengers:</b> ${booking.passengers}</p>
    <p><b>Fare:</b> ${money(booking.fare)}</p>
    <p><b>Payment:</b> ${escapeHTML(booking.paymentStatus)}</p>
    <hr>
    <p class="small-note">This is a student-project demonstration ticket. It is not valid for railway travel.</p>`;

  ticket.hidden = false;
  window.print();
  ticket.hidden = true;
}

function adminLogin() {
  const username = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value;

  if (username !== "admin" || password !== "admin123") {
    alert("Incorrect demo admin credentials.");
    return;
  }

  document.getElementById("adminDashboard").hidden = false;
  renderAdmin();
}

function renderAdmin() {
  const trains = getTrains();
  const bookings = getBookings();
  const confirmed = bookings.filter(item => item.status === "Confirmed").length;
  const cancelled = bookings.filter(item => item.status === "Cancelled").length;
  const revenue = bookings
    .filter(item => item.status !== "Cancelled")
    .reduce((sum, item) => sum + item.fare, 0);

  document.getElementById("adminStats").innerHTML = `
    <div class="stat-card"><span>Total trains</span><strong>${trains.length}</strong></div>
    <div class="stat-card"><span>Total bookings</span><strong>${bookings.length}</strong></div>
    <div class="stat-card"><span>Confirmed</span><strong>${confirmed}</strong></div>
    <div class="stat-card"><span>Cancelled</span><strong>${cancelled}</strong></div>
    <div class="stat-card"><span>Demo booking value</span><strong>${money(revenue)}</strong></div>`;

  document.getElementById("adminTrains").innerHTML = `
    <table>
      <thead><tr>
        <th>No.</th><th>Train</th><th>Route</th><th>Departure</th>
        <th>Arrival</th><th>Fare</th><th>Seats</th>
      </tr></thead>
      <tbody>
        ${trains.map(train => `
          <tr>
            <td>${escapeHTML(train.number)}</td>
            <td>${escapeHTML(train.name)}</td>
            <td>${escapeHTML(train.from)} → ${escapeHTML(train.to)}</td>
            <td>${escapeHTML(train.departure)}</td>
            <td>${escapeHTML(train.arrival)}</td>
            <td>${money(train.fare)}</td>
            <td>${train.seats}</td>
          </tr>`).join("")}
      </tbody>
    </table>`;

  document.getElementById("adminBookings").innerHTML = bookings.length ? `
    <table>
      <thead><tr>
        <th>PNR</th><th>Passenger</th><th>Train</th><th>Date</th>
        <th>Fare</th><th>Status</th><th>Payment</th>
      </tr></thead>
      <tbody>
        ${bookings.map(item => `
          <tr>
            <td>${escapeHTML(item.pnr)}</td>
            <td>${escapeHTML(item.passengerName)}</td>
            <td>${escapeHTML(item.trainName)}</td>
            <td>${escapeHTML(item.date)}</td>
            <td>${money(item.fare)}</td>
            <td>${escapeHTML(item.status)}</td>
            <td>${escapeHTML(item.paymentStatus)}</td>
          </tr>`).join("")}
      </tbody>
    </table>` : "<p>No bookings recorded.</p>";
}

document.getElementById("addTrainForm").addEventListener("submit", function(event) {
  event.preventDefault();

  if (document.getElementById("adminUser").value.trim() !== "admin" ||
      document.getElementById("adminPass").value !== "admin123" ||
      document.getElementById("adminDashboard").hidden === true) {
    alert("Open the admin dashboard first.");
    return;
  }

  const trains = getTrains();
  const number = document.getElementById("newNumber").value.trim();

  if (trains.some(train => train.number === number)) {
    alert("A train with that number already exists.");
    return;
  }

  const fare = Number(document.getElementById("newFare").value);

  if (fare <= 0) {
    alert("Fare must be greater than zero.");
    return;
  }

  trains.push({
    id: Date.now(),
    number,
    name: document.getElementById("newName").value.trim(),
    from: document.getElementById("newFrom").value.trim(),
    to: document.getElementById("newTo").value.trim(),
    departure: document.getElementById("newDeparture").value,
    arrival: document.getElementById("newArrival").value,
    fare,
    seats: 50
  });

  saveData(STORAGE.trains, trains);
  this.reset();
  renderAdmin();
  alert("Demo train added successfully.");
});

function exportReport() {
  const bookings = getBookings();

  if (!bookings.length) {
    alert("There are no bookings to export.");
    return;
  }

  const columns = [
    "PNR", "Passenger", "Email", "Train", "Train Number",
    "From", "To", "Journey Date", "Class", "Passengers",
    "Fare", "Status", "Payment Method", "Payment Status", "Refund"
  ];

  const rows = bookings.map(item => [
    item.pnr, item.passengerName, item.passengerEmail, item.trainName,
    item.trainNumber, item.from, item.to, item.date, item.travelClass,
    item.passengers, item.fare, item.status, item.paymentMethod,
    item.paymentStatus, item.refund
  ]);

  const csvCell = value =>
    '"' + String(value ?? "").replace(/"/g, '""') + '"';

  const csv = [columns, ...rows]
    .map(row => row.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "railease-booking-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// Close modal when the user clicks outside the card.
document.getElementById("authModal").addEventListener("click", function(event) {
  if (event.target === this) closeAuth();
});

document.getElementById("bookingModal").addEventListener("click", function(event) {
  if (event.target === this) closeBooking();
});

// Initialize the application.
setInitialData();
updateAuthUI();
renderBookings();

/* Interactive 3D tilt effect */
const tiltCards = ".train-card, .booking-card, .stat-card";

document.addEventListener("pointermove", function(event) {
  if (event.pointerType === "touch") return;

  const card = event.target.closest(tiltCards);
  if (!card) return;

  const rect = card.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  const rotateY = (x - 0.5) * 8;
  const rotateX = (0.5 - y) * 8;

  card.style.setProperty("--rx", rotateX + "deg");
  card.style.setProperty("--ry", rotateY + "deg");
});

document.addEventListener("pointerout", function(event) {
  const card = event.target.closest(tiltCards);
  if (!card) return;

  // Do not reset when moving between elements inside the same card.
  if (event.relatedTarget && card.contains(event.relatedTarget)) return;

  card.style.setProperty("--rx", "0deg");
  card.style.setProperty("--ry", "0deg");
});
