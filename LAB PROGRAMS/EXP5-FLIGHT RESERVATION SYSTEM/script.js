
const $ = id => document.getElementById(id);

const FLIGHTS_KEY = "skyglide_flights";
const BOOKINGS_KEY = "skyglide_bookings";
const FEEDBACK_KEY = "skyglide_feedback";

const sampleFlights = [
  {id:"SG101",airline:"SkyGlide Air",from:"Chennai",to:"Mumbai",depart:"07:15",arrive:"09:20",duration:"2h 05m",fare:4590,seats:18,tag:"BEST VALUE"},
  {id:"AS208",airline:"AeroSpark",from:"Chennai",to:"Mumbai",depart:"10:40",arrive:"12:50",duration:"2h 10m",fare:5290,seats:12,tag:"POPULAR"},
  {id:"NW315",airline:"Nova Wings",from:"Chennai",to:"Mumbai",depart:"18:25",arrive:"20:35",duration:"2h 10m",fare:4890,seats:7,tag:"EVENING"},
  {id:"SG220",airline:"SkyGlide Air",from:"Bengaluru",to:"Delhi",depart:"08:10",arrive:"11:00",duration:"2h 50m",fare:6390,seats:16,tag:"BEST VALUE"},
  {id:"AS122",airline:"AeroSpark",from:"Mumbai",to:"Delhi",depart:"13:30",arrive:"15:40",duration:"2h 10m",fare:5790,seats:9,tag:"POPULAR"},
  {id:"NW401",airline:"Nova Wings",from:"Hyderabad",to:"Kochi",depart:"16:20",arrive:"18:00",duration:"1h 40m",fare:4290,seats:14,tag:"QUICK TRIP"}
];

function readData(key, fallback) {
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

let flights = readData(FLIGHTS_KEY, sampleFlights);
let bookings = readData(BOOKINGS_KEY, []);
let feedback = readData(FEEDBACK_KEY, []);
let selectedFlight = null;
let pendingBooking = null;
let currentTicket = null;
let adminLoggedIn = false;

function money(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function openModal(id) {
  $(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  $(id).classList.add("hidden");

  if (!document.querySelector(".modal-backdrop:not(.hidden)")) {
    document.body.style.overflow = "";
  }
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.add("hidden");
  });

  $(page).classList.remove("hidden");

  if (page === "tickets") renderMyTickets();
  if (page === "admin" && adminLoggedIn) renderAdmin();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Set today's date as the earliest selectable date.
const today = new Date();
const dateString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

$("date").min = dateString;
$("date").value = dateString;

// Modal close buttons.
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeModal(backdrop.id);
  });
});

// Swap origin and destination.
$("swap").addEventListener("click", () => {
  const origin = $("from").value;
  $("from").value = $("to").value;
  $("to").value = origin;
});

// Calculate fare based on travel class.
function calculateFare(baseFare) {
  const travelClass = $("travelClass").value;

  if (travelClass === "Business") {
    return Math.round(baseFare * 2.65);
  }

  if (travelClass === "Premium Economy") {
    return Math.round(baseFare * 1.45);
  }

  return baseFare;
}

