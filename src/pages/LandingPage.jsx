"use client"

import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { FaFilm, FaMobileAlt, FaMoon } from "react-icons/fa"

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    cta: false
  })

  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  // Smooth scroll function
  const scrollToSection = (elementRef) => {
    if (elementRef && elementRef.current) {
      window.scrollTo({
        top: elementRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === heroRef.current) {
            setIsVisible(prev => ({ ...prev, hero: true }))
          } else if (entry.target === featuresRef.current) {
            setIsVisible(prev => ({ ...prev, features: true }))
          } else if (entry.target === ctaRef.current) {
            setIsVisible(prev => ({ ...prev, cta: true }))
          }
        }
      })
    }, observerOptions)

    if (heroRef.current) observer.observe(heroRef.current)
    if (featuresRef.current) observer.observe(featuresRef.current)
    if (ctaRef.current) observer.observe(ctaRef.current)

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current)
      if (featuresRef.current) observer.unobserve(featuresRef.current)
      if (ctaRef.current) observer.unobserve(ctaRef.current)
    }
  }, [])

  return (
    <div className="landing-page" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>
      {/* Hero Section */}
      <section
        ref={heroRef}
        style={{
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          position: "relative",
          overflow: "hidden",
          opacity: isVisible.hero ? 1 : 0,
          transform: isVisible.hero ? "translateY(0)" : "translateY(30px)",
          transition: "opacity var(--transition-slow), transform var(--transition-slow)"
        }}
      >
        <div 
          className="floating-shapes"
          style={{
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 0,
            overflow: "hidden"
          }}
        >
          <div className="shape shape-1" style={{
            position: "absolute",
            width: "120px",
            height: "120px",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            backgroundColor: "var(--primary-light)",
            opacity: 0.1,
            top: "10%",
            left: "10%",
            animation: "float 8s infinite alternate ease-in-out"
          }}></div>
          <div className="shape shape-2" style={{
            position: "absolute",
            width: "80px",
            height: "80px",
            borderRadius: "58% 42% 33% 67% / 63% 46% 54% 37%",
            backgroundColor: "var(--secondary-light)",
            opacity: 0.1,
            top: "60%",
            right: "10%",
            animation: "float 10s infinite alternate-reverse ease-in-out"
          }}></div>
          <div className="shape shape-3" style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            opacity: 0.1,
            bottom: "15%",
            left: "15%",
            animation: "float 12s infinite alternate ease-in-out"
          }}></div>
        </div>

        <div className="container max-w-xl mx-auto">
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              marginBottom: "1rem",
              fontWeight: "800",
              color: "var(--foreground)",
              position: "relative",
              zIndex: 1,
              letterSpacing: "-0.03em",
              lineHeight: 1.2
            }}
          >
            Flick Fusion
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              maxWidth: "600px",
              marginBottom: "2rem",
              color: "var(--muted-foreground)",
              position: "relative",
              zIndex: 1,
              lineHeight: 1.6,
              margin: "0 auto 2rem"
            }}
          >
            Your personal movie and TV series collection, all in one place.
          </p>
          <div
            className="flex gap-4 flex-sm-col w-sm-full"
            style={{
              position: "relative",
              zIndex: 1,
              justifyContent: "center",
              alignItems: "stretch"
            }}
          >
            <Link
              to="/add-media"
              className="w-sm-full"
              style={{
                backgroundColor: "var(--primary)",
                color: "white",
                padding: "0.875rem 2rem",
                borderRadius: "var(--radius)",
                fontWeight: "600",
                boxShadow: "var(--shadow-md)",
                transition: "all var(--transition-fast)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "1rem",
                whiteSpace: "nowrap"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "var(--shadow-lg)"
                e.currentTarget.style.backgroundColor = "var(--primary-hover)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "var(--shadow-md)"
                e.currentTarget.style.backgroundColor = "var(--primary)"
              }}
            >
              Add Media
            </Link>
            <Link
              to="/my-movies"
              className="w-sm-full"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
                padding: "0.875rem 2rem",
                borderRadius: "var(--radius)",
                fontWeight: "600",
                boxShadow: "var(--shadow)",
                transition: "all var(--transition-fast)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "1rem",
                border: "1px solid var(--border)",
                whiteSpace: "nowrap"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "var(--shadow-lg)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "var(--shadow)"
              }}
            >
              My Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        style={{
          padding: "4rem 1rem",
          backgroundColor: "var(--card)",
          opacity: isVisible.features ? 1 : 0,
          transform: isVisible.features ? "translateY(0)" : "translateY(30px)",
          transition: "opacity var(--transition-slow), transform var(--transition-slow)"
        }}
      >
        <div className="container max-w-xl mx-auto">
          <h2
            className="text-center"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              marginBottom: "3rem",
              color: "var(--foreground)",
              position: "relative",
              fontWeight: "700"
            }}
          >
            Key Features
          </h2>
          <div className="grid gap-6">
            {/* Feature cards */}
            {[
              {
                icon: <FaFilm size={24} />,
                title: "Manage Your Collection",
                description: "Organize your movies and TV series in one place. Add, remove, and sort your media with ease.",
                color: "var(--primary)"
              },
              {
                icon: <FaMobileAlt size={24} />,
                title: "Responsive Design",
                description: "Enjoy a seamless experience on any device. Flick Fusion adapts perfectly to your screen size.",
                color: "var(--secondary)"
              },
              {
                icon: <FaMoon size={24} />,
                title: "Theme Customization",
                description: "Choose from multiple themes including light and dark modes. Personalize your viewing experience.",
                color: "var(--accent)"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="card p-6 p-md-4"
                style={{
                  backgroundColor: "var(--background)",
                  borderRadius: "var(--radius)",
                  transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "var(--primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    marginBottom: "0.5rem"
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "var(--foreground)",
                    marginBottom: "0.5rem"
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                    margin: 0
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        ref={ctaRef}
        style={{
          padding: "4rem 2rem",
          backgroundColor: "var(--muted)",
          textAlign: "center",
          opacity: isVisible.cta ? 1 : 0,
          transform: isVisible.cta ? "translateY(0)" : "translateY(30px)",
          transition: "opacity var(--transition-slow), transform var(--transition-slow)"
        }}
      >
        <div 
          className="container"
          style={{
            maxWidth: "800px",
            margin: "0 auto"
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              marginBottom: "1rem",
              color: "var(--foreground)",
              fontWeight: "700"
            }}
          >
            Ready to Build Your Collection?
          </h2>
          <p
            style={{
              fontSize: "1rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
              color: "var(--muted-foreground)",
              lineHeight: 1.6
            }}
          >
            Start adding your favorite movies and TV shows to create your personalized media library today.
          </p>
          <Link
            to="/add-media"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius)",
              fontWeight: "600",
              display: "inline-block",
              boxShadow: "var(--shadow)",
              transition: "all var(--transition-fast)",
              textDecoration: "none",
              fontSize: "0.95rem"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "var(--shadow-lg)"
              e.currentTarget.style.backgroundColor = "var(--primary-hover)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "var(--shadow)"
              e.currentTarget.style.backgroundColor = "var(--primary)"
            }}
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--card)",
          color: "var(--card-foreground)",
          padding: "2rem",
          textAlign: "center"
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          <div
            className="logo"
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.75rem"
            }}
          >
            Flick Fusion
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--muted-foreground)",
              marginBottom: "1.5rem"
            }}
          >
            Your personal movie and TV series collection
          </p>
          <div
            className="footer-links"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap"
            }}
          >
            <Link to="/" style={{ color: "var(--card-foreground)", textDecoration: "none", transition: "color var(--transition-fast)", fontSize: "0.9rem" }}>Home</Link>
            <Link to="/my-movies" style={{ color: "var(--card-foreground)", textDecoration: "none", transition: "color var(--transition-fast)", fontSize: "0.9rem" }}>My Movies</Link>
            <Link to="/add-media" style={{ color: "var(--card-foreground)", textDecoration: "none", transition: "color var(--transition-fast)", fontSize: "0.9rem" }}>Add Media</Link>
            <Link to="/settings" style={{ color: "var(--card-foreground)", textDecoration: "none", transition: "color var(--transition-fast)", fontSize: "0.9rem" }}>Settings</Link>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1.5rem",
              fontSize: "0.85rem",
              color: "var(--muted-foreground)"
            }}
          >
            © {new Date().getFullYear()} Flick Fusion. All rights reserved.
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(-40px) rotate(-5deg);
          }
        }
        
        @media (max-width: 768px) {
          .feature-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage