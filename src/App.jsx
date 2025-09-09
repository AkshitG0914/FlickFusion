import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "./components/Navbar"
import LandingPage from "./pages/LandingPage"
import MyMovies from "./pages/MyMovies"
import MySeries from "./pages/MySeries"
import AddMedia from "./pages/AddMedia"
import WatchMovie from "./pages/WatchMovie"
import WatchSeries from "./pages/WatchSeries"
import NotFound from "./pages/NotFound"
import { useTheme } from "./contexts/ThemeContext"
import { initializeDefaultData } from "./services/defaultData"
import ScrollToTop from "./components/ScrollToTop"
import ScrollRestoration from "./components/ScrollRestoration"

function App() {
  const { theme } = useTheme()

  useEffect(() => {
    // Initialize default data when the app starts
    initializeDefaultData().catch(console.error);
  }, []);

  // Add CSS to ensure proper scroll behavior
  useEffect(() => {
    // Add CSS rules for proper scroll behavior
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
      
      html, body {
        overflow-x: hidden;
      }
      
      body {
        transition: scroll-behavior 0.5s ease;
      }
      
      #root {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      
      main {
        flex: 1;
        transition: scroll-behavior 0.3s ease;
      }
      
      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
        
        body, main {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <ScrollRestoration />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/my-movies" element={<MyMovies />} />
          <Route path="/my-series" element={<MySeries />} />
          <Route path="/add-media" element={<AddMedia />} />
          <Route path="/watch-movie/:id" element={<WatchMovie />} />
          <Route path="/watch-series/:id" element={<WatchSeries />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

