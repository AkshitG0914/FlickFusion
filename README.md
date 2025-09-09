# Flick-Fusion

Flick-Fusion is a modern web application for managing and streaming your personal movie and TV series collection. It provides an intuitive interface to organize, add, and watch your favorite media content in one centralized location.

## Live Demo

[Visit Flick-Fusion](https://flick-fusion-x.vercel.app/)

---

## Table of Contents
- [Features](#features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Media Management:** Add, organize, and remove movies and TV series.
- **Dedicated Sections:** Separate views for movies and TV series.
- **Streaming Capability:** Watch your media directly in the app.
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile.
- **Easy Navigation:** Intuitive navbar for quick access to all sections.
- **Theme Toggle:** Switch between dark and light modes.
- **Sorting & Filtering:** Sort by release date, genre, and more.
- **Like/Favorite:** Mark your favorite movies and series.
- **404 Page:** Friendly error page for invalid routes.

---

## How It Works

1. **Landing Page:**
   - Welcome screen with quick links to movies, series, and add media.
2. **Add Media:**
   - Fill out a form to add new movies or TV series to your collection.
   - Specify details like title, genre, release date, and streaming link.
3. **My Movies / My Series:**
   - Browse your collection, sort and filter items, and mark favorites.
   - Remove items you no longer want.
4. **Watch Movie / Watch Series:**
   - Click any item to view details and stream directly in the app.
5. **Theme Toggle:**
   - Use the navbar switch to toggle between dark and light modes.
6. **Navigation:**
   - The navbar provides links to all main sections for easy movement.
7. **404 Page:**
   - If you visit an invalid route, a custom NotFound page is shown.

---

## Tech Stack
- **Frontend:** React 18, Vite
- **Routing:** React Router DOM
- **Icons:** React Icons
- **Styling:** Custom CSS with CSS variables for theming
- **Linting:** ESLint

---

## Folder Structure
```
src/
  App.jsx            # Main app component, routing, theme logic
  App.css            # App-wide styles
  index.css          # Global styles, variables, utilities
  pages/
    LandingPage.jsx  # Home/landing page
    MyMovies.jsx     # Movies collection
    MySeries.jsx     # Series collection
    WatchMovie.jsx   # Watch movie details/player
    WatchSeries.jsx  # Watch series details/player
    AddMedia.jsx     # Add new media form
    NotFound.jsx     # 404 page
  components/
    Navbar.jsx       # Navigation bar
  utils/
    movieOrganization.js # Sorting/grouping helpers
index.html           # HTML template
package.json         # Project metadata and scripts
README.md            # Project documentation
```

---

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/flick-fusion.git
   cd flick-fusion
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run the development server:**
   ```sh
   npm run dev
   ```
4. **Open in browser:**
   Visit `http://localhost:5173` (or the port shown in your terminal).

---

## Usage Guide

- **Add Media:**
  - Navigate to "Add Media" from the navbar.
  - Fill out the form and submit to add a new movie or series.
- **Browse Collection:**
  - Use "My Movies" and "My Series" to view, sort, filter, and manage your collection.
- **Watch Content:**
  - Click any item to view details and stream it directly.
- **Mark Favorites:**
  - Click the like/favorite icon to mark items you love.
- **Theme Toggle:**
  - Use the switch in the navbar to change between dark and light modes.
- **Remove Media:**
  - Delete unwanted items from your collection.
- **Navigation:**
  - Use the navbar for quick access to all sections.

---

## Contributing

Contributions are welcome! Feel free to fork the repo, open issues, or submit pull requests for improvements.

---

## License

This project is for personal use and learning. See [LICENSE](LICENSE) for details.

---

## Authors

- Akshit
- Aman Shamra
- Aryan Tiwari

Enjoy managing and streaming your media with Flick-Fusion!