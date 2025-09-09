import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchMoviesData } from "../utils/tmdb";
import "../styles/movieWatch.css";

const WatchMoviePage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  // For Genre Modal
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genreMovies, setGenreMovies] = useState([]);

  // Fetch movie details on mount
  useEffect(() => {
    const loadMovie = async () => {
      try {
        const data = await fetchMoviesData([movieId]);
        if (data && data.length > 0) {
          const foundMovie = data[0];
          setMovie(foundMovie);

          // Mark lastWatched for this movie right now
          const now = Date.now();
          // Retrieve the entire movie list from localStorage
          const storedMovies = JSON.parse(localStorage.getItem("myMovieList")) || [];
          // Find the matching movie
          const foundIndex = storedMovies.findIndex((m) => m.id === Number(movieId));
          if (foundIndex !== -1) {
            storedMovies[foundIndex].lastWatched = now;
            localStorage.setItem("myMovieList", JSON.stringify(storedMovies));
          }
        } else {
          console.error("No movie data returned for movieId:", movieId);
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };
    loadMovie();
  }, [movieId]);

  // Handle a genre link click: open the modal and filter movies from localStorage
  const handleGenreClick = (genreName) => {
    setSelectedGenre(genreName);
    const stored = localStorage.getItem("myMovieList");
    if (stored) {
      const allMovies = JSON.parse(stored);
      // Filter movies that include the selected genre
      const filtered = allMovies.filter(
        (m) => m.genres && m.genres.some((g) => g.name === genreName)
      );
      setGenreMovies(filtered);
    } else {
      setGenreMovies([]);
    }
    setShowGenreModal(true);
  };

  // When a movie is selected from the modal, navigate to its watch page
  const handleSelectGenreMovie = (id) => {
    setShowGenreModal(false);
    navigate(`/watch-movie/${id}`);
  };

  return (
    <div className="movie-watch-page-container">
      {/* Header with Logo */}
      <header className="movie-header">
        <Link to="/" className="movie-logo">FlickFusion</Link>
      </header>

      {movie ? (
        <div className="movie-watch-container">
          {/* Video Player: Always 16:9 */}
          <div className="movie-video-player">
            <iframe
              id="videoFrame"
              src={`https://vidsrc.xyz/embed/movie?tmdb=${movie.id}&quality=hd`}
              allowFullScreen
            ></iframe>
          </div>

          {/* Info Section */}
          <div className="movie-info-section">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
            <h1>{movie.title}</h1>
            {/* Genre Links */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="movie-genre-links">
                {movie.genres.map((g) => (
                  <button key={g.id} onClick={() => handleGenreClick(g.name)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
            <p>{movie.overview}</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Genre Modal */}
      {showGenreModal && (
        <div
          className="movie-genre-modal"
          onClick={(e) => {
            // Close the modal if clicking on the overlay (outside the modal content)
            if (e.target.classList.contains("movie-genre-modal")) {
              setShowGenreModal(false);
            }
          }}
        >
          <div className="movie-genre-modal-content">
            <h2>{selectedGenre} Movies</h2>
            <div className="movie-genre-list">
              {genreMovies.length > 0 ? (
                genreMovies.map((m) => (
                  <div
                    key={m.id}
                    className="movie-genre-card"
                    onClick={() => handleSelectGenreMovie(m.id)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                      alt={m.title}
                    />
                    <p>{m.title}</p>
                  </div>
                ))
              ) : (
                <p>No movies found for this genre.</p>
              )}
            </div>
            <button
              className="movie-genre-modal-close"
              onClick={() => setShowGenreModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchMoviePage;
