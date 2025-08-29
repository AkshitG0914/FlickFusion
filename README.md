# Flick Fusion

Flick Fusion is a modern React-based web application for managing and watching your favorite TV series and movies. It provides a beautiful, responsive interface for organizing your personal media collection, searching for new content, and streaming episodes or movies directly from the browser.

---

## Features

- **Personal Media Collections:**  
  Maintain separate collections for TV series and movies. Add new items via search, reorder, or remove them as you wish.

- **Search & Add:**  
  Search for any series or movie using TMDB's API proxy and add them to your collection with a single click.

- **Filter & Sort:**  
  Powerful filter and sort options by genre, last watched, alphabetical order, rating, and (for movies) release date.

- **Watch Directly:**  
  Stream episodes or movies using embedded players. For series, select season and episode; for movies, watch in HD.

- **Genre Browsing:**  
  Click on any genre to view all items in your collection that match, and quickly jump to their watch pages.

- **Responsive Design:**  
  Fully optimized for desktop, tablet, and mobile screens.

- **Persistent Storage:**  
  All collections and watch history are stored in your browser's localStorage, so your data is preserved across sessions.

---

## Tech Stack

- **Frontend:**  
  - React 18  
  - React Router DOM  
  - Vite (for fast development and build)  
  - CSS Modules for styling

- **APIs:**  
  - TMDB Proxy API (via Cloudflare Worker) for fetching movie/series/episode data

- **Other:**  
  - LocalStorage for persistent user data  
  - ESLint for code quality

- **Planned Backend:**  
  - **Node.js** and **MongoDB** will be integrated in future versions to provide a full backend and persistent storage beyond the browser.

---

## Folder Structure

```
Basic_Flick_Fusion/
├── src/
│   ├── component/         # Reusable React components (e.g., AddMedia)
│   ├── data/              # Seed data for initial collections
│   ├── pages/             # Main pages (Home, Watch Series, Watch Movie)
│   ├── styles/            # CSS files for each page/component
│   ├── utils/             # Utility functions (TMDB API helpers)
│   ├── App.jsx            # Main App component with routes
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets (favicon, etc.)
├── index.html             # Main HTML file
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Project documentation
```

---

## Usage

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

---

## How It Works

- **Home Page:**  
  - Choose between "My Series Collection" and "My Movie Collection".
  - Search for new items and add them to your collection.
  - Filter and sort your collection.
  - Reorder or delete items.

- **Watch Series Page:**  
  - Select a season and episode to watch.
  - See series details and genres.
  - Browse other series by genre.

- **Watch Movie Page:**  
  - Watch the selected movie in HD.
  - See movie details and genres.
  - Browse other movies by genre.

- **Add Media Modal:**  
  - Search TMDB for any series or movie.
  - Preview results and add directly to your collection.

---

## Customization

- **Seed Data:**  
  The app loads with a set of popular movies and series (see `src/data/seedData.json`). You can modify this file to change the initial collection.

- **Styling:**  
  All styles are in the `src/styles/` folder and can be customized as needed.

---

## Credits

- **TMDB API** for movie and series data.
- **vidsrc.xyz** for streaming embeds.
- **UIverse.io** for some UI inspiration.

---

## License

This project is for educational and personal use.  
Not for commercial redistribution.

---

## Author

Developed by Akshit Anoai.
