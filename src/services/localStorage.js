// Helper functions for localStorage operations

// Initialize the storage with default values if empty
const initializeStorage = () => {
  if (!localStorage.getItem("movies")) {
    localStorage.setItem("movies", "[]");
  }
  if (!localStorage.getItem("series")) {
    localStorage.setItem("series", "[]");
  }
  if (!localStorage.getItem("media_removed")) {
    localStorage.setItem("media_removed", JSON.stringify({ movies: [], series: [] }));
  }
};

// Call initialization when the module loads
initializeStorage();

// Removed list management
const getRemovedList = () => {
  try {
    const removed = localStorage.getItem("media_removed");
    return removed ? JSON.parse(removed) : { movies: [], series: [] };
  } catch (error) {
    console.error("Error reading removed list:", error);
    return { movies: [], series: [] };
  }
};

const addToRemovedList = (id, type) => {
  try {
    const removed = getRemovedList();
    if (type === 'movie' && !removed.movies.includes(id)) {
      removed.movies.push(id);
    } else if (type === 'series' && !removed.series.includes(id)) {
      removed.series.push(id);
    }
    localStorage.setItem("media_removed", JSON.stringify(removed));
    return true;
  } catch (error) {
    console.error("Error adding to removed list:", error);
    return false;
  }
};

const removeFromRemovedList = (id, type) => {
  try {
    const removed = getRemovedList();
    if (type === 'movie') {
      removed.movies = removed.movies.filter(movieId => movieId !== id);
    } else if (type === 'series') {
      removed.series = removed.series.filter(seriesId => seriesId !== id);
    }
    localStorage.setItem("media_removed", JSON.stringify(removed));
    return true;
  } catch (error) {
    console.error("Error removing from removed list:", error);
    return false;
  }
};

export const isRemoved = (id, type) => {
  try {
    const removed = getRemovedList();
    return type === 'movie' 
      ? removed.movies.includes(id)
      : removed.series.includes(id);
  } catch (error) {
    console.error("Error checking removed status:", error);
    return false;
  }
};

// Get all movies from localStorage with error handling
export const getMovies = () => {
  try {
    const movies = localStorage.getItem("movies");
    return movies ? JSON.parse(movies) : [];
  } catch (error) {
    console.error("Error reading movies from localStorage:", error);
    return [];
  }
};

// Save movies to localStorage with error handling and quota management
export const saveMovies = (movies) => {
  try {
    // Compress movie data by keeping only essential fields to reduce storage size
    const compressedMovies = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      release_date: movie.release_date,
      runtime: movie.runtime,
      vote_average: movie.vote_average,
      genres: movie.genres,
      production_companies: movie.production_companies,
      belongs_to_collection: movie.belongs_to_collection,
      original_language: movie.original_language,
      
      // Keep track of app-specific metadata
      addedAt: movie.addedAt,
      lastWatched: movie.lastWatched,
      watchCount: movie.watchCount,
      
      // Keep nested keywords if available
      keywords: movie.keywords?.keywords ? { keywords: movie.keywords.keywords } : movie.keywords
    }));
    
    localStorage.setItem("movies", JSON.stringify(compressedMovies));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error("Storage quota exceeded. Implementing emergency compression...");
      try {
        // Emergency compression - keep bare minimum data
        const minimalMovies = movies.map(movie => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genres: movie.genres?.slice(0, 3).map(g => ({ id: g.id, name: g.name })),
          vote_average: movie.vote_average,
          original_language: movie.original_language,
          addedAt: movie.addedAt,
          lastWatched: movie.lastWatched,
          watchCount: movie.watchCount,
        }));
        
        localStorage.setItem("movies", JSON.stringify(minimalMovies));
        return true;
      } catch (fallbackError) {
        console.error("Emergency compression failed:", fallbackError);
        return false;
      }
    }
    console.error("Error saving movies to localStorage:", error);
    return false;
  }
};

