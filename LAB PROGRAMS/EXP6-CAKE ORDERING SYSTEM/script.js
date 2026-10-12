
const cakes = [
    {
        id: 1,
        name: "Chocolate Dream",
        category: "Chocolate",
        subcategory: "Chocolate Truffle",
        price: 650,
        badge: "Bestseller",
        description: "Rich chocolate layers covered in silky chocolate ganache.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 2,
        name: "Strawberry Bliss",
        category: "Fruit",
        subcategory: "Strawberry",
        price: 550,
        badge: "Fresh Pick",
        description: "Soft vanilla sponge with fresh strawberries and cream.",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 3,
        name: "Birthday Sprinkle",
        category: "Birthday",
        subcategory: "Vanilla",
        price: 800,
        badge: "Party Favourite",
        description: "A colourful celebration cake with creamy vanilla frosting.",
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 4,
        name: "Red Velvet Love",
        category: "Birthday",
        subcategory: "Red Velvet",
        price: 750,
        badge: "Popular",
        description: "Velvety red sponge paired with smooth cream cheese frosting.",
        image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 5,
        name: "Wedding Elegance",
        category: "Wedding",
        subcategory: "Vanilla",
        price: 1800,
        badge: "Premium",
        description: "An elegant layered cake for your special celebrations.",
        image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 6,
        name: "Blueberry Cheesecake",
        category: "Fruit",
        subcategory: "Blueberry",
        price: 900,
        badge: "Chef's Pick",
        description: "Creamy cheesecake finished with a blueberry topping.",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 7,
        name: "Chocolate Cupcakes",
        category: "Cupcakes",
        subcategory: "Chocolate",
        price: 350,
        badge: "Mini Treat",
        description: "Soft chocolate cupcakes topped with delicious frosting.",
        image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 8,
        name: "Vanilla Cloud",
        category: "Birthday",
        subcategory: "Vanilla",
        price: 500,
        badge: "Classic",
        description: "Light vanilla sponge with fluffy whipped cream.",
        image: "https://images.unsplash.com/photo-1551879400-111a9087cd86?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 9,
        name: "Caramel Crunch",
        category: "Chocolate",
        subcategory: "Caramel",
        price: 700,
        badge: "Sweet Treat",
        description: "Caramel cream, soft sponge, and a crunchy topping.",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 10,
        name: "Rose Celebration",
        category: "Wedding",
        subcategory: "Vanilla",
        price: 1500,
        badge: "Elegant",
        description: "A delicate celebration cake decorated with floral details.",
        image: "https://images.unsplash.com/photo-1464195244916-405fa0a82545?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 11,
        name: "Lemon Sunshine",
        category: "Fruit",
        subcategory: "Lemon",
        price: 600,
        badge: "Zesty",
        description: "A refreshing lemon cake with a light citrus flavour.",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 12,
        name: "Vanilla Cupcake Box",
        category: "Cupcakes",
        subcategory: "Vanilla",
        price: 400,
        badge: "Gift Idea",
        description: "A delightful box of vanilla cupcakes for sharing.",
        image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=700&q=80"
    }
];

const sizeOptions = {
    "0.5 kg": 0.65,
    "1 kg": 1,
    "2 kg": 1.85
};

let currentUser = null;
let cart = [];
let authMode = "login";
let selectedCakeId = null;

function readStorage(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    return readStorage("cakeBloomUsers", []);
}

function getOrders() {
    return readStorage("cakeBloomOrders", []);
}

function getAddresses() {
    return readStorage("cakeBloomAddresses", {});
}

function money(amount) {
    return "₹" + Math.round(amount).toLocaleString("en-IN");
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

function notify(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal.show").forEach(modal => {
            modal.classList.remove("show");
        });
    }
});

// CAKE SEARCH AND FILTERS

