import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollRestoration = () => {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Only handle scroll on PUSH navigation (not on browser back/forward)
    if (navType === 'PUSH') {
      window.history.scrollRestoration = 'manual';
      
      const smoothScrollToTop = () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only scroll if we're not already at the top
        if (currentScroll > 0) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });

          document.documentElement.style.scrollBehavior = 'smooth';
          document.body.style.scrollBehavior = 'smooth';

          // Reset scroll behavior after animation
          setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';
          }, 1000);
        }
      };

      // Execute scroll with a slight delay
      setTimeout(smoothScrollToTop, 100);
    } else {
      // For POP navigation (browser back/forward), let browser handle scroll
      window.history.scrollRestoration = 'auto';
    }

    return () => {
      window.history.scrollRestoration = 'auto';
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
    };
  }, [location.pathname, navType]);

  return null;
};

export default ScrollRestoration; 