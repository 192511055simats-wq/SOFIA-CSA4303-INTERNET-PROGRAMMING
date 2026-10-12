
const STORAGE_KEY = "medcareAppointmentsV2";

const hospitalDoctors = {
    "MedCare Central Hospital": [
        {
            name: "Dr. Ananya Sharma",
            specialty: "General Physician",
            experience: "8 years"
        },
        {
            name: "Dr. Rahul Menon",
            specialty: "Cardiologist",
            experience: "12 years"
        },
        {
            name: "Dr. Priya Nair",
            specialty: "Dermatologist",
            experience: "7 years"
        }
    ],

    "MedCare City Clinic": [
        {
            name: "Dr. Arjun Kumar",
            specialty: "General Physician",
            experience: "9 years"
        },
        {
            name: "Dr. Meera Krishnan",
            specialty: "Pediatrician",
            experience: "10 years"
        },
        {
            name: "Dr. Kavya Iyer",
            specialty: "Gynecologist",
            experience: "8 years"
        }
    ],

    "MedCare Specialty Centre": [
        {
            name: "Dr. Vikram Rao",
            specialty: "Orthopedic Specialist",
            experience: "15 years"
        },
        {
            name: "Dr. Sneha Das",
            specialty: "Neurologist",
            experience: "11 years"
        },
        {
            name: "Dr. Aditya Bose",
            specialty: "Cardiologist",
            experience: "13 years"
        }
    ]
};

const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM"
];

const form = document.getElementById("appointmentForm");
const patientNameInput = document.getElementById("patientName");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const hospitalSelect = document.getElementById("hospital");
const doctorSelect = document.getElementById("doctor");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const typeSelect = document.getElementById("type");
const reasonInput = document.getElementById("reason");
const formMessage = document.getElementById("formMessage");

const doctorInfo = document.getElementById("doctorInfo");
const previewDoctor = document.getElementById("previewDoctor");
const previewSpecialty = document.getElementById("previewSpecialty");
const previewHospital = document.getElementById("previewHospital");
const previewType = document.getElementById("previewType");

const appointmentList = document.getElementById("appointmentList");
const hospitalSearch = document.getElementById("hospitalSearch");
const statusFilter = document.getElementById("statusFilter");

let appointments = loadAppointments();

// Return today's date in local time, not UTC.
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Safely read saved appointments.
function loadAppointments() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const data = JSON.parse(saved);

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Unable to load appointments:", error);
        return [];
    }
}

// Save appointments in this browser.
function saveAppointments() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
        return true;
    } catch (error) {
        console.error("Unable to save appointments:", error);

        showMessage(
            "Could not save the appointment. Check your browser storage settings.",
            "error"
        );

        return false;
    }
}

// Prevent HTML entered by users from being interpreted as markup.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function getSelectedDoctor() {
    const hospital = hospitalSelect.value;
    const doctorName = doctorSelect.value;

    if (!hospital || !doctorName || !hospitalDoctors[hospital]) {
        return null;
    }

    return hospitalDoctors[hospital].find(
        doctor => doctor.name === doctorName
    ) || null;
}

// Set the earliest bookable date to today.
dateInput.min = getLocalDate();

// Update doctor options when the hospital changes.
hospitalSelect.addEventListener("change", function () {
    const hospital = hospitalSelect.value;
    const doctors = hospitalDoctors[hospital] || [];

    doctorSelect.innerHTML = '<option value="">Choose a doctor</option>';

    doctors.forEach(function (doctor) {
        const option = document.createElement("option");

        option.value = doctor.name;
        option.textContent = `${doctor.name} — ${doctor.specialty}`;

        doctorSelect.appendChild(option);
    });

    doctorSelect.disabled = doctors.length === 0;

    if (doctors.length === 0) {
        doctorSelect.innerHTML =
            '<option value="">Select a hospital first</option>';
    }

    doctorInfo.textContent = doctors.length
        ? `${doctors.length} doctors available at this hospital.`
        : "Select a hospital to view available doctors.";

    updateDoctorPreview();
    updateTimeSlots();
});

// Update the doctor information panel.
doctorSelect.addEventListener("change", function () {
    updateDoctorPreview();
    updateTimeSlots();
});

function updateDoctorPreview() {
    const doctor = getSelectedDoctor();

    previewHospital.textContent = hospitalSelect.value || "Not selected";
    previewType.textContent = typeSelect.value;

    if (!doctor) {
        previewDoctor.textContent = "Your doctor awaits";
        previewSpecialty.textContent =
            "Choose a hospital and doctor to see their details here.";
        return;
    }

    previewDoctor.textContent = doctor.name;
    previewSpecialty.textContent =
        `${doctor.specialty} · ${doctor.experience} experience`;
}

// Update available times for the chosen doctor and date.
dateInput.addEventListener("change", updateTimeSlots);

