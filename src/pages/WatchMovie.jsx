"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { getMovies, removeMovie, updateMovieWatchStatus } from "../services/localStorage"
import { getImageUrl, getMovieDetails, getSimilarMovies, getMovieRecommendations, getCollectionDetails } from "../services/api"
import { FaEye, FaClock, FaStar, FaHeart, FaArrowLeft, FaPlus, FaChevronDown, FaChevronUp, FaThumbsUp, FaSync } from "react-icons/fa"

const WatchMovie = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDetails, setShowDetails] = useState(true)
  const [similarMovies, setSimilarMovies] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [displayedMovies, setDisplayedMovies] = useState([])
  const [hasRefreshed, setHasRefreshed] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [moviesToSkip, setMoviesToSkip] = useState({})
  const [allAvailableMovies, setAllAvailableMovies] = useState([])
  
  // Cooldown period for movies (number of refreshes to skip)
  const MOVIE_COOLDOWN = 5;

  // CSS styles defined in the component
  const styles = {
    pageContainer: {
      backgroundColor: "var(--background)",
      minHeight: "100vh",
      animation: "fadeIn 0.4s ease-in",
    },
    container: {
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1rem",
    },
    loaderContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
    },
    loader: {
      width: "48px",
      height: "48px",
      border: "5px solid var(--muted)",
      borderBottomColor: "var(--primary)",
      borderRadius: "50%",
      animation: "rotation 1s linear infinite",
    },
    loaderText: {
      marginTop: "1rem",
      color: "var(--muted-foreground)",
      fontSize: "0.9rem",
    },
    errorContainer: {
      padding: "2rem 1rem",
    },
    errorCard: {
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "var(--shadow)",
    },
    errorMessage: {
      color: "var(--destructive)",
      marginBottom: "1rem",
      fontSize: "1.1rem",
    },
    notFoundMessage: {
      textAlign: "center",
      padding: "3rem 1rem",
      fontSize: "1.2rem",
      color: "var(--muted-foreground)",
    },
    header: {
      backgroundColor: "var(--card)",
      padding: "2rem 1rem",
      boxShadow: "var(--shadow)",
      position: "relative",
    },
    movieDetails: {
      display: "flex",
      flexDirection: "row", // Always row to keep info alongside image
      gap: "2rem",
      alignItems: "flex-start",
    },
    posterContainer: {
      flexShrink: "0",
      width: "230px", // Fixed width for poster
      position: "relative",
    },
    poster: {
      width: "100%",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      transition: "transform var(--transition-default)",
    },
    movieInfo: {
      flex: "1",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "0.5rem",
      color: "var(--foreground)",
    },
    releaseDate: {
      fontSize: "1rem",
      color: "var(--muted-foreground)",
      marginBottom: "1rem",
    },
    overview: {
      fontSize: "1rem",
      color: "var(--foreground)",
      marginBottom: "1.5rem",
      lineHeight: "1.6",
    },
    stats: {
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    badge: {
      backgroundColor: "var(--muted)",
      padding: "0.5rem 1rem",
      borderRadius: "var(--radius)",
      fontSize: "0.875rem",
      color: "var(--muted-foreground)",
      display: "flex",
      alignItems: "center",
      gap: "0.3rem",
    },
    button: {
      display: "inline-block",
      padding: "0.75rem 1.5rem",
      borderRadius: "var(--radius)",
      fontWeight: "600",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all var(--transition-default)",
      textDecoration: "none",
    },
    primaryButton: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      border: "none",
    },
    outlineButton: {
      backgroundColor: "transparent",
      color: "var(--primary)",
      border: "1px solid var(--primary)",
      marginRight: "1rem",
    },
    toggleButton: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      backgroundColor: "var(--muted)",
      border: "none",
      borderRadius: "var(--radius)",
      color: "var(--muted-foreground)",
      cursor: "pointer",
      fontSize: "0.875rem",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "var(--accent)",
      },
    },
    playerSection: {
      padding: "2rem 1rem",
    },
    playerCard: {
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "var(--shadow)",
    },
    videoContainer: {
      position: "relative",
      paddingBottom: "56.25%",
      backgroundColor: "var(--background)",
    },
    videoPlayer: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      border: "none",
    },
    playerInfo: {
      padding: "1.5rem",
    },
    nowPlaying: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "1rem",
      color: "var(--foreground)",
    },
    relatedSection: {
      padding: "0 1rem 2rem 1rem",
    },
    relatedHeading: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "1.5rem",
      color: "var(--foreground)",
    },
    relatedGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "1.5rem",
    },
    relatedItem: {
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "var(--shadow)",
      transition: "transform var(--transition-default)",
      cursor: "pointer",
      backgroundColor: "var(--card)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    relatedImage: {
      width: "100%",
      aspectRatio: "2/3",
      objectFit: "cover",
    },
    relatedTitle: {
      padding: "0.75rem",
      fontSize: "0.9rem",
      fontWeight: "500",
      color: "var(--foreground)",
      flex: "1",
    },
    buttonGroup: {
      display: "flex",
      alignItems: "center",
      marginTop: "1rem",
    },
    controlsBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
      gap: "1rem",
    },
    favoriteButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "0.5rem",
      borderRadius: "50%",
      cursor: "pointer",
      color: "var(--destructive)",
      fontSize: "1.5rem",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "1",
      backgroundColor: "var(--background)", // Keep only one instance
      opacity: "0.8",
    },
    qualityBadge: {
      position: "absolute",
      bottom: "10px",
      right: "10px",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      padding: "0.3rem 0.6rem",
      borderRadius: "var(--radius-sm)",
      fontSize: "0.75rem",
      zIndex: "1",
      opacity: "0.8",
    },
    backToMoviesLink: {
      marginTop: "1.5rem",
      display: "inline-block",
    },
    iconWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    // Mobile styles for smaller screens
    mobileMovieDetails: {
      flexDirection: "column",
      alignItems: "center",
    },
    mobilePosterContainer: {
      width: "180px",
      marginBottom: "1.5rem",
    },
    genreContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "1.5rem",
    },
    genreBadge: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      padding: "0.3rem 0.8rem",
      borderRadius: "var(--radius)",
      fontSize: "0.8rem",
      fontWeight: "500",
    },
    releaseYear: {
      fontSize: "0.8rem",
      color: "var(--muted-foreground)",
      marginTop: "0.2rem",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
  }

  useEffect(() => {
    const loadMovie = async () => {
      setIsLoading(true)
      setError("")

      try {
        const allMovies = getMovies()
        const foundMovie = allMovies.find((m) => m.id.toString() === id)

        if (foundMovie) {
          // First set the basic movie info we already have
          setMovie(foundMovie)
          setIsLoading(false)
          
          // Check if movie is liked
          const likedMovies = JSON.parse(localStorage.getItem("liked_movies") || "[]")
          setIsLiked(likedMovies.includes(parseInt(id)))
          
          // Update last visited time
          updateMovieWatchStatus(foundMovie.id)
          
          try {
            // Fetch additional details in the background
            const movieDetails = await getMovieDetails(foundMovie.id)
            setMovie(prev => ({ ...prev, ...movieDetails }))
            
            // Load similar movies and recommendations
            const [similar, recommended] = await Promise.all([
              getSimilarMovies(foundMovie.id),
              getMovieRecommendations(foundMovie.id)
            ])
            
            // Extract results from API responses
            const similarResults = similar && similar.results ? similar.results : (similar || []);
            const recommendedResults = recommended && recommended.results ? recommended.results : (recommended || []);
            
            // Store all available movies for future refreshes
            const combinedResults = [...recommendedResults, ...similarResults];
            const uniqueMovies = combinedResults.filter((movie, index, self) => 
              index === self.findIndex(m => m.id === movie.id) && movie.id !== parseInt(id)
            );
            
            setAllAvailableMovies(uniqueMovies);
            setSimilarMovies(similarResults || []);
            setRecommendations(recommendedResults || []);
            
            // Get initial set of movies to display
            if (uniqueMovies.length > 0) {
              // Select random movies for initial display
              const shuffled = [...uniqueMovies].sort(() => 0.5 - Math.random());
              const selectedMovies = shuffled.slice(0, 6);
              setDisplayedMovies(selectedMovies);
              
              // Initialize the movies to skip with the ones we've just shown
              const initialSkipMap = {};
              selectedMovies.forEach(movie => {
                initialSkipMap[movie.id] = refreshCount + MOVIE_COOLDOWN;
              });
              setMoviesToSkip(initialSkipMap);
            }
          } catch (detailsError) {
            console.error("Error loading additional movie details:", detailsError)
          }
        } else {
          setError("Movie not found in your collection.")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error loading movie:", err)
        setError("An error occurred while loading the movie.")
        setIsLoading(false)
      }
    }

    loadMovie()
  }, [id])

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Never"
    return new Date(timestamp).toLocaleString()
  }

  // Toggle movie like status
  const toggleLike = () => {
    const movieId = parseInt(id)
    const likedMovies = JSON.parse(localStorage.getItem("liked_movies") || "[]")
    
    if (isLiked) {
      // Remove from liked movies
      const updatedLikes = likedMovies.filter(id => id !== movieId)
      localStorage.setItem("liked_movies", JSON.stringify(updatedLikes))
      setIsLiked(false)
    } else {
      // Add to liked movies
      likedMovies.push(movieId)
      localStorage.setItem("liked_movies", JSON.stringify(likedMovies))
      setIsLiked(true)
    }
  }

  // Check if screen is mobile sized
  const isMobile = () => {
    return window.innerWidth < 768
  }

  // Function to add a movie to collection
  const handleAddToCollection = async (movieToAdd) => {
    try {
      const movieDetails = await getMovieDetails(movieToAdd.id);
      const allMovies = getMovies();
      
      // Add the new movie to the collection
      allMovies.push({
        ...movieDetails,
        addedAt: Date.now(),
        lastWatched: null
      });
      
      localStorage.setItem('movies', JSON.stringify(allMovies));
      
      // Update UI to reflect changes
      setDisplayedMovies(prevMovies => 
        prevMovies.map(movie => 
          movie.id === movieToAdd.id 
            ? { ...movie, isInCollection: true } 
            : movie
        )
      );
    } catch (error) {
      console.error("Error adding movie to collection:", error);
    }
  };

  // Function to refresh recommendations
  const refreshRecommendations = async () => {
    if (isRefreshing) return;
    
    try {
      // Clear current movies and show loading state
      setIsRefreshing(true);
      setDisplayedMovies([]);
      
      // Increment refresh counter
      const newRefreshCount = refreshCount + 1;
      setRefreshCount(newRefreshCount);
      
      // Update the moviesToSkip map by removing entries that have expired their cooldown
      const updatedMoviesToSkip = { ...moviesToSkip };
      Object.keys(updatedMoviesToSkip).forEach(movieId => {
        if (updatedMoviesToSkip[movieId] <= newRefreshCount) {
          delete updatedMoviesToSkip[movieId];
        }
      });
      
      // Find available movies (not in cooldown)
      const availableMovies = allAvailableMovies.filter(movie => 
        !updatedMoviesToSkip[movie.id] && movie.id !== parseInt(id)
      );
      
      console.log(`Available movies not in cooldown: ${availableMovies.length}`);
      console.log(`Movies in cooldown: ${Object.keys(updatedMoviesToSkip).length}`);
      
      // If we don't have enough available movies, reduce the cooldown for some
      if (availableMovies.length < 6) {
        console.log("Not enough available movies, reducing cooldown for some");
        
        // Get movies in cooldown
        const cooldownMovies = allAvailableMovies.filter(movie => 
          updatedMoviesToSkip[movie.id] && movie.id !== parseInt(id)
        );
        
        // Sort by cooldown expiration (those closest to expiring first)
        cooldownMovies.sort((a, b) => updatedMoviesToSkip[a.id] - updatedMoviesToSkip[b.id]);
        
        // Take enough to fill our needs
        const neededExtra = 6 - availableMovies.length;
        const extraMovies = cooldownMovies.slice(0, neededExtra);
        
        // Remove these from the skip map (effectively reducing their cooldown)
        extraMovies.forEach(movie => {
          delete updatedMoviesToSkip[movie.id];
        });
        
        // Add them to available movies
        availableMovies.push(...extraMovies);
      }
      
      // Get user's collection
      const userCollection = getMovies();
      const userMovieIds = new Set(userCollection.map(m => m.id));
      
      // Separate movies that are in collection and not in collection
      const moviesInCollection = availableMovies.filter(m => userMovieIds.has(m.id));
      const moviesNotInCollection = availableMovies.filter(m => !userMovieIds.has(m.id));
      
      // Create a balanced mix (2 from collection, 4 not in collection if possible)
      let mixedMovies = [];
      
      // Add 2 from collection if available
      if (moviesInCollection.length > 0) {
        // Randomly select 2 movies from collection
        const shuffledInCollection = [...moviesInCollection].sort(() => 0.5 - Math.random());
        mixedMovies = mixedMovies.concat(
          shuffledInCollection.slice(0, Math.min(2, shuffledInCollection.length))
        );
      }
      
      // Fill the rest with movies not in collection
      const remainingSlots = 6 - mixedMovies.length;
      if (moviesNotInCollection.length > 0) {
        // Randomly select remaining movies
        const shuffledNotInCollection = [...moviesNotInCollection].sort(() => 0.5 - Math.random());
        mixedMovies = mixedMovies.concat(
          shuffledNotInCollection.slice(0, Math.min(remainingSlots, shuffledNotInCollection.length))
        );
      }
      
      // If we still need more, add more from either category
      if (mixedMovies.length < 6) {
        // Get all remaining movies
        const allRemaining = [
          ...moviesInCollection.filter(m => !mixedMovies.some(selected => selected.id === m.id)),
          ...moviesNotInCollection.filter(m => !mixedMovies.some(selected => selected.id === m.id))
        ];
        
        // Randomly select remaining movies
        const shuffledRemaining = [...allRemaining].sort(() => 0.5 - Math.random());
        mixedMovies = mixedMovies.concat(
          shuffledRemaining.slice(0, Math.min(6 - mixedMovies.length, shuffledRemaining.length))
        );
      }
      
      // Shuffle the final movie selection for display
      const shuffledMovies = mixedMovies.sort(() => 0.5 - Math.random());
      
      // Add these movies to the skip list
      const newSkipMap = { ...updatedMoviesToSkip };
      shuffledMovies.forEach(movie => {
        newSkipMap[movie.id] = newRefreshCount + MOVIE_COOLDOWN;
      });
      
      // Debug log
      console.log(`Selected ${shuffledMovies.length} movies for display`);
      console.log("Movie IDs in cooldown:", Object.keys(newSkipMap).join(", "));
      
      // Update state
      setMoviesToSkip(newSkipMap);
      setDisplayedMovies(shuffledMovies);
      setHasRefreshed(true);
      
      // Optional: Fetch new recommendations in the background to refresh the pool
      if (newRefreshCount % 3 === 0) { // Every 3 refreshes
        try {
          const [newSimilar, newRecommended] = await Promise.all([
            getSimilarMovies(id),
            getMovieRecommendations(id)
          ]);
          
          const newSimilarResults = newSimilar?.results || newSimilar || [];
          const newRecommendedResults = newRecommended?.results || newRecommended || [];
          
          // Add new movies to the available pool
          const newCombined = [...newRecommendedResults, ...newSimilarResults];
          const currentIds = new Set(allAvailableMovies.map(m => m.id));
          
          const newUniqueMovies = newCombined.filter(movie => 
            !currentIds.has(movie.id) && movie.id !== parseInt(id)
          );
          
          if (newUniqueMovies.length > 0) {
            setAllAvailableMovies(prev => [...prev, ...newUniqueMovies]);
            console.log(`Added ${newUniqueMovies.length} new movies to the available pool`);
          }
        } catch (error) {
          console.error("Error refreshing recommendation pool:", error);
        }
      }
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to render movie cards
  const renderMovieCard = (movie, isInCollection = true) => (
    <div key={movie.id} style={styles.relatedItem}>
      <Link to={isInCollection ? `/watch-movie/${movie.id}` : '#'} style={{ 
        textDecoration: "none", 
        display: "flex", 
        flexDirection: "column",
        flex: "1"
      }}>
        <img 
          src={getImageUrl(movie.poster_path) || "/placeholder.svg"} 
          alt={movie.title}
          style={styles.relatedImage} 
        />
        <div style={styles.relatedTitle}>
          <div style={{ fontWeight: "600" }}>{movie.title}</div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem"
          }}>
            <span style={styles.releaseYear}>
              {movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"}
            </span>
            {movie.vote_average > 0 && (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                fontSize: "0.8rem",
                color: "var(--muted-foreground)"
              }}>
                <FaStar style={{ color: "var(--warning)" }} />
                {movie.vote_average.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
      {!isInCollection ? (
        <div style={{ padding: "0 0.75rem 0.75rem" }}>
          <button
            onClick={() => handleAddToCollection(movie)}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              width: "100%",
              fontSize: "0.85rem",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FaPlus style={{ marginRight: "0.3rem" }} /> Add to Collection
          </button>
        </div>
      ) : (
        <div style={{ padding: "0 0.75rem 0.75rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
            width: "100%",
            fontSize: "0.8rem",
            padding: "0.3rem 0",
            borderRadius: "var(--radius-sm)",
          }}>
            In Collection
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loaderText}>Loading movie...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.errorContainer}>
          <div style={styles.errorCard}>
            <p style={styles.errorMessage}>{error}</p>
            <Link 
              to="/my-movies" 
              style={{...styles.button, ...styles.primaryButton}}
            >
              Back to My Movies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.notFoundMessage}>Movie not found.</div>
      </div>
    )
  }

  return (
    <div style={styles.pageContainer}>
      {/* Movie details header */}
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={styles.controlsBar}>
            <Link 
              to="/my-movies" 
              style={{...styles.button, ...styles.outlineButton, padding: "0.5rem 1rem"}}
            >
              <div style={styles.iconWrapper}>
                <FaArrowLeft /> Back
              </div>
            </Link>
            {!showDetails && (
              <h2 style={{
                margin: 0,
                flex: 1,
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "var(--foreground)"
              }}>
                {movie.title}
              </h2>
            )}
            <button 
              onClick={() => setShowDetails(!showDetails)} 
              style={styles.toggleButton}
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {showDetails && (
            <div style={isMobile() ? {...styles.movieDetails, ...styles.mobileMovieDetails} : styles.movieDetails}>
              {/* Poster */}
              <div style={isMobile() ? {...styles.posterContainer, ...styles.mobilePosterContainer} : styles.posterContainer}>
                <div style={styles.qualityBadge}>HD</div>
                <img
                  src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
                  alt={movie.title}
                  style={styles.poster}
                />
              </div>

              {/* Movie info */}
              <div style={styles.movieInfo}>
                <h1 style={styles.title}>{movie.title}</h1>

                {movie.release_date && (
                  <p style={styles.releaseDate}>
                    Released: {new Date(movie.release_date).getFullYear()}
                  </p>
                )}

                <p style={styles.overview}>
                  {movie.overview || "No description available."}
                </p>

                <div style={styles.stats}>
                  <div style={styles.badge}>
                    <FaClock style={{ marginRight: "5px" }} /> Last visited: {formatDate(movie.lastWatched)}
                  </div>
                  <div style={styles.badge}>
                    <FaStar style={{ marginRight: "5px" }} /> Rating: {(movie.vote_average || 0).toFixed(1)}/10
                  </div>
                </div>

                {/* Add genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div style={styles.genreContainer}>
                    {movie.genres.map(genre => (
                      <span key={genre.id} style={styles.genreBadge}>
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Like button */}
                <button 
                  onClick={toggleLike} 
                  style={{
                    ...styles.button,
                    ...styles.outlineButton,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "1rem",
                    backgroundColor: isLiked ? "var(--primary)" : "transparent",
                    color: isLiked ? "var(--primary-foreground)" : "var(--primary)"
                  }}
                >
                  <FaThumbsUp style={{ color: isLiked ? "var(--primary-foreground)" : "var(--primary)" }} /> 
                  {isLiked ? "Liked" : "Like"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video player section */}
      <div style={styles.playerSection} id="player-section">
        <div style={styles.container}>
          <div style={styles.playerCard}>
            <div style={styles.videoContainer}>
              {videoLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--background)',
                  zIndex: 2,
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={styles.loader}></div>
                  <p style={{ color: 'var(--muted-foreground)' }}>Loading video player...</p>
                </div>
              )}
              {videoError ? (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--background)',
                  flexDirection: 'column',
                  padding: '1rem',
                  gap: '1rem'
                }}>
                  <p style={{color: 'var(--destructive)', textAlign: 'center'}}>
                    Video source is currently unavailable.<br/>Please try again later or choose a different source.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => {
                        setVideoError(false);
                        setVideoLoading(true);
                        if (videoRef.current) {
                          videoRef.current.src = `https://vidsrc.xyz/embed/movie/${movie.id}`;
                        }
                      }}
                      style={{...styles.button, ...styles.primaryButton}}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setVideoError(false);
                        setVideoLoading(true);
                        if (videoRef.current) {
                          // Try an alternative source
                          videoRef.current.src = `https://2embed.org/embed/movie?tmdb=${movie.id}`;
                        }
                      }}
                      style={{...styles.button, ...styles.outlineButton}}
                    >
                      Try Alternative Source
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={videoRef}
                  src={`https://vidsrc.xyz/embed/movie/${movie.id}`}
                  title={`Watch ${movie.title}`}
                  style={styles.videoPlayer}
                  className="video-player"
                  allowFullScreen
                  onLoad={() => {
                    console.log('Video player loaded');
                    setVideoLoading(false);
                  }}
                  onError={(e) => {
                    console.error('Video player error:', e);
                    setVideoError(true);
                    setVideoLoading(false);
                  }}
                ></iframe>
              )}
            </div>
            <div style={styles.playerInfo}>
              <h2 style={styles.nowPlaying}>
                Now Playing: {movie.title}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies and Recommendations Combined Section */}
      <div style={styles.relatedSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.relatedHeading}>Similar Movies You May Like</h2>
            <button
              onClick={refreshRecommendations}
              style={{
                ...styles.toggleButton,
                backgroundColor: isRefreshing ? "var(--primary)" : "var(--muted)",
                color: isRefreshing ? "var(--primary-foreground)" : "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              disabled={isRefreshing}
            >
              <FaSync style={{ 
                animation: isRefreshing ? "rotation 1s linear infinite" : "none" 
              }} /> 
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          
          {isRefreshing ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "3rem 0",
              gap: "1rem"
            }}>
              <div style={styles.loader}></div>
              <p>Finding movies you might enjoy...</p>
            </div>
          ) : displayedMovies.length === 0 && !hasRefreshed ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 0"
            }}>
              <p>Click refresh to see movie recommendations</p>
            </div>
          ) : displayedMovies.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 0"
            }}>
              <p>No recommendations found. Please try refreshing again.</p>
            </div>
          ) : (
            <div style={styles.relatedGrid}>
              {displayedMovies.map(item => {
                const isInCollection = getMovies().some(m => m.id === item.id);
                return renderMovieCard(item, isInCollection);
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add custom style for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .related-grid {
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .related-grid::-webkit-scrollbar {
            display: none;
          }
          .movie-card {
            scroll-snap-align: start;
          }
        `
      }} />
    </div>
  )
}

export default WatchMovie