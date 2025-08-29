const TMDB_BASE_URL = "https://tmdb-proxy.akshitanoai.workers.dev";

// Fetch details of multiple series
export const fetchSeriesData = async (seriesIds) => {
  try {
    // For each series ID, call the Worker with /tv/{id}?language=en-US
    const requests = seriesIds.map((id) =>
      fetch(`${TMDB_BASE_URL}/tv/${id}?language=en-US`).then((res) => res.json())
    );
    const results = await Promise.all(requests);

    // Map the results into the shape your app expects
    return results.map((series) => ({
      id: series.id,
      name: series.name,
      overview: series.overview,
      poster_path: series.poster_path,
      genres: series.genres || [],
      number_of_seasons: series.number_of_seasons,
      vote_average: series.vote_average, // For rating-based sorting
      lastWatched: series.lastWatched || 0,
    }));
  } catch (error) {
    console.error("Error fetching series data:", error);
    return [];
  }
};

// Fetch episodes of a specific season (for series)
export const fetchSeasonEpisodes = async (seriesId, season) => {
  try {
    // e.g. /tv/119051/season/1?language=en-US
    const url = `${TMDB_BASE_URL}/tv/${seriesId}/season/${season}?language=en-US`;
    const response = await fetch(url);
    const data = await response.json();
    return data.episodes
      ? data.episodes.map((ep) => ({
          number: ep.episode_number,
          title: ep.name,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
};

// Fetch details of multiple movies
export const fetchMoviesData = async (movieIds) => {
  try {
    // For each movie ID, call the Worker with /movie/{id}?language=en-US
    const requests = movieIds.map((id) =>
      fetch(`${TMDB_BASE_URL}/movie/${id}?language=en-US`).then((res) => res.json())
    );
    const results = await Promise.all(requests);

    // Map the results into the shape your app expects
    return results.map((movie) => ({
      id: movie.id,
      name: movie.title, // For movies, we use title as name
      overview: movie.overview,
      poster_path: movie.poster_path,
      genres: movie.genres || [],
      release_date: movie.release_date,
      vote_average: movie.vote_average, // For rating-based sorting
      lastWatched: movie.lastWatched || 0,
    }));
  } catch (error) {
    console.error("Error fetching movies data:", error);
    return [];
  }
};
