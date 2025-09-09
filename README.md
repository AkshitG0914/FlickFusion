# Flick-Fusion

Flick-Fusion is a modern web application for managing and streaming your personal movie and TV series collection. This platform allows users to organize, add, and watch their favorite media content in one centralized location.

## Live Link
<a href="https://flick-fusion-x.vercel.app/" target="_blank">Flick Fusion</a>

## Features

- **Media Management:** Add, organize, and remove your movies and TV series.
- **Dedicated Sections:** Separate spaces for movies and TV series.
- **Streaming Capability:** Watch your media content directly through the platform.
- **Responsive Design:** Modern and user-friendly interface that works on various devices.
- **Easy Navigation:** Intuitive navbar for seamless movement between different sections.
- **Theme Toggle:** Switch between dark and light modes.
- **Sorting & Filtering:** Sort by release date, genre, and more.
- **Like/Favorite:** Mark your favorite movies and series.

## Tech Stack

- React 18
- Vite
- React Router DOM
- React Icons
- Custom CSS (with CSS variables for theming)
- ESLint

## Folder Structure

```
src/
  App.jsx            # Main app component, routing, theme
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

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Run the development server:**
   ```sh
   npm run dev
   ```

3. **Build for production:**
   ```sh
   npm run build
   ```

4. **Preview production build:**
   ```sh
   npm run preview
   ```

## Usage

- **Add Media:** Go to "Add Media" to add movies or series.
- **Browse:** Use "My Movies" and "My Series" to view and manage your collection.
- **Watch:** Click on any item to view details and watch.
- **Theme:** Toggle dark/light mode from the navbar.

## License

This project is for personal use and learning. See [LICENSE](LICENSE) for details.

---

Enjoy managing and streaming your media with Flick-Fusion!