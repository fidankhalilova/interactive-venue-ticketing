const state = {
    seats: [],
    seatMap: new Map(),
    inspectedId: null,
    cart: []
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

function init() {
    state.seats = buildSeats();
    state.seats.forEach(seat => state.seatMap.set(seat.id, seat));
    renderVenue();
}

init();