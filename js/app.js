const state = {
    seats: [],
    seatMap: new Map(),
    inspectedId: null,
    cart: []
};

const STORAGE_KEY = "ticketmasterCart"

const STATE_LABELS = {
    available: "available",
    inspected: "selected",
    "in-cart": "in your cart",
    unavailable: "unavailable"
};

const STATUS_TEXT = {
    available: "Available",
    inspected: "Available",
    "in-cart": "Already in your cart",
    unavailable: "Not available"
};

const mapEl = document.getElementById('venue-map');
const seatEls = new Map();
const detailsEl = document.getElementById("seat-details");
const addBtn = document.getElementById("add-to-cart");
const viewportEl = document.getElementById("map-viewport");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const view = { x: 0, y: 0, scale: 1 };
const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const ZOOM_STEP = 1.25;
const PAN_STEP = 60;

// Map navigation (zoom, pan, reset)

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function applyView() {
    mapEl.style.transform =
        "translate(" + view.x + "px, " + view.y + "px) scale(" + view.scale + ")";
    zoomInBtn.disabled = view.scale >= MAX_SCALE - 0.001;
    zoomOutBtn.disabled = view.scale <= MIN_SCALE + 0.001;
}

function clampView() {
    const margin = 80;
    const w = mapEl.offsetWidth * view.scale;
    const h = mapEl.offsetHeight * view.scale;
    view.x = clamp(view.x, margin - w, viewportEl.clientWidth - margin);
    view.y = clamp(view.y, margin - h, viewportEl.clientHeight - margin);
}

function zoomBy(factor) {
    const newScale = clamp(view.scale * factor, MIN_SCALE, MAX_SCALE);
    const ratio = newScale / view.scale;
    const cx = viewportEl.clientWidth / 2;
    const cy = viewportEl.clientHeight / 2;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.scale = newScale;
    clampView();
    applyView();
}

function panBy(dx, dy) {
    view.x += dx;
    view.y += dy;
    clampView();
    applyView();
}

function resetView() {
    const fit = viewportEl.clientWidth / mapEl.offsetWidth;
    view.scale = clamp(Math.min(1, fit), MIN_SCALE, MAX_SCALE);
    view.x = (viewportEl.clientWidth - mapEl.offsetWidth * view.scale) / 2;
    view.y = 0;
    applyView();
}

function formatPrice(amount) {
    return VENUE.currency + amount.toFixed(2);
}

function renderVenue() {
    VENUE.sections.forEach(section => {
        const category = VENUE.categories[section.category];
        const sectionEl = document.createElement("div");
        sectionEl.className = "map-section";

        const title = document.createElement("h3");
        title.textContent = `${section.name} - ${category.label} ${formatPrice(category.price)}`;
        sectionEl.appendChild(title);

        section.rows.forEach(row => {
            const rowEl = document.createElement("div");
            rowEl.className = "seat-row";

            const label = document.createElement("span");
            label.className = "row-label";
            label.textContent = row;
            rowEl.appendChild(label);

            for (let n = 1; n <= section.seatsPerRow; n++) {
                const seat = state.seatMap.get(makeSeatId(row, n));
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "seat";
                btn.dataset.id = seat.id;
                btn.textContent = n;
                btn.setAttribute("aria-label", "Seat " + seat.id + ', ' + seat.sectionName + ', ' + formatPrice(category.price));
                seatEls.set(seat.id, btn);
                rowEl.appendChild(btn);
            }
            sectionEl.appendChild(rowEl);
        });

        mapEl.appendChild(sectionEl);
    });
}

function isInCart(id) {
    return state.cart.includes(id);
}

function getSeatState(id) {
    const seat = state.seatMap.get(id);
    if(seat.unavailable) return "unavailable";
    if(isInCart(id)) return "in-cart";
    if(state.inspectedId === id) return "inspected";
    return "available";
}

function refreshSeat(id) {
    const el = seatEls.get(id);
    if(!el) return;
    const seat = state.seatMap.get(id);
    const seatState = getSeatState(id);
    el.className = "seat " + seatState;
    el.setAttribute("aria-label", "Seat " + id + ", " + seat.sectionName + ", " + formatPrice(seat.price) + ", " + STATE_LABELS[seatState]);
}

function refreshAllSeats() {
    seatEls.forEach((el, id) => refreshSeat(id));
}

function inspectSeat(id) {
    const previous = state.inspectedId;
    state.inspectedId = id;
    if (previous) refreshSeat(previous);
    refreshSeat(id);
}

function renderDetails() {
    const id = state.inspectedId;
    if (!id) {
        detailsEl.innerHTML = '<p class="empty">Select a seat on the map to see its details.</p>';
        addBtn.disabled = true;
        return;
    }
    const seat = state.seatMap.get(id);
    const seatState = getSeatState(id);
    detailsEl.innerHTML = `
    <dl class="detail-list">
        <dt>Seat</dt><dd>${seat.id}</dd>
        <dt>Section</dt><dd>${seat.sectionName}</dd>
        <dt>Row</dt><dd>${seat.row}</dd>
        <dt>Number</dt><dd>${seat.number}</dd>
        <dt>Category</dt><dd>${seat.categoryLabel}</dd>
        <dt>Price</dt><dd>${formatPrice(seat.price)}</dd>
        <dt>Status</dt><dd>${STATUS_TEXT[seatState]}</dd>
    </dl>
    `;
    addBtn.disabled = seatState !== "inspected";
}

