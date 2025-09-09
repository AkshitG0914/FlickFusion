"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { getSeries, updateSeriesWatchProgress, getSeriesWatchProgress } from "../services/localStorage"
import { getSeriesDetails, getSeasonDetails, getImageUrl, getSimilarSeries, getSeriesRecommendations } from "../services/api"
import { FaPlay, FaCheck, FaArrowLeft, FaCalendarAlt, FaClock, FaEye, FaHeart, FaStar, FaThumbsUp, FaSync, FaPlus } from "react-icons/fa"

const WatchSeries = () => {
  const { id } = useParams()
  const [series, setSeries] = useState(null)
  const [seriesDetails, setSeriesDetails] = useState(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [seasonDetails, setSeasonDetails] = useState(null)
  const [watchProgress, setWatchProgress] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDetails, setShowDetails] = useState(true)
  const [relatedSeries, setRelatedSeries] = useState([])
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [displayedSeries, setDisplayedSeries] = useState([])
  const [hasRefreshed, setHasRefreshed] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [seriesToSkip, setSeriesToSkip] = useState({})
  const [allAvailableSeries, setAllAvailableSeries] = useState([])
  const [isChangingSeason, setIsChangingSeason] = useState(false)
  
  // Cooldown period for series (number of refreshes to skip)
  const SERIES_COOLDOWN = 5;

  // CSS styles for episode components
  const episodeStyles = {
    episodeButton: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: "1rem",
      backgroundColor: "transparent",
      border: "none",
      borderBottom: "1px solid var(--border)",
      color: "var(--foreground)",
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      position: "relative",
      overflow: "hidden",
    },
    episodeButtonHover: {
      backgroundColor: "rgba(var(--primary-rgb), 0.1)",
    },
    episodeButtonSelected: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    episodeButtonWatched: {
      backgroundColor: "var(--muted)",
    },
    episodeNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      marginRight: "0.75rem",
      fontSize: "0.9rem",
      fontWeight: "600",
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      flexShrink: "0",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    episodeNumberSelected: {
      backgroundColor: "var(--primary-foreground)",
      color: "var(--primary-foreground)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    },
    episodeInfo: {
      flex: "1",
      minWidth: 0, // Helps with text overflow
    },
    episodeTitle: {
      fontWeight: "500",
      marginBottom: "0.25rem",
      fontSize: "1rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    episodeTitleSelected: {
      color: "var(--primary-foreground)",
      fontWeight: "600",
    },
    episodeDuration: {
      fontSize: "0.85rem",
      color: "var(--muted-foreground)",
      display: "flex",
      alignItems: "center",
      gap: "0.3rem",
    },
    episodeDurationSelected: {
      color: "var(--primary-foreground)",
      opacity: "0.9",
    },
    episodeIcon: {
      marginLeft: "0.75rem",
      fontSize: "1rem",
    },
    watchedBadge: {
      fontSize: "0.75rem",
      padding: "0.2rem 0.4rem",
      borderRadius: "var(--radius-sm)",
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      marginLeft: "0.5rem",
    }
  }

  // Merge episode styles with main styles
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
    seriesDetails: {
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
    seriesInfo: {
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
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "var(--radius)",
      marginLeft: "auto",
      fontSize: "0.8rem",
      cursor: "pointer",
      transition: "all var(--transition-default)",
    },
    playerSection: {
      padding: "2rem 1rem",
    },
    playerLayout: {
      display: "flex",
      flexDirection: "row",
      gap: "1.5rem",
      alignItems: "stretch",
    },
    playerLayoutMobile: {
      flexDirection: "column",
    },
    playerCard: {
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "var(--shadow)",
      flex: "3", // Takes up more space than episodes list
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
    backToSeriesLink: {
      marginTop: "1.5rem",
      display: "inline-block",
    },
    iconWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    // Episode selector styles
    episodesContainer: {
      flex: "1", // Takes up less space than the player
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "var(--shadow)",
      display: "flex",
      flexDirection: "column",
      maxHeight: "600px", // Limit height to match video player approximately
    },
    selectorHeader: {
      padding: "1rem",
      backgroundColor: "var(--muted)",
      borderBottom: "1px solid var(--border)",
    },
    selectorGrid: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    seasonSelect: {
      padding: "0.5rem",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      minWidth: "150px",
    },
    episodesList: {
      overflowY: "auto",
      flex: "1", // Fills available space
    },
    ...episodeStyles,
    episodeDetails: {
      padding: "1.5rem",
    },
    episodeOverview: {
      fontSize: "0.95rem",
      color: "var(--foreground)",
      marginTop: "1rem",
      lineHeight: "1.6",
    },
    // Mobile styles for smaller screens
    mobileSeriesDetails: {
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

  // Load series from localStorage
  useEffect(() => {
    const loadSeries = async () => {
      setIsLoading(true)
      setError("")

      try {
        const allSeries = getSeries()
        const foundSeries = allSeries.find((s) => s.id.toString() === id)

        if (foundSeries) {
          setSeries(foundSeries)
          setWatchProgress(getSeriesWatchProgress(foundSeries.id))
          
          // Check if series is liked
          const likedSeries = JSON.parse(localStorage.getItem("liked_series") || "[]")
          setIsLiked(likedSeries.includes(parseInt(id)))
          
          // Update last visited time immediately when the watch page is loaded
          updateSeriesWatchProgress(foundSeries.id, selectedSeason, selectedEpisode)
          
          // Load additional series details if needed
          try {
            const details = await getSeriesDetails(foundSeries.id)
            setSeriesDetails(details)
            
            // Fetch similar and recommended series
            const [similar, recommended] = await Promise.all([
              getSimilarSeries(foundSeries.id),
              getSeriesRecommendations(foundSeries.id)
            ]);
            
            // Extract results from API responses
            const similarResults = similar && similar.results ? similar.results : (similar || []);
            const recommendedResults = recommended && recommended.results ? recommended.results : (recommended || []);
            
            // Store all available series for future refreshes
            const combinedResults = [...recommendedResults, ...similarResults];
            const uniqueSeries = combinedResults.filter((series, index, self) => 
              index === self.findIndex(s => s.id === series.id) && series.id !== parseInt(id)
            );
            
            setAllAvailableSeries(uniqueSeries);
            
            // Get other series from user's collection for initial display
            const otherUserSeries = allSeries
              .filter(s => s.id.toString() !== id)
              .slice(0, 6);
              
            if (otherUserSeries.length > 0) {
              setDisplayedSeries(otherUserSeries);
              
              // Initialize the series to skip with the ones we've just shown
              const initialSkipMap = {};
              otherUserSeries.forEach(series => {
                initialSkipMap[series.id] = refreshCount + SERIES_COOLDOWN;
              });
              setSeriesToSkip(initialSkipMap);
            } else if (uniqueSeries.length > 0) {
              // If user has no other series, show recommendations
              const selectedSeries = uniqueSeries.slice(0, 6);
              setDisplayedSeries(selectedSeries);
              
              // Initialize the series to skip with the ones we've just shown
              const initialSkipMap = {};
              selectedSeries.forEach(series => {
                initialSkipMap[series.id] = refreshCount + SERIES_COOLDOWN;
              });
              setSeriesToSkip(initialSkipMap);
            }
          } catch (error) {
            console.error("Error loading series details or recommendations:", error)
          }
        } else {
          setError("Series not found in your collection.")
        }
      } catch (err) {
        console.error("Error loading series:", err)
        setError("An error occurred while loading the series.")
      } finally {
        setIsLoading(false)
      }
    }

    loadSeries()
  }, [id])

  // Load season details when selected season changes
  useEffect(() => {
    const loadSeasonDetails = async () => {
      if (!series || !selectedSeason) return
      
      setIsChangingSeason(true);
      
      try {
        const details = await getSeasonDetails(series.id, selectedSeason)
        if (details && details.episodes) {
          setSeasonDetails(details)

          // Only set default episode when initially loading a season
          // or if there are no episodes selected yet
          if (!selectedEpisode || selectedEpisode > details.episodes.length) {
            const seasonProgress = watchProgress[selectedSeason] || {}
            const episodes = details.episodes || []

            if (episodes.length > 0) {
              // Find first unwatched episode
              const unwatchedEpisode = episodes.find((ep) => !seasonProgress[ep.episode_number])
              setSelectedEpisode(unwatchedEpisode ? unwatchedEpisode.episode_number : 1)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching season details:", error)
      } finally {
        setIsChangingSeason(false);
      }
    }

    loadSeasonDetails()
  }, [series, selectedSeason])

  // Update video source when episode changes
  useEffect(() => {
    if (series && selectedSeason && selectedEpisode) {
      setVideoLoading(true);
      setVideoError(false);
      
      // If there's a video reference, update its source
      if (videoRef.current) {
        videoRef.current.src = `https://vidsrc.xyz/embed/tv/${series.id}/${selectedSeason}/${selectedEpisode}`;
      }
    }
  }, [series, selectedSeason, selectedEpisode]);

  // Handle episode selection and update watch progress
  const handleEpisodeSelect = (episodeNumber) => {
    // Only proceed if this is a different episode than the current one
    if (episodeNumber === selectedEpisode) return;
    
    // Immediately update the selected episode
    setSelectedEpisode(episodeNumber)
    
    // Immediately update watch progress
    if (series) {
      updateSeriesWatchProgress(series.id, selectedSeason, episodeNumber)

      // Update local state
      const newProgress = { ...watchProgress }
      if (!newProgress[selectedSeason]) {
        newProgress[selectedSeason] = {}
      }
      newProgress[selectedSeason][episodeNumber] = Date.now()
      setWatchProgress(newProgress)
    }
  }

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Never"
    return new Date(timestamp).toLocaleString()
  }

  // Check if episode has been watched
  const isEpisodeWatched = (seasonNumber, episodeNumber) => {
    return watchProgress[seasonNumber] && watchProgress[seasonNumber][episodeNumber]
  }

  // Toggle series like status
  const toggleLike = () => {
    const seriesId = parseInt(id)
    const likedSeries = JSON.parse(localStorage.getItem("liked_series") || "[]")
    
    if (isLiked) {
      // Remove from liked series
      const updatedLikes = likedSeries.filter(id => id !== seriesId)
      localStorage.setItem("liked_series", JSON.stringify(updatedLikes))
      setIsLiked(false)
    } else {
      // Add to liked series
      likedSeries.push(seriesId)
      localStorage.setItem("liked_series", JSON.stringify(likedSeries))
      setIsLiked(true)
    }
  }

  // Check if screen is mobile sized
  const isMobile = () => {
    return window.innerWidth < 768
  }

  // Get current episode details
  const currentEpisode = seasonDetails?.episodes?.find((ep) => ep.episode_number === selectedEpisode)

  // Add this function
  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  // Function to add a series to collection
  const handleAddToCollection = async (seriesToAdd) => {
    try {
      const seriesDetails = await getSeriesDetails(seriesToAdd.id);
      const allSeries = getSeries();
      
      // Add the new series to the collection
      allSeries.push({
        ...seriesDetails,
        addedAt: Date.now(),
        lastWatched: null,
        watchProgress: {}
      });
      
      localStorage.setItem('series', JSON.stringify(allSeries));
      
      // Update UI to reflect changes
      setDisplayedSeries(prevSeries => 
        prevSeries.map(s => 
          s.id === seriesToAdd.id 
            ? { ...s, isInCollection: true } 
            : s
        )
      );
    } catch (error) {
      console.error("Error adding series to collection:", error);
    }
  };
  
  // Function to refresh recommendations
  const refreshRecommendations = async () => {
    if (isRefreshing) return;
    
    try {
      // Clear current series and show loading state
      setIsRefreshing(true);
      setDisplayedSeries([]);
      
      // Increment refresh counter
      const newRefreshCount = refreshCount + 1;
      setRefreshCount(newRefreshCount);
      
      // Update the seriesToSkip map by removing entries that have expired their cooldown
      const updatedSeriesToSkip = { ...seriesToSkip };
      Object.keys(updatedSeriesToSkip).forEach(seriesId => {
        if (updatedSeriesToSkip[seriesId] <= newRefreshCount) {
          delete updatedSeriesToSkip[seriesId];
        }
      });
      
      // Find available series (not in cooldown)
      const availableSeries = allAvailableSeries.filter(series => 
        !updatedSeriesToSkip[series.id] && series.id !== parseInt(id)
      );
      
      console.log(`Available series not in cooldown: ${availableSeries.length}`);
      console.log(`Series in cooldown: ${Object.keys(updatedSeriesToSkip).length}`);
      
      // If we don't have enough available series, reduce the cooldown for some
      if (availableSeries.length < 6) {
        console.log("Not enough available series, reducing cooldown for some");
        
        // Get series in cooldown
        const cooldownSeries = allAvailableSeries.filter(series => 
          updatedSeriesToSkip[series.id] && series.id !== parseInt(id)
        );
        
        // Sort by cooldown expiration (those closest to expiring first)
        cooldownSeries.sort((a, b) => updatedSeriesToSkip[a.id] - updatedSeriesToSkip[b.id]);
        
        // Take enough to fill our needs
        const neededExtra = 6 - availableSeries.length;
        const extraSeries = cooldownSeries.slice(0, neededExtra);
        
        // Remove these from the skip map (effectively reducing their cooldown)
        extraSeries.forEach(series => {
          delete updatedSeriesToSkip[series.id];
        });
        
        // Add them to available series
        availableSeries.push(...extraSeries);
      }
      
      // Get user's collection
      const userCollection = getSeries();
      const userSeriesIds = new Set(userCollection.map(s => s.id));
      
      // Separate series that are in collection and not in collection
      const seriesInCollection = availableSeries.filter(s => userSeriesIds.has(s.id));
      const seriesNotInCollection = availableSeries.filter(s => !userSeriesIds.has(s.id));
      
      // Create a balanced mix (2 from collection, 4 not in collection if possible)
      let mixedSeries = [];
      
      // Add 2 from collection if available
      if (seriesInCollection.length > 0) {
        // Randomly select 2 series from collection
        const shuffledInCollection = [...seriesInCollection].sort(() => 0.5 - Math.random());
        mixedSeries = mixedSeries.concat(
          shuffledInCollection.slice(0, Math.min(2, shuffledInCollection.length))
        );
      }
      
      // Fill the rest with series not in collection
      const remainingSlots = 6 - mixedSeries.length;
      if (seriesNotInCollection.length > 0) {
        // Randomly select remaining series
        const shuffledNotInCollection = [...seriesNotInCollection].sort(() => 0.5 - Math.random());
        mixedSeries = mixedSeries.concat(
          shuffledNotInCollection.slice(0, Math.min(remainingSlots, shuffledNotInCollection.length))
        );
      }
      
      // If we still need more, add more from either category
      if (mixedSeries.length < 6) {
        // Get all remaining series
        const allRemaining = [
          ...seriesInCollection.filter(s => !mixedSeries.some(selected => selected.id === s.id)),
          ...seriesNotInCollection.filter(s => !mixedSeries.some(selected => selected.id === s.id))
        ];
        
        // Randomly select remaining series
        const shuffledRemaining = [...allRemaining].sort(() => 0.5 - Math.random());
        mixedSeries = mixedSeries.concat(
          shuffledRemaining.slice(0, Math.min(6 - mixedSeries.length, shuffledRemaining.length))
        );
      }
      
      // Shuffle the final series selection for display
      const shuffledSeries = mixedSeries.sort(() => 0.5 - Math.random());
      
      // Add these series to the skip list
      const newSkipMap = { ...updatedSeriesToSkip };
      shuffledSeries.forEach(series => {
        newSkipMap[series.id] = newRefreshCount + SERIES_COOLDOWN;
      });
      
      // Debug log
      console.log(`Selected ${shuffledSeries.length} series for display`);
      console.log("Series IDs in cooldown:", Object.keys(newSkipMap).join(", "));
      
      // Update state
      setSeriesToSkip(newSkipMap);
      setDisplayedSeries(shuffledSeries);
      setHasRefreshed(true);
      
      // Optional: Fetch new recommendations in the background to refresh the pool
      if (newRefreshCount % 3 === 0) { // Every 3 refreshes
        try {
          const [newSimilar, newRecommended] = await Promise.all([
            getSimilarSeries(id),
            getSeriesRecommendations(id)
          ]);
          
          const newSimilarResults = newSimilar?.results || newSimilar || [];
          const newRecommendedResults = newRecommended?.results || newRecommended || [];
          
          // Add new series to the available pool
          const newCombined = [...newRecommendedResults, ...newSimilarResults];
          const currentIds = new Set(allAvailableSeries.map(s => s.id));
          
          const newUniqueSeries = newCombined.filter(series => 
            !currentIds.has(series.id) && series.id !== parseInt(id)
          );
          
          if (newUniqueSeries.length > 0) {
            setAllAvailableSeries(prev => [...prev, ...newUniqueSeries]);
            console.log(`Added ${newUniqueSeries.length} new series to the available pool`);
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
  
  // Function to render series cards
  const renderSeriesCard = (seriesItem, isInCollection = true) => (
    <div key={seriesItem.id} style={styles.relatedItem}>
      <Link to={isInCollection ? `/watch-series/${seriesItem.id}` : '#'} style={{ 
        textDecoration: "none",
        display: "flex", 
        flexDirection: "column",
        flex: "1"
      }}>
        <img 
          src={getImageUrl(seriesItem.poster_path) || "/placeholder.svg"} 
          alt={seriesItem.name}
          style={styles.relatedImage} 
        />
        <div style={styles.relatedTitle}>
          <div style={{ fontWeight: "600" }}>{seriesItem.name}</div>
          {seriesItem.first_air_date && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.5rem"
            }}>
              <span style={styles.releaseYear}>
                {new Date(seriesItem.first_air_date).getFullYear()}
              </span>
              {seriesItem.vote_average > 0 && (
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  fontSize: "0.8rem",
                  color: "var(--muted-foreground)"
                }}>
                  <FaStar style={{ color: "var(--warning)" }} />
                  {seriesItem.vote_average.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      {!isInCollection ? (
        <div style={{ padding: "0 0.75rem 0.75rem" }}>
          <button
            onClick={() => handleAddToCollection(seriesItem)}
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

  // Add CSS custom properties
  useEffect(() => {
    // Get the primary color from CSS
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    
    // Convert hex to rgb if needed
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }
  }, []);
  
  // Track if we're changing seasons to prevent infinite loop

  if (isLoading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loaderText}>Loading series...</p>
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
              to="/my-series" 
              style={{...styles.button, ...styles.primaryButton}}
            >
              Back to My Series
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!series) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.notFoundMessage}>Series not found.</div>
      </div>
    )
  }

  return (
    <div style={styles.pageContainer}>
      {/* Series details header */}
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={styles.controlsBar}>
            <Link 
              to="/my-series" 
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
                {series.name}
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
            <div style={isMobile() ? {...styles.seriesDetails, ...styles.mobileSeriesDetails} : styles.seriesDetails}>
              {/* Poster */}
              <div style={isMobile() ? {...styles.posterContainer, ...styles.mobilePosterContainer} : styles.posterContainer}>
                <div style={styles.qualityBadge}>HD</div>
                <img
                  src={getImageUrl(series.poster_path) || "/placeholder.svg"}
                  alt={series.name}
                  style={styles.poster}
                />
              </div>

              {/* Series info */}
              <div style={styles.seriesInfo}>
                <h1 style={styles.title}>{series.name}</h1>

                {series.first_air_date && (
                  <p style={styles.releaseDate}>
                    First aired: {new Date(series.first_air_date).getFullYear()}
                  </p>
                )}

                <p style={styles.overview}>
                  {series.overview || "No description available."}
                </p>

                <div style={styles.stats}>
                  <div style={styles.badge}>
                    <FaClock style={{ marginRight: "5px" }} /> Last visited: {formatDate(series.lastWatched)}
                  </div>
                  {seriesDetails?.vote_average && (
                    <div style={styles.badge}>
                      <FaStar style={{ marginRight: "5px" }} /> Rating: {(seriesDetails.vote_average || 0).toFixed(1)}/10
                    </div>
                  )}
                </div>

                {/* Add genres */}
                {series.genres && series.genres.length > 0 && (
                  <div style={styles.genreContainer}>
                    {series.genres.map(genre => (
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

      {/* Video player and episodes side by side section */}
      <div style={styles.playerSection} id="player-section">
        <div style={styles.container}>
          <div style={isMobile() ? {...styles.playerLayout, ...styles.playerLayoutMobile} : styles.playerLayout}>
            {/* Episode selector */}
            <div style={styles.episodesContainer}>
              <div style={styles.selectorHeader}>
                <div style={styles.selectorGrid}>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    style={styles.seasonSelect}
                  >
                    {seriesDetails?.seasons
                      ?.filter((season) => season.season_number > 0)
                      .map((season) => (
                        <option key={season.id} value={season.season_number}>
                          Season {season.season_number} 
                        </option>
                      ))}
                  </select>
                  
                  {/* Season info badge */}
                  {seasonDetails && (
                    <div style={{
                      fontSize: "0.85rem",
                      color: "var(--muted-foreground)",
                      marginLeft: "1rem"
                    }}>
                      {seasonDetails.episodes?.length || 0} episodes
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.episodesList}>
                {seasonDetails?.episodes?.map((episode) => {
                  const isWatched = isEpisodeWatched(selectedSeason, episode.episode_number);
                  const isSelected = selectedEpisode === episode.episode_number;
                  
                  // Apply appropriate styles based on episode state
                  const episodeButtonStyle = {
                    ...styles.episodeButton,
                    ...(isSelected ? styles.episodeButtonSelected : {}),
                    ...(!isSelected && isWatched ? styles.episodeButtonWatched : {})
                  };
                  
                  const episodeNumberStyle = {
                    ...styles.episodeNumber,
                    ...(isSelected ? styles.episodeNumberSelected : {})
                  };
                  
                  const episodeTitleStyle = {
                    ...styles.episodeTitle,
                    ...(isSelected ? styles.episodeTitleSelected : {})
                  };
                  
                  const episodeDurationStyle = {
                    ...styles.episodeDuration,
                    ...(isSelected ? styles.episodeDurationSelected : {})
                  };

                  return (
                    <button
                      key={episode.id}
                      onClick={() => handleEpisodeSelect(episode.episode_number)}
                      style={episodeButtonStyle}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && !isWatched) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        } else if (!isSelected && isWatched) {
                          e.currentTarget.style.backgroundColor = 'var(--muted)';
                        }
                      }}
                    >
                      <div style={episodeNumberStyle}>
                        {episode.episode_number}
                      </div>
                      <div style={styles.episodeInfo}>
                        <div style={episodeTitleStyle}>
                          {episode.name || `Episode ${episode.episode_number}`}
                          {isWatched && !isSelected && (
                            <span style={styles.watchedBadge}>Watched</span>
                          )}
                        </div>
                        <div style={episodeDurationStyle}>
                          <FaClock size={12} />
                          {episode.runtime ? `${episode.runtime} min` : "Duration unknown"}
                        </div>
                      </div>
                      {isWatched && !isSelected && (
                        <FaCheck style={{...styles.episodeIcon, color: "var(--muted-foreground)"}} />
                      )}
                      {isSelected && (
                        <FaPlay style={{...styles.episodeIcon, color: "var(--primary-foreground)"}} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video player */}
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
                    zIndex: 2
                  }}>
                    <div style={styles.loader}></div>
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
                    padding: '1rem'
                  }}>
                    <p style={{color: 'var(--destructive)', marginBottom: '1rem'}}>
                      Video source is currently unavailable. Please try again later.
                    </p>
                    <button
                      onClick={() => {
                        setVideoError(false);
                        setVideoLoading(true);
                        if (videoRef.current) {
                          videoRef.current.src = `https://vidsrc.xyz/embed/tv/${series.id}/${selectedSeason}/${selectedEpisode}`;
                        }
                      }}
                      style={{...styles.button, ...styles.primaryButton}}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <iframe
                    ref={videoRef}
                    src={`https://vidsrc.xyz/embed/tv/${series.id}/${selectedSeason}/${selectedEpisode}`}
                    title={`Watch ${series.name} S${selectedSeason}E${selectedEpisode}`}
                    style={styles.videoPlayer}
                    className="video-player"
                    allowFullScreen
                    onLoad={() => setVideoLoading(false)}
                    onError={() => {
                      setVideoError(true);
                      setVideoLoading(false);
                    }}
                  ></iframe>
                )}
              </div>
              <div style={styles.playerInfo}>
                <h2 style={styles.nowPlaying}>
                  Now Playing: {series.name} - S{selectedSeason}E{selectedEpisode} {currentEpisode?.name ? `- ${currentEpisode.name}` : ''}
                </h2>
                {currentEpisode?.overview && (
                  <p style={styles.episodeOverview}>
                    {currentEpisode.overview}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Series Section with updated title */}
      <div style={styles.relatedSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.relatedHeading}>Similar Series You May Like</h2>
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
              <p>Finding series you might enjoy...</p>
            </div>
          ) : displayedSeries.length === 0 && !hasRefreshed ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 0"
            }}>
              <p>Click refresh to see series recommendations</p>
            </div>
          ) : displayedSeries.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 0"
            }}>
              <p>No recommendations found. Please try refreshing again.</p>
            </div>
          ) : (
            <div style={styles.relatedGrid}>
              {displayedSeries.map(item => {
                const isInCollection = getSeries().some(s => s.id === item.id);
                return renderSeriesCard(item, isInCollection);
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
        `
      }} />
    </div>
  )
}

export default WatchSeries