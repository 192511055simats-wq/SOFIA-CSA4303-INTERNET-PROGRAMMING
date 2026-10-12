// GLAMORA - ONLINE BEAUTY PARLOUR BOOKING SYSTEM

const services = [
    {
        id: 1, name: "Signature Haircut", category: "Hair",
        price: 500, duration: 45, tag: "Popular",
        description: "A fresh cut and a style that feels completely you.",
        image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2, name: "Hair Spa Ritual", category: "Hair",
        price: 900, duration: 60, tag: "Self-care",
        description: "A nourishing treatment for soft, glossy hair.",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3, name: "Glow Facial", category: "Skin",
        price: 800, duration: 50, tag: "Glow-up",
        description: "A refreshing facial for a radiant, happy glow.",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4, name: "Classic Manicure", category: "Nails",
        price: 400, duration: 40, tag: "Favourite",
        description: "Nail shaping, cuticle care, and a pretty polish.",
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5, name: "Party Makeup", category: "Makeup",
        price: 1800, duration: 75, tag: "Special occasion",
        description: "A polished party look made for your big moment.",
        image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6, name: "Relaxing Head Spa", category: "Spa",
        price: 1100, duration: 60, tag: "Relax",
        description: "Unwind with a calming scalp and head treatment.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 7, name: "Nail Art", category: "Nails",
        price: 700, duration: 55, tag: "Creative",
        description: "A little colour, a little sparkle, all your style.",
        image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 8, name: "Bridal Makeup", category: "Makeup",
        price: 4500, duration: 120, tag: "Premium",
        description: "A special bridal look for your once-in-a-lifetime day.",
        image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 9, name: "Hair Styling", category: "Hair",
        price: 650, duration: 45, tag: "Chic",
        description: "Beautiful styling for a dinner, event, or just because.",
        image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
    }
];

const stylists = [
    {
        id: 1, name: "Ananya Rao", specialty: "Hair Artist",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2, name: "Meera Joseph", specialty: "Skin Specialist",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3, name: "Kiara Sharma", specialty: "Makeup Artist",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4, name: "Diya Menon", specialty: "Nail Artist",
        rating: "★★★★★",
        image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80"
    }
];

const TIME_SLOTS = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
];

let currentUser = null;
let authMode = "login";
let calendarDate = new Date();
let selectedCalendarDate = "";
let managerActive = false;

// ---------- STORAGE HELPERS ----------

function readData(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data === null ? fallback : data;
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    return readData("glamoraUsers", []);
}

function getBookings() {
    return readData("glamoraBookings", []);
}

function getBlockedSlots() {
    return readData("glamoraBlockedSlots", []);
}

function getFeedback() {
    return readData("glamoraFeedback", []);
}

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function dateToday() {
    const date = new Date();
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString + "T12:00:00").toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "short", year: "numeric" }
    );
}

function formatTime(time) {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function notify(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) modal.classList.remove("show");
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal.show").forEach(modal =>
            modal.classList.remove("show")
        );
    }
});

// ---------- SERVICES ----------