function inspectSeat(id) {
    const previous = state.inspectedId;
    state.inspectedId = id;
    if (previous) refreshSeat(previous);
    refreshSeat(id);
    renderDetails();
}

mapEl.addEventListener("click", e => {
    const btn = e.target.closest(".seat");
    if(btn) inspectSeat(btn.dataset.id);
});

// Map Actions
document.getElementById("zoom-in").addEventListener("click", () => zoomBy(ZOOM_STEP));
document.getElementById("zoom-out").addEventListener("click", () => zoomBy(1 / ZOOM_STEP));
document.getElementById("move-up").addEventListener("click", () => panBy(0, PAN_STEP));
document.getElementById("move-down").addEventListener("click", () => panBy(0, -PAN_STEP));
document.getElementById("move-left").addEventListener("click", () => panBy(PAN_STEP, 0));
document.getElementById("move-right").addEventListener("click", () => panBy(-PAN_STEP, 0));
document.getElementById("reset-view").addEventListener("click", resetView);

// Cart

const cartListEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

function afterCartChange(id) {
    refreshSeat(id);
    renderDetails();
    renderCart();
    saveCart();
}

function addToCart(id) {
    const seat = state.seatMap.get(id);
    if (!seat) return;
    if (seat.unavailable) {
        showMessage("Seat " + id + " is not available.");
        return;
    }
    if (isInCart(id)) {
        showMessage("Seat " + id + " is already in your cart.");
        return;
    }
    state.cart.push(id);
    afterCartChange(id);
    showMessage("Seat " + id + " added to your cart.");
}

function getCartTotal() {
    return state.cart.reduce((sum, id) => sum + state.seatMap.get(id).price, 0);
}

function removeFromCart(id) {
    const idx = state.cart.indexOf(id);
    if (idx === -1) return;
    state.cart.splice(idx, 1);
    afterCartChange(id);
}

function renderCart() {
    cartListEl.innerHTML = "";
    if (state.cart.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No tickets here.";
        cartListEl.appendChild(empty);
    }
    state.cart.forEach(id => {
        const seat = state.seatMap.get(id);
        const li = document.createElement("li");

        const text = document.createElement("span");
        text.textContent = "Seat " + seat.id + " (" + seat.sectionName + ") - " + formatPrice(seat.price);
        li.appendChild(text);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-btn";
        removeBtn.dataset.id = id;
        removeBtn.textContent = "Remove";
        removeBtn.setAttribute("aria-label", "Remove seat " + id + " from cart");
        li.appendChild(removeBtn);

        cartListEl.appendChild(li);
    });
    cartTotalEl.textContent = formatPrice(getCartTotal());
}

addBtn.addEventListener("click", () => {
    if (state.inspectedId) addToCart(state.inspectedId);
});

cartListEl.addEventListener("click", e => {
    const btn = e.target.closest(".remove-btn");
    if (btn) removeFromCart(btn.dataset.id);
});

// Persistance

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    } catch (error) {
        console.warn("Could not save cart: ", error);
    }
}

function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return [];
        const ids = JSON.parse(raw);
        if (!Array.isArray(ids)) return [];
        return Array.from(new Set(ids)).filter(id => {
            const seat = state.seatMap.get(id);
            return seat && !seat.unavailable;
        });
    } catch (error) {
        return [];
    }
}


// User feedback
const messageEl = document.getElementById("message");
let messageTimer = null;

function showMessage(text) {
    messageEl.textContent = text;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { messageEl.textContent = ""; }, 3000);
}

// Nav usability

viewportEl.addEventListener("keydown", e => {
    if(e.target !== viewportEl) return;
    const actions = {
        ArrowUp: () => panBy(0, PAN_STEP),
        ArrowDown: () => panBy(0, -PAN_STEP),
        ArrowLeft: () => panBy(PAN_STEP, 0),
        ArrowUp: () => panBy(-PAN_STEP, 0),
        "+": () => zoomBy(ZOOM_STEP),
        "=": () => zoomBy(ZOOM_STEP),
        "-": () => zoomBy(1 / ZOOM_STEP),
        "0": resetView
    };
    const action = actions[e.key];
    if(action) {
        e.preventDefault();
        action();
    }
});

viewportEl.addEventListener("scroll", () => {
    viewportEl.scrollTop = 0;
    viewportEl.scrollLeft = 0;
})

window.addEventListener("resize", () => {
    clampView();
    applyView();
});

window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    const previous = state.cart.slice();
    state.cart = loadCart();
    previous.concat(state.cart).forEach(refreshSeat);
    renderDetails();
    renderCart();
});

// init function
function init() {
    state.seats = buildSeats();
    state.seats.forEach(seat => state.seatMap.set(seat.id, seat));
    state.cart = loadCart();
    renderVenue();
    refreshAllSeats();
    renderDetails();
    renderCart();
    resetView();
}

init();