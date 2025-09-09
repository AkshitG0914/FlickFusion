// Cinematic Universe definitions
const CINEMATIC_UNIVERSES = {
  MCU: {
    name: "Marvel Cinematic Universe",
    productionCompanies: ["Marvel Studios"],
    keywords: ["marvel cinematic universe", "mcu"],
    genres: ["Action", "Science Fiction", "Adventure"],
  },
  DCEU: {
    name: "DC Extended Universe",
    productionCompanies: ["DC Films", "DC Studios", "Warner Bros. Pictures"],
    keywords: ["dc extended universe", "dceu"],
    genres: ["Action", "Science Fiction", "Fantasy"],
  },
  // Add more universes as needed
};

// Check if a movie belongs to a cinematic universe
export const getMovieUniverse = (movie) => {
  if (!movie) return null;

  for (const [key, universe] of Object.entries(CINEMATIC_UNIVERSES)) {
    // Check production companies
    const hasMatchingCompany = movie.production_companies?.some(company =>
      universe.productionCompanies.includes(company.name)
    );

    // Check keywords - Handle nested keywords structure from TMDB API
    // TMDB returns keywords in format { keywords: [{id, name}] }
    const keywordsArray = movie.keywords?.keywords || movie.keywords || [];
    const hasMatchingKeyword = Array.isArray(keywordsArray) && keywordsArray.some(keyword =>
      keyword && keyword.name && universe.keywords.includes(keyword.name.toLowerCase())
    );

    // Check genres as supporting factor
    const hasMatchingGenres = movie.genres?.some(genre =>
      universe.genres.includes(genre.name)
    );

    if (hasMatchingCompany || hasMatchingKeyword || (hasMatchingGenres && (hasMatchingCompany || hasMatchingKeyword))) {
      return {
        key,
        ...universe
      };
    }
  }

  return null;
};

// Sort movies by release date
export const sortByReleaseDate = (movies) => {
  return [...movies].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
};

// Group movies by collection
export const groupByCollection = (movies) => {
  const collections = new Map();

  movies.forEach(movie => {
    if (movie.belongs_to_collection) {
      const collection = collections.get(movie.belongs_to_collection.id) || {
        id: movie.belongs_to_collection.id,
        name: movie.belongs_to_collection.name,
        movies: []
      };
      collection.movies.push(movie);
      collections.set(movie.belongs_to_collection.id, collection);
    }
  });

  return Array.from(collections.values());
};

// Group movies by cinematic universe
export const groupByUniverse = (movies) => {
  const universes = new Map();

  movies.forEach(movie => {
    const universe = getMovieUniverse(movie);
    if (universe) {
      const existingUniverse = universes.get(universe.key) || {
        ...universe,
        movies: []
      };
      existingUniverse.movies.push(movie);
      universes.set(universe.key, existingUniverse);
    }
  });

  return Array.from(universes.values());
};

// Get related movies (collection + universe)
export const getRelatedMovies = (movie, allMovies) => {
  if (!movie) return [];

  const relatedMovies = new Set();

  // Add collection movies
  if (movie.belongs_to_collection) {
    allMovies
      .filter(m => m.belongs_to_collection?.id === movie.belongs_to_collection.id)
      .forEach(m => relatedMovies.add(m));
  }

  // Add universe movies
  const universe = getMovieUniverse(movie);
  if (universe) {
    allMovies
      .filter(m => getMovieUniverse(m)?.key === universe.key)
      .forEach(m => relatedMovies.add(m));
  }

  return sortByReleaseDate(Array.from(relatedMovies));
};

// Get dummy cards for missing movies in a collection/universe
export const getDummyCards = (existingMovies, allMoviesInUniverse) => {
  const existingIds = new Set(existingMovies.map(m => m.id));
  return allMoviesInUniverse.filter(m => !existingIds.has(m.id));
}; 