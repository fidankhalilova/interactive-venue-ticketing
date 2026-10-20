const state = {
    seats: [],
    seatMap: new Map(),
    inspectedId: null,
    cart: []
};

const STATE_LABELS = {
    available: "available",
    inspected: "selected",
    "in-cart": "in your cart",
    unavailable: "unavailable"
};

const mapEl = document.getElementById('venue-map');
const seatEls = new Map();

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

mapEl.addEventListener("click", e => {
    const btn = e.target.closest(".seat");
    if(btn) inspectSeat(btn.dataset.id);
});

function init() {
    state.seats = buildSeats();
    state.seats.forEach(seat => state.seatMap.set(seat.id, seat));
    renderVenue();
    refreshAllSeats();
}

init();