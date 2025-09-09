"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getMovies, removeMovie } from "../services/localStorage"
import { getImageUrl } from "../services/api"
import { IoClose } from "react-icons/io5"
import { FaStar } from "react-icons/fa"
import ConfirmModal from "../components/ConfirmModal"
import { groupByCollection, groupByUniverse, getMovieUniverse } from "../utils/movieOrganization"
import { initializeDefaultData } from "../services/defaultData"
import React, { useContext, useCallback } from 'react'
import { useTheme } from "../contexts/ThemeContext"

const MyMovies = () => {
  const [movies, setMovies] = useState([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeFilters, setActiveFilters] = useState({
    genres: [],
    languages: [],
    years: []
  })
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    languages: [],
    years: []
  })
  const [filterInitialized, setFilterInitialized] = useState(false)
  const [collections, setCollections] = useState([])
  const [universes, setUniverses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('moviesSortBy') || "addedAt"
  })
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('moviesSortOrder') || "desc"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [modalState, setModalState] = useState({
    isOpen: false,
    movieId: null,
    movieTitle: ""
  })

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true)
        
        // Initialize default data if needed
        try {
          await initializeDefaultData()
        } catch (error) {
          console.error("Error initializing default data:", error)
        }
        
        const allMovies = getMovies()
        
        if (!allMovies || allMovies.length === 0) {
          setMovies([])
          setCollections([])
          setUniverses([])
          setIsLoading(false)
          return
        }

        // Process movies in batches for better performance
        setTimeout(() => {
          setMovies(allMovies)
          
          // Process collections and universes after setting initial movies
          setTimeout(() => {
            try {
              setCollections(groupByCollection(allMovies))
            } catch (err) {
              console.error("Error grouping by collection:", err)
              setCollections([])
            }
            
            try {
              setUniverses(groupByUniverse(allMovies))
            } catch (err) {
              console.error("Error grouping by universe:", err)
              setUniverses([])
            }
            
            // Initialize filter options after movies are loaded
            const options = calculateFilterOptions(allMovies);
            setFilterOptions(options);
            setFilterInitialized(true);
            
            setIsLoading(false)
          }, 0)
        }, 0)
      } catch (error) {
        console.error("Error loading movies:", error)
        setMovies([])
        setCollections([])
        setUniverses([])
        setIsLoading(false)
      }
    }

    loadMovies()
    
    // Safety timeout to ensure loading state ends even if there's an error
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timeout reached, forcing display of available content")
        setIsLoading(false)
      }
    }, 10000) // 10 second safety timeout
    
    return () => clearTimeout(safetyTimer)
  }, [])

  const handleRemoveMovie = (id, title) => {
    setModalState({
      isOpen: true,
      movieId: id,
      movieTitle: title
    })
  }

  const handleConfirmRemove = () => {
    if (modalState.movieId) {
      removeMovie(modalState.movieId)
      setMovies(movies.filter((movie) => movie.id !== modalState.movieId))
    }
    setModalState({ isOpen: false, movieId: null, movieTitle: "" })
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, movieId: null, movieTitle: "" })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      // Toggle sort order if clicking the same criteria
      const newOrder = sortOrder === "asc" ? "desc" : "asc"
      setSortOrder(newOrder)
      localStorage.setItem('moviesSortOrder', newOrder)
    } else {
      setSortBy(criteria)
      setSortOrder("asc") // Default to ascending for new criteria
      localStorage.setItem('moviesSortBy', criteria)
      localStorage.setItem('moviesSortOrder', "asc")
    }
  }

  // Extract unique filter options - simplified version
  const calculateFilterOptions = (moviesList) => {
    const genres = new Set();
    const languages = new Set();
    const years = new Set();

    moviesList.forEach(movie => {
      // Add genres
      movie.genres?.forEach(genre => {
        if (genre.name) genres.add(genre.name);
      });
      
      // Add language with proper normalization
      if (movie.original_language) {
        const normalizedLanguage = String(movie.original_language).toLowerCase();
        languages.add(normalizedLanguage);
      }
      
      // Add release year
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear().toString();
        years.add(year);
      }
    });

    return {
      genres: Array.from(genres).sort(),
      languages: Array.from(languages).sort(),
      years: Array.from(years).sort((a, b) => b.localeCompare(a))
    };
  };

  // Replace the getFilterOptions function with a simpler one that just returns the current state
  const getFilterOptions = () => {
    return filterOptions;
  };

  // Clean up handleFilterChange to remove debugging code
  const handleFilterChange = (type, value) => {
    if (!value) return;
    
    // Create a normalized value for consistent comparison
    let normalizedValue = value;
    
    // Apply special handling for languages
    if (type === 'languages') {
      normalizedValue = String(value).toLowerCase();
    }
    
    setActiveFilters(prev => {
      // Check if the filter is already active
      const isActive = prev[type].includes(normalizedValue);
      
      // Create new filter array by either adding or removing the value
      const newFilters = isActive
        ? prev[type].filter(item => item !== normalizedValue)
        : [...prev[type], normalizedValue];
      
      return {
        ...prev,
        [type]: newFilters
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      genres: [],
      languages: [],
      years: []
    });
    setSearchTerm("");
  }

  // Clean up the filtering logic
  const filteredAndSortedMovies = movies
    .filter(movie => {
      try {
        const matchesSearch = (movie.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (movie.overview?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesGenres = activeFilters.genres.length === 0 ||
          movie.genres?.some(genre => activeFilters.genres.includes(genre.name))

        // Ensure consistent language handling
        let movieLanguage = '';
        if (movie.original_language) {
          movieLanguage = String(movie.original_language).toLowerCase();
        }
        
        let matchesLanguage = false;
        if (activeFilters.languages.length === 0) {
          matchesLanguage = true;
        } else if (movieLanguage) {
          // Check each active language filter
          for (const langFilter of activeFilters.languages) {
            if (movieLanguage === langFilter) {
              matchesLanguage = true;
              break;
            }
          }
        }

        const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : null
        const matchesYear = activeFilters.years.length === 0 ||
          (movieYear && activeFilters.years.includes(movieYear))

        // Check for collection/universe views which use the activeFilter
        const isCollectionOrUniverse = 
          activeFilter === "collections" || 
          activeFilter === "universe";

        return matchesSearch && matchesGenres && matchesLanguage && matchesYear && !isCollectionOrUniverse
      } catch (error) {
        console.error("Error filtering movie:", movie?.title, error);
        return false;
      }
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "addedAt":
          comparison = a.addedAt - b.addedAt
          break
        case "lastWatched":
          // Handle null values for lastWatched
          if (!a.lastWatched && !b.lastWatched) {
            comparison = 0
          } else if (!a.lastWatched) {
            comparison = 1
          } else if (!b.lastWatched) {
            comparison = -1
          } else {
            comparison = b.lastWatched - a.lastWatched // Compare timestamps directly
          }
          break
        case "releaseDate":
          // Handle release_date comparison (format: YYYY-MM-DD)
          const dateA = a.release_date ? new Date(a.release_date) : null
          const dateB = b.release_date ? new Date(b.release_date) : null
          if (!dateA && !dateB) comparison = 0
          else if (!dateA) comparison = 1
          else if (!dateB) comparison = -1
          else comparison = dateA - dateB
          break
        case "runtime":
          // Handle runtime comparison (in minutes)
          const runtimeA = a.runtime || 0
          const runtimeB = b.runtime || 0
          comparison = runtimeA - runtimeB
          break
        case "rating":
          // Handle vote_average comparison
          const ratingA = a.vote_average || 0
          const ratingB = b.vote_average || 0
          comparison = ratingA - ratingB
          break
        default:
          comparison = 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

  // Styles
  const styles = {
    container: {
      padding: "2rem 1rem",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    pageTitle: {
      fontSize: "2.5rem",
      marginBottom: "2rem",
      color: "var(--foreground)",
      textAlign: "left",
    },
    searchAndFilterContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "1rem",
    },
    searchContainer: {
      flex: 1,
      maxWidth: "500px",
    },
    filterToggleButton: {
      backgroundColor: "var(--primary)",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "var(--radius)",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      transition: "opacity 0.2s",
      "&:hover": {
        opacity: 0.9,
      },
    },
    filterSection: {
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      padding: "1.5rem",
      marginBottom: "0",
      transition: "all 0.3s ease",
      maxHeight: "0",
      opacity: "0",
      visibility: "hidden",
      position: "relative",
      transform: "translateY(-10px)",
      zIndex: "50",
    },
    filterSectionVisible: {
      maxHeight: "2000px",
      opacity: "1",
      visibility: "visible",
      marginTop: "1rem",
      marginBottom: "2rem",
      transform: "translateY(0)",
    },
    sortingSection: {
      marginBottom: "1.5rem",
    },
    sortingTitle: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "var(--muted-foreground)",
      marginBottom: "0.75rem",
    },
    segmentedButtons: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      backgroundColor: "var(--muted)",
      padding: "0.25rem",
      borderRadius: "var(--radius)",
    },
    segmentButton: (active) => ({
      padding: "0.5rem 1rem",
      borderRadius: "var(--radius-sm)",
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: active ? "var(--background)" : "transparent",
      color: active ? "var(--foreground)" : "var(--muted-foreground)",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    }),
    controlsContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "1.5rem",
      position: "relative",
      zIndex: "51",
    },
    dropdownContainer: {
      position: "relative",
      flex: "1 1 200px",
      minWidth: "200px",
      maxWidth: "300px",
      zIndex: "52",
    },
    filterButton: {
      backgroundColor: "var(--background)",
      border: "1px solid var(--border)",
      padding: "0.75rem 1rem",
      borderRadius: "var(--radius)",
      color: "var(--foreground)",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      width: "100%",
      transition: "border-color 0.2s, box-shadow 0.2s",
      "&:hover": {
        borderColor: "var(--primary)",
      },
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 0.5rem)",
      left: 0,
      right: 0,
      backgroundColor: "var(--background)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "0.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxHeight: "300px",
      overflowY: "auto",
      overscrollBehavior: "contain",
      zIndex: "1000",
    },
    dropdownOption: {
      padding: "0.5rem 0.75rem",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "var(--accent)",
      },
    },
    filtersFooter: {
      borderTop: "1px solid var(--border)",
      paddingTop: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    activeFiltersContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      flex: 1,
    },
    activeFilter: {
      backgroundColor: "var(--primary)",
      color: "white",
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--radius)",
      fontSize: "0.75rem",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    clearFiltersButton: {
      backgroundColor: "var(--destructive)",
      color: "white",
      padding: "0.5rem 1rem",
      borderRadius: "var(--radius)",
      fontSize: "0.875rem",
      fontWeight: "500",
      border: "none",
      cursor: "pointer",
      transition: "opacity 0.2s",
      marginLeft: "1rem",
      "&:hover": {
        opacity: 0.9,
      },
    },
    unifiedControlsSection: {
      marginBottom: "2rem",
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      padding: "1.5rem",
    },
    controlsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    controlsTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "var(--foreground)",
    },
    controlsToggle: {
      backgroundColor: "transparent",
      border: "none",
      color: "var(--primary)",
      cursor: "pointer",
      fontSize: "0.875rem",
      padding: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
    },
    searchInput: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "var(--radius)",
      border: "1px solid var(--input)",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontSize: "1rem",
      outline: "none",
    },
    sortContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    sortLabel: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "var(--muted-foreground)",
    },
    sortButtons: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
    },
    divider: {
      height: "1px",
      backgroundColor: "var(--border)",
      margin: "1rem 0",
    },
    moviesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(calc(100% / 6 - 1.5rem), 1fr))",
      gap: "2rem",
      position: "relative",
      zIndex: "1",
    },
    movieCard: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      },
    },
    posterContainer: {
      position: "relative",
      width: "100%",
      paddingBottom: "150%",
      overflow: "hidden",
    },
    poster: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.3s",
      "&:hover": {
        transform: "scale(1.05)",
      },
    },
    watchCount: {
      position: "absolute",
      top: "0.5rem",
      right: "0.5rem",
      backgroundColor: "var(--primary)",
      color: "white",
      borderRadius: "50%",
      width: "2rem",
      height: "2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "0.875rem",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    },
    cardContent: {
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      position: "relative",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "var(--accent)",
      },
    },
    movieTitle: {
      fontSize: "1.125rem",
      fontWeight: "bold",
      marginBottom: "0.25rem",
      color: "var(--card-foreground)",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      minHeight: "2.75rem",
    },
    cardActions: {
      position: "absolute",
      top: "0.5rem",
      right: "0.5rem",
      zIndex: 10,
    },
    removeButton: {
      backgroundColor: "var(--card)",
      color: "var(--muted-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      padding: 0,
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "var(--destructive)",
        color: "white",
        borderColor: "var(--destructive)",
      },
    },
    mobileRemoveButton: {
      display: "none",
      width: "100%",
      padding: "0.75rem",
      backgroundColor: "var(--card)",
      color: "var(--muted-foreground)",
      border: "none",
      borderRadius: "var(--radius)",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "0.5rem",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "var(--accent)",
        borderColor: "var(--border)",
      },
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      color: "var(--muted-foreground)",
    },
    emptyStateText: {
      marginBottom: "1.5rem",
      fontSize: "1.125rem",
    },
    addButton: {
      backgroundColor: "var(--primary)",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "var(--radius)",
      fontWeight: "bold",
      display: "inline-block",
      textDecoration: "none",
      transition: "background-color 0.2s, transform 0.1s",
      "&:hover": {
        opacity: 0.9,
        transform: "translateY(-1px)",
      },
    },
    loadingState: {
      textAlign: "center",
      padding: "3rem",
      color: "var(--muted-foreground)",
    },
    filterGroups: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.5rem",
    },
    filterGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    filterGroupTitle: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "var(--muted-foreground)",
      marginBottom: "0.25rem",
    },
    filterOptions: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
    },
    filterChip: (active) => ({
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--radius)",
      fontSize: "0.875rem",
      cursor: "pointer",
      backgroundColor: active ? "var(--primary)" : "var(--muted)",
      color: active ? "white" : "var(--muted-foreground)",
      border: "none",
      transition: "all 0.2s",
    }),
    removeFilter: {
      backgroundColor: "transparent",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "0.25rem",
      display: "flex",
      alignItems: "center",
      "&:hover": {
        opacity: 0.8,
      },
    },
    collectionHeader: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "1rem",
      color: "var(--foreground)",
    },
    collectionSection: {
      marginBottom: "2rem",
    },
    movieGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    movieImage: {
      width: "100%",
      aspectRatio: "2/3",
      objectFit: "cover",
    },
    movieInfo: {
      padding: "0.75rem",
    },
    movieMeta: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.8rem",
      color: "var(--muted-foreground)",
    },
  }

  const applyStyle = (style) => {
    if (typeof style === 'function') {
      return style()
    }
    return style
  }

  // Add custom CSS for hover states and responsive design
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .movie-card {
        position: relative;
      }
      .movie-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      }
      .movie-card:hover .movie-image {
        transform: scale(1.05);
      }
      .movie-card .remove-button {
        opacity: 0;
        transform: translateY(-5px);
        transition: all 0.2s ease;
      }
      .movie-card:hover .remove-button {
        opacity: 1;
        transform: translateY(0);
      }
      @media (hover: none) {
        .movie-card {
          transform: none !important;
        }
        .movie-card .movie-image {
          transform: none !important;
        }
        .movie-card .remove-button {
          display: none !important;
        }
        .movie-card .mobile-remove-button {
          display: block !important;
        }
      }
      .watch-button:hover {
        background-color: var(--primary-hover, #0056b3);
      }
      .remove-button:hover {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
      }
      .add-button:hover {
        background-color: var(--primary-hover, #0056b3);
      }
      .sort-button:hover {
        filter: brightness(1.1);
      }
      .sort-button:active {
        transform: scale(0.97);
      }
      .filter-chip:hover {
        filter: brightness(1.1);
      }
      .filter-chip:active {
        transform: scale(0.97);
      }
      .filter-section {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .dropdown {
        position: absolute !important;
        z-index: 1000 !important;
        background-color: var(--background) !important;
      }
      .dropdown-container {
        position: relative !important;
        z-index: 52 !important;
      }
      .filter-section {
        position: relative !important;
        z-index: 50 !important;
      }
      .movies-grid {
        position: relative !important;
        z-index: 1 !important;
      }
      @media (max-width: 786px) {
        .controls-container {
          justify-content: space-between;
        }
        .dropdown-container {
          flex: 1 1 calc(50% - 0.5rem) !important;
          max-width: calc(50% - 0.5rem) !important;
        }
        .search-container {
          max-width: 100%;
        }
        .title {
          font-size: 2rem;
        }
        .movies-grid {
          grid-template-columns: repeat(auto-fill, minmax(calc(100% / 4 - 1.5rem), 1fr)) !important;
          gap: 1.5rem !important;
        }
        .filter-section {
          overflow: visible !important;
        }
      }
      
      @media (max-width: 480px) {
        .dropdown-container {
          flex: 1 1 100% !important;
          max-width: 100% !important;
        }
        .movies-grid {
          grid-template-columns: repeat(auto-fill, minmax(calc(100% / 2 - 1rem), 1fr)) !important;
          gap: 1rem !important;
        }
        .title {
          font-size: 1.75rem;
        }
        .filter-section {
          overflow: visible !important;
        }
      }
      .movie-card .card-content:hover .card-actions {
        opacity: 1;
      }
      .movie-card .card-content {
        transition: all 0.2s ease;
      }
      .movie-card .card-content:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      .movie-card .remove-button {
        z-index: 10;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Function to toggle dropdown
  const toggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type)
  }

  // Function to handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const renderMovieCard = (movie) => (
    <div key={movie.id} style={styles.movieCard} className="movie-card">
      <div style={styles.cardActions}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveMovie(movie.id, movie.title);
          }}
          style={styles.removeButton}
          className="remove-button"
          title="Remove from collection"
        >
          <IoClose size={20} />
        </button>
      </div>
      <Link to={`/watch-movie/${movie.id}`} style={{ textDecoration: "none" }}>
        <div style={styles.posterContainer}>
          <img
            src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
            alt={movie.title}
            style={styles.poster}
            className="movie-image"
          />
          {movie.watchCount > 9007199254740991 && (
            <div style={styles.watchCount}>
              {movie.watchCount}
            </div>
          )}
        </div>
        <div style={styles.cardContent} className="card-content">
          <div style={styles.movieTitle}>{movie.title}</div>
          <div style={styles.movieMeta}>
            <span>{new Date(movie.release_date).getFullYear()}</span>
            {movie.vote_average > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <FaStar style={{ color: "var(--warning)" }} />
                {movie.vote_average.toFixed(1)}
              </span>
            )}
          </div>
          {movie.lastWatched && (
            <div style={{
              fontSize: "0.8rem",
              color: "var(--muted-foreground)",
              marginTop: "0.5rem"
            }}>
              Last watched: {new Date(movie.lastWatched).toLocaleDateString()}
            </div>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRemoveMovie(movie.id, movie.title);
        }}
        style={styles.mobileRemoveButton}
        className="mobile-remove-button"
      >
        Remove
      </button>
    </div>
  )

  const renderContent = () => {
    switch (activeFilter) {
      case "collections":
        return collections.map(collection => (
          <div key={collection.id} style={styles.collectionSection}>
            <h2 style={styles.collectionHeader}>{collection.name}</h2>
            <div style={styles.movieGrid}>
              {collection.movies.map(movie => renderMovieCard(movie))}
            </div>
          </div>
        ))

      case "universe":
        return universes.map(universe => (
          <div key={universe.key} style={styles.collectionSection}>
            <h2 style={styles.collectionHeader}>{universe.name}</h2>
            <div style={styles.movieGrid}>
              {universe.movies.map(movie => renderMovieCard(movie))}
            </div>
          </div>
        ))

      default:
        return (
          <div style={styles.movieGrid}>
            {filteredAndSortedMovies.map((movie) => renderMovieCard(movie))}
          </div>
        )
    }
  }

  // Update the loading state display to show progress
  const LoadingState = () => (
    <div style={{
      ...styles.loadingState,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '5px solid var(--muted)',
        borderBottomColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'rotation 1s linear infinite'
      }}></div>
      <p>Loading your collection...</p>
      <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
        This may take a moment while we organize your movies
      </p>
    </div>
  )

  const resetAllFilters = () => {
    // Reset all filters to their default states
    setActiveFilter("all");
    setActiveFilters({
      genres: [],
      languages: [],
      years: []
    });
    setSearchTerm("");
    // Log the reset
    console.log("All filters reset to default state");
  }

  // Add a simple useEffect for filter initialization if needed
  useEffect(() => {
    if (!filterInitialized && movies.length > 0) {
      const options = calculateFilterOptions(movies);
      setFilterOptions(options);
      setFilterInitialized(true);
    }
  }, [movies, filterInitialized]);

  return (
    <div className="page-transition" style={styles.container}>
      <h1 style={styles.pageTitle}>My Movies</h1>

      {/* Search and Filter Toggle */}
      <div style={styles.searchAndFilterContainer}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search your movies..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
        <button
          style={styles.filterToggleButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          Sort & Filter {showFilters ? "↑" : "↓"}
        </button>
        </div>

      {/* Collapsible Filter Section */}
      <div
        style={{
          ...styles.filterSection,
          ...(showFilters ? styles.filterSectionVisible : {}),
        }}
      >
        {/* Sorting Section */}
        <div style={styles.sortingSection}>
          <div style={styles.sortingTitle}>Sort by</div>
          <div style={styles.segmentedButtons}>
            {[
              { value: "addedAt", label: "Date Added" },
              { value: "title", label: "Title" },
              { value: "lastWatched", label: "Last Watched" },
              { value: "releaseDate", label: "Release Date" },
              { value: "runtime", label: "Runtime" },
              { value: "rating", label: "Rating" },
            ].map((option) => (
              <button
                key={option.value}
                style={styles.segmentButton(sortBy === option.value)}
                onClick={() => handleSort(option.value)}
              >
                {option.label} {sortBy === option.value && (sortOrder === "asc" ? "↑ A" : "↓ D")}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <div style={styles.controlsContainer}>
          {/* Genre Dropdown */}
          <div style={styles.dropdownContainer} className="dropdown-container">
            <button
              style={styles.filterButton}
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown('genres');
              }}
            >
              Genres ({activeFilters.genres.length})
              <span>{openDropdown === 'genres' ? '↑' : '↓'}</span>
            </button>
            {openDropdown === 'genres' && (
              <div style={styles.dropdown}>
                {filterOptions.genres.map(genre => (
                  <div
                    key={genre}
                    style={{
                      ...styles.dropdownOption,
                      backgroundColor: activeFilters.genres.includes(genre) ? 'var(--primary)' : 'transparent',
                      color: activeFilters.genres.includes(genre) ? 'white' : 'inherit',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('genres', genre);
                      // Keep dropdown open for multiple selections
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div style={styles.dropdownContainer}>
            <button
              style={styles.filterButton}
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown('languages');
              }}
            >
              Languages ({activeFilters.languages.length})
              <span>{openDropdown === 'languages' ? '↑' : '↓'}</span>
            </button>
            {openDropdown === 'languages' && (
              <div style={styles.dropdown}>
                {filterOptions.languages.map(language => {
                  // We store languages in lowercase but display uppercase for readability
                  return (
                    <div
                      key={language}
                      style={{
                        ...styles.dropdownOption,
                        backgroundColor: activeFilters.languages.includes(language) ? 'var(--primary)' : 'transparent',
                        color: activeFilters.languages.includes(language) ? 'white' : 'inherit',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFilterChange('languages', language);
                        // Keep dropdown open for multiple selections
                        e.nativeEvent.stopImmediatePropagation();
                      }}
                    >
                      {language.toUpperCase()}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div style={styles.dropdownContainer} className="dropdown-container">
            <button
              style={styles.filterButton}
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown('years');
              }}
            >
              Release Years ({activeFilters.years.length})
              <span>{openDropdown === 'years' ? '↑' : '↓'}</span>
            </button>
            {openDropdown === 'years' && (
              <div style={styles.dropdown}>
                {filterOptions.years.map(year => (
                  <div
                    key={year}
                    style={{
                      ...styles.dropdownOption,
                      backgroundColor: activeFilters.years.includes(year.toString()) ? 'var(--primary)' : 'transparent',
                      color: activeFilters.years.includes(year.toString()) ? 'white' : 'inherit',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('years', year.toString());
                      // Keep dropdown open for multiple selections
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Footer */}
        {(activeFilters.genres.length > 0 ||
          activeFilters.languages.length > 0 ||
          activeFilters.years.length > 0 ||
          activeFilter === "collections" ||
          activeFilter === "universe") && (
          <div style={styles.filtersFooter}>
            <div style={styles.activeFiltersContainer}>
              {activeFilters.genres.map(genre => (
                <div key={genre} style={styles.activeFilter}>
                  {genre}
                  <button
                    style={styles.removeFilter}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('genres', genre);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.languages.map(language => (
                <div key={language} style={styles.activeFilter}>
                  {language.toUpperCase()}
                  <button
                    style={styles.removeFilter}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('languages', language);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.years.map(year => (
                <div key={year} style={styles.activeFilter}>
                  {year}
                  <button
                    style={styles.removeFilter}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('years', year);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {(activeFilter === "collections" || activeFilter === "universe") && (
                <div style={styles.activeFilter}>
                  {activeFilter === "collections" ? "Collections" : "Universe"}
                  <button
                    style={styles.removeFilter}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveFilter("all");
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <button
                style={styles.clearFiltersButton}
                onClick={(e) => {
                  e.preventDefault();
                  resetAllFilters();
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movie grid */}
      {isLoading ? (
        <LoadingState />
      ) : movies.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyStateText}>
            {searchTerm ? "No movies match your search." : "Your movie collection is empty."}
          </p>
          <Link to="/add-media" style={styles.addButton}>
            Add Movies
          </Link>
        </div>
      ) : renderContent()}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRemove}
        title="Remove Movie"
        message={`Are you sure you want to remove "${modalState.movieTitle}" from your collection?`}
      />
    </div>
  )
}

export default MyMovies