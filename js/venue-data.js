// Venue model: The Grand Hall

const VENUE = {
    name: "The Grand Hall",
    currency: "$",
    categories: {
        premium: {
            label: "Premium",
            price: 95
        },
        standard: {
            label: "Standard",
            price: 60
        },
        economy: {
            label: "Economy",
            price: 35
        }
    },
    sections: [
        {
            id: '001-ORC',
            name: "Orchestra",
            category: "premium",
            rows: ["A", "B", "C", "D", "E", "F"],
            seatsPerRow: 14,
            unavailable: ["A5", "A6", "B9", "C3", "D12", "E7", "E8"]
        },
        {
            id: '002-MEZZ',
            name: "Mezzanine",
            category: "standard",
            rows: ["G", "H", "I", "J"],
            seatsPerRow: 16,
            unavailable: ["G1", "H8", "H9", "J14", "K4"]
        },
        {
            id: '003-BALC',
            name: "Balcony",
            category: "economy",
            rows: ["L", "M", "N", "O"],
            seatsPerRow: 18,
            unavailable: ["L10", "M2", "M3", "N17", "O6"]
        }
    ]
}

function makeSeatId(row, number) {
    return row + number;
}

function buildSeats() {
    const seats = [];
    VENUE.sections.forEach(section => {
        const category = VENUE.categories[section.category];
        section.rows.forEach(row => {
            for (let n = 1; n <= section.seatsPerRow; n++) {
                const id = makeSeatId(row, n);
                seats.push({
                    id: id,
                    sectionId: section.id,
                    sectionName: section.name,
                    row: row,
                    number: n,
                    categoryLabel: category.label,
                    price: category.price,
                    unavailable: section.unavailable.includes(id)
                });
            }
        });
    });
    return seats;
}