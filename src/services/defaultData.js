// Default movie IDs for popular movies
export const defaultData = {
  movies: [
    1726
  ],
  series: [
    85271
  ]
};

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeDefaultData = async () => {
  const { getMovies, addMovie } = await import('./localStorage');
  const { getMovieDetails, getSeriesDetails } = await import('./api');
  const { getSeries, addSeries } = await import('./localStorage');

  // Initialize default movies
  await initializeDefaultMovies(getMovies, addMovie, getMovieDetails);
  
  // Initialize default series
  await initializeDefaultSeries(getSeries, addSeries, getSeriesDetails);
};

const initializeDefaultMovies = async (getMovies, addMovie, getMovieDetails) => {
  // Get existing movies
  const existingMovies = getMovies();
  const existingMovieIds = new Set(existingMovies.map(m => m.id));

  // Calculate missing movies
  const missingMovies = defaultData.movies.filter(id => !existingMovieIds.has(id));

  // If no movies are missing, return early
  if (missingMovies.length === 0) {
    console.log('All default movies are already loaded.');
    return;
  }

  console.log(`Loading ${missingMovies.length} default movies...`);

  // Load missing movies with error handling and retries
  for (const movieId of missingMovies) {
    try {
      // Add a small delay to prevent rate limiting
      await delay(50);
      
      const movieDetails = await getMovieDetails(movieId);
      if (movieDetails && movieDetails.title) {
        const movieWithMeta = {
          ...movieDetails,
          addedAt: Date.now(),
          lastWatched: null,
          watchCount: 0,
        };
        const success = addMovie(movieWithMeta);
        if (success) {
          console.log(`✓ Added default movie: ${movieDetails.title}`);
        }
      }
    } catch (error) {
      console.error(`Failed to load movie ${movieId}:`, error);
      
      // Try one more time after a longer delay
      try {
        await delay(1000);
        const movieDetails = await getMovieDetails(movieId);
        if (movieDetails && movieDetails.title) {
          const movieWithMeta = {
            ...movieDetails,
            addedAt: Date.now(),
            lastWatched: null,
            watchCount: 0,
          };
          const success = addMovie(movieWithMeta);
          if (success) {
            console.log(`✓ Added default movie on retry: ${movieDetails.title}`);
          }
        }
      } catch (retryError) {
        console.error(`Failed to load movie ${movieId} after retry:`, retryError);
      }
    }
  }
};

const initializeDefaultSeries = async (getSeries, addSeries, getSeriesDetails) => {
  // Get existing series
  const existingSeries = getSeries();
  const existingSeriesIds = new Set(existingSeries.map(s => s.id));

  // Calculate missing series
  const missingSeries = defaultData.series.filter(id => !existingSeriesIds.has(id));

  // If no series are missing, return early
  if (missingSeries.length === 0) {
    console.log('All default series are already loaded.');
    return;
  }

  console.log(`Loading ${missingSeries.length} default series...`);

  // Load missing series with error handling and retries
  for (const seriesId of missingSeries) {
    try {
      // Add a small delay to prevent rate limiting
      await delay(50);
      
      const seriesDetails = await getSeriesDetails(seriesId);
      if (seriesDetails && seriesDetails.name) {
        const seriesWithMeta = {
          ...seriesDetails,
          addedAt: Date.now(),
          lastWatched: null,
          watchProgress: {},
        };
        const success = addSeries(seriesWithMeta);
        if (success) {
          console.log(`✓ Added default series: ${seriesDetails.name}`);
        }
      }
    } catch (error) {
      console.error(`Failed to load series ${seriesId}:`, error);
      
      // Try one more time after a longer delay
      try {
        await delay(1000);
        const seriesDetails = await getSeriesDetails(seriesId);
        if (seriesDetails && seriesDetails.name) {
          const seriesWithMeta = {
            ...seriesDetails,
            addedAt: Date.now(),
            lastWatched: null,
            watchProgress: {},
          };
          const success = addSeries(seriesWithMeta);
          if (success) {
            console.log(`✓ Added default series on retry: ${seriesDetails.name}`);
          }
        }
      } catch (retryError) {
        console.error(`Failed to load series ${seriesId} after retry:`, retryError);
      }
    }
  }
}; 