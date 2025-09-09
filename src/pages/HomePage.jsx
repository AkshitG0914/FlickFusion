import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSeriesData, fetchMoviesData } from "../utils/tmdb";
import seedData from "../data/seedData.json"; // Your seed data
import "../styles/home.css";
import AddMedia from "../component/addmedia";

// Helper function to get available genres from items
const getAvailableGenres = (items) => {
  const genresSet = new Set();
  items.forEach((item) => {
    if (item.genres && item.genres.length > 0) {
      item.genres.forEach((genre) => genresSet.add(genre.name));
    }
  });
  return Array.from(genresSet);
};

// Helper function to filter items based on search and genre.
const filteredItems = (items, searchQuery, filterGenre) => {
  return items.filter((item) => {
    const itemName = item?.name || item?.title || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      filterGenre === '' ||
      (item?.genres && item.genres.some((g) => g?.name === filterGenre));
    return matchesSearch && matchesGenre;
  });
};

function HomePage() {
  // "series" or "movies"
  const [collectionType, setCollectionType] = useState("series");

  // Lists of items
  const [seriesList, setSeriesList] = useState([]);
  const [movieList, setMovieList] = useState([]);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [sortMethod, setSortMethod] = useState("lastWatched");

  // Temp states for Filter & Sort popout
  const [tempFilterGenre, setTempFilterGenre] = useState("");
  const [tempSortMethod, setTempSortMethod] = useState("lastWatched");

  // Whether to show the filter/sort overlay
  const [showFilterSort, setShowFilterSort] = useState(false);

  // Load collectionType from localStorage (if available)
  useEffect(() => {
    const storedType = localStorage.getItem("collectionType");
    if (storedType) {
      setCollectionType(storedType);
    }
  }, []);

  // On mount, load or seed data for Series & Movies
  useEffect(() => {
    // Series
    const storedSeries = localStorage.getItem("mySeriesList");
    if (storedSeries && JSON.parse(storedSeries).length > 0) {
      setSeriesList(JSON.parse(storedSeries));
    } else {
      const loadInitialSeries = async () => {
        const data = await fetchSeriesData(seedData.series);
        localStorage.setItem("mySeriesList", JSON.stringify(data));
        setSeriesList(data);
      };
      loadInitialSeries();
    }

    // Movies
    const storedMovies = localStorage.getItem("myMovieList");
    if (storedMovies && JSON.parse(storedMovies).length > 0) {
      setMovieList(JSON.parse(storedMovies));
    } else {
      const loadInitialMovies = async () => {
        const data = await fetchMoviesData(seedData.movies);
        localStorage.setItem("myMovieList", JSON.stringify(data));
        setMovieList(data);
      };
      loadInitialMovies();
    }
  }, []);

  // Switch between "series" or "movies"
  const handleCollectionTypeChange = (type) => {
    setCollectionType(type);
    localStorage.setItem("collectionType", type);
  };

  // Sorting function
  const sortItems = (items) => {
    let sorted = [...items];
    switch (tempSortMethod) {
      case "lastWatched":
        sorted.sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
        break;
      case "reverseLastWatched":
        sorted.sort((a, b) => (a.lastWatched || 0) - (b.lastWatched || 0));
        break;
      case "alphabetical":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "reverseAlphabetical":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case "reverseRating":
        sorted.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
        break;
      case "releaseDate":
        if (collectionType === "movies") {
          sorted.sort(
            (a, b) => new Date(b.release_date) - new Date(a.release_date)
          );
        }
        break;
      case "reverseReleaseDate":
        if (collectionType === "movies") {
          sorted.sort(
            (a, b) => new Date(a.release_date) - new Date(b.release_date)
          );
        }
        break;
      default:
        break;
    }
    return sorted;
  };

  // Apply filter & sort
  const applyFilterSort = () => {
    setFilterGenre(tempFilterGenre);
    setSortMethod(tempSortMethod);
    setShowFilterSort(false);
  };

  // Open Filter & Sort
  const openFilterSort = () => {
    setTempFilterGenre(filterGenre);
    setTempSortMethod(sortMethod);
    setShowFilterSort(true);
  };

  // Once an item is added in AddMedia, update local states & localStorage
  const handleItemAdded = (item) => {
    // item.media_type = 'tv' or 'movie'
    const itemName = item.name ?? item.title ?? "No Title";

    if (item.media_type === "tv") {
      setSeriesList((prev) => {
        if (!prev.some((s) => s.id === item.id)) {
          const updated = [{ ...item, name: itemName }, ...prev];
          localStorage.setItem("mySeriesList", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    } else if (item.media_type === "movie") {
      setMovieList((prev) => {
        if (!prev.some((m) => m.id === item.id)) {
          const updated = [{ ...item, name: itemName }, ...prev];
          localStorage.setItem("myMovieList", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  };

  // Move item left or right
  const moveItem = (index, direction) => {
    if (collectionType === "series") {
      const newList = [...seriesList];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newList.length) {
        [newList[index], newList[targetIndex]] = [
          newList[targetIndex],
          newList[index],
        ];
        setSeriesList(newList);
        localStorage.setItem("mySeriesList", JSON.stringify(newList));
      }
    } else {
      const newList = [...movieList];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newList.length) {
        [newList[index], newList[targetIndex]] = [
          newList[targetIndex],
          newList[index],
        ];
        setMovieList(newList);
        localStorage.setItem("myMovieList", JSON.stringify(newList));
      }
    }
  };

  // Remove item
  const removeItem = (index) => {
    if (collectionType === "series") {
      const newList = [...seriesList];
      newList.splice(index, 1);
      setSeriesList(newList);
      localStorage.setItem("mySeriesList", JSON.stringify(newList));
    } else {
      const newList = [...movieList];
      newList.splice(index, 1);
      setMovieList(newList);
      localStorage.setItem("myMovieList", JSON.stringify(newList));
    }
  };

  // Final displayed items
  const itemsToSort = collectionType === "series" ? seriesList : movieList;
  const sortedItems = sortItems(itemsToSort);
  const displayedItems = filteredItems(sortedItems, searchQuery, filterGenre);

  return (
    <div className="home-container">
      {/* Header with Collection Tabs */}
      <div className="header-collections">
        <h1
          className={collectionType === "series" ? "active" : ""}
          onClick={() => handleCollectionTypeChange("series")}
        >
          My Series Collection
        </h1>
        <h1
          className={collectionType === "movies" ? "active" : ""}
          onClick={() => handleCollectionTypeChange("movies")}
        >
          My Movie Collection
        </h1>
      </div>

      {/* Search & Filter-Sort Row */}
      <div className="search-filter-container">
        {/* Uiverse.io style search bar */}
        <div className="group">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
          <input
            id="query"
            className="input"
            type="search"
            placeholder="Search..."
            name="searchbar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* "Filter & Sort" Button */}
        <div className="filter-sort-button-container">
          <button className="boton-elegante" onClick={openFilterSort}>
            <span>Filter & Sort</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Popout */}
      {showFilterSort && (
        <div
          className="filter-sort-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("filter-sort-overlay")) {
              setShowFilterSort(false);
            }
          }}
        >
          <div className="filter-sort-dropdown">
            {/* Genre Filter */}
            <div className="filter-sort-section">
              <label>Genre:</label>
              <select
                value={tempFilterGenre}
                onChange={(e) => setTempFilterGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {getAvailableGenres(
                  collectionType === "series" ? seriesList : movieList
                ).map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Button Pairs */}
            <div className="filter-sort-section">
              <label>Sort By:</label>

              {/* Last Watched Pair */}
              <div className="sort-group">
                <button
                  className={`btn-31 ${
                    tempSortMethod === "lastWatched" ? "active-sort" : ""
                  }`}
                  onClick={() => setTempSortMethod("lastWatched")}
                >
                  <span className="text-container">
                    <span className="text">Last Watched</span>
                  </span>
                </button>
                <button
                  className={`btn-31 reverse-btn ${
                    tempSortMethod === "reverseLastWatched"
                      ? "active-sort"
                      : ""
                  }`}
                  onClick={() => setTempSortMethod("reverseLastWatched")}
                >
                  <span className="text-container">
                    <span className="text">Reverse Last Watched</span>
                  </span>
                </button>
              </div>

              {/* Alphabetical Pair */}
              <div className="sort-group">
                <button
                  className={`btn-31 ${
                    tempSortMethod === "alphabetical" ? "active-sort" : ""
                  }`}
                  onClick={() => setTempSortMethod("alphabetical")}
                >
                  <span className="text-container">
                    <span className="text">Alphabetical</span>
                  </span>
                </button>
                <button
                  className={`btn-31 reverse-btn ${
                    tempSortMethod === "reverseAlphabetical"
                      ? "active-sort"
                      : ""
                  }`}
                  onClick={() => setTempSortMethod("reverseAlphabetical")}
                >
                  <span className="text-container">
                    <span className="text">Reverse Alphabetical</span>
                  </span>
                </button>
              </div>

              {/* Rating Pair */}
              <div className="sort-group">
                <button
                  className={`btn-31 ${
                    tempSortMethod === "rating" ? "active-sort" : ""
                  }`}
                  onClick={() => setTempSortMethod("rating")}
                >
                  <span className="text-container">
                    <span className="text">Rating</span>
                  </span>
                </button>
                <button
                  className={`btn-31 reverse-btn ${
                    tempSortMethod === "reverseRating" ? "active-sort" : ""
                  }`}
                  onClick={() => setTempSortMethod("reverseRating")}
                >
                  <span className="text-container">
                    <span className="text">Reverse Rating</span>
                  </span>
                </button>
              </div>

              {/* Release Date Pair (Movies Only) */}
              {collectionType === "movies" && (
                <div className="sort-group">
                  <button
                    className={`btn-31 ${
                      tempSortMethod === "releaseDate" ? "active-sort" : ""
                    }`}
                    onClick={() => setTempSortMethod("releaseDate")}
                  >
                    <span className="text-container">
                      <span className="text">Release Date</span>
                    </span>
                  </button>
                  <button
                    className={`btn-31 reverse-btn ${
                      tempSortMethod === "reverseReleaseDate"
                        ? "active-sort"
                        : ""
                    }`}
                    onClick={() => setTempSortMethod("reverseReleaseDate")}
                  >
                    <span className="text-container">
                      <span className="text">Reverse Release Date</span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Cancel & Apply Buttons */}
            <div className="filter-sort-section buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowFilterSort(false)}
              >
                Cancel
              </button>
              <button className="apply-btn" onClick={applyFilterSort}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The AddMedia component with an onItemAdded callback */}
      <div className="add-series">
        <AddMedia onItemAdded={handleItemAdded} />
      </div>

      {/* Display Items in a Grid of Cards */}
      <div className="series-grid">
        {displayedItems.map((item, index) => (
          <div key={`${item.id}-${collectionType}-${index}`} className="series-card">
            {collectionType === "series" ? (
              <Link to={`/watch/${item.id}`} className="card-link">
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.name || 'No title'}
                />
                <div className="overlay">
                  <h3>{item.name || 'No title'}</h3>
                  <p>{(item.overview || 'No description available').slice(0, 80)}...</p>
                </div>
              </Link>
            ) : (
              <Link to={`/watch-movie/${item.id}`} className="card-link">
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.name || 'No title'}
                />
                <div className="overlay">
                  <h3>{item.name || 'No title'}</h3>
                  <p>{(item.overview || 'No description available').slice(0, 80)}...</p>
                </div>
              </Link>
            )}
            <div className="card-controls">
              <button onClick={() => moveItem(index, "left")}>&larr;</button>
              <button onClick={() => moveItem(index, "right")}>&rarr;</button>
              <button onClick={() => removeItem(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
