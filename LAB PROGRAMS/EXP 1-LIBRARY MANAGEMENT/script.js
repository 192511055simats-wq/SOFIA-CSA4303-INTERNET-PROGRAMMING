/* =====================================================
   LIBRARY MANAGEMENT SYSTEM
   JAVASCRIPT + LOCAL STORAGE
   ===================================================== */


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

let users = JSON.parse(localStorage.getItem("libraryUsers")) || [];
let books = JSON.parse(localStorage.getItem("libraryBooks")) || [];
let issues = JSON.parse(localStorage.getItem("libraryIssues")) || [];
let fines = JSON.parse(localStorage.getItem("libraryFines")) || [];
let materials = JSON.parse(localStorage.getItem("libraryMaterials")) || [];
let contacts = JSON.parse(localStorage.getItem("libraryContacts")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("currentLibraryUser")) || null;


/* =====================================================
   SAVE DATA
   ===================================================== */

function saveData() {

    localStorage.setItem(
        "libraryUsers",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "libraryBooks",
        JSON.stringify(books)
    );

    localStorage.setItem(
        "libraryIssues",
        JSON.stringify(issues)
    );

    localStorage.setItem(
        "libraryFines",
        JSON.stringify(fines)
    );

    localStorage.setItem(
        "libraryMaterials",
        JSON.stringify(materials)
    );

    localStorage.setItem(
        "libraryContacts",
        JSON.stringify(contacts)
    );

}


/* =====================================================
   ID GENERATOR
   ===================================================== */

function generateId(prefix) {

    return prefix + Date.now() + Math.floor(Math.random() * 1000);

}


/* =====================================================
   REGISTER
   ===================================================== */

document
    .getElementById("registerForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const registerNumber =
            document.getElementById("registerNumber").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const department =
            document.getElementById("registerDepartment").value;

        const password =
            document.getElementById("registerPassword").value;


        /* CHECK EXISTING EMAIL */

        const existingUser = users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {

            showMessage(
                "registerMessage",
                "An account with this email already exists.",
                "error"
            );

            return;
        }


        /* CREATE USER */

        const user = {

            id: generateId("USR"),

            name: name,

            registerNumber: registerNumber,

            email: email,

            department: department,

            password: password

        };


        users.push(user);

        saveData();

        this.reset();

        showMessage(
            "registerMessage",
            "Registration successful. Your account has been stored.",
            "success"
        );

        refreshAll();

    });


/* =====================================================
   LOGIN
   ===================================================== */

document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const user = users.find(
            u =>
                u.email.toLowerCase() === email.toLowerCase()
                &&
                u.password === password
        );


        if (!user) {

            showMessage(
                "loginMessage",
                "Invalid email or password.",
                "error"
            );

            return;
        }


        currentUser = user;

        localStorage.setItem(
            "currentLibraryUser",
            JSON.stringify(user)
        );


        showMessage(
            "loginMessage",
            "Login successful. Welcome " + user.name + "!",
            "success"
        );


        updateProfile();

    });


/* =====================================================
   DISPLAY USERS
   ===================================================== */

function displayUsers() {

    const table =
        document.getElementById("usersTable");

    const label =
        document.getElementById("registeredUserLabel");


    label.textContent =
        users.length + (users.length === 1 ? " user" : " users");


    if (users.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No registered users yet.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = users.map(user => `

        <tr>

            <td>${escapeHTML(user.name)}</td>

            <td>${escapeHTML(user.registerNumber)}</td>

            <td>${escapeHTML(user.email)}</td>

            <td>${escapeHTML(user.department)}</td>

        </tr>

    `).join("");

}


/* =====================================================
   ADD BOOK
   ===================================================== */

document
    .getElementById("bookForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const title =
            document.getElementById("bookTitle").value.trim();

        const author =
            document.getElementById("bookAuthor").value.trim();

        const category =
            document.getElementById("bookCategory").value.trim();

        const quantity =
            parseInt(
                document.getElementById("bookQuantity").value
            );


        const book = {

            id: generateId("BOOK"),

            title: title,

            author: author,

            category: category,

            quantity: quantity,

            available: quantity

        };


        books.push(book);

        saveData();

        this.reset();

        refreshAll();

        alert("Book added successfully.");

    });


/* =====================================================
   DISPLAY BOOKS
   ===================================================== */

