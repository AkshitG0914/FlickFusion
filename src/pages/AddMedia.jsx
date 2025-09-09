"use client"

import { useState, useEffect } from "react"
import { searchMedia } from "../services/api"
import { addMovie, addSeries } from "../services/localStorage"
import { getImageUrl } from "../services/api"

const AddMedia = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [addedItems, setAddedItems] = useState({})

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const debounceTimer = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setMessage("")

    try {
      const results = await searchMedia(searchTerm)
      setSearchResults(results)

      if (results.length === 0) {
        setMessage("No results found. Try a different search term.")
      }
    } catch (error) {
      console.error("Search error:", error)
      setMessage("An error occurred while searching. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = (item) => {
    let success = false

    if (item.media_type === "movie") {
      success = addMovie(item)
    } else if (item.media_type === "tv") {
      success = addSeries(item)
    }

    if (success) {
      setAddedItems((prev) => ({ ...prev, [item.id]: true }))
      setMessage(`${item.title || item.name} added to your collection!`)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("")
      }, 3000)
    } else {
      setMessage(`${item.title || item.name} is already in your collection.`)
    }
  }

  const styles = {
    container: {
      padding: "2rem 1rem",
      maxWidth: "1200px",
      margin: "0 auto",
      transition: "all 0.3s ease"
    },
    header: {
      fontSize: "2.5rem",
      marginBottom: "2rem",
      color: "var(--foreground)",
      fontWeight: "700",
      borderBottom: "2px solid var(--primary)",
      paddingBottom: "0.5rem"
    },
    searchContainer: {
      marginBottom: "2.5rem",
      width: "100%",
      maxWidth: "700px"
    },
    searchForm: {
      display: "flex",
      gap: "0.5rem",
      width: "100%",
      flexWrap: "wrap",
      alignItems: "stretch"
    },
    searchInput: {
      flex: "1",
      minWidth: "250px",
      padding: "0.85rem 1rem",
      borderRadius: "var(--radius)",
      border: "1px solid var(--input)",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontSize: "1rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    searchButton: {
      backgroundColor: "var(--primary)",
      color: "white",
      padding: "0.85rem 1.5rem",
      borderRadius: "var(--radius)",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s, transform 0.1s",
      minWidth: "120px"
    },
    searchHint: {
      marginTop: "0.75rem",
      fontSize: "0.875rem",
      color: "var(--muted-foreground)"
    },
    messageBox: {
      padding: "1rem 1.5rem",
      marginBottom: "2rem",
      borderRadius: "var(--radius)",
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    successMessage: {
      backgroundColor: "#ecfdf5",
      color: "#047857",
      border: "1px solid #a7f3d0"
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca"
    },
    loadingContainer: {
      textAlign: "center",
      padding: "3rem",
      color: "var(--muted-foreground)"
    },
    resultsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(calc(100% / 6 - 1.5rem), 1fr))",
      gap: "2rem",
      width: "100%"
    },
    card: {
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      transition: "transform 0.3s, box-shadow 0.3s"
    },
    cardImageContainer: {
      position: "relative",
      width: "100%",
      paddingBottom: "150%",
      overflow: "hidden"
    },
    cardImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    mediaType: {
      position: "absolute",
      top: "0.5rem",
      left: "0.5rem",
      color: "white",
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--radius)",
      fontSize: "0.75rem",
      fontWeight: "bold",
      textTransform: "uppercase",
      zIndex: 1
    },
    movieType: {
      backgroundColor: "var(--primary)"
    },
    tvType: {
      backgroundColor: "var(--secondary)"
    },
    cardContent: {
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1
    },
    cardTitle: {
      fontSize: "1.125rem",
      fontWeight: "bold",
      marginBottom: "0.75rem",
      color: "var(--card-foreground)",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      height: "2.75rem" // Fixed height for titles
    },
    cardDescription: {
      fontSize: "0.875rem",
      color: "var(--muted-foreground)",
      marginBottom: "1.5rem",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      flexGrow: 1,
      height: "3.9rem" // Fixed height for descriptions (3 lines)
    },
    cardFooter: {
      marginTop: "auto",
      width: "100%"
    },
    addButton: {
      width: "100%",
      padding: "0.65rem 0.75rem",
      borderRadius: "var(--radius)",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s"
    },
    addButtonActive: {
      backgroundColor: "var(--primary)",
      color: "white"
    },
    addButtonDisabled: {
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      cursor: "default"
    },
    emptyState: {
      textAlign: "center",
      padding: "3.5rem 2rem",
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      color: "var(--muted-foreground)",
      width: "100%",
      maxWidth: "700px",
      margin: "0 auto",
      border: "1px dashed var(--border)"
    }
  }

  // Add custom CSS for hover states and responsive design
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .media-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      }
      .media-card:hover .media-image {
        transform: scale(1.05);
      }
      .add-button:hover {
        background-color: var(--primary-hover, #0056b3);
      }
      .search-button:hover {
        filter: brightness(1.1);
      }
      .search-button:active {
        transform: scale(0.97);
      }

      @media (max-width: 786px) {
        .search-container {
          flex-direction: column;
        }
        .search-form {
          flex-direction: column;
          gap: 1rem;
        }
        .search-input {
          width: 100%;
        }
        .search-button {
          width: 100%;
        }
        .results-grid {
          grid-template-columns: repeat(auto-fill, minmax(calc(100% / 4 - 1.5rem), 1fr)) !important;
          gap: 1.5rem !important;
        }
      }
      
      @media (max-width: 480px) {
        .results-grid {
          grid-template-columns: repeat(auto-fill, minmax(calc(100% / 2 - 1rem), 1fr)) !important;
          gap: 1rem !important;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="page-transition" style={styles.container}>
      <h1 style={styles.header}>Add to Your Collection</h1>

      {/* Search form */}
      <div style={styles.searchContainer} className="search-container">
        <div style={styles.searchForm} className="search-form">
          <input
            type="text"
            placeholder="Search for movies or TV series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            style={styles.searchButton}
            className="search-button"
          >
            Search
          </button>
        </div>
        <p style={styles.searchHint}>
          Search for movies and TV shows to add to your collection.
        </p>
      </div>

      {/* Message display */}
      {message && (
        <div
          style={{
            ...styles.messageBox,
            ...(message.includes("error") ? styles.errorMessage : styles.successMessage)
          }}
        >
          {message}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div style={styles.loadingContainer}>
          <div style={{ fontSize: "1.125rem" }}>Searching...</div>
        </div>
      )}

      {/* Search results */}
      {!isLoading && searchResults.length > 0 && (
        <div style={styles.resultsGrid} className="results-grid">
          {searchResults.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardImageContainer}>
                <img
                  src={getImageUrl(item.poster_path) || "/placeholder.svg"}
                  alt={item.title || item.name}
                  style={styles.cardImage}
                />
                <div
                  style={{
                    ...styles.mediaType,
                    ...(item.media_type === "movie" ? styles.movieType : styles.tvType)
                  }}
                >
                  {item.media_type === "movie" ? "Movie" : "TV Series"}
                </div>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>
                  {item.title || item.name}
                </h3>
                <p style={styles.cardDescription}>
                  {item.overview || "No description available."}
                </p>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleAddItem(item)}
                    disabled={addedItems[item.id]}
                    style={{
                      ...styles.addButton,
                      ...(addedItems[item.id] ? styles.addButtonDisabled : styles.addButtonActive)
                    }}
                  >
                    {addedItems[item.id] ? "Added" : "Add to Collection"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && searchTerm && searchResults.length === 0 && !message && (
        <div style={styles.emptyState}>
          <p style={{ fontSize: "1.125rem" }}>No results found. Try a different search term.</p>
        </div>
      )}
    </div>
  )
}

export default AddMedia