function updateTimeSlots() {
    const hospital = hospitalSelect.value;
    const doctor = doctorSelect.value;
    const selectedDate = dateInput.value;

    timeSelect.innerHTML = '<option value="">Choose a time</option>';

    if (!hospital || !doctor || !selectedDate) {
        timeSelect.disabled = true;
        timeSelect.innerHTML =
            '<option value="">Select hospital, doctor and date</option>';
        return;
    }

    if (selectedDate < getLocalDate()) {
        timeSelect.disabled = true;
        timeSelect.innerHTML =
            '<option value="">Choose a future date</option>';
        return;
    }

    const now = new Date();

    const availableSlots = timeSlots.filter(function (slot) {
        // Exclude time slots that have already passed today.
        if (selectedDate === getLocalDate()) {
            const match = slot.match(/^(\d+):(\d+) (AM|PM)$/);

            let hours = Number(match[1]);
            const minutes = Number(match[2]);
            const period = match[3];

            if (period === "AM" && hours === 12) {
                hours = 0;
            } else if (period === "PM" && hours !== 12) {
                hours += 12;
            }

            const slotDate = new Date();
            slotDate.setHours(hours, minutes, 0, 0);

            if (slotDate <= now) {
                return false;
            }
        }

        // A non-cancelled booking occupies that doctor's time slot.
        const isBooked = appointments.some(function (appointment) {
            return (
                appointment.hospital === hospital &&
                appointment.doctor === doctor &&
                appointment.date === selectedDate &&
                appointment.time === slot &&
                appointment.status !== "Cancelled"
            );
        });

        return !isBooked;
    });

    timeSelect.disabled = false;

    if (availableSlots.length === 0) {
        timeSelect.innerHTML =
            '<option value="">No available slots</option>';
        timeSelect.disabled = true;
        return;
    }

    availableSlots.forEach(function (slot) {
        const option = document.createElement("option");

        option.value = slot;
        option.textContent = slot;

        timeSelect.appendChild(option);
    });
}

typeSelect.addEventListener("change", updateDoctorPreview);

// Convert a date and time into a Date object.
function getAppointmentDateTime(appointment) {
    const match = appointment.time.match(/^(\d+):(\d+) (AM|PM)$/);

    if (!match) {
        return new Date(`${appointment.date}T23:59:59`);
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3];

    if (period === "AM" && hours === 12) {
        hours = 0;
    } else if (period === "PM" && hours !== 12) {
        hours += 12;
    }

    const [year, month, day] = appointment.date.split("-").map(Number);

    return new Date(year, month - 1, day, hours, minutes);
}