function displayBooks() {

    const container =
        document.getElementById("bookList");

    const search =
        document
            .getElementById("bookSearch")
            .value
            .toLowerCase()
            .trim();


    const filteredBooks =
        books.filter(book =>

            book.title.toLowerCase().includes(search)

            ||

            book.author.toLowerCase().includes(search)

            ||

            book.category.toLowerCase().includes(search)

        );


    if (filteredBooks.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No books found.
            </div>
        `;

        return;
    }


    container.innerHTML = filteredBooks.map((book, index) => `

        <div class="book-card">

            <div class="book-number">
                BOOK ${String(index + 1).padStart(2, "0")}
            </div>

            <h3>
                ${escapeHTML(book.title)}
            </h3>

            <p>
                <strong>Author:</strong>
                ${escapeHTML(book.author)}
            </p>

            <p>
                <strong>Category:</strong>
                ${escapeHTML(book.category)}
            </p>

            <div class="book-status
                ${book.available > 0
                    ? "available"
                    : "not-available"}">

                ${
                    book.available > 0
                    ? book.available + " copies available"
                    : "Currently unavailable"
                }

            </div>

        </div>

    `).join("");

}


/* =====================================================
   ADMIN BOOK TABLE
   ===================================================== */

function displayAdminBooks() {

    const table =
        document.getElementById("adminBookTable");


    if (books.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No books added yet.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = books.map(book => `

        <tr>

            <td>${escapeHTML(book.title)}</td>

            <td>${escapeHTML(book.author)}</td>

            <td>${escapeHTML(book.category)}</td>

            <td>${book.quantity}</td>

            <td>${book.available}</td>

            <td>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteBook('${book.id}')">

                    Delete

                </button>

            </td>

        </tr>

    `).join("");

}


/* =====================================================
   DELETE BOOK
   ===================================================== */

function deleteBook(bookId) {

    const book =
        books.find(b => b.id === bookId);


    if (!book) return;


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this book?"
        );


    if (!confirmDelete) return;


    books =
        books.filter(b => b.id !== bookId);

    saveData();

    refreshAll();

}


/* =====================================================
   ISSUE BOOK
   ===================================================== */

document
    .getElementById("issueForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const bookId =
            document.getElementById("issueBook").value;

        const student =
            document.getElementById("issueStudent").value.trim();

        const issueDate =
            document.getElementById("issueDate").value;

        const expiryDate =
            document.getElementById("expiryDate").value;


        const book =
            books.find(b => b.id === bookId);


        if (!book) {

            alert("Please select a book.");

            return;
        }


        if (book.available <= 0) {

            alert("This book is currently unavailable.");

            return;
        }


        const issue = {

            id: generateId("ISS"),

            bookId: bookId,

            bookTitle: book.title,

            student: student,

            issueDate: issueDate,

            expiryDate: expiryDate,

            status: "Issued"

        };


        issues.push(issue);

        book.available--;

        saveData();

        this.reset();

        refreshAll();

        alert("Book issued successfully.");

    });


/* =====================================================
   POPULATE ISSUE BOOK SELECT
   ===================================================== */

function populateBookSelect() {

    const select =
        document.getElementById("issueBook");


    select.innerHTML =
        `<option value="">Select Book</option>`;


    books.forEach(book => {

        if (book.available > 0) {

            select.innerHTML += `

                <option value="${book.id}">

                    ${escapeHTML(book.title)}
                    (${book.available} available)

                </option>

            `;

        }

    });

}


/* =====================================================
   ADMIN ISSUE TABLE
   ===================================================== */

function displayIssues() {

    const table =
        document.getElementById("adminIssueTable");


    if (issues.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No issue records yet.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = issues.map(issue => `

        <tr>

            <td>${escapeHTML(issue.bookTitle)}</td>

            <td>${escapeHTML(issue.student)}</td>

            <td>${issue.issueDate}</td>

            <td>${issue.expiryDate}</td>

            <td>

                <strong>
                    ${issue.status}
                </strong>

            </td>

            <td>

                ${
                    issue.status === "Issued"

                    ?

                    `<button
                        class="action-btn return-btn"
                        onclick="returnBook('${issue.id}')">

                        Return

                    </button>`

                    :

                    "Completed"
                }

            </td>

        </tr>

    `).join("");

}


/* =====================================================
   RETURN BOOK
   ===================================================== */

function returnBook(issueId) {

    const issue =
        issues.find(i => i.id === issueId);


    if (!issue || issue.status === "Returned") {
        return;
    }


    issue.status = "Returned";


    const book =
        books.find(b => b.id === issue.bookId);


    if (book) {

        book.available++;

    }


    saveData();

    refreshAll();

    alert("Book returned successfully.");

}


/* =====================================================
   ADD FINE
   ===================================================== */

document
    .getElementById("fineForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const student =
            document.getElementById("fineStudent").value.trim();

        const amount =
            parseFloat(
                document.getElementById("fineAmount").value
            );

        const reason =
            document.getElementById("fineReason").value.trim();


        const fine = {

            id: generateId("FINE"),

            student: student,

            amount: amount,

            reason: reason

        };


        fines.push(fine);

        saveData();

        this.reset();

        refreshAll();

        alert("Fine added successfully.");

    });


/* =====================================================
   DISPLAY FINES
   ===================================================== */

function displayFines() {

    const table =
        document.getElementById("fineTable");


    if (fines.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    No fine records yet.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = fines.map(fine => `

        <tr>

            <td>${escapeHTML(fine.student)}</td>

            <td>₹${fine.amount}</td>

            <td>${escapeHTML(fine.reason)}</td>

        </tr>

    `).join("");

}


/* =====================================================
   ADD MATERIAL
   ===================================================== */

document
    .getElementById("materialForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const title =
            document
                .getElementById("materialTitle")
                .value
                .trim();

        const year =
            document
                .getElementById("materialAddYear")
                .value;

        const semester =
            document
                .getElementById("materialAddSemester")
                .value;

        const subject =
            document
                .getElementById("materialSubject")
                .value
                .trim();

        const link =
            document
                .getElementById("materialLink")
                .value
                .trim();


        const material = {

            id: generateId("MAT"),

            title: title,

            year: year,

            semester: semester,

            subject: subject,

            link: link

        };


        materials.push(material);

        saveData();

        this.reset();

        refreshAll();

        alert("Study material added successfully.");

    });


/* =====================================================
   DISPLAY MATERIALS
   ===================================================== */

function displayMaterials() {

    const container =
        document.getElementById("materialList");


    const selectedYear =
        document.getElementById("materialYear").value;

    const selectedSemester =
        document.getElementById("materialSemester").value;


    const filtered =
        materials.filter(material =>

            (selectedYear === "All"
                || material.year === selectedYear)

            &&

            (selectedSemester === "All"
                || material.semester === selectedSemester)

        );


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No study materials available for the selected filters.
            </div>
        `;

        return;
    }


    container.innerHTML = filtered.map(material => `

        <div class="material-card">

            <h3>
                ${escapeHTML(material.title)}
            </h3>

            <p>
                <strong>Subject:</strong>
                ${escapeHTML(material.subject)}
            </p>

            <p>
                <strong>Year:</strong>
                ${material.year}
            </p>

            <p>
                <strong>Semester:</strong>
                ${material.semester}
            </p>

            <a
                href="${escapeAttribute(material.link)}"
                target="_blank">

                View / Download Material →

            </a>

        </div>

    `).join("");

}


