import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchSeriesData, fetchSeasonEpisodes } from "../utils/tmdb";
import "../styles/watch.css";

const WatchPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  // For Genre Modal
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genreSeries, setGenreSeries] = useState([]);

  // Fetch series details on mount
  useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await fetchSeriesData([seriesId]);
        if (data && data.length > 0) {
          setSeries(data[0]);
          const totalSeasons = data[0].number_of_seasons || 1;
          setSeasons(Array.from({ length: totalSeasons }, (_, i) => i + 1));

          // Load last watched episode (if any)
          const lastWatched = JSON.parse(localStorage.getItem(`lastWatched-${seriesId}`));
          setSelectedSeason(lastWatched ? lastWatched.season : 1);
          setCurrentEpisode(lastWatched ? lastWatched.episode : 1);
        } else {
          console.error("No series data returned for seriesId:", seriesId);
        }
      } catch (error) {
        console.error("Error fetching series data:", error);
      }
    };
    loadSeries();
  }, [seriesId]);

  // Fetch episodes when the season changes
  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        const episodesData = await fetchSeasonEpisodes(seriesId, selectedSeason);
        setEpisodes(episodesData);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    };
    if (selectedSeason) {
      loadEpisodes();
    }
  }, [seriesId, selectedSeason]);

  // Update the video player (and lastWatched) when an episode is selected
  const loadEpisode = (episode) => {
    setCurrentEpisode(episode);

    // Mark this series as last watched right now
    const now = Date.now();

    // 1) Retrieve the entire series array from localStorage
    const storedSeries = JSON.parse(localStorage.getItem("mySeriesList")) || [];
    // 2) Find the matching series
    const foundIndex = storedSeries.findIndex((s) => s.id === Number(seriesId));
    if (foundIndex !== -1) {
      // 3) Update lastWatched
      storedSeries[foundIndex].lastWatched = now;
      // 4) Save it back
      localStorage.setItem("mySeriesList", JSON.stringify(storedSeries));
    }

    // Also store the last watched season/episode
    localStorage.setItem(`lastWatched-${seriesId}`, JSON.stringify({ season: selectedSeason, episode }));
  };

  // Handle a genre link click: open the modal and filter series from localStorage
  const handleGenreClick = (genreName) => {
    setSelectedGenre(genreName);
    const stored = localStorage.getItem("mySeriesList");
    if (stored) {
      const allSeries = JSON.parse(stored);
      // Filter series that include the selected genre
      const filtered = allSeries.filter(
        (s) => s.genres && s.genres.some((g) => g.name === genreName)
      );
      setGenreSeries(filtered);
    } else {
      setGenreSeries([]);
    }
    setShowGenreModal(true);
  };

  // When a series is selected from the modal, navigate to its watch page
  const handleSelectGenreSeries = (id) => {
    setShowGenreModal(false);
    navigate(`/watch/${id}`);
  };

  return (
    <div className="watch-page-container">
      {/* Header with Logo */}
      <header className="header">
        <Link to="/" className="logo">FlickFusion</Link>
      </header>

      {series ? (
        <div className="watch-container">
          {/* Sidebar: Seasons & Episodes */}
          <div className="sidebar">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  Season {season}
                </option>
              ))}
            </select>
            <ul className="episode-list">
  {episodes.map((ep) => (
    <li
      key={ep.number}
      onClick={() => loadEpisode(ep.number)}
      className={currentEpisode === ep.number ? "current-episode" : ""}
    >
      {ep.number}. {ep.title}
    </li>
  ))}
</ul>

          </div>

          {/* Video Player: Always 16:9 */}
          <div className="video-player">
            <iframe
              id="videoFrame"
              src={`https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${selectedSeason}&episode=${currentEpisode}`}
              allowFullScreen
            ></iframe>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <img
              src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
              alt={series.name}
            />
            <h1>{series.name}</h1>
            {/* Genre Links */}
            {series.genres && series.genres.length > 0 && (
              <div className="genre-links">
                {series.genres.map((g) => (
                  <button key={g.id} onClick={() => handleGenreClick(g.name)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
            <p>{series.overview}</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Genre Modal */}
      {showGenreModal && (
        <div
          className="genre-modal"
          onClick={(e) => {
            // Close the modal if clicking on the overlay (outside the modal content)
            if (e.target.classList.contains("genre-modal")) {
              setShowGenreModal(false);
            }
          }}
        >
          <div className="genre-modal-content">
            <h2>{selectedGenre} Series</h2>
            <div className="genre-series-list">
              {genreSeries.length > 0 ? (
                genreSeries.map((s) => (
                  <div
                    key={s.id}
                    className="genre-series-card"
                    onClick={() => handleSelectGenreSeries(s.id)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w200${s.poster_path}`}
                      alt={s.name}
                    />
                    <p>{s.name}</p>
                  </div>
                ))
              ) : (
                <p>No series found for this genre.</p>
              )}
            </div>
            <button className="genre-modal-close" onClick={() => setShowGenreModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPage;