// Display available flight cards.
function renderFlights(list) {
  $("resultCount").textContent = list.length + " options";

  if (list.length === 0) {
    $("flightResults").innerHTML =
      '<div class="empty">☁<br>No flights found for this route. Try another city pair.</div>';
    return;
  }

  $("flightResults").innerHTML = list.map((flight, index) => `
    <article class="flight-card tilt-card">
      <div class="airline-row">
        <div class="airline-name">
          <span class="airline-logo">${safe(flight.airline.slice(0, 2).toUpperCase())}</span>
          ${safe(flight.airline)}
        </div>
        <span class="tag">${safe(flight.tag)}</span>
      </div>

      <div class="route">
        <div class="airport">
          <strong>${safe(flight.depart)}</strong>
          <span>${safe(flight.from)}</span>
        </div>

        <div class="route-middle">
          ${safe(flight.duration)}
          <div class="route-line">──── ✈ ────</div>
          NON-STOP
        </div>

        <div class="airport">
          <strong>${safe(flight.arrive)}</strong>
          <span>${safe(flight.to)}</span>
        </div>
      </div>

      <div class="meta">
        <span>📅 ${safe($("date").value)}</span>
        <span>💺 ${flight.seats} seats left</span>
        <span>${safe($("travelClass").value)}</span>
      </div>

      <div class="flight-bottom">
        <div class="fare">
          <small>FARE PER PERSON</small>
          <strong>${money(calculateFare(flight.fare))}</strong>
          <em>Sample fare</em>
        </div>
        <button class="primary book-btn"
          data-flight="${safe(flight.id)}"
          ${flight.seats < 1 ? "disabled" : ""}>
          Select ↗
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-flight]").forEach(button => {
    button.addEventListener("click", () => {
      startBooking(button.dataset.flight);
    });
  });

  addTiltEffects();
}

// Search flights.
$("searchForm").addEventListener("submit", event => {
  event.preventDefault();

  const origin = $("from").value;
  const destination = $("to").value;

  if (origin === destination) {
    notify("Choose two different cities.");
    return;
  }

  const matchingFlights = flights.filter(flight =>
    flight.from.toLowerCase() === origin.toLowerCase() &&
    flight.to.toLowerCase() === destination.toLowerCase() &&
    flight.seats > 0
  );

  renderFlights(matchingFlights);

  $("flightResults").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  if (matchingFlights.length === 0) {
    notify("No sample flights found. Try Chennai to Mumbai.");
  }
});

// Start booking.
function startBooking(flightId) {
  selectedFlight = flights.find(flight => flight.id === flightId);

  if (!selectedFlight) return;

  const passengerCount = Number($("passengers").value);

  if (selectedFlight.seats < passengerCount) {
    notify("Not enough sample seats for your passengers.");
    return;
  }

  $("selectedFlightSummary").innerHTML = `
    <div class="booking-summary">
      <b>${safe(selectedFlight.from)} → ${safe(selectedFlight.to)}</b><br>
      ${safe(selectedFlight.airline)} |
      ${safe(selectedFlight.depart)}–${safe(selectedFlight.arrive)}<br>
      Date: ${safe($("date").value)}<br>
      Class: ${safe($("travelClass").value)}<br>
      Passengers: ${passengerCount}<br>
      Total: <b>${money(calculateFare(selectedFlight.fare) * passengerCount)}</b>
    </div>
  `;

  $("passengerName").value = "";
  $("passengerEmail").value = "";
  $("passengerPhone").value = "";

  openModal("bookingModal");
}

// Passenger details form.
$("bookingForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!selectedFlight) return;

  const passengerCount = Number($("passengers").value);

  pendingBooking = {
    flightId: selectedFlight.id,
    flight: { ...selectedFlight },
    passenger: $("passengerName").value.trim(),
    email: $("passengerEmail").value.trim(),
    phone: $("passengerPhone").value.trim(),
    seat: $("seatPreference").value,
    date: $("date").value,
    travelClass: $("travelClass").value,
    passengers: passengerCount,
    fare: calculateFare(selectedFlight.fare) * passengerCount,
    status: "Confirmed"
  };

  $("paymentSummary").innerHTML = `
    <p>Flight: <b>${safe(selectedFlight.airline)}</b></p>
    <p>Route: ${safe(selectedFlight.from)} → ${safe(selectedFlight.to)}</p>
    <p>Passenger: ${safe(pendingBooking.passenger)}</p>
    <p>Travel date: ${safe(pendingBooking.date)}</p>
    <p>Travel class: ${safe(pendingBooking.travelClass)}</p>
    <h2>Total: ${money(pendingBooking.fare)}</h2>
  `;

  closeModal("bookingModal");
  openModal("paymentModal");
});

// Simulated payment and booking confirmation.
$("paymentForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!pendingBooking) return;

  const flight = flights.find(f => f.id === pendingBooking.flightId);

  if (!flight || flight.seats < pendingBooking.passengers) {
    closeModal("paymentModal");
    notify("Sample seats are no longer available.");
    return;
  }

  flight.seats -= pendingBooking.passengers;

  pendingBooking.paymentMethod = $("paymentMethod").value;
  pendingBooking.pnr =
    "SG" + Math.random().toString(36).slice(2, 8).toUpperCase();

  pendingBooking.createdAt = new Date().toISOString();

  bookings.unshift(pendingBooking);
  currentTicket = pendingBooking;

  saveData(FLIGHTS_KEY, flights);
  saveData(BOOKINGS_KEY, bookings);

  $("confirmationTicket").innerHTML = ticketMarkup(currentTicket);

  closeModal("paymentModal");
  openModal("confirmationModal");

  pendingBooking = null;

  renderFlights(flights.filter(f =>
    f.from === $("from").value &&
    f.to === $("to").value &&
    f.seats > 0
  ));
});

// Ticket details reusable in multiple pages.
function ticketMarkup(ticket) {
  return `
    <div class="ticket">
      <div>
        <h3>${safe(ticket.flight.airline)}</h3>
        <p>
          <b>${safe(ticket.flight.from)} → ${safe(ticket.flight.to)}</b><br>
          Passenger: ${safe(ticket.passenger)}<br>
          Date: ${safe(ticket.date)}<br>
          Departure: ${safe(ticket.flight.depart)} |
          Arrival: ${safe(ticket.flight.arrive)}<br>
          Class: ${safe(ticket.travelClass)}<br>
          Seat preference: ${safe(ticket.seat)}<br>
          PNR: <b>${safe(ticket.pnr)}</b><br>
          Status: <b>${safe(ticket.status)}</b><br>
          Total: ${money(ticket.fare)}
        </p>
      </div>
    </div>
  `;
}

// My Tickets page.
function renderMyTickets() {
  if (bookings.length === 0) {
    $("myTickets").innerHTML =
      '<div class="empty">✈<br>No bookings yet. Search for a flight to get started.</div>';
    return;
  }

  $("myTickets").innerHTML = bookings.map(ticket => `
    <article class="ticket">
      <div>
        <h3>${safe(ticket.flight.airline)}
          <span style="color:${ticket.status === "Confirmed" ? "#249579" : "#d44"}">
            ● ${safe(ticket.status)}
          </span>
        </h3>
        <p>
          <b>${safe(ticket.flight.from)} → ${safe(ticket.flight.to)}</b><br>
          Date: ${safe(ticket.date)}<br>
          Passenger: ${safe(ticket.passenger)}<br>
          PNR: <b>${safe(ticket.pnr)}</b><br>
          ${safe(ticket.travelClass)} | ${ticket.passengers} passenger(s)<br>
          Fare: ${money(ticket.fare)}
        </p>
      </div>

      <div class="ticket-actions">
        <button class="secondary" data-print="${safe(ticket.pnr)}">Print Ticket</button>
        ${ticket.status === "Confirmed"
          ? `<button class="primary" data-cancel="${safe(ticket.pnr)}">Cancel Ticket</button>`
          : ""}
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-print]").forEach(button => {
    button.addEventListener("click", () => {
      const ticket = bookings.find(t => t.pnr === button.dataset.print);
      if (ticket) printTicket(ticket);
    });
  });

  document.querySelectorAll("[data-cancel]").forEach(button => {
    button.addEventListener("click", () => {
      cancelTicket(button.dataset.cancel);
    });
  });
}