function getAppointmentStatus(appointment) {
    if (appointment.status === "Cancelled") {
        return "Cancelled";
    }

    return getAppointmentDateTime(appointment) < new Date()
        ? "Past"
        : "Upcoming";
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Book a new appointment.
form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearMessage();

    const name = patientNameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const hospital = hospitalSelect.value;
    const doctor = getSelectedDoctor();
    const date = dateInput.value;
    const time = timeSelect.value;
    const type = typeSelect.value;
    const reason = reasonInput.value.trim();

    if (!name || !phone || !email || !hospital || !doctor || !date || !time) {
        showMessage("Please complete all required fields.", "error");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        showMessage("Enter a valid 10-digit Indian mobile number.", "error");
        return;
    }

    if (date < getLocalDate()) {
        showMessage("Please select today or a future date.", "error");
        return;
    }

    if (getAppointmentDateTime({ date, time }) <= new Date()) {
        showMessage("This time has already passed. Please choose another slot.", "error");
        updateTimeSlots();
        return;
    }

    // Check the slot again at submission time.
    const duplicate = appointments.some(function (appointment) {
        return (
            appointment.hospital === hospital &&
            appointment.doctor === doctor.name &&
            appointment.date === date &&
            appointment.time === time &&
            appointment.status !== "Cancelled"
        );
    });

    if (duplicate) {
        showMessage(
            "This doctor is already booked at that time. Please choose another slot.",
            "error"
        );

        updateTimeSlots();
        return;
    }

    const appointment = {
        id: "MC" + Date.now().toString().slice(-9),
        patientName: name,
        phone: phone,
        email: email,
        hospital: hospital,
        doctor: doctor.name,
        specialty: doctor.specialty,
        date: date,
        time: time,
        type: type,
        reason: reason,
        status: "Upcoming",
        createdAt: new Date().toISOString()
    };

    appointments.unshift(appointment);

    if (!saveAppointments()) {
        appointments.shift();
        return;
    }

    renderAppointments();
    showMessage(
        `Appointment confirmed! Your booking ID is ${appointment.id}.`,
        "success"
    );

    form.reset();

    doctorSelect.innerHTML =
        '<option value="">Select a hospital first</option>';
    doctorSelect.disabled = true;

    timeSelect.innerHTML =
        '<option value="">Select a date first</option>';
    timeSelect.disabled = true;

    doctorInfo.textContent =
        "Doctor details will appear after selecting a hospital.";

    dateInput.min = getLocalDate();

    updateDoctorPreview();

    document.getElementById("appointments").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Cancel an appointment.
function cancelAppointment(id) {
    const appointment = appointments.find(item => item.id === id);

    if (!appointment || appointment.status === "Cancelled") {
        return;
    }

    if (getAppointmentStatus(appointment) === "Past") {
        alert("Past appointments cannot be cancelled.");
        return;
    }

    const confirmed = window.confirm(
        `Cancel the appointment with ${appointment.doctor} on ` +
        `${formatDate(appointment.date)} at ${appointment.time}?`
    );

    if (!confirmed) {
        return;
    }

    appointment.status = "Cancelled";

    if (!saveAppointments()) {
        appointment.status = "Upcoming";
        return;
    }

    renderAppointments();
    updateTimeSlots();
}

// Render appointment cards and dashboard statistics.
function renderAppointments() {
    const query = hospitalSearch.value.trim().toLowerCase();
    const filter = statusFilter.value;

    const total = appointments.length;

    const upcoming = appointments.filter(function (appointment) {
        return getAppointmentStatus(appointment) === "Upcoming";
    }).length;

    const cancelled = appointments.filter(function (appointment) {
        return appointment.status === "Cancelled";
    }).length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("upcomingCount").textContent = upcoming;
    document.getElementById("cancelledCount").textContent = cancelled;

    const filteredAppointments = appointments.filter(function (appointment) {
        const currentStatus = getAppointmentStatus(appointment);

        const searchableText = [
            appointment.id,
            appointment.patientName,
            appointment.phone,
            appointment.email,
            appointment.hospital,
            appointment.doctor,
            appointment.specialty,
            appointment.type,
            appointment.date,
            appointment.time
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        let matchesFilter = true;

        if (filter === "upcoming") {
            matchesFilter = currentStatus === "Upcoming";
        } else if (filter === "past") {
            matchesFilter = currentStatus === "Past";
        } else if (filter === "cancelled") {
            matchesFilter = currentStatus === "Cancelled";
        }

        return matchesSearch && matchesFilter;
    });

    if (filteredAppointments.length === 0) {
        const hasAppointments = appointments.length > 0;

        appointmentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">▦</div>
                <h3>${hasAppointments
                    ? "No matching appointments"
                    : "No appointments yet"}</h3>
                <p>${hasAppointments
                    ? "Try changing your search or status filter."
                    : "Your confirmed bookings will appear here."}</p>
                ${!hasAppointments
                    ? '<a href="#booking" class="primary-button">Book your first visit →</a>'
                    : ""}
            </div>
        `;

        return;
    }

    appointmentList.innerHTML = filteredAppointments.map(function (appointment) {
        const currentStatus = getAppointmentStatus(appointment);

        const statusClass = currentStatus.toLowerCase();

        const cancelButton = currentStatus === "Upcoming"
            ? `<button type="button"
                class="cancel-button"
                data-cancel-id="${escapeHTML(appointment.id)}">
                Cancel appointment
               </button>`
            : "";

        const reasonHTML = appointment.reason
            ? `<div class="appointment-reason">
                    <strong>Reason:</strong> ${escapeHTML(appointment.reason)}
               </div>`
            : "";

        return `
            <article class="appointment-card">
                <div class="appointment-top">
                    <div>
                        <h3>${escapeHTML(appointment.doctor)}</h3>
                        <span class="appointment-id">
                            Booking ID: ${escapeHTML(appointment.id)}
                        </span>
                    </div>

                    <span class="status status-${statusClass}">
                        ${escapeHTML(currentStatus)}
                    </span>
                </div>

                <div class="appointment-details">
                    <div>
                        <small>Patient</small>
                        <strong>${escapeHTML(appointment.patientName)}</strong>
                    </div>

                    <div>
                        <small>Appointment date</small>
                        <strong>${escapeHTML(formatDate(appointment.date))}</strong>
                    </div>

                    <div>
                        <small>Time</small>
                        <strong>${escapeHTML(appointment.time)}</strong>
                    </div>

                    <div>
                        <small>Hospital</small>
                        <strong>${escapeHTML(appointment.hospital)}</strong>
                    </div>

                    <div>
                        <small>Specialty</small>
                        <strong>${escapeHTML(appointment.specialty)}</strong>
                    </div>

                    <div>
                        <small>Appointment type</small>
                        <strong>${escapeHTML(appointment.type)}</strong>
                    </div>

                    <div>
                        <small>Contact</small>
                        <strong>${escapeHTML(appointment.phone)}</strong>
                    </div>

                    <div>
                        <small>Email</small>
                        <strong>${escapeHTML(appointment.email)}</strong>
                    </div>
                </div>

                ${reasonHTML}

                ${cancelButton
                    ? `<div class="card-actions">${cancelButton}</div>`
                    : ""}
            </article>
        `;
    }).join("");
}

// Handle cancellation buttons using event delegation.
appointmentList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cancel-id]");

    if (!button) {
        return;
    }

    cancelAppointment(button.dataset.cancelId);
});

// Search and filter appointments.
hospitalSearch.addEventListener("input", renderAppointments);
statusFilter.addEventListener("change", renderAppointments);

// Refresh the dashboard from browser storage.
document.getElementById("refreshButton").addEventListener("click", function () {
    appointments = loadAppointments();
    renderAppointments();
    updateTimeSlots();

    showMessage("Appointment dashboard refreshed.", "success");
});

// Initial display.
renderAppointments();
updateDoctorPreview();
