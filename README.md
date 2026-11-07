# Interactive Venue Ticketing System

WM1 student project: a front-end ticket-selection site for a theatre, built with HTML, CSS and JavaScript.

## Run
Open `index.html` in a browser.

## Features
- 236 seats generated from a JavaScript data model (3 sections, 3 price categories)
- Seat states: available, selected, in cart, unavailable
- Clicking a seat inspects it; only "Add to cart" adds a ticket
- Zoom, directional movement and reset controls (keyboard shortcuts on the map)
- Cart with prices, total and removal, kept in sync with the map
- Cart saved in localStorage and restored on refresh
- Responsive layout for desktop, tablet and phone

## Manual test checklist
- [x] Click a seat: details appear, cart unchanged
- [x] Add a seat twice: no duplicate
- [x] Remove from cart: the seat changes on the map immediately
- [x] Refresh: cart and seat states restored
- [x] Unavailable seat cannot be added
- [x] All map controls and Reset work
- [x] Layout checked at desktop, tablet and phone widths
- [x] Bonus: Mouse wheel zoom and drag panning