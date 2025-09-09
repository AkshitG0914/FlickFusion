// Use Cloudflare worker proxy instead of direct TMDB API
const API_BASE_URL = "https://tmdb-proxy.akshitanoai.workers.dev/api";
// No need for API key as it's configured in the worker
const API_KEY = "";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (data.success === false) {
    throw new Error(data.status_message || 'API Error');
  }
  return data;
};

// Get movie details with all necessary data
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}?append_to_response=credits,keywords,videos,similar,recommendations,collection`
    );
    const data = await handleResponse(response);
    
    // Ensure keywords property is properly structured
    if (!data.keywords) {
      data.keywords = { keywords: [] };
    } else if (!data.keywords.keywords && Array.isArray(data.keywords)) {
      // Handle case where keywords might be an array directly
      data.keywords = { keywords: data.keywords };
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

// Get similar movies
export const getSimilarMovies = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}/similar`);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
};

// Get movie recommendations
export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}/recommendations`);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    return [];
  }
};

// Get collection details
export const getCollectionDetails = async (collectionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/collection/${collectionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching collection details:", error);
    return null;
  }
};

// Get production company details
export const getProductionCompanyDetails = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/${companyId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching company details:", error);
    return null;
  }
};

// Get movies by production company
export const getMoviesByCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/discover/movie?with_companies=${companyId}&sort_by=release_date.asc`);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching company movies:", error);
    return [];
  }
};

// Get image URL
export const getImageUrl = (path, size = "w500") => {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Search for movies and TV shows
export const searchMedia = async (query) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=1`
    );
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Error searching media:", error);
    return [];
  }
};

export const getSeriesDetails = async (seriesId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tv/${seriesId}?language=en-US`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching series details:", error);
    return null;
  }
};

export const getSeasonDetails = async (seriesId, seasonNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?language=en-US`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching season details:", error);
    return null;
  }
};

// Get similar series
export const getSimilarSeries = async (seriesId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tv/${seriesId}/similar`);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching similar series:", error);
    return [];
  }
};

// Get series recommendations
export const getSeriesRecommendations = async (seriesId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tv/${seriesId}/recommendations`);
    const data = await handleResponse(response);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching series recommendations:", error);
    return [];
  }
};
