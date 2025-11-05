import { useEffect, useState } from 'react';
import preloaderLogo from '/assets/Images/hopson-loader.png';

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [minDisplayTime] = useState(Date.now() + 800); // Minimum 800ms display time

  useEffect(() => {
    // Function to hide preloader with minimum display time
    const hidePreloader = () => {
      const now = Date.now();
      const remainingTime = minDisplayTime - now;
      
      setTimeout(() => {
        setIsHidden(true);
        // Remove from DOM after fade-out animation
        setTimeout(() => {
          setIsLoading(false);
          // Remove inline preloader if it exists
          const inlinePreloader = document.getElementById('inline-preloader');
          if (inlinePreloader) {
            inlinePreloader.style.opacity = '0';
            inlinePreloader.style.visibility = 'hidden';
            setTimeout(() => {
              inlinePreloader.remove();
            }, 500);
          }
        }, 500);
      }, remainingTime > 0 ? remainingTime : 0);
    };

    // Function to check if critical resources are loaded
    const checkLoadState = () => {
      // Check for window load event (all resources loaded)
      const handleWindowLoad = () => {
        // Wait a bit for images to render
        setTimeout(() => {
          hidePreloader();
        }, 300);
      };

      if (document.readyState === 'complete') {
        handleWindowLoad();
      } else {
        window.addEventListener('load', handleWindowLoad, { once: true });
        // Fallback: hide after max 3 seconds regardless
        setTimeout(() => {
          hidePreloader();
        }, 3000);
      }
    };

    // Start checking immediately
    checkLoadState();
  }, [minDisplayTime]);

  if (!isLoading) return null;

  return (
    <div className={`preloader ${isHidden ? 'hidden' : ''}`}>
      <div className="preloader-container">
        <img 
          src={preloaderLogo} 
          alt="Loading" 
          className="preloader-logo"
          onLoad={(e) => {
            // Ensure image is loaded before showing
            e.target.style.opacity = '1';
          }}
        />
      </div>
    </div>
  );
}