function renderServices() {
    const query = document.getElementById("serviceSearch").value
        .trim().toLowerCase();
    const category = document.getElementById("serviceCategory").value;
    const sort = document.getElementById("serviceSort").value;

    let filtered = services.filter(service =>
        (service.name + " " + service.category + " " + service.description)
            .toLowerCase().includes(query) &&
        (category === "All" || service.category === category)
    );

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);

    const grid = document.getElementById("serviceGrid");

    if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            No services found. Try another search 💗
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map((service, index) => `
        <article class="service-card" style="animation-delay:${index * 55}ms">
            <div class="service-image">
                <img src="${service.image}" alt="${escapeHTML(service.name)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='https://placehold.co/700x450/ffe5ef/81466b?text=Glamora'">
                <span class="service-tag">${escapeHTML(service.tag)}</span>
            </div>
            <div class="service-info">
                <span class="service-category">${escapeHTML(service.category)}</span>
                <h3>${escapeHTML(service.name)}</h3>
                <p>${escapeHTML(service.description)}</p>
                <div class="service-bottom">
                    <div class="service-price">
                        ${money(service.price)}
                        <small>${service.duration} minutes</small>
                    </div>
                    <button class="btn-primary" onclick="selectService(${service.id})">
                        Book now ↗
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function renderStylists() {
    document.getElementById("stylistGrid").innerHTML = stylists.map(stylist => `
        <article class="stylist-card">
            <img src="${stylist.image}" alt="${escapeHTML(stylist.name)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://placehold.co/500x400/f8ddec/81466b?text=Stylist'">
            <h3>${escapeHTML(stylist.name)}</h3>
            <p>${escapeHTML(stylist.specialty)}</p>
            <div class="stylist-rating">${stylist.rating}</div>
            <button class="btn-light" onclick="selectStylist(${stylist.id})">
                Choose stylist
            </button>
        </article>
    `).join("");
}

function populateBookingOptions() {
    const serviceSelect = document.getElementById("bookingService");
    const stylistSelect = document.getElementById("bookingStylist");

    serviceSelect.innerHTML = services.map(service => `
        <option value="${service.id}">
            ${escapeHTML(service.name)} — ${money(service.price)}
        </option>
    `).join("");

    stylistSelect.innerHTML = stylists.map(stylist => `
        <option value="${stylist.id}">
            ${escapeHTML(stylist.name)} — ${escapeHTML(stylist.specialty)}
        </option>
    `).join("");

    serviceSelect.addEventListener("change", () => {
        updateBookingSummary();
        updateAvailableTimes();
    });

    stylistSelect.addEventListener("change", updateAvailableTimes);
}

function selectService(id) {
    document.getElementById("bookingService").value = String(id);
    updateBookingSummary();
    updateAvailableTimes();
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function selectStylist(id) {
    document.getElementById("bookingStylist").value = String(id);
    updateAvailableTimes();
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function goToBooking() {
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function selectedService() {
    return services.find(service =>
        service.id === Number(document.getElementById("bookingService").value)
    );
}

function selectedStylist() {
    return stylists.find(stylist =>
        stylist.id === Number(document.getElementById("bookingStylist").value)
    );
}

function updateBookingSummary() {
    const service = selectedService();
    const payment = document.querySelector('input[name="payment"]:checked')?.value;
    if (!service) return;

    const amount = payment === "deposit"
        ? Math.ceil(service.price * 0.3)
        : service.price;

    document.getElementById("bookingSummary").innerHTML = `
        <strong>${escapeHTML(service.name)}</strong><br>
        Duration: ${service.duration} minutes<br>
        Service price: ${money(service.price)}<br>
        ${payment === "deposit" ? "30% deposit due now" : "Full payment due"}:
        <strong>${money(amount)}</strong>
    `;
}

document.querySelectorAll('input[name="payment"]').forEach(input => {
    input.addEventListener("change", updateBookingSummary);
});

// ---------- APPOINTMENT AVAILABILITY ----------

function isSlotBlocked(date, time) {
    return getBlockedSlots().some(slot =>
        slot.date === date && slot.time === time
    );
}

function isSlotBooked(date, time, stylistId, ignoreId = null) {
    return getBookings().some(booking =>
        booking.date === date &&
        booking.time === time &&
        Number(booking.stylistId) === Number(stylistId) &&
        booking.status !== "Cancelled" &&
        booking.id !== ignoreId
    );
}

function updateAvailableTimes() {
    const date = document.getElementById("bookingDate").value;
    const stylistId = document.getElementById("bookingStylist").value;
    const select = document.getElementById("bookingTime");

    if (!date) {
        select.innerHTML = `<option value="">Select a date first</option>`;
        return;
    }

    const available = TIME_SLOTS.filter(time =>
        !isSlotBlocked(date, time) &&
        !isSlotBooked(date, time, stylistId)
    );

    if (!available.length) {
        select.innerHTML = `<option value="">No available slots</option>`;
        return;
    }

    select.innerHTML = `<option value="">Choose a time</option>` +
        available.map(time => `
            <option value="${time}">${formatTime(time)}</option>
        `).join("");
}

document.getElementById("bookingDate").min = dateToday();
document.getElementById("bookingDate").value = dateToday();
document.getElementById("bookingDate").addEventListener("change", () => {
    updateAvailableTimes();
    renderCalendar();
});

// ---------- LOGIN AND REGISTRATION ----------

function openLogin() {
    authMode = "login";
    updateAuthMode();
    document.getElementById("authMessage").textContent = "";
    openModal("authModal");
}

function toggleAuth() {
    authMode = authMode === "login" ? "register" : "login";
    updateAuthMode();
}

function updateAuthMode() {
    const registering = authMode === "register";
    const name = document.getElementById("authName");

    name.classList.toggle("hidden", !registering);
    name.required = registering;

    document.getElementById("authTitle").textContent =
        registering ? "Create your account" : "Welcome, lovely!";

    document.getElementById("authSubmit").textContent =
        registering ? "Create Account" : "Login";

    document.getElementById("authSwitchText").textContent =
        registering ? "Already have an account?" : "New here?";

    document.getElementById("authSwitch").textContent =
        registering ? "Login" : "Create account";
}

document.getElementById("authForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("authName").value.trim();
    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const message = document.getElementById("authMessage");
    const users = getUsers();

    if (authMode === "register") {
        if (users.some(user => user.email === email)) {
            message.textContent = "This email is already registered.";
            return;
        }

        // Demo only: never store plain-text passwords in a real application.
        users.push({ name, email, password });
        saveData("glamoraUsers", users);

        currentUser = { name, email };
        saveData("glamoraSession", currentUser);
        finishLogin();
        notify("Welcome to Glamora, " + name + "! 💗");
        return;
    }

    const user = users.find(item =>
        item.email === email && item.password === password
    );

    if (!user) {
        message.textContent = "Incorrect email or password.";
        return;
    }

    currentUser = { name: user.name, email: user.email };
    saveData("glamoraSession", currentUser);
    finishLogin();
    notify("Welcome back, " + user.name + "! ✨");
});

function finishLogin() {
    closeModal("authModal");
    renderAccount();
    renderAppointments();
    renderCalendar();
    renderManagerReservations();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("glamoraSession");
    renderAccount();
    renderAppointments();
    notify("You have logged out.");
}

// ---------- CREATE APPOINTMENT ----------

document.getElementById("bookingForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser) {
        notify("Please log in before booking.");
        openLogin();
        return;
    }

    const service = selectedService();
    const stylist = selectedStylist();
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;
    const paymentType = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    if (!service || !stylist || !date || !time) {
        notify("Please complete all appointment details.");
        return;
    }

    if (date < dateToday()) {
        notify("Please choose today or a future date.");
        return;
    }

    if (isSlotBlocked(date, time) ||
        isSlotBooked(date, time, stylist.id)) {
        notify("That time is no longer available. Please choose another.");
        updateAvailableTimes();
        return;
    }

    const amountDue = paymentType === "deposit"
        ? Math.ceil(service.price * 0.3)
        : service.price;

    const booking = {
        id: "GL" + Date.now().toString().slice(-8),
        userEmail: currentUser.email,
        customerName: currentUser.name,
        serviceId: service.id,
        serviceName: service.name,
        stylistId: stylist.id,
        stylistName: stylist.name,
        date,
        time,
        price: service.price,
        paymentType,
        amountDue,
        paymentStatus: "Demo payment pending",
        status: "Confirmed",
        createdAt: new Date().toISOString()
    };

    const bookings = getBookings();
    bookings.unshift(booking);
    saveData("glamoraBookings", bookings);

    renderAppointments();
    renderCalendar();
    renderManagerReservations();
    updateAvailableTimes();

    notify(`Appointment created! Booking ID: ${booking.id} 💗`);

    document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" });
});

// ---------- CUSTOMER DASHBOARD ----------

function renderAccount() {
    const panel = document.getElementById("accountPanel");

    if (!currentUser) {
        panel.innerHTML = `
            <div class="empty-state">
                💌 Log in to see your personal account and appointments.
                <br><br>
                <button class="btn-primary" onclick="openLogin()">Login / Register</button>
            </div>`;
        return;
    }

    panel.innerHTML = `
        <div class="account-card">
            <div>
                <strong>Welcome, ${escapeHTML(currentUser.name)}! 🌷</strong>
                <p>${escapeHTML(currentUser.email)}</p>
            </div>
            <button class="btn-light" onclick="logout()">Log out</button>
        </div>
    `;
}

function renderAppointments() {
    const container = document.getElementById("appointmentList");

    if (!currentUser) {
        container.innerHTML = "";
        return;
    }

    const bookings = getBookings().filter(booking =>
        booking.userEmail === currentUser.email
    );

    if (!bookings.length) {
        container.innerHTML = `
            <div class="empty-state">
                No appointments yet. Your next self-care moment is waiting! ✨
            </div>`;
        return;
    }

    const sorted = bookings.sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
    );

    container.innerHTML = sorted.map(booking => {
        const cancelled = booking.status === "Cancelled";
        const upcoming = booking.date >= dateToday() && !cancelled;

        return `
            <article class="appointment-card">
                <div>
                    <h3>${escapeHTML(booking.serviceName)}</h3>
                    <p>Booking ID: ${escapeHTML(booking.id)}</p>
                    <p>📅 ${formatDate(booking.date)} · ${formatTime(booking.time)}</p>
                    <p>💄 Stylist: ${escapeHTML(booking.stylistName)}</p>
                    <p>Payment: ${escapeHTML(booking.paymentStatus)}</p>
                    <span class="status ${cancelled ? "cancelled" : ""}">
                        ${escapeHTML(booking.status)}
                    </span>
                    <div class="appointment-actions">
                        ${upcoming ? `
                            <button class="small-btn"
                                onclick="openReschedule('${escapeHTML(booking.id)}')">
                                Reschedule
                            </button>
                            <button class="small-btn danger"
                                onclick="cancelBooking('${escapeHTML(booking.id)}')">
                                Cancel
                            </button>
                            <button class="small-btn"
                                onclick="demoPay('${escapeHTML(booking.id)}')">
                                Demo Payment
                            </button>
                        ` : ""}
                    </div>
                </div>
                <div class="appointment-price">${money(booking.price)}</div>
            </article>
        `;
    }).join("");
}

function cancelBooking(id) {
    if (!currentUser) return;

    const bookings = getBookings();
    const booking = bookings.find(item =>
        item.id === id && item.userEmail === currentUser.email
    );

    if (!booking || booking.status === "Cancelled") return;

    if (!confirm("Cancel this appointment?")) return;

    booking.status = "Cancelled";
    saveData("glamoraBookings", bookings);

    renderAppointments();
    renderCalendar();
    renderManagerReservations();
    updateAvailableTimes();

    notify("Your appointment has been cancelled.");
}

// ---------- RESCHEDULE APPOINTMENT ----------

function openReschedule(id) {
    const booking = getBookings().find(item =>
        item.id === id && item.userEmail === currentUser?.email
    );

    if (!booking) return;

    document.getElementById("editBookingId").value = id;
    document.getElementById("editDate").min = dateToday();
    document.getElementById("editDate").value = booking.date;

    updateEditTimes(booking.date, booking.stylistId, booking.id);
    document.getElementById("editTime").value = booking.time;

    openModal("editModal");
}

function updateEditTimes(date, stylistId, ignoreId) {
    const select = document.getElementById("editTime");

    const available = TIME_SLOTS.filter(time =>
        !isSlotBlocked(date, time) &&
        !isSlotBooked(date, time, stylistId, ignoreId)
    );

    select.innerHTML = available.map(time => `
        <option value="${time}">${formatTime(time)}</option>
    `).join("");

    if (!available.length) {
        select.innerHTML = `<option value="">No available slots</option>`;
    }
}

document.getElementById("editDate").addEventListener("change", () => {
    const id = document.getElementById("editBookingId").value;
    const booking = getBookings().find(item => item.id === id);
    if (booking) {
        updateEditTimes(
            document.getElementById("editDate").value,
            booking.stylistId,
            booking.id
        );
    }
});

document.getElementById("editForm").addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("editBookingId").value;
    const date = document.getElementById("editDate").value;
    const time = document.getElementById("editTime").value;

    const bookings = getBookings();
    const booking = bookings.find(item =>
        item.id === id && item.userEmail === currentUser?.email
    );

    if (!booking || !date || !time) {
        notify("Choose a valid date and time.");
        return;
    }

    if (date < dateToday() ||
        isSlotBlocked(date, time) ||
        isSlotBooked(date, time, booking.stylistId, booking.id)) {
        notify("That slot is unavailable. Please choose another.");
        return;
    }

    booking.date = date;
    booking.time = time;
    saveData("glamoraBookings", bookings);

    closeModal("editModal");
    renderAppointments();
    renderCalendar();
    renderManagerReservations();
    updateAvailableTimes();

    notify("Appointment rescheduled successfully!");
});

// ---------- DEMO PAYMENT ----------

function demoPay(id) {
    if (!currentUser) return;

    const bookings = getBookings();
    const booking = bookings.find(item =>
        item.id === id && item.userEmail === currentUser.email
    );

    if (!booking) return;

    if (booking.paymentStatus === "Paid") {
        notify("This demo appointment is already marked as paid.");
        return;
    }

    const confirmed = confirm(
        `Demo payment of ${money(booking.amountDue)} for ${booking.serviceName}?\n\n` +
        "This does not charge a real card or account."
    );

    if (!confirmed) return;

    booking.paymentStatus = "Paid";
    saveData("glamoraBookings", bookings);

    renderAppointments();
    renderManagerReservations();
    notify("Demo payment marked as successful! 💗");
}

// ---------- RESERVATION CALENDAR ----------

function changeMonth(direction) {
    calendarDate.setMonth(calendarDate.getMonth() + direction);
    renderCalendar();
}

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    document.getElementById("calendarMonth").textContent =
        calendarDate.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });

    const grid = document.getElementById("calendarGrid");
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let html = dayLabels.map(day =>
        `<div class="calendar-day-label">${day}</div>`
    ).join("");

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = [
            year,
            String(month + 1).padStart(2, "0"),
            String(day).padStart(2, "0")
        ].join("-");

        const bookings = getBookings().filter(booking =>
            booking.date === date && booking.status !== "Cancelled"
        );

        const blocks = getBlockedSlots().filter(slot => slot.date === date);
        const isToday = date === dateToday();
        const selected = date === selectedCalendarDate;

        html += `
            <button class="calendar-day ${isToday ? "today" : ""} ${selected ? "selected" : ""}"
                onclick="selectCalendarDate('${date}')">
                <span class="day-number">${day}</span>
                <span class="day-markers">
                    ${bookings.length ? '<i class="booked"></i>' : ""}
                    ${blocks.length ? '<i class="blocked"></i>' : ""}
                </span>
            </button>
        `;
    }

    grid.innerHTML = html;
}

function selectCalendarDate(date) {
    selectedCalendarDate = date;
    renderCalendar();

    const bookings = getBookings().filter(booking =>
        booking.date === date && booking.status !== "Cancelled"
    );

    const blocks = getBlockedSlots().filter(slot => slot.date === date);

    let html = `<strong>${formatDate(date)}</strong><br>`;

    if (!bookings.length && !blocks.length) {
        html += "No reservations or blocked slots. This date is currently clear.";
    }

    if (bookings.length) {
        html += "<br><strong>Appointments</strong><br>";
        html += bookings.map(booking =>
            `${formatTime(booking.time)} — ${escapeHTML(booking.serviceName)} ` +
            `with ${escapeHTML(booking.stylistName)}`
        ).join("<br>");
    }

    if (blocks.length) {
        html += "<br><strong>Unavailable slots</strong><br>";
        html += blocks.map(slot => formatTime(slot.time)).join(", ");
    }

    document.getElementById("dateDetails").innerHTML = html;
}

// ---------- MANAGER PANEL ----------

function managerSignIn() {
    const pin = prompt("Enter demo manager PIN (2468):");

    if (pin !== "2468") {
        notify("Incorrect manager PIN.");
        return;
    }

    managerActive = true;
    document.getElementById("managerLogin").classList.add("hidden");
    document.getElementById("managerPanel").classList.remove("hidden");

    document.getElementById("managerDate").min = dateToday();
    document.getElementById("managerDate").value = dateToday();

    document.getElementById("blockTime").innerHTML = TIME_SLOTS.map(time =>
        `<option value="${time}">${formatTime(time)}</option>`
    ).join("");

    renderManagerReservations();
}

function managerSignOut() {
    managerActive = false;
    document.getElementById("managerLogin").classList.remove("hidden");
    document.getElementById("managerPanel").classList.add("hidden");
}

function blockSlot() {
    if (!managerActive) return;

    const date = document.getElementById("managerDate").value;
    const time = document.getElementById("blockTime").value;

    if (!date || date < dateToday()) {
        notify("Choose today or a future date.");
        return;
    }

    if (isSlotBooked(date, time, -1)) {
        notify("This time has a reservation. Review it before blocking.");
        return;
    }

    const blocked = getBlockedSlots();

    if (blocked.some(slot => slot.date === date && slot.time === time)) {
        notify("This time is already blocked.");
        return;
    }

    blocked.push({ date, time });
    saveData("glamoraBlockedSlots", blocked);

    renderCalendar();
    renderManagerReservations();
    updateAvailableTimes();

    notify(`${formatDate(date)} at ${formatTime(time)} is now blocked.`);
}

function renderManagerReservations() {
    if (!managerActive) return;

    const date = document.getElementById("managerDate").value || dateToday();
    const bookings = getBookings().filter(booking => booking.date === date);
    const blocked = getBlockedSlots().filter(slot => slot.date === date);

    const container = document.getElementById("managerReservations");

    let html = `<h3>Reservations for ${formatDate(date)}</h3>`;

    if (!bookings.length && !blocked.length) {
        html += `<div class="empty-state">No reservations or blocked slots for this date.</div>`;
    }

    html += bookings.map(booking => `
        <div class="manager-row">
            <div>
                <strong>${formatTime(booking.time)} · ${escapeHTML(booking.serviceName)}</strong>
                <p>${escapeHTML(booking.customerName)} · ${escapeHTML(booking.stylistName)}</p>
                <p>${escapeHTML(booking.userEmail)} · ${escapeHTML(booking.status)}</p>
                <p>${money(booking.price)} · ${escapeHTML(booking.paymentStatus)}</p>
            </div>
            <div>
                <a href="tel:" onclick="return callCustomer('${escapeHTML(booking.id)}')">
                    📞 Call customer
                </a>
                <br><br>
                <button class="small-btn danger"
                    onclick="managerCancel('${escapeHTML(booking.id)}')">
                    Cancel booking
                </button>
            </div>
        </div>
    `).join("");

    html += blocked.map(slot => `
        <div class="manager-row">
            <div>
                <strong>${formatTime(slot.time)} · Unavailable</strong>
                <p>This time slot is blocked by the salon.</p>
            </div>
            <button class="small-btn"
                onclick="unblockSlot('${slot.date}','${slot.time}')">
                Unblock
            </button>
        </div>
    `).join("");

    container.innerHTML = html;
}

document.getElementById("managerDate").addEventListener("change", () => {
    renderManagerReservations();
});

function managerCancel(id) {
    if (!managerActive) return;

    const bookings = getBookings();
    const booking = bookings.find(item => item.id === id);

    if (!booking || booking.status === "Cancelled") return;

    if (!confirm("Cancel this customer reservation?")) return;

    booking.status = "Cancelled";
    saveData("glamoraBookings", bookings);

    renderManagerReservations();
    renderAppointments();
    renderCalendar();
    updateAvailableTimes();

    notify("Reservation cancelled by manager.");
}

function unblockSlot(date, time) {
    if (!managerActive) return;

    const blocked = getBlockedSlots().filter(slot =>
        !(slot.date === date && slot.time === time)
    );

    saveData("glamoraBlockedSlots", blocked);
    renderManagerReservations();
    renderCalendar();
    updateAvailableTimes();

    notify("Time slot is available again.");
}

function callCustomer(id) {
    const booking = getBookings().find(item => item.id === id);
    if (!booking) return false;

    // A real phone number must be collected and handled securely in production.
    alert(
        "Customer: " + booking.customerName +
        "\nEmail: " + booking.userEmail +
        "\n\nPhone numbers are not collected in this demo."
    );

    return false;
}

// ---------- CUSTOMER FEEDBACK ----------

document.getElementById("feedbackForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser) {
        notify("Please log in to submit feedback.");
        openLogin();
        return;
    }

    const rating = Number(document.getElementById("feedbackRating").value);
    const comment = document.getElementById("feedbackText").value.trim();

    if (!comment) {
        notify("Please enter your feedback.");
        return;
    }

    const feedback = getFeedback();

    feedback.unshift({
        name: currentUser.name,
        email: currentUser.email,
        rating,
        comment,
        date: new Date().toLocaleDateString()
    });

    saveData("glamoraFeedback", feedback);
    document.getElementById("feedbackForm").reset();

    notify("Thank you for sharing your experience! 💌");
});

// ---------- INITIALISE WEBSITE ----------

function initialise() {
    currentUser = readData("glamoraSession", null);

    populateBookingOptions();
    renderServices();
    renderStylists();
    renderAccount();
    renderAppointments();
    renderCalendar();
    updateBookingSummary();
    updateAvailableTimes();

    // Ensure the calendar opens on the current month.
    calendarDate = new Date();
}

initialise();