// Cancel ticket and restore demo seat inventory.
function cancelTicket(pnr) {
  const ticket = bookings.find(t => t.pnr === pnr);

  if (!ticket || ticket.status !== "Confirmed") return;

  const confirmed = confirm(
    "Cancel this demo booking? No real payment or refund is involved."
  );

  if (!confirmed) return;

  ticket.status = "Cancelled";

  const flight = flights.find(f => f.id === ticket.flightId);

  if (flight) flight.seats += ticket.passengers;

  saveData(FLIGHTS_KEY, flights);
  saveData(BOOKINGS_KEY, bookings);

  renderMyTickets();

  if (adminLoggedIn) renderAdmin();

  notify("Demo ticket cancelled successfully.");
}

// Search booking by PNR.
$("statusForm").addEventListener("submit", event => {
  event.preventDefault();

  const pnr = $("pnrInput").value.trim().toUpperCase();
  const ticket = bookings.find(t => t.pnr === pnr);

  if (!ticket) {
    $("statusResult").innerHTML =
      '<div class="status-box">No booking found. Check the PNR and try again.</div>';
    return;
  }

  $("statusResult").innerHTML = `
    <div class="status-box">
      <h2>Booking Details</h2>
      ${ticketMarkup(ticket)}
    </div>
  `;
});

// Customer feedback form.
$("feedbackForm").addEventListener("submit", event => {
  event.preventDefault();

  feedback.unshift({
    name: $("feedbackName").value.trim(),
    rating: $("rating").value,
    comments: $("comments").value.trim(),
    date: new Date().toISOString()
  });

  saveData(FEEDBACK_KEY, feedback);

  $("feedbackForm").reset();

  $("feedbackResult").innerHTML =
    '<div class="status-box">Thank you! Your feedback was saved in this browser.</div>';

  notify("Feedback submitted successfully.");
});

// Admin login.
$("adminLoginBtn").addEventListener("click", () => {
  const username = $("adminUser").value;
  const password = $("adminPass").value;

  if (username === "admin" && password === "admin123") {
    adminLoggedIn = true;
    $("adminLogin").classList.add("hidden");
    $("adminDashboard").classList.remove("hidden");
    renderAdmin();
    notify("Admin panel opened.");
  } else {
    notify("Incorrect demo admin username or password.");
  }
});

// Demo forgot-password page.
$("forgotBtn").addEventListener("click", () => {
  openModal("forgotModal");
});

