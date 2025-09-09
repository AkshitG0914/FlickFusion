import { Link } from "react-router-dom";
import { useState } from "react";

const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // CSS styles defined as JavaScript objects
  const styles = {
    // Variables
    colors: {
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      background: "#ffffff",
      foreground: "#111827",
      mutedForeground: "#6b7280",
      border: "#e5e7eb",
      cardBackground: "#f9fafb",
      cardHover: "#f3f4f6",
    },
    radius: "8px",
    transition: "all 0.2s ease",

    // Component styles
    notFound: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem 1rem",
      backgroundColor: "var(--background)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    notFoundContent: {
      width: "100%",
      maxWidth: "800px",
      margin: "0 auto",
      textAlign: "center",
    },
    errorContainer: {
      marginBottom: "3rem",
    },
    errorTitle: {
      fontSize: "5rem",
      fontWeight: "700",
      margin: "0",
      color: "var(--foreground)",
      lineHeight: "1",
    },
    errorSubtitle: {
      fontSize: "2rem",
      fontWeight: "600",
      margin: "0.5rem 0 1.5rem 0",
      color: "var(--foreground)",
    },
    errorText: {
      fontSize: "1.125rem",
      color: "var(--muted-foreground)",
      marginBottom: "2rem",
    },
    searchContainer: {
      marginBottom: "3rem",
    },
    searchHeading: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "1rem",
      color: "var(--foreground)",
    },
    searchForm: {
      display: "flex",
      maxWidth: "600px",
      margin: "0 auto",
    },
    searchInput: {
      flex: "1",
      padding: "0.75rem 1rem",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius) 0 0 var(--radius)",
      fontSize: "1rem",
      outline: "none",
      transition: "all var(--transition-default)",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
    },
    searchButton: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      fontWeight: "600",
      padding: "0.75rem 1.5rem",
      border: "none",
      borderRadius: "0 var(--radius) var(--radius) 0",
      cursor: "pointer",
      transition: "all var(--transition-default)",
    },
    searchResults: {
      marginBottom: "3rem",
    },
    resultsHeading: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "1.5rem",
      color: "var(--foreground)",
    },
    resultCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "1.5rem",
      width: "100%",
    },
    resultCard: {
      backgroundColor: "var(--card)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      overflow: "hidden",
      transition: "all var(--transition-default)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      border: "1px solid var(--border)",
    },
    cardTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      padding: "1.25rem 1.25rem 0.5rem",
      margin: "0",
      color: "var(--foreground)",
    },
    cardContent: {
      padding: "0 1.25rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      flex: "1",
    },
    cardDescription: {
      color: "var(--muted-foreground)",
      marginTop: "0",
      marginBottom: "1.5rem",
      minHeight: "4.5rem",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      flex: "1",
    },
    cardButton: {
      display: "inline-block",
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      textDecoration: "none",
      fontWeight: "600",
      padding: "0.625rem 1.25rem",
      borderRadius: "var(--radius)",
      textAlign: "center",
      transition: "all var(--transition-default)",
      marginTop: "auto",
      alignSelf: "flex-start",
    },
    navigationOptions: {
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
      flexWrap: "wrap",
    },
    homeButton: {
      display: "inline-block",
      padding: "0.75rem 1.5rem",
      borderRadius: "var(--radius)",
      fontWeight: "600",
      textDecoration: "none",
      transition: "all var(--transition-default)",
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
    },
    sitemapButton: {
      display: "inline-block",
      padding: "0.75rem 1.5rem",
      borderRadius: "var(--radius)",
      fontWeight: "600",
      textDecoration: "none",
      transition: "all var(--transition-default)",
      backgroundColor: "transparent",
      color: "var(--primary)",
      border: "1px solid var(--primary)",
    },
    // Media query styles applied conditionally
    getResponsiveStyles: (windowWidth) => {
      // Default styles
      let responsiveStyles = {};
      
      // Apply tablet styles
      if (windowWidth <= 786) {
        responsiveStyles = {
          errorTitle: { fontSize: "4rem" },
          errorSubtitle: { fontSize: "1.5rem" },
          searchForm: { flexDirection: "column" },
          searchInput: { borderRadius: "var(--radius)", marginBottom: "0.5rem" },
          searchButton: { borderRadius: "var(--radius)", width: "100%" },
          resultCards: { gridTemplateColumns: "1fr" },
        };
      }
      
      // Apply mobile styles
      if (windowWidth <= 480) {
        responsiveStyles = {
          ...responsiveStyles,
          errorTitle: { fontSize: "3rem" },
          navigationOptions: { flexDirection: "column", width: "100%" },
          homeButton: { width: "100%" },
          sitemapButton: { width: "100%" },
        };
      }
      
      return responsiveStyles;
    }
  };

  // Example search results for demonstration
  const mockSearch = (query) => {
    if (!query.trim()) return [];
    
    return [
      {
        id: 1,
        title: "Dashboard",
        description: "Main dashboard with analytics and overview of your account activity.",
        link: "/dashboard"
      },
      {
        id: 2,
        title: "User Settings",
        description: "Configure your profile and account preferences.",
        link: "/settings"
      },
      {
        id: 3,
        title: "Documentation",
        description: "Learn how to use our platform with detailed guides and tutorials.",
        link: "/docs"
      },
      {
        id: 4,
        title: "Support",
        description: "Get help with any issues or questions about our services.",
        link: "/support"
      }
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const results = mockSearch(searchQuery);
    setSearchResults(results);
  };

  // Hook to handle responsive styles
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Effect to update window width on resize
  useState(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive styles based on current window width
  const responsiveStyles = styles.getResponsiveStyles(windowWidth);

  return (
    <div style={styles.notFound}>
      <div style={styles.notFoundContent}>
        <div style={styles.errorContainer}>
          <h1 style={{...styles.errorTitle, ...responsiveStyles.errorTitle}}>
            404
          </h1>
          <h2 style={{...styles.errorSubtitle, ...responsiveStyles.errorSubtitle}}>
            Page Not Found
          </h2>
          <p style={styles.errorText}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div style={styles.searchContainer}>
          <h3 style={styles.searchHeading}>Find what you're looking for</h3>
          <form 
            onSubmit={handleSearch} 
            style={{...styles.searchForm, ...responsiveStyles.searchForm}}
          >
            <input
              type="text"
              placeholder="Search for pages or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{...styles.searchInput, ...responsiveStyles.searchInput}}
            />
            <button 
              type="submit" 
              style={{...styles.searchButton, ...responsiveStyles.searchButton}}
            >
              Search
            </button>
          </form>
        </div>

        {searchResults.length > 0 && (
          <div style={styles.searchResults}>
            <h3 style={styles.resultsHeading}>Search Results</h3>
            <div style={{...styles.resultCards, ...responsiveStyles.resultCards}}>
              {searchResults.map((result) => (
                <div 
                  key={result.id} 
                  style={{
                    ...styles.resultCard,
                    ':hover': {
                      boxShadow: 'var(--shadow-lg)',
                      transform: 'translateY(-2px)',
                      backgroundColor: 'var(--card-hover)',
                    }
                  }}
                >
                  <h4 style={styles.cardTitle}>{result.title}</h4>
                  <div style={styles.cardContent}>
                    <p style={styles.cardDescription}>{result.description}</p>
                    <Link 
                      to={result.link} 
                      style={{
                        ...styles.cardButton,
                        ':hover': {
                          backgroundColor: 'var(--primary-hover)',
                        }
                      }}
                    >
                      Go to Page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{...styles.navigationOptions, ...responsiveStyles.navigationOptions}}>
          <Link 
            to="/" 
            style={{
              ...styles.homeButton, 
              ...responsiveStyles.homeButton,
              ':hover': {
                backgroundColor: 'var(--primary-hover)',
              }
            }}
          >
            Back to Home
          </Link>
          <Link 
            to="/sitemap" 
            style={{
              ...styles.sitemapButton, 
              ...responsiveStyles.sitemapButton,
              ':hover': {
                backgroundColor: 'var(--primary-light)',
              }
            }}
          >
            View Sitemap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;