function renderCakes() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const category = document.getElementById("categoryFilter").value;
    const subcategory = document.getElementById("subcategoryFilter").value;
    const maxPrice = Number(document.getElementById("priceFilter").value);

    const filtered = cakes.filter(cake => {
        const searchable = [
            cake.name,
            cake.category,
            cake.subcategory,
            cake.description
        ].join(" ").toLowerCase();

        return searchable.includes(search)
            && (category === "All" || cake.category === category)
            && (subcategory === "All" || cake.subcategory === subcategory)
            && cake.price <= maxPrice;
    });

    document.getElementById("resultCount").textContent =
        `${filtered.length} cake${filtered.length !== 1 ? "s" : ""} found`;

    const grid = document.getElementById("cakeGrid");

    if (!filtered.length) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                🍰 No cakes found. Try changing your search or filters!
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map((cake, index) => `
        <article class="cake-card" style="animation-delay:${index * 55}ms">
            <div class="cake-image-wrap">
                <img src="${cake.image}"
                     alt="${escapeHTML(cake.name)}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://placehold.co/600x400/ffe5ef/81466b?text=CakeBloom'">
                <span class="cake-badge">${escapeHTML(cake.badge)}</span>
            </div>
            <div class="cake-info">
                <span class="cake-category">${escapeHTML(cake.category)} · ${escapeHTML(cake.subcategory)}</span>
                <h3>${escapeHTML(cake.name)}</h3>
                <p class="cake-description">${escapeHTML(cake.description)}</p>
                <div class="cake-bottom">
                    <div class="cake-price">
                        ${money(cake.price)}
                        <small>Starting price</small>
                    </div>
                    <div class="card-actions">
                        <button class="view-btn" onclick="viewCake(${cake.id})">
                            View
                        </button>
                        <button class="add-btn" onclick="quickAdd(${cake.id})">
                            + Add
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `).join("");
}

function updateSubcategories() {
    const category = document.getElementById("categoryFilter").value;
    const select = document.getElementById("subcategoryFilter");

    const options = [...new Set(
        cakes
            .filter(cake => category === "All" || cake.category === category)
            .map(cake => cake.subcategory)
    )].sort();

    select.innerHTML = '<option value="All">All Types</option>';

    options.forEach(option => {
        const element = document.createElement("option");
        element.value = option;
        element.textContent = option;
        select.appendChild(element);
    });

    renderCakes();
}

function updatePriceLabel() {
    document.getElementById("priceValue").textContent =
        document.getElementById("priceFilter").value;

    renderCakes();
}

// CAKE DETAILS AND CUSTOMIZATION

function viewCake(id) {
    selectedCakeId = id;
    const cake = cakes.find(item => item.id === id);
    if (!cake) return;

    document.getElementById("cakeDetails").innerHTML = `
        <span class="eyebrow">${escapeHTML(cake.category)}</span>
        <h2>${escapeHTML(cake.name)}</h2>
        <img class="detail-image"
             src="${cake.image}"
             alt="${escapeHTML(cake.name)}"
             onerror="this.onerror=null;this.src='https://placehold.co/600x400/ffe5ef/81466b?text=CakeBloom'">
        <p class="detail-description">${escapeHTML(cake.description)}</p>
        <div class="detail-price">${money(cake.price)} <small>starting price</small></div>
        <div class="detail-options">
            <label>Choose cake size
                <select id="cakeSize">
                    <option value="0.5 kg">0.5 kg</option>
                    <option value="1 kg" selected>1 kg</option>
                    <option value="2 kg">2 kg</option>
                </select>
            </label>
            <label>Personalised cake message (optional)
                <input id="cakeMessage" maxlength="60"
                       placeholder="e.g. Happy Birthday!">
            </label>
        </div>
        <button class="primary-btn full-btn" onclick="addCustomizedCake()">
            Add to Cart · <span id="detailPrice">${money(cake.price)}</span>
        </button>
    `;

    document.getElementById("cakeSize").addEventListener("change", () => {
        const size = document.getElementById("cakeSize").value;
        document.getElementById("detailPrice").textContent =
            money(cake.price * sizeOptions[size]);
    });

    openModal("cakeModal");
}

function addCustomizedCake() {
    const cake = cakes.find(item => item.id === selectedCakeId);
    if (!cake) return;

    const size = document.getElementById("cakeSize").value;
    const message = document.getElementById("cakeMessage").value.trim();

    addToCart(cake, size, message);
    closeModal("cakeModal");
    notify("Sweet choice! Added to your cart 🍰");
}

function quickAdd(id) {
    const cake = cakes.find(item => item.id === id);
    if (!cake) return;

    addToCart(cake, "1 kg", "");
    notify(`${cake.name} added to your cart 💗`);
}

// SHOPPING CART

function addToCart(cake, size, message) {
    const key = `${cake.id}-${size}-${message}`;

    const existing = cart.find(item => item.key === key);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            key,
            id: cake.id,
            name: cake.name,
            image: cake.image,
            size,
            message,
            unitPrice: Math.round(cake.price * sizeOptions[size]),
            quantity: 1
        });
    }

    updateCartCount();
}