/* =====================================================
   ADMIN MATERIAL TABLE
   ===================================================== */

function displayAdminMaterials() {

    const table =
        document.getElementById("adminMaterialTable");


    if (materials.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No materials added yet.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = materials.map(material => `

        <tr>

            <td>${escapeHTML(material.title)}</td>

            <td>${material.year}</td>

            <td>${material.semester}</td>

            <td>${escapeHTML(material.subject)}</td>

        </tr>

    `).join("");

}


/* =====================================================
   BORROW HISTORY
   ===================================================== */

function displayBorrowHistory() {

    const table =
        document.getElementById("borrowTable");


    if (!currentUser) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    Login to view your borrow history.
                </td>
            </tr>
        `;

        return;
    }


    const studentIssues =
        issues.filter(
            issue =>
                issue.student.toLowerCase()
                === currentUser.registerNumber.toLowerCase()
        );


    if (studentIssues.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No borrowing records found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = studentIssues.map(issue => `

        <tr>

            <td>${escapeHTML(issue.bookTitle)}</td>

            <td>${issue.issueDate}</td>

            <td>${issue.expiryDate}</td>

            <td>${issue.status}</td>

        </tr>

    `).join("");

}


/* =====================================================
   PROFILE
   ===================================================== */

function updateProfile() {

    if (!currentUser) {

        document.getElementById("profileDisplayName")
            .textContent = "Guest User";

        document.getElementById("profileDisplayEmail")
            .textContent =
            "Please login to view your profile.";

        document.getElementById("profileRegister")
            .textContent = "-";

        document.getElementById("profileDepartment")
            .textContent = "-";

        document.getElementById("profileFine")
            .textContent = "₹0";

        document.getElementById("profileName")
            .textContent = "Guest";

        return;
    }


    const studentFines =
        fines.filter(
            fine =>
                fine.student.toLowerCase()
                === currentUser.registerNumber.toLowerCase()
        );


    const totalFine =
        studentFines.reduce(
            (sum, fine) => sum + Number(fine.amount),
            0
        );


    const borrowed =
        issues.filter(
            issue =>
                issue.student.toLowerCase()
                === currentUser.registerNumber.toLowerCase()
                &&
                issue.status === "Issued"
        );


    document.getElementById("profileDisplayName")
        .textContent = currentUser.name;

    document.getElementById("profileDisplayEmail")
        .textContent = currentUser.email;

    document.getElementById("profileRegister")
        .textContent = currentUser.registerNumber;

    document.getElementById("profileDepartment")
        .textContent = currentUser.department;

    document.getElementById("profileFine")
        .textContent = "₹" + totalFine;

    document.getElementById("profileName")
        .textContent = currentUser.name;

    document.getElementById("myFine")
        .textContent = "₹" + totalFine;

    document.getElementById("myBorrowCount")
        .textContent = borrowed.length;

}


/* =====================================================
   CONTACT FORM
   ===================================================== */

document
    .getElementById("contactForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const contact = {

            id: generateId("MSG"),

            name:
                document.getElementById("contactName").value,

            email:
                document.getElementById("contactEmail").value,

            message:
                document.getElementById("contactMessage").value

        };


        contacts.push(contact);

        saveData();

        this.reset();


        showMessage(
            "contactResult",
            "Your message has been saved successfully.",
            "success"
        );

    });


/* =====================================================
   STATISTICS
   ===================================================== */

function updateStatistics() {

    document.getElementById("bookCount")
        .textContent = books.length;

    document.getElementById("userCount")
        .textContent = users.length;

    document.getElementById("issueCount")
        .textContent =
        issues.filter(
            issue => issue.status === "Issued"
        ).length;

    document.getElementById("materialCount")
        .textContent = materials.length;


    document.getElementById("adminBookCount")
        .textContent = books.length;

    document.getElementById("adminUserCount")
        .textContent = users.length;

    document.getElementById("adminIssueCount")
        .textContent =
        issues.filter(
            issue => issue.status === "Issued"
        ).length;

    document.getElementById("adminFineCount")
        .textContent = fines.length;

}


/* =====================================================
   MESSAGE
   ===================================================== */

function showMessage(elementId, text, type) {

    const element =
        document.getElementById(elementId);

    element.textContent = text;

    if (type === "success") {

        element.style.color = "#357044";

    } else {

        element.style.color = "#9F3E1A";

    }

}


/* =====================================================
   SECURITY HELPERS
   ===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   REFRESH EVERYTHING
   ===================================================== */

function refreshAll() {

    displayBooks();

    displayUsers();

    displayAdminBooks();

    populateBookSelect();

    displayIssues();

    displayFines();

    displayMaterials();

    displayAdminMaterials();

    displayBorrowHistory();

    updateProfile();

    updateStatistics();

}


/* =====================================================
   SAMPLE DATA
   Only inserted when there are NO books/materials.
   ===================================================== */

function createInitialData() {

    if (books.length === 0) {

        books = [

            {
                id: generateId("BOOK"),
                title: "Computer Networks",
                author: "Andrew S. Tanenbaum",
                category: "Computer Science",
                quantity: 5,
                available: 5
            },

            {
                id: generateId("BOOK"),
                title: "Operating System Concepts",
                author: "Abraham Silberschatz",
                category: "Computer Science",
                quantity: 4,
                available: 4
            },

            {
                id: generateId("BOOK"),
                title: "Database System Concepts",
                author: "Henry Korth",
                category: "Database",
                quantity: 6,
                available: 6
            },

            {
                id: generateId("BOOK"),
                title: "Introduction to Algorithms",
                author: "Thomas H. Cormen",
                category: "Algorithms",
                quantity: 3,
                available: 3
            }

        ];

    }


    if (materials.length === 0) {

        materials = [

            {
                id: generateId("MAT"),
                title: "Data Structures Notes",
                year: "2",
                semester: "3",
                subject: "Data Structures",
                link: "#"
            },

            {
                id: generateId("MAT"),
                title: "Database Management Notes",
                year: "2",
                semester: "4",
                subject: "DBMS",
                link: "#"
            },

            {
                id: generateId("MAT"),
                title: "Computer Networks Notes",
                year: "3",
                semester: "5",
                subject: "Computer Networks",
                link: "#"
            }

        ];

    }


    saveData();

}


/* =====================================================
   PAGE LOAD
   ===================================================== */

document.addEventListener("DOMContentLoaded", function() {

    createInitialData();

    refreshAll();

});