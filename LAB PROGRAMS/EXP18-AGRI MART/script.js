
"use strict";

// AgriMart is an educational front-end demonstration.
// Local Storage and demo OTPs must not be used for real payments or accounts.

const DB_KEY = "agriMart_demo_v1";
const SESSION_KEY = "agriMart_demo_session_v1";

const starterProducts = [
  { id: "p1", name: "Premium Tomato Seeds", category: "Seeds", price: 180, stock: 30, emoji: "🍅" },
  { id: "p2", name: "Organic Wheat Seeds", category: "Seeds", price: 250, stock: 25, emoji: "🌾" },
  { id: "p3", name: "Garden Fertilizer", category: "Fertilizers", price: 320, stock: 20, emoji: "🪴" },
  { id: "p4", name: "Organic Compost", category: "Fertilizers", price: 150, stock: 40, emoji: "🌱" },
  { id: "p5", name: "Plant Protection Spray", category: "Pesticides", price: 280, stock: 15, emoji: "🛡️" },
  { id: "p6", name: "Hand Sprayer", category: "Equipment", price: 650, stock: 12, emoji: "🚿" },
  { id: "p7", name: "Garden Spade", category: "Tools", price: 220, stock: 18, emoji: "🪏" },
  { id: "p8", name: "Watering Can", category: "Tools", price: 190, stock: 22, emoji: "🚿" }
];

const initialDB = {
  products: starterProducts,
  users: [],
  cart: [],
  orders: [],
  wallet: 1000,
  activity: []
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return clone(initialDB);

    const saved = JSON.parse(raw);
    if (
      !saved ||
      !Array.isArray(saved.products) ||
      !Array.isArray(saved.users) ||
      !Array.isArray(saved.cart) ||
      !Array.isArray(saved.orders) ||
      !Number.isFinite(saved.wallet)
    ) {
      return clone(initialDB);
    }
    return saved;
  } catch (error) {
    console.error("AgriMart storage could not be read:", error);
    return clone(initialDB);
  }
}

let db = loadDB();
let selectedUserId = null;
let pendingAccountOtp = null;
let pendingOtpPhone = null;
let pendingOtpExpires = 0;
let toastTimer;

const $ = id => document.getElementById(id);

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    showToast("Could not save data. Browser storage may be full.");
    return false;
  }
}

function id(prefix) {
  return prefix + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[ch]);
}