function cartTotal() {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function updateCartCount() {
    document.getElementById("cartCount").textContent =
        cart.reduce((sum, item) => sum + item.quantity, 0);
}

function showCart() {
    renderCart();
    openModal("cartModal");
}

function renderCart() {
    const container = document.getElementById("cartItems");

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-state">🛍️ Your cart is waiting for something sweet!</div>`;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${escapeHTML(item.name)}">
                <div>
                    <h4>${escapeHTML(item.name)}</h4>
                    <p>${escapeHTML(item.size)} · ${money(item.unitPrice)}</p>
                    ${item.message ? `<p>Message: ${escapeHTML(item.message)}</p>` : ""}
                    <div class="quantity-controls">
                        <button onclick="changeQuantity('${escapeHTML(item.key)}',-1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${escapeHTML(item.key)}',1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart('${escapeHTML(item.key)}')">Remove</button>
                    </div>
                </div>
                <strong>${money(item.unitPrice * item.quantity)}</strong>
            </div>
        `).join("");
    }

    document.getElementById("cartTotal").textContent = money(cartTotal());
    document.getElementById("checkoutTotal").textContent = money(cartTotal());
    updateCartCount();
}

function changeQuantity(key, change) {
    const item = cart.find(product => product.key === key);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.key !== key);
    }

    renderCart();
}

function removeFromCart(key) {
    cart = cart.filter(item => item.key !== key);
    renderCart();
    notify("Item removed from cart.");
}

// REGISTRATION AND LOGIN

function openAuth() {
    authMode = "login";
    updateAuthForm();
    document.getElementById("authMessage").textContent = "";
    openModal("authModal");
}

function toggleAuthMode() {
    authMode = authMode === "login" ? "register" : "login";
    updateAuthForm();
}

function updateAuthForm() {
    const registering = authMode === "register";

    document.getElementById("authTitle").textContent =
        registering ? "Create your account" : "Welcome back!";

    document.getElementById("authSubmit").textContent =
        registering ? "Create Account" : "Login";

    document.getElementById("nameField").classList.toggle("hidden", !registering);
    document.getElementById("authName").required = registering;

    document.getElementById("authSwitchText").textContent =
        registering ? "Already registered?" : "New to CakeBloom?";

    document.getElementById("authSwitch").textContent =
        registering ? "Login" : "Create account";

    document.getElementById("authMessage").textContent = "";
}

document.getElementById("authForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("authName").value.trim();
    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const message = document.getElementById("authMessage");

    let users = getUsers();

    if (authMode === "register") {
        if (users.some(user => user.email === email)) {
            message.textContent = "An account with this email already exists.";
            return;
        }

        users.push({ name, email, password });
        saveStorage("cakeBloomUsers", users);

        currentUser = { name, email };
        saveStorage("cakeBloomSession", currentUser);

        message.textContent = "Account created successfully!";
        finishLogin();
        notify("Welcome to CakeBloom! 🎉");
        return;
    }

    const user = users.find(item =>
        item.email === email && item.password === password
    );

    if (!user) {
        message.textContent = "Incorrect email or password. Please try again.";
        return;
    }

    currentUser = { name: user.name, email: user.email };
    saveStorage("cakeBloomSession", currentUser);

    finishLogin();
    notify(`Welcome back, ${user.name}! 💗`);
});

function finishLogin() {
    closeModal("authModal");
    loadAddress();
    renderOrders();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("cakeBloomSession");
    renderOrders();
    notify("You have logged out.");
}

// ADDRESS MANAGEMENT

function addressKey() {
    return currentUser ? currentUser.email : null;
}

function saveAddressData(data) {
    const key = addressKey();

    if (!key) {
        notify("Please log in before saving your address.");
        openAuth();
        return false;
    }

    const addresses = getAddresses();
    addresses[key] = data;
    saveStorage("cakeBloomAddresses", addresses);

    return true;
}

function loadAddress() {
    if (!currentUser) return;

    const data = getAddresses()[currentUser.email];
    if (!data) return;

    document.getElementById("addressName").value = data.name || "";
    document.getElementById("addressPhone").value = data.phone || "";
    document.getElementById("addressLine").value = data.address || "";
    document.getElementById("addressCity").value = data.city || "";
    document.getElementById("addressPin").value = data.pin || "";
}

document.getElementById("addressForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser) {
        notify("Please log in to save your delivery address.");
        openAuth();
        return;
    }

    const data = {
        name: document.getElementById("addressName").value.trim(),
        phone: document.getElementById("addressPhone").value.trim(),
        address: document.getElementById("addressLine").value.trim(),
        city: document.getElementById("addressCity").value.trim(),
        pin: document.getElementById("addressPin").value.trim()
    };

    if (saveAddressData(data)) {
        document.getElementById("addressMessage").textContent =
            "Your delivery address has been saved successfully! 💗";
        notify("Address saved successfully.");
    }
});

// CHECKOUT AND ORDER PLACEMENT

function checkout() {
    if (!cart.length) {
        notify("Your cart is empty!");
        return;
    }

    if (!currentUser) {
        closeModal("cartModal");
        openAuth();
        notify("Please log in before placing an order.");
        return;
    }

    const address = getAddresses()[currentUser.email];

    if (address) {
        document.getElementById("checkoutName").value = address.name || "";
        document.getElementById("checkoutPhone").value = address.phone || "";
        document.getElementById("checkoutAddress").value =
            [address.address, address.city, address.pin].filter(Boolean).join(", ");
    }

    document.getElementById("checkoutTotal").textContent = money(cartTotal());

    closeModal("cartModal");
    openModal("checkoutModal");
}

document.getElementById("checkoutForm").addEventListener("submit", event => {
    event.preventDefault();

    if (!currentUser || !cart.length) {
        notify("Please log in and add a cake to your cart.");
        closeModal("checkoutModal");
        return;
    }

    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        notify("Enter a valid 10-digit phone number.");
        return;
    }

    const order = {
        orderId: "CB" + Date.now().toString().slice(-8),
        email: currentUser.email,
        name,
        phone,
        address,
        items: cart.map(item => ({ ...item })),
        total: cartTotal(),
        date: new Date().toLocaleString(),
        status: "Order Confirmed"
    };

    const orders = getOrders();
    orders.unshift(order);
    saveStorage("cakeBloomOrders", orders);

    cart = [];
    updateCartCount();
    closeModal("checkoutModal");

    document.getElementById("checkoutForm").reset();

    renderOrders();

    document.getElementById("orders").scrollIntoView({ behavior: "smooth" });

    notify(`Order placed successfully! Order ID: ${order.orderId} 🎂`);
});

// MY ORDERS AND SHIPPING STATUS

function renderOrders() {
    const container = document.getElementById("ordersList");

    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                🔐 Please log in to view your orders.
                <br><br>
                <button class="primary-btn" onclick="openAuth()">Login / Register</button>
            </div>`;
        return;
    }

    const orders = getOrders().filter(order =>
        order.email === currentUser.email
    );

    if (!orders.length) {
        container.innerHTML = `
            <div class="empty-state">
                🍰 No orders yet. Explore our cakes and order your favourite!
            </div>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        const cancelled = order.status === "Cancelled";

        const itemNames = order.items.map(item =>
            `${escapeHTML(item.name)} (${escapeHTML(item.size)}) × ${item.quantity}`
        ).join(", ");

        return `
            <article class="order-card">
                <div>
                    <h3>🎂 Order ${escapeHTML(order.orderId)}</h3>
                    <p>${escapeHTML(order.date)}</p>
                    <p>${itemNames}</p>
                    <p>📍 ${escapeHTML(order.address)}</p>
                    <p>📞 ${escapeHTML(order.phone)}</p>
                    <span class="status-pill ${cancelled ? "cancelled" : ""}">
                        ${escapeHTML(order.status)}
                    </span>
                    <div class="order-actions">
                        ${!cancelled ? `
                            <button class="small-btn"
                                onclick="advanceOrder('${escapeHTML(order.orderId)}')">
                                Demo: Update Shipping Status
                            </button>
                            <button class="small-btn danger"
                                onclick="cancelOrder('${escapeHTML(order.orderId)}')">
                                Cancel Order
                            </button>
                        ` : ""}
                    </div>
                </div>
                <div class="order-price">${money(order.total)}</div>
            </article>
        `;
    }).join("");
}

function advanceOrder(orderId) {
    const stages = [
        "Order Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered"
    ];

    const orders = getOrders();
    const order = orders.find(item =>
        item.orderId === orderId &&
        item.email === currentUser?.email
    );

    if (!order || order.status === "Cancelled") return;

    const currentIndex = stages.indexOf(order.status);
    order.status = stages[Math.min(currentIndex + 1, stages.length - 1)];

    saveStorage("cakeBloomOrders", orders);
    renderOrders();

    notify("Shipping status: " + order.status);
}

function cancelOrder(orderId) {
    if (!currentUser) return;

    const orders = getOrders();
    const order = orders.find(item =>
        item.orderId === orderId &&
        item.email === currentUser.email
    );

    if (!order || order.status === "Cancelled") return;

    if (order.status === "Out for Delivery" || order.status === "Delivered") {
        notify("This order can no longer be cancelled in the demo.");
        return;
    }

    if (!confirm("Are you sure you want to cancel this order?")) return;

    order.status = "Cancelled";
    saveStorage("cakeBloomOrders", orders);
    renderOrders();

    notify("Order cancelled.");
}

// RESTORE SESSION AFTER REFRESH

function restoreSession() {
    currentUser = readStorage("cakeBloomSession", null);

    if (currentUser) {
        loadAddress();
    }

    renderCakes();
    renderOrders();
    updateCartCount();
}

restoreSession();
