import React, { useState } from "react";
import "./addmedia.css";

function AddMedia({ onItemAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    const url = `https://tmdb-proxy.akshitanoai.workers.dev/search/multi?query=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.results) {
        // Filter out 'person' if you only want tv or movie
        const filtered = data.results.filter(
          (item) => item.media_type === "tv" || item.media_type === "movie"
        );
        setResults(filtered);
      } else {
        setResults([]);
      }

      // Show the modal with the results
      setShowModal(true);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setShowModal(true); // show modal (even if empty)
    }
  }

  function handleAdd(item) {
    const itemName = item.name ?? item.title ?? "No Title";

    // Also store in localStorage so reloading still has them
    if (item.media_type === "tv") {
      const stored = JSON.parse(localStorage.getItem("mySeriesList")) || [];
      if (!stored.some((s) => s.id === item.id)) {
        stored.unshift({ ...item, name: itemName });
        localStorage.setItem("mySeriesList", JSON.stringify(stored));
      }
    } else if (item.media_type === "movie") {
      const stored = JSON.parse(localStorage.getItem("myMovieList")) || [];
      if (!stored.some((m) => m.id === item.id)) {
        stored.unshift({ ...item, name: itemName });
        localStorage.setItem("myMovieList", JSON.stringify(stored));
      }
    }

    // Notify HomePage to update its local state
    if (onItemAdded) {
      onItemAdded(item);
    }

    // Close modal
    setShowModal(false);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function stopPropagation(e) {
    e.stopPropagation();
  }

  return (
    <div className="add-media-container">
      <form className="add-media-form" onSubmit={handleSearch}>
        <div className="form__group field">
          <input
            type="text"
            className="form__field"
            placeholder="Name"
            name="search"
            id="search"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label htmlFor="search" className="form__label">
            Name
          </label>
        </div>

        <button className="boton-elegante" type="submit">
          Search
        </button>
      </form>

      {showModal && (
        <div className="search-modal" onClick={handleCloseModal}>
          <div className="search-modal-content" onClick={stopPropagation}>
            {results.length > 0 ? (
              results.map((item) => {
                const title = item.name ?? item.title ?? "No Title";
                const overview = item.overview || "";
                const poster = item.poster_path
                  ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                  : null;

                return (
                  <div key={item.id} className="search-result-card">
                    {poster && (
                      <img src={poster} alt={title} className="result-poster" />
                    )}
                    <div className="result-info">
                      <strong className="result-title">{title}</strong>
                      <p className="result-overview">
                        {overview.slice(0, 150)}...
                      </p>
                      <button onClick={() => handleAdd(item)}>Add This</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddMedia;
