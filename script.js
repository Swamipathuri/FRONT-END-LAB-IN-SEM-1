const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Sports Shoes",
        price: 1499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
    },
    {
        id: 2,
        name: "Wrist Watch",
        price: 999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    },
    {
        id: 3,
        name: "Headphones",
        price: 1299,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 1899,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"
    }
];

function getData(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getProducts() {
    return getData("products", DEFAULT_PRODUCTS);
}

function getCart() {
    return getData("cart", []);
}

// Initialize shared products once.
if (localStorage.getItem("products") === null) {
    saveData("products", DEFAULT_PRODUCTS);
}

// LOGIN AND SIGNUP
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");

function showMessage(message) {
    if (authMessage) {
        authMessage.textContent = message;
    }
}

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

if (loginTab && signupTab) {
    loginTab.addEventListener("click", function () {
        loginForm.hidden = false;
        signupForm.hidden = true;
        showMessage("");
    });

    signupTab.addEventListener("click", function () {
        loginForm.hidden = true;
        signupForm.hidden = false;
        showMessage("");
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail")
            .value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;

        const users = getData("users", []);

        if (users.some(user => user.email === email)) {
            showMessage("This email is already registered.");
            return;
        }

        users.push({ name, email, password });
        saveData("users", users);

        signupForm.reset();
        loginForm.hidden = false;
        signupForm.hidden = true;
        showMessage("Signup successful! Please login.");
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail")
            .value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = getData("users", []);
        const user = users.find(
            item => item.email === email && item.password === password
        );

        if (!user) {
            showMessage("Invalid email or password.");
            return;
        }

        saveData("loggedInUser", {
            name: user.name,
            email: user.email
        });

        window.location.href = "user.html";
    });
}

// SHOPPING PAGE
const productsSection = document.getElementById("products");

function displayProducts() {
    if (!productsSection) return;

    const products = getProducts();
    productsSection.replaceChildren();

    if (products.length === 0) {
        productsSection.textContent = "No products available.";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "product";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";
        image.onerror = function () {
            this.alt = "Product image unavailable";
        };

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = "₹" + product.price.toLocaleString("en-IN");

        const button = document.createElement("button");
        button.textContent = "Add to Cart";
        button.addEventListener("click", function () {
            addToCart(product.id);
        });

        card.append(image, name, price, button);
        productsSection.appendChild(card);
    });
}

function addToCart(productId) {
    const product = getProducts().find(item => item.id === productId);
    if (!product) return;

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveData("cart", cart);
    displayCart();

    const message = document.getElementById("cartMessage");
    if (message) message.textContent = product.name + " added to cart!";
}

function changeQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(product => product.id === productId);
    if (!item) return;

    item.quantity += change;

    const updatedCart = cart.filter(product => product.quantity > 0);
    saveData("cart", updatedCart);
    displayCart();
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveData("cart", cart);
    displayCart();
}

function displayCart() {
    const itemsElement = document.getElementById("cartItems");
    if (!itemsElement) return;

    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const countElement = document.getElementById("cartCount");
    if (countElement) countElement.textContent = count;

    itemsElement.replaceChildren();

    if (cart.length === 0) {
        itemsElement.textContent = "Your cart is empty.";
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("p");
        details.textContent =
            item.name + " — ₹" + item.price.toLocaleString("en-IN");

        const quantity = document.createElement("div");
        quantity.className = "quantity";

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Decrease quantity");
        minus.addEventListener("click", () => changeQuantity(item.id, -1));

        const number = document.createElement("span");
        number.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Increase quantity");
        plus.addEventListener("click", () => changeQuantity(item.id, 1));

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.className = "danger";
        remove.addEventListener("click", () => removeFromCart(item.id));

        quantity.append(minus, number, plus);
        row.append(details, quantity, remove);
        itemsElement.appendChild(row);
    });

    const totalElement = document.getElementById("total");
    if (totalElement) {
        totalElement.textContent = "Total: ₹" + total.toLocaleString("en-IN");
    }
}

function clearCart() {
    saveData("cart", []);
    displayCart();

    const message = document.getElementById("cartMessage");
    if (message) message.textContent = "Cart cleared.";
}

function checkout() {
    const cart = getCart();

    if (cart.length === 0) {
        const message = document.getElementById("cartMessage");
        if (message) message.textContent = "Your cart is empty.";
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    alert("Demo order placed successfully!\nTotal: ₹" + total);
    clearCart();
}

function logout() {
    localStorage.removeItem("loggedInUser");
}

// ADMIN PAGE
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

function displayAdminProducts() {
    if (!productList) return;

    productList.replaceChildren();

    getProducts().forEach(product => {
        const row = document.createElement("div");
        row.className = "admin-product";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;

        const details = document.createElement("div");
        details.className = "details";

        const name = document.createElement("strong");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = "₹" + product.price.toLocaleString("en-IN");

        details.append(name, price);

        const button = document.createElement("button");
        button.textContent = "Delete";
        button.className = "danger";

        button.addEventListener("click", function () {
            const updated = getProducts().filter(
                item => item.id !== product.id
            );

            saveData("products", updated);
            displayAdminProducts();
        });

        row.append(image, details, button);
        productList.appendChild(row);
    });
}

if (productForm) {
    productForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const price = Number(document.getElementById("productPrice").value);
        const image = document.getElementById("productImage").value.trim();
        const message = document.getElementById("adminMessage");

        if (!name || !Number.isFinite(price) || price <= 0 || !image) {
            if (message) message.textContent = "Enter valid product details.";
            return;
        }

        try {
            const url = new URL(image);
            if (url.protocol !== "https:" && url.protocol !== "http:") {
                throw new Error("Invalid image URL");
            }
        } catch (error) {
            if (message) message.textContent = "Enter a valid image URL.";
            return;
        }

        const products = getProducts();
        const nextId = products.reduce(
            (max, item) => Math.max(max, Number(item.id) || 0), 0
        ) + 1;

        products.push({ id: nextId, name, price, image });
        saveData("products", products);

        productForm.reset();
        if (message) message.textContent = "Product added successfully!";
        displayAdminProducts();
    });
}

// Initialize only the page elements that exist.
displayProducts();
displayCart();
displayAdminProducts();