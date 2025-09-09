import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top on route change
    const scrollToTop = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      // Only scroll if we're not already at the top
      if (currentScroll > 0) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        // Ensure main content container also scrolls smoothly
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.style.scrollBehavior = 'smooth';
          mainContent.scrollTop = 0;
          // Reset scroll behavior after animation
          setTimeout(() => {
            mainContent.style.scrollBehavior = 'auto';
          }, 1000);
        }
      }
    };

    // Execute scroll with a slight delay to ensure route transition is complete
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop; 