// Admin dashboard and report.
function renderAdmin() {
  const confirmed = bookings.filter(t => t.status === "Confirmed").length;
  const cancelled = bookings.filter(t => t.status === "Cancelled").length;

  $("adminStats").innerHTML = `
    <div class="stat-card tilt-card">
      <span>Total Bookings</span>
      <strong>${bookings.length}</strong>
    </div>
    <div class="stat-card tilt-card">
      <span>Confirmed Tickets</span>
      <strong>${confirmed}</strong>
    </div>
    <div class="stat-card tilt-card">
      <span>Cancelled Tickets</span>
      <strong>${cancelled}</strong>
    </div>
  `;

  $("adminBookings").innerHTML = bookings.length
    ? bookings.map(ticket => `
      <div style="padding:12px 0;border-bottom:1px solid #eee7f7;font-size:12px;line-height:1.8">
        <b>${safe(ticket.pnr)}</b> — ${safe(ticket.passenger)}<br>
        ${safe(ticket.flight.from)} → ${safe(ticket.flight.to)} |
        ${safe(ticket.status)} | ${money(ticket.fare)}
      </div>
    `).join("")
    : '<p class="subtext">No reservations have been created.</p>';

  addTiltEffects();
}

// Add new flight from admin page.
$("addFlightForm").addEventListener("submit", event => {
  event.preventDefault();

  const from = $("newFrom").value.trim();
  const to = $("newTo").value.trim();

  if (from.toLowerCase() === to.toLowerCase()) {
    notify("Origin and destination must differ.");
    return;
  }

  const flight = {
    id: "ADM" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    airline: $("newAirline").value.trim(),
    from,
    to,
    depart: $("newDepart").value.trim(),
    arrive: $("newArrive").value.trim(),
    duration: "Scheduled",
    fare: Number($("newFare").value),
    seats: 20,
    tag: "NEW FLIGHT"
  };

  flights.push(flight);
  saveData(FLIGHTS_KEY, flights);

  $("addFlightForm").reset();
  renderAdmin();
  notify("New sample flight added.");
});

// Export report to CSV.
$("exportBtn").addEventListener("click", () => {
  const rows = [
    ["PNR", "Passenger", "Email", "From", "To", "Date", "Class", "Passengers", "Fare", "Status"],
    ...bookings.map(t => [
      t.pnr, t.passenger, t.email, t.flight.from, t.flight.to,
      t.date, t.travelClass, t.passengers, t.fare, t.status
    ])
  ];

  const csv = rows.map(row =>
    row.map(value =>
      '"' + String(value ?? "").replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "skyglide-booking-report.csv";
  link.click();

  URL.revokeObjectURL(url);
  notify("Booking report downloaded.");
});

// Print a demo e-ticket.
function printTicket(ticket) {
  const printWindow = window.open("", "_blank", "width=800,height=700");

  if (!printWindow) {
    notify("Allow pop-ups to print the ticket.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SkyGlide Ticket</title>
      <style>
        body {font-family:Arial,sans-serif;padding:35px;color:#211344}
        .ticket {max-width:650px;margin:auto;border:2px solid #7545f5;
          border-radius:20px;padding:28px}
        h1 {color:#7545f5}
        .row {padding:12px 0;border-bottom:1px solid #ddd}
        small {color:#777}
      </style>
    </head>
    <body>
      <div class="ticket">
        <h1>✈ SkyGlide</h1>
        <small>DEMO E-TICKET — NOT VALID FOR TRAVEL</small>
        <h2>${safe(ticket.flight.from)} → ${safe(ticket.flight.to)}</h2>
        <div class="row">Passenger: <b>${safe(ticket.passenger)}</b></div>
        <div class="row">Airline: ${safe(ticket.flight.airline)}</div>
        <div class="row">Flight ID: ${safe(ticket.flightId)}</div>
        <div class="row">Date: ${safe(ticket.date)}</div>
        <div class="row">Departure: ${safe(ticket.flight.depart)}</div>
        <div class="row">Arrival: ${safe(ticket.flight.arrive)}</div>
        <div class="row">PNR: <b>${safe(ticket.pnr)}</b></div>
        <div class="row">Status: ${safe(ticket.status)}</div>
        <div class="row">Class: ${safe(ticket.travelClass)}</div>
        <div class="row">Total: ${money(ticket.fare)}</div>
        <p>This is a student project demo. No real flight reservation or payment has occurred.</p>
      </div>
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

$("printTicketBtn").addEventListener("click", () => {
  if (currentTicket) printTicket(currentTicket);
});

$("goTicketsBtn").addEventListener("click", () => {
  closeModal("confirmationModal");
  showPage("tickets");
});

// 3D tilt effect for flight and dashboard cards.
function addTiltEffects() {
  document.querySelectorAll(".flight-card, .tilt-card").forEach(card => {
    if (card.dataset.tiltReady) return;

    card.dataset.tiltReady = "true";

    card.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateX = (0.5 - y) * 8;
      const rotateY = (x - 0.5) * 9;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform =
        "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
}

// Initial page display.
renderFlights(
  flights.filter(f => f.from === $("from").value && f.to === $("to").value)
);
