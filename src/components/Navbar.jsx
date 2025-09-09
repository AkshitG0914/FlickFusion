"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa"

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef(null)

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/my-movies", label: "My Movies" },
    { path: "/my-series", label: "My Series" },
    { path: "/add-media", label: "Add Media" },
  ]

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && menuOpen) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  // Get background color based on theme with transparency
  const getBackgroundColor = () => {
    if (theme === "dark") {
      return scrolled ? "rgba(22, 22, 24, 0.8)" : "rgba(22, 22, 24, 0.7)"
    } else {
      return scrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.7)"
    }
  }

  useEffect(() => {
    // Add or remove class to body when menu opens/closes
    if (menuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [menuOpen])

  return (
    <nav
      ref={navRef}
      className="navbar"
      style={{
        backgroundColor: getBackgroundColor(),
        color: "var(--card-foreground)",
        padding: scrolled ? "0.6rem 1rem" : "1rem",
        boxShadow: scrolled ? "var(--shadow-lg)" : "var(--shadow)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 100,
        transition: "all var(--transition-default)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)", // For Safari
        borderBottom: `1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
      }}
    >
      <div
        className="navbar-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <Link
          to="/"
          className="navbar-logo"
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            transition: "transform 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)"
          }}
        >
          Flick Fusion
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="menu-button show-md"
          style={{
            background: "none",
            border: "none",
            color: "var(--card-foreground)",
            cursor: "pointer",
            zIndex: 200,
            padding: "0.5rem",
            transition: "transform 0.3s ease",
            position: "relative",
          }}
        >
          {menuOpen ? (
            <FaTimes size={24} />
          ) : (
            <FaBars size={24} />
          )}
        </button>

        {/* Desktop navigation */}
        <div
          className="desktop-nav hide-md"
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
              style={{
                color: location.pathname === link.path ? "var(--primary)" : "var(--card-foreground)",
                fontWeight: location.pathname === link.path ? "600" : "normal",
                position: "relative",
                padding: "0.5rem 0",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
            >
              <span>{link.label}</span>
              <span 
                className="nav-underline"
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: "0",
                  width: location.pathname === link.path ? "100%" : "0%",
                  height: "2px",
                  backgroundColor: "var(--primary)",
                  transition: "width 0.3s ease",
                }}
              ></span>
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              background: theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)",
              border: "none",
              color: "var(--card-foreground)",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              backdropFilter: "blur(5px)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)"
              e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.15)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"
            }}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>

        {/* Mobile navigation - slide in from right */}
        <div
          className="mobile-nav show-md"
          style={{
            position: "fixed",
            top: 0,
            right: menuOpen ? 0 : "-100%",
            width: "100%",
            maxWidth: "300px",
            height: "100vh",
            backgroundColor: theme === "dark" ? "rgba(22, 22, 24, 0.98)" : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            padding: "5rem 2rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            boxShadow: menuOpen ? "var(--shadow-lg)" : "none",
            zIndex: 100,
            transition: "right 0.3s ease, opacity 0.3s ease",
            overflow: "auto",
            borderLeft: `1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
              style={{
                color: location.pathname === link.path ? "var(--primary)" : "var(--card-foreground)",
                fontWeight: location.pathname === link.path ? "600" : "normal",
                fontSize: "1.125rem",
                padding: "0.75rem 0",
                borderBottom: `1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
                width: "100%",
                textDecoration: "none",
                transition: "color 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{link.label}</span>
              {location.pathname === link.path && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                  }}
                />
              )}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              background: theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)",
              border: "none",
              color: "var(--card-foreground)",
              cursor: "pointer",
              padding: "0.75rem",
              borderRadius: "var(--radius)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "1.125rem",
              transition: "all 0.3s ease",
            }}
          >
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>

        {/* Overlay for mobile menu */}
        {menuOpen && (
          <div
            className="mobile-menu-overlay show-md"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 90,
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 0.3s ease",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </div>

      {/* CSS for hover effects and responsive design */}
      <style jsx>{`
        /* Add body padding to account for fixed navbar */
        body {
          padding-top: ${scrolled ? "61px" : "72px"};
        }

        @media (min-width: 787px) {
          .nav-link:hover {
            color: var(--primary) !important;
          }
          
          .nav-link:hover .nav-underline {
            width: 100% !important;
          }
          
          .menu-button {
            display: none !important;
          }

          .mobile-nav {
            display: none !important;
          }
        }
        
        @media (max-width: 786px) {
          .desktop-nav {
            display: none !important;
          }
          
          .menu-button {
            display: flex !important;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .mobile-nav {
            display: flex;
          }
        }

        /* Prevent body scroll when mobile menu is open */
        body.mobile-menu-open {
          overflow: hidden;
        }

        .mobile-nav {
          position: fixed;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-font-smoothing: subpixel-antialiased;
        }
      `}</style>
    </nav>
  )
}

export default Navbar