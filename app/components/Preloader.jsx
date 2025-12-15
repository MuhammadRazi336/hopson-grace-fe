import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigation, useLocation } from '@remix-run/react';
import preloaderLogo from '/assets/Images/hopson-loader.png';

export function Preloader() {
  const navigation = useNavigation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const minDisplayTimeRef = useRef(Date.now() + 800);
  const hideTimeoutRef = useRef(null);

  // Function to hide preloader
  const hidePreloader = useCallback((isFirstLoad = false) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    const now = Date.now();
    const remainingTime = minDisplayTimeRef.current - now;
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsHidden(true);
      setTimeout(() => {
        setIsLoading(false);
        if (isFirstLoad) {
          setIsInitialLoad(false);
          // Remove inline preloader if it exists
          const inlinePreloader = document.getElementById('inline-preloader');
          if (inlinePreloader) {
            inlinePreloader.style.opacity = '0';
            inlinePreloader.style.visibility = 'hidden';
            setTimeout(() => {
              inlinePreloader.remove();
            }, 500);
          }
        }
      }, 500);
    }, remainingTime > 0 ? remainingTime : 0);
  }, []);

  // Show preloader when navigating (route changes)
  useEffect(() => {
    if (!isInitialLoad) {
      // Show preloader when navigation starts
      if (navigation.state === 'loading') {
        setIsLoading(true);
        setIsHidden(false);
        minDisplayTimeRef.current = Date.now() + 800;
      }
    }
  }, [navigation.state, isInitialLoad]);

  // Hide preloader when navigation completes
  useEffect(() => {
    if (navigation.state === 'idle' && !isInitialLoad) {
      // Wait for images to load on the new page
      setTimeout(() => {
        hidePreloader(false);
      }, 300);
    }
  }, [navigation.state, isInitialLoad, hidePreloader]);

  // Handle initial page load
  useEffect(() => {
    if (isInitialLoad) {
      const checkLoadState = () => {
        const handleWindowLoad = () => {
          setTimeout(() => {
            hidePreloader(true);
          }, 300);
        };

        if (document.readyState === 'complete') {
          handleWindowLoad();
        } else {
          window.addEventListener('load', handleWindowLoad, { once: true });
          setTimeout(() => {
            hidePreloader(true);
          }, 3000);
        }
      };

      checkLoadState();
    }
  }, [isInitialLoad, hidePreloader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`preloader ${isHidden ? 'hidden' : ''}`}>
      <div className="preloader-container">
        <img 
          src={preloaderLogo} 
          alt="Loading" 
          className="preloader-logo"
          onLoad={(e) => {
            e.target.style.opacity = '1';
          }}
        />
      </div>
    </div>
  );
}