// Add a movie to localStorage
export const addMovie = (movie) => {
  try {
    const movies = getMovies();
    // Check if movie already exists
    if (!movies.some((m) => m.id === movie.id)) {
      // Add timestamp and watched status
      const movieWithMeta = {
        ...movie,
        addedAt: Date.now(),
        lastWatched: null,
        watchCount: 0,
      };
      const success = saveMovies([...movies, movieWithMeta]);
      if (success) {
        removeFromRemovedList(movie.id, 'movie');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error adding movie:", error);
    return false;
  }
};

// Remove a movie from localStorage
export const removeMovie = (movieId) => {
  try {
    const movies = getMovies();
    addToRemovedList(movieId, 'movie');
    return saveMovies(movies.filter((movie) => movie.id !== movieId));
  } catch (error) {
    console.error("Error removing movie:", error);
    return false;
  }
};

// Get all series from localStorage
export const getSeries = () => {
  const series = localStorage.getItem("series");
  return series ? JSON.parse(series) : [];
};

// Save series to localStorage
export const saveSeries = (series) => {
  try {
    // Compress series data by keeping only essential fields to reduce storage size
    const compressedSeries = series.map(show => ({
      id: show.id,
      name: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      overview: show.overview,
      first_air_date: show.first_air_date,
      number_of_seasons: show.number_of_seasons,
      number_of_episodes: show.number_of_episodes,
      vote_average: show.vote_average,
      genres: show.genres,
      original_language: show.original_language,
      status: show.status,
      
      // Keep track of app-specific metadata
      addedAt: show.addedAt,
      lastWatched: show.lastWatched,
      watchProgress: show.watchProgress || {},
    }));
    
    localStorage.setItem("series", JSON.stringify(compressedSeries));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error("Storage quota exceeded. Implementing emergency compression for series...");
      try {
        // Emergency compression - keep bare minimum data
        const minimalSeries = series.map(show => ({
          id: show.id,
          name: show.name,
          poster_path: show.poster_path,
          first_air_date: show.first_air_date,
          genres: show.genres?.slice(0, 3).map(g => ({ id: g.id, name: g.name })),
          vote_average: show.vote_average,
          addedAt: show.addedAt,
          lastWatched: show.lastWatched,
          watchProgress: show.watchProgress || {},
        }));
        
        localStorage.setItem("series", JSON.stringify(minimalSeries));
        return true;
      } catch (fallbackError) {
        console.error("Emergency compression failed for series:", fallbackError);
        return false;
      }
    }
    console.error("Error saving series to localStorage:", error);
    return false;
  }
};

// Add a series to localStorage
export const addSeries = (series) => {
  const allSeries = getSeries();
  // Check if series already exists
  if (!allSeries.some((s) => s.id === series.id)) {
    // Add metadata
    const seriesWithMeta = {
      ...series,
      addedAt: Date.now(),
      watchProgress: {},
      lastWatched: null
    };
    saveSeries([...allSeries, seriesWithMeta]);
    // If the series was in the removed list, remove it from there
    removeFromRemovedList(series.id, 'series');
    return true;
  }
  return false;
};

// Remove a series from localStorage
export const removeSeries = (seriesId) => {
  const allSeries = getSeries();
  addToRemovedList(seriesId, 'series');
  saveSeries(allSeries.filter((series) => series.id !== seriesId));
};

// Get removed media list
export const getRemovedMedia = () => {
  return getRemovedList();
};

// Update movie watch status
export const updateMovieWatchStatus = (movieId) => {
  try {
    const movies = getMovies();
    const updatedMovies = movies.map((movie) => {
      if (movie.id === movieId) {
        return {
          ...movie,
          lastWatched: Date.now(),
          watchCount: (movie.watchCount || 0) + 1,
        };
      }
      return movie;
    });
    return saveMovies(updatedMovies);
  } catch (error) {
    console.error("Error updating movie watch status:", error);
    return false;
  }
};

// Update series watch progress
export const updateSeriesWatchProgress = (seriesId, seasonNumber, episodeNumber) => {
  const allSeries = getSeries();
  const updatedSeries = allSeries.map((series) => {
    if (series.id === seriesId) {
      const watchProgress = { ...(series.watchProgress || {}) };
      if (!watchProgress[seasonNumber]) {
        watchProgress[seasonNumber] = {};
      }
      watchProgress[seasonNumber][episodeNumber] = Date.now();
      return {
        ...series,
        lastWatched: Date.now(),
        watchProgress,
      };
    }
    return series;
  });
  saveSeries(updatedSeries);
};

// Get watch progress for a specific series
export const getSeriesWatchProgress = (seriesId) => {
  const allSeries = getSeries();
  const series = allSeries.find((s) => s.id === seriesId);
  return series ? series.watchProgress || {} : {};
};
  
  