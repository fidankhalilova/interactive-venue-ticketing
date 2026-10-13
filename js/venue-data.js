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
            seatsPerRow: 14
        },
        {
            id: '002-MEZZ',
            name: "Mezzanine",
            category: "standard",
            rows: ["G", "H", "I", "J"],
            seatsPerRow: 16
        },
        {
            id: '003-BALC',
            name: "Balcony",
            category: "economy",
            rows: ["L", "M", "N", "O"],
            seatsPerRow: 18
        }
    ]
}