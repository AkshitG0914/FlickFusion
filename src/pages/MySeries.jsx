"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getSeries, removeSeries } from "../services/localStorage"
import { getImageUrl } from "../services/api"
import { IoClose } from "react-icons/io5"
import { FaStar } from "react-icons/fa"
import ConfirmModal from "../components/ConfirmModal"
import { initializeDefaultData } from "../services/defaultData"

const MySeries = () => {
  const [series, setSeries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('seriesSortBy') || "addedAt"
  })
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('seriesSortOrder') || "desc"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({
    genres: [],
    languages: [],
    status: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [modalState, setModalState] = useState({
    isOpen: false,
    seriesId: null,
    seriesTitle: ""
  })

  useEffect(() => {
    // Load series from localStorage
    const loadSeries = async () => {
      try {
        setIsLoading(true)
        
        // Initialize default data if needed
        try {
          await initializeDefaultData()
        } catch (error) {
          console.error("Error initializing default data:", error)
          // Continue loading existing series anyway
        }
        
        const storedSeries = getSeries()
        setSeries(storedSeries)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading series:", error)
        setSeries([])
        setIsLoading(false)
      }
    }

    loadSeries()
    
    // Safety timeout to ensure loading state ends even if there's an error
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timeout reached, forcing display of available content")
        setIsLoading(false)
      }
    }, 10000) // 10 second safety timeout
    
    return () => clearTimeout(safetyTimer)
  }, [])

  const handleRemoveSeries = (id, title) => {
    setModalState({
      isOpen: true,
      seriesId: id,
      seriesTitle: title
    })
  }

  const handleConfirmRemove = () => {
    if (modalState.seriesId) {
      removeSeries(modalState.seriesId)
      setSeries(series.filter((s) => s.id !== modalState.seriesId))
    }
    setModalState({ isOpen: false, seriesId: null, seriesTitle: "" })
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, seriesId: null, seriesTitle: "" })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      // Toggle sort order if clicking the same criteria
      const newOrder = sortOrder === "asc" ? "desc" : "asc"
      setSortOrder(newOrder)
      localStorage.setItem('seriesSortOrder', newOrder)
    } else {
      setSortBy(criteria)
      setSortOrder("asc") // Default to ascending for new criteria
      localStorage.setItem('seriesSortBy', criteria)
      localStorage.setItem('seriesSortOrder', "asc")
    }
  }

  // Calculate watch progress percentage for a series
  const calculateWatchProgress = (series) => {
    if (!series.watchProgress || Object.keys(series.watchProgress).length === 0) {
      return 0
    }

    // This is a simplified calculation - in a real app, you'd need to know the total episodes
    // For now, we'll just count the number of watched episodes
    let watchedEpisodes = 0
    let totalEpisodes = 0

    Object.keys(series.watchProgress).forEach((seasonNum) => {
      const season = series.watchProgress[seasonNum]
      watchedEpisodes += Object.keys(season).length

      // For this example, we'll just assume each season has 10 episodes
      // In a real app, you'd get this from the series data
      totalEpisodes += 10
    })

    return Math.min(100, Math.round((watchedEpisodes / totalEpisodes) * 100))
  }

  // Extract unique filter options
  const getFilterOptions = (series) => {
    const options = {
      genres: new Set(),
      languages: new Set(),
      status: new Set()
    }

    series.forEach(show => {
      // Add genres
      show.genres?.forEach(genre => options.genres.add(genre.name))
      // Add language
      if (show.original_language) {
        options.languages.add(show.original_language.toLowerCase())
      }
      // Add status
      if (show.status) {
        options.status.add(show.status)
      }
    })

    return {
      genres: Array.from(options.genres).sort(),
      languages: Array.from(options.languages).sort(),
      status: Array.from(options.status).sort()
    }
  }

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const clearFilters = () => {
    setActiveFilters({
      genres: [],
      languages: [],
      status: []
    })
  }

  // Update filter and sort function
  const filteredAndSortedSeries = series
    .filter(show => {
      const matchesSearch = (show.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (show.overview?.toLowerCase() || '').includes(searchTerm.toLowerCase())

      const matchesGenres = activeFilters.genres.length === 0 ||
        show.genres?.some(genre => activeFilters.genres.includes(genre.name))

      const matchesLanguage = activeFilters.languages.length === 0 ||
        activeFilters.languages.includes(show.original_language?.toLowerCase())

      const matchesStatus = activeFilters.status.length === 0 ||
        activeFilters.status.includes(show.status)

      return matchesSearch && matchesGenres && matchesLanguage && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
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
        case "seasons":
          // Handle number_of_seasons comparison
          const seasonsA = a.number_of_seasons || 0
          const seasonsB = b.number_of_seasons || 0
          comparison = seasonsA - seasonsB
          break
        case "episodes":
          // Handle number_of_episodes comparison
          const episodesA = a.number_of_episodes || 0
          const episodesB = b.number_of_episodes || 0
          comparison = episodesA - episodesB
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

  // CSS styles as JavaScript objects
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
    seriesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "2rem",
      position: "relative",
      zIndex: "1",
    },
    seriesCard: {
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
    imageContainer: {
      position: "relative",
      width: "100%",
      paddingBottom: "150%",
      overflow: "hidden",
    },
    seriesImage: {
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
    progressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "4px",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    progressFill: (progress) => ({
      height: "100%",
      width: `${progress}%`,
      backgroundColor: "var(--primary)",
    }),
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
    seriesTitle: {
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
    emptyContainer: {
      textAlign: "center",
      padding: "3rem",
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      color: "var(--muted-foreground)",
    },
    emptyMessage: {
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
    movieMeta: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.8rem",
      color: "var(--muted-foreground)",
    },
  }

  // Custom CSS for hover states and responsive design
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .series-card {
        position: relative;
      }
      .series-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      }
      .series-card:hover .series-image {
        transform: scale(1.05);
      }
      .series-card .remove-button {
        opacity: 0;
        transform: translateY(-5px);
        transition: all 0.2s ease;
      }
      .series-card:hover .remove-button {
        opacity: 1;
        transform: translateY(0);
      }
      @media (hover: none) {
        .series-card {
          transform: none !important;
        }
        .series-card .series-image {
          transform: none !important;
        }
        .series-card .remove-button {
          display: none !important;
        }
        .series-card .mobile-remove-button {
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
        position: relative !important;
        z-index: 50 !important;
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
      .series-grid {
        position: relative !important;
        z-index: 1 !important;
      }
      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
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
        .pageTitle {
          font-size: 2rem;
        }
        .series-grid, .movies-grid {
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
        .series-grid, .movies-grid {
          grid-template-columns: repeat(auto-fill, minmax(calc(100% / 2 - 1rem), 1fr)) !important;
          gap: 1rem !important;
        }
        .pageTitle {
          font-size: 1.75rem;
        }
        .filter-section {
          overflow: visible !important;
        }
      }
      .search-input {
        transition: border-color 0.2s ease;
      }
      .search-input:hover {
        border-color: var(--border-hover);
      }
      .search-input:focus {
        border-color: var(--primary);
      }
      .series-card .card-content:hover .card-actions {
        opacity: 1;
      }
      .series-card .card-content {
        transition: all 0.2s ease;
      }
      .series-card .card-content:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      .series-card .remove-button {
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

  const filterOptions = getFilterOptions(series)

  return (
    <div className="page-transition" style={styles.container}>
      <h1 style={styles.pageTitle} className="pageTitle">My TV Series</h1>

      {/* Search and Filter Toggle */}
      <div style={styles.searchAndFilterContainer}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search your series..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
            className="search-input"
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
              { value: "name", label: "Title" },
              { value: "lastWatched", label: "Last Watched" },
              { value: "seasons", label: "Seasons" },
              { value: "episodes", label: "Episodes" },
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
              onClick={() => toggleDropdown('genres')}
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
                    onClick={() => handleFilterChange('genres', genre)}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div style={styles.dropdownContainer} className="dropdown-container">
            <button
              style={styles.filterButton}
              onClick={() => toggleDropdown('languages')}
            >
              Languages ({activeFilters.languages.length})
              <span>{openDropdown === 'languages' ? '↑' : '↓'}</span>
            </button>
            {openDropdown === 'languages' && (
              <div style={styles.dropdown}>
                {filterOptions.languages.map(language => {
                  // We're storing languages in lowercase but displaying them uppercase
                  return (
                    <div
                      key={language}
                      style={{
                        ...styles.dropdownOption,
                        backgroundColor: activeFilters.languages.includes(language) ? 'var(--primary)' : 'transparent',
                        color: activeFilters.languages.includes(language) ? 'white' : 'inherit',
                      }}
                      onClick={() => handleFilterChange('languages', language)}
                    >
                      {language.toUpperCase()}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div style={styles.dropdownContainer} className="dropdown-container">
            <button
              style={styles.filterButton}
              onClick={() => toggleDropdown('status')}
            >
              Status ({activeFilters.status.length})
              <span>{openDropdown === 'status' ? '↑' : '↓'}</span>
            </button>
            {openDropdown === 'status' && (
              <div style={styles.dropdown}>
                {filterOptions.status.map(status => (
                  <div
                    key={status}
                    style={{
                      ...styles.dropdownOption,
                      backgroundColor: activeFilters.status.includes(status) ? 'var(--primary)' : 'transparent',
                      color: activeFilters.status.includes(status) ? 'white' : 'inherit',
                    }}
                    onClick={() => handleFilterChange('status', status)}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Footer */}
        {(activeFilters.genres.length > 0 ||
          activeFilters.languages.length > 0 ||
          activeFilters.status.length > 0) && (
          <div style={styles.filtersFooter}>
            <div style={styles.activeFiltersContainer}>
              {activeFilters.genres.map(genre => (
                <div key={genre} style={styles.activeFilter}>
                  {genre}
                  <button
                    style={styles.removeFilter}
                    onClick={() => handleFilterChange('genres', genre)}
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
                    onClick={() => handleFilterChange('languages', language)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.status.map(status => (
                <div key={status} style={styles.activeFilter}>
                  {status}
                  <button
                    style={styles.removeFilter}
                    onClick={() => handleFilterChange('status', status)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                style={styles.clearFiltersButton}
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Series grid */}
      {isLoading ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--muted-foreground)",
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
            This may take a moment while we organize your series
          </p>
        </div>
      ) : filteredAndSortedSeries.length > 0 ? (
        <div style={styles.seriesGrid} className="series-grid movies-grid">
          {filteredAndSortedSeries.map((series) => {
            const progress = calculateWatchProgress(series);

            return (
              <div
                key={series.id}
                style={styles.seriesCard}
                className="series-card movie-card"
              >
                <div style={styles.cardActions}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveSeries(series.id, series.name)
                    }}
                    style={styles.removeButton}
                    className="remove-button"
                    title="Remove from collection"
                  >
                    <IoClose size={20} />
                  </button>
                </div>
                <Link to={`/watch-series/${series.id}`} style={{ textDecoration: 'none' }}>
                  <div style={styles.imageContainer}>
                    <img
                      src={getImageUrl(series.poster_path) || "/placeholder.svg"}
                      alt={series.name}
                      style={styles.seriesImage}
                      className="series-image movie-image"
                    />
                    {progress > 0 && (
                      <div style={styles.progressBar}>
                        <div style={styles.progressFill(progress)}></div>
                      </div>
                    )}
                  </div>
                  <div style={styles.cardContent} className="card-content">
                    <h3 style={styles.seriesTitle}>
                      {series.name}
                    </h3>
                    <div style={styles.movieMeta}>
                      <span>{series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A'}</span>
                      {series.vote_average > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <FaStar style={{ color: "var(--warning)" }} />
                          {series.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {series.lastWatched && (
                      <div style={{
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        marginTop: "0.5rem"
                      }}>
                        Last watched: {new Date(series.lastWatched).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveSeries(series.id, series.name)
                  }}
                  style={styles.mobileRemoveButton}
                  className="mobile-remove-button"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={styles.emptyContainer}>
          <p style={styles.emptyMessage}>
            {searchTerm ? "No series match your search." : "Your TV series collection is empty."}
          </p>
          <Link
            to="/add-media"
            style={styles.addButton}
            className="add-button"
          >
            Add TV Series
          </Link>
        </div>
      )}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRemove}
        title="Remove TV Series"
        message={`Are you sure you want to remove "${modalState.seriesTitle}" from your collection?`}
      />
    </div>
  )
}

export default MySeries