function money(value) {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function getCurrentUser() {
  return db.users.find(user => user.id === selectedUserId) || null;
}

function cartQuantity() {
  return db.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal() {
  return db.cart.reduce((sum, item) => {
    const product = db.products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getOrderStatus(order) {
  return order.status || "Order Placed";
}

function addActivity(message) {
  db.activity.unshift({
    message,
    date: new Date().toLocaleString()
  });
  db.activity = db.activity.slice(0, 30);
}

function renderProducts() {
  const search = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const sort = $("sortFilter").value;

  let products = db.products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);
    const matchesCategory =
      category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sort === "low") products.sort((a, b) => a.price - b.price);
  if (sort === "high") products.sort((a, b) => b.price - a.price);
  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));

  $("productGrid").innerHTML = products.map((p, index) => `
    <article class="product-card" style="animation-delay:${index * 45}ms">
      <div class="product-art">${escapeHTML(p.emoji)}</div>
      <span class="product-category">${escapeHTML(p.category)}</span>
      <h3>${escapeHTML(p.name)}</h3>
      <div class="product-price">${money(p.price)}</div>
      <p class="stock">${p.stock > 0 ? `${p.stock} available` : "Out of stock"}</p>
      <button class="btn" data-add-cart="${escapeHTML(p.id)}"
        ${p.stock <= 0 ? "disabled" : ""}>
        ${p.stock > 0 ? "Add to Cart +" : "Out of Stock"}
      </button>
    </article>
  `).join("");

  $("noProducts").hidden = products.length > 0;
  $("productCount").textContent = db.products.length;
}

function renderCart() {
  $("cartCount").textContent = cartQuantity();
  $("cartTotal").textContent = money(cartTotal());

  const rows = db.cart.map(item => {
    const p = db.products.find(product => product.id === item.productId);
    if (!p) return "";

    return `
      <div class="cart-row">
        <div>
          <h3>${escapeHTML(p.emoji)} ${escapeHTML(p.name)}</h3>
          <p>${money(p.price)} each · Subtotal ${money(p.price * item.quantity)}</p>
        </div>
        <div class="quantity">
          <button type="button" data-minus="${escapeHTML(p.id)}" aria-label="Decrease quantity">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-plus="${escapeHTML(p.id)}" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="remove-button" data-remove-cart="${escapeHTML(p.id)}">Remove</button>
      </div>
    `;
  }).join("");

  $("cartItems").innerHTML = rows || `
    <p class="muted">Your cart is empty. Browse products and add items to begin.</p>
  `;
}

function renderOrders() {
  $("orderCount").textContent = db.orders.length;

  $("orderList").innerHTML = db.orders.map(order => `
    <article class="order-card">
      <h3>📦 Order ${escapeHTML(order.id)}</h3>
      <p><strong>Placed:</strong> ${escapeHTML(order.date)}</p>
      <p><strong>Total:</strong> ${money(order.total)}</p>
      <p><strong>Payment:</strong> ${escapeHTML(order.payment)}</p>
      <p><strong>Delivery:</strong> ${escapeHTML(order.address)}</p>
      <span class="status">${escapeHTML(getOrderStatus(order))}</span>
      <p class="muted small">Items: ${order.items.map(item =>
        `${escapeHTML(item.name)} × ${item.quantity}`
      ).join(", ")}</p>
    </article>
  `).reverse().join("") || `
    <div class="panel"><p class="muted">No orders yet. Your purchases will appear here.</p></div>
  `;

  $("farmerOrders").innerHTML = db.orders.map(order => `
    <div class="inventory-row">
      <div>
        <strong>${escapeHTML(order.id)}</strong>
        <p class="muted small">${escapeHTML(order.date)} · ${money(order.total)}</p>
        <span class="status">${escapeHTML(getOrderStatus(order))}</span>
      </div>
      <div class="action-group">
        <select data-order-status="${escapeHTML(order.id)}" aria-label="Update order status">
          ${["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map(status =>
            `<option value="${status}" ${getOrderStatus(order) === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </div>
    </div>
  `).join("") || `<p class="muted">No orders to manage.</p>`;
}

function renderInventory() {
  $("inventoryList").innerHTML = db.products.map(p => `
    <div class="inventory-row">
      <div>
        <strong>${escapeHTML(p.emoji)} ${escapeHTML(p.name)}</strong>
        <p class="muted small">${escapeHTML(p.category)} · ${money(p.price)} · Stock: ${p.stock}</p>
      </div>
      <div class="action-group">
        <button data-edit-product="${escapeHTML(p.id)}">Edit</button>
        <button class="delete" data-delete-product="${escapeHTML(p.id)}">Delete</button>
      </div>
    </div>
  `).join("") || `<p class="muted">No products listed.</p>`;

  $("farmerProductCount").textContent = db.products.length;
  $("farmerOrderCount").textContent = db.orders.filter(
    order => order.status !== "Cancelled"
  ).length;

  const sales = db.orders
    .filter(order => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  $("salesTotal").textContent = money(sales);
}

function renderRecommendations() {
  const recentlyViewed = db.activity
    .filter(item => item.productId)
    .map(item => item.productId);

  const cartIds = db.cart.map(item => item.productId);
  const preferredIds = [...new Set([...cartIds, ...recentlyViewed])];

  let products = preferredIds
    .map(productId => db.products.find(p => p.id === productId))
    .filter(Boolean);

  if (!products.length) products = db.products.slice(0, 3);
  products = products.slice(0, 4);

  $("recommendations").innerHTML = products.map(p => `
    <div class="recommendation">
      ${escapeHTML(p.emoji)} <strong>${escapeHTML(p.name)}</strong>
      <span class="muted"> · ${money(p.price)}</span>
      <button class="remove-button" data-recommend-add="${escapeHTML(p.id)}">
        Add to cart
      </button>
    </div>
  `).join("") || `<p class="muted">Add products to see recommendations.</p>`;
}

function renderAccount() {
  const user = getCurrentUser();
  $("accountButton").textContent = user ? user.name : "Login / Register";

  if (user) {
    $("customerName").value = user.name;
    $("customerPhone").value = user.phone;
    $("shippingAddress").value = user.address || "";
    $("accountMessage").hidden = false;
    $("accountMessage").textContent = `Signed in as ${user.name} (demo account).`;
  } else {
    $("accountMessage").hidden = true;
  }

  $("walletBalance").textContent = money(db.wallet);
  $("farmerWalletBalance").textContent = money(db.wallet);
}

function renderAll() {
  renderProducts();
  renderCart();
  renderOrders();
  renderInventory();
  renderRecommendations();
  renderAccount();
}

// PRODUCT SEARCH AND FILTERS
$("searchInput").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", () => {
  document.querySelectorAll(".category-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === $("categoryFilter").value
    );
  });
  renderProducts();
});
$("sortFilter").addEventListener("change", renderProducts);

document.querySelector(".category-row").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  $("categoryFilter").value = button.dataset.category;
  document.querySelectorAll(".category-chip").forEach(chip =>
    chip.classList.toggle("active", chip === button)
  );
  renderProducts();
});

// ADD PRODUCTS TO CART
function addToCart(productId) {
  const product = db.products.find(p => p.id === productId);
  if (!product) return;

  const existing = db.cart.find(item => item.productId === productId);
  if (product.stock <= 0 ||
      (existing && existing.quantity >= product.stock)) {
    showToast("Not enough stock available.");
    return;
  }

  const previous = clone(db.cart);
  if (existing) existing.quantity++;
  else db.cart.push({ productId, quantity: 1 });

  addActivity("Viewed or added " + product.name);
  db.activity[0].productId = productId;

  if (!saveDB()) {
    db.cart = previous;
    return;
  }

  renderCart();
  renderRecommendations();
  showToast(product.name + " added to cart.");
}

$("productGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add-cart]");
  if (button) addToCart(button.dataset.addCart);
});

$("recommendations").addEventListener("click", event => {
  const button = event.target.closest("[data-recommend-add]");
  if (button) addToCart(button.dataset.recommendAdd);
});

$("cartItems").addEventListener("click", event => {
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove-cart]");
  const button = plus || minus || remove;
  if (!button) return;

  const productId = button.dataset.plus ||
    button.dataset.minus || button.dataset.removeCart;

  const item = db.cart.find(entry => entry.productId === productId);
  const product = db.products.find(p => p.id === productId);
  if (!item) return;

  const previous = clone(db.cart);

  if (remove) {
    db.cart = db.cart.filter(entry => entry.productId !== productId);
  } else if (minus) {
    item.quantity--;
    if (item.quantity <= 0) {
      db.cart = db.cart.filter(entry => entry.productId !== productId);
    }
  } else if (plus) {
    if (!product || item.quantity >= product.stock) {
      showToast("Maximum available stock reached.");
      return;
    }
    item.quantity++;
  }

  if (!saveDB()) {
    db.cart = previous;
    return;
  }

  renderCart();
  renderRecommendations();
});

$("clearCart").addEventListener("click", () => {
  if (!db.cart.length) return showToast("Your cart is already empty.");

  const previous = db.cart;
  db.cart = [];

  if (!saveDB()) {
    db.cart = previous;
    return;
  }

  renderAll();
  showToast("Cart cleared.");
});

// CHECKOUT
$("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!db.cart.length) {
    showToast("Add products to your cart first.");
    return;
  }

  const name = $("customerName").value.trim();
  const phone = $("customerPhone").value.trim();
  const address = $("shippingAddress").value.trim();
  const payment = $("paymentMethod").value;

  if (!name || !/^[0-9]{10}$/.test(phone) || !address) {
    showToast("Enter a valid name, 10-digit phone and address.");
    return;
  }

  for (const item of db.cart) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product || item.quantity > product.stock || item.quantity < 1) {
      showToast("A product is unavailable or has insufficient stock.");
      renderAll();
      return;
    }
  }

  const total = cartTotal();
  if (payment === "Wallet" && db.wallet < total) {
    showToast("Insufficient demo wallet balance. Add credits in Farmer Hub or choose COD.");
    return;
  }

  if (!confirm(`Place this demo order for ${money(total)}?`)) return;

  const oldDB = clone(db);

  if (payment === "Wallet") db.wallet -= total;

  const items = db.cart.map(item => {
    const product = db.products.find(p => p.id === item.productId);
    product.stock -= item.quantity;

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    };
  });

  const order = {
    id: "AGR-" + Date.now().toString().slice(-8),
    date: new Date().toLocaleString(),
    customer: name,
    phone,
    address,
    payment,
    total,
    items,
    status: "Order Placed"
  };

  db.orders.push(order);
  db.cart = [];
  addActivity("Placed order " + order.id);

  if (!saveDB()) {
    db = oldDB;
    return;
  }

  renderAll();
  $("checkoutForm").reset();
  showToast("Order placed! Reference: " + order.id);
  $("orders").scrollIntoView({ behavior: "smooth" });
});

// FARMER PRODUCT MANAGEMENT
function resetProductForm() {
  $("productForm").reset();
  $("editProductId").value = "";
  $("productEmoji").value = "🌱";
  $("productSubmit").textContent = "Add Product";
  $("cancelEdit").hidden = true;
}

$("productForm").addEventListener("submit", event => {
  event.preventDefault();

  const productId = $("editProductId").value;
  const name = $("productName").value.trim();
  const category = $("productCategory").value;
  const price = Number($("productPrice").value);
  const stock = Number($("productStock").value);
  const emoji = $("productEmoji").value.trim();

  if (
    !name || !emoji ||
    !Number.isFinite(price) || price <= 0 || price > 10000000 ||
    !Number.isInteger(stock) || stock < 0 || stock > 100000
  ) {
    showToast("Enter valid product details, price and stock.");
    return;
  }

  const oldDB = clone(db);

  if (productId) {
    const product = db.products.find(p => p.id === productId);
    if (!product) return showToast("Product not found.");

    product.name = name;
    product.category = category;
    product.price = price;
    product.stock = stock;
    product.emoji = emoji;
    addActivity("Updated product " + name);
  } else {
    db.products.push({
      id: id("P"),
      name,
      category,
      price,
      stock,
      emoji
    });
    addActivity("Added product " + name);
  }

  if (!saveDB()) {
    db = oldDB;
    return;
  }

  resetProductForm();
  renderAll();
  showToast(productId ? "Product updated." : "Product added.");
});

$("cancelEdit").addEventListener("click", resetProductForm);

$("inventoryList").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit-product]");
  const deleteButton = event.target.closest("[data-delete-product]");

  if (editButton) {
    const product = db.products.find(p => p.id === editButton.dataset.editProduct);
    if (!product) return;

    $("editProductId").value = product.id;
    $("productName").value = product.name;
    $("productCategory").value = product.category;
    $("productPrice").value = product.price;
    $("productStock").value = product.stock;
    $("productEmoji").value = product.emoji;
    $("productSubmit").textContent = "Save Changes";
    $("cancelEdit").hidden = false;
    $("farmer").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (deleteButton) {
    const productId = deleteButton.dataset.deleteProduct;
    const product = db.products.find(p => p.id === productId);
    if (!product) return;

    if (!confirm("Delete " + product.name + " from the demo inventory?")) return;

    const oldDB = clone(db);
    db.products = db.products.filter(p => p.id !== productId);
    db.cart = db.cart.filter(item => item.productId !== productId);
    addActivity("Deleted product " + product.name);

    if (!saveDB()) {
      db = oldDB;
      return;
    }

    resetProductForm();
    renderAll();
    showToast("Product deleted.");
  }
});

// ORDER SHIPPING STATUS
$("farmerOrders").addEventListener("change", event => {
  const select = event.target.closest("[data-order-status]");
  if (!select) return;

  const order = db.orders.find(o => o.id === select.dataset.orderStatus);
  if (!order) return;

  const oldStatus = order.status;
  order.status = select.value;
  addActivity("Order " + order.id + " status changed to " + order.status);

  if (!saveDB()) {
    order.status = oldStatus;
    return;
  }

  renderOrders();
  renderInventory();
  showToast("Shipping status updated.");
});

$("refreshOrders").addEventListener("click", () => {
  renderOrders();
  showToast("Orders refreshed.");
});

// WALLET DEMO CREDITS
$("walletForm").addEventListener("submit", event => {
  event.preventDefault();

  const amount = Number($("walletAmount").value);
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    showToast("Enter an amount from ₹1 to ₹100,000.");
    return;
  }

  const previous = db.wallet;
  db.wallet += amount;

  if (!saveDB()) {
    db.wallet = previous;
    return;
  }

  $("walletForm").reset();
  renderAccount();
  showToast(money(amount) + " demo credits added.");
});

// ACCOUNT REGISTER / LOGIN
$("accountForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("accountName").value.trim();
  const phone = $("accountPhone").value.trim();
  const address = $("accountAddress").value.trim();

  if (!name || !/^[0-9]{10}$/.test(phone)) {
    showToast("Enter a name and valid 10-digit phone number.");
    return;
  }

  const oldDB = clone(db);
  let user = db.users.find(u => u.phone === phone);

  if (user) {
    user.name = name;
    user.address = address;
  } else {
    user = { id: id("U"), name, phone, address };
    db.users.push(user);
  }

  if (!saveDB()) {
    db = oldDB;
    return;
  }

  selectedUserId = user.id;
  pendingAccountOtp = null;
  pendingOtpPhone = phone;
  pendingOtpExpires = Date.now() + 5 * 60 * 1000;

  // Demonstration only. This does not send a real SMS.
  pendingAccountOtp = "123456";

  $("accountOtpMessage").textContent =
    "Demo OTP: 123456. It expires in 5 minutes.";
  localStorage.setItem(SESSION_KEY, user.id);

  renderAccount();
  showToast("Demo account ready. Use the displayed demo OTP.");
});

$("verifyAccountOtp").addEventListener("click", () => {
  const user = getCurrentUser();
  const value = $("accountOtp").value.trim();

  if (
    !user ||
    !pendingAccountOtp ||
    user.phone !== pendingOtpPhone ||
    Date.now() > pendingOtpExpires ||
    value !== pendingAccountOtp
  ) {
    $("accountOtpMessage").textContent =
      "Register or log in first, then enter a valid demo OTP.";
    return;
  }

  pendingAccountOtp = null;
  pendingOtpPhone = null;
  pendingOtpExpires = 0;

  $("accountOtpMessage").textContent =
    "Demo OTP verified for this session.";
  showToast("Demo account verified.");
});

$("logoutButton").addEventListener("click", () => {
  selectedUserId = null;
  pendingAccountOtp = null;
  pendingOtpPhone = null;
  pendingOtpExpires = 0;
  localStorage.removeItem(SESSION_KEY);
  $("accountOtp").value = "";
  $("accountOtpMessage").textContent = "";
  renderAccount();
  showToast("Logged out of demo account.");
});

$("accountButton").addEventListener("click", () => {
  $("account").scrollIntoView({ behavior: "smooth" });
});

// EXPORT INVENTORY AS CSV
$("exportProducts").addEventListener("click", () => {
  const rows = [
    ["Product", "Category", "Price INR", "Stock"],
    ...db.products.map(p => [p.name, p.category, p.price, p.stock])
  ];

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
  link.download = "agrimart-inventory.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Restore the demonstration session for this browser.
try {
  selectedUserId = localStorage.getItem(SESSION_KEY);
} catch {
  selectedUserId = null;
}

if (!db.users.some(user => user.id === selectedUserId)) {
  selectedUserId = null;
}

renderAll();
