import React, { useState, useEffect } from 'react';

const LiveChat = ({ 
  title =  "CHAT WITH US",
  buttonText = "START LIVE CHAT", 
  loadingText = "LOADING...",
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  showTitle = true,
  showDescription = true,
  onChatStart,
  onChatError 
}) => {
  const [chatScriptLoaded, setChatScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Function to initialize Tawk.to chat script
  const initializeChat = () => {
    // Check if Tawk.to API is already available and fully loaded
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      setChatScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="tawk.to"]');
    if (existingScript) {
      // Script exists, wait for it to load
      const checkInterval = setInterval(() => {
        if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
          setChatScriptLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);
      return;
    }

    setIsLoading(true);

    // Create and inject the Tawk.to script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://embed.tawk.to/68ad8a78891afb1924e06aee/1j3iu9q6i';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Set up Tawk_API before script loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    // Hide welcome message and icon
    window.Tawk_API.hideWelcomeMessage = true;
    window.Tawk_API.hideWidget = false; // Keep widget visible, just hide welcome message
    
    // Callback when Tawk.to widget loads - hide welcome message
    window.Tawk_API.onLoad = function() {
      // Hide welcome message elements
      setTimeout(() => {
        const welcomeElements = document.querySelectorAll(
          '[class*="welcome"], [id*="welcome"], [class*="we-are-here"], [data-tawk-welcome]'
        );
        welcomeElements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
        });
      }, 500);
    };
    
    // Configure Tawk to position on the right side
    window.Tawk_API.customStyle = {
      zIndex: 1000,
      visibility: {
        desktop: {
          position: 'br', // bottom-right
          xOffset: 20,
          yOffset: 20
        },
        mobile: {
          position: 'br', // bottom-right
          xOffset: 20,
          yOffset: 20
        }
      }
    };

    // Handle script load completion
    script.onload = () => {
      setChatScriptLoaded(true);
      setIsLoading(false);
      
      // Don't auto-open, let Tawk.to show its default bubble
      // Just add close button functionality when chat opens
      setTimeout(() => {
        addCloseButtonToChat();
        
        // Watch for DOM changes to catch chat popup when it appears
        const observer = new MutationObserver(() => {
          addCloseButtonToChat();
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'id']
        });
        
        // Stop observing after 30 seconds
        setTimeout(() => {
          observer.disconnect();
        }, 30000);
      }, 1000);
      
      onChatStart && onChatStart();
    };

    // Handle script load errors
    script.onerror = () => {
      setIsLoading(false);
      const errorMessage = 'Failed to load chat. Please try again or contact us via email/phone.';
      console.error(errorMessage);
      onChatError && onChatError(errorMessage);
    };

    // Insert the script into the document
    try {
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        // Fallback: append to head if no script tags found
        document.head.appendChild(script);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = 'Failed to initialize chat. Please try again or contact us via email/phone.';
      console.error(errorMessage, error);
      onChatError && onChatError(errorMessage);
    }
  };

  // Auto-initialize chat on component mount
  useEffect(() => {
    // Check if Tawk.to is already fully loaded
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      setChatScriptLoaded(true);
      return;
    }

    // Initialize chat automatically
    initializeChat();
  }, []);

  const handleStartLiveChat = () => {
    if (chatScriptLoaded && window.Tawk_API && window.Tawk_API.maximize) {
      // If script is already loaded, just open the chat widget
      window.Tawk_API.maximize();
      setIsChatOpen(true);
      onChatStart && onChatStart();
    } else {
      // Initialize if not already loaded
      initializeChat();
    }
  };

  // Close chat function
  const handleCloseChat = () => {
    if (window.Tawk_API && window.Tawk_API.minimize) {
      window.Tawk_API.minimize();
      setIsChatOpen(false);
    }
  };

  // Function to add close button to chat widget
  const addCloseButtonToChat = () => {
    // Wait for chat popup to be fully loaded
    const checkForChatPopup = () => {
      
      // Find the opened chat popup/window
      const chatPopup = document.querySelector('[class*="tawk-widget"], [class*="tawk-chat"], [class*="tawk-window"], iframe[src*="tawk"]');
      const chatHeader = document.querySelector('[class*="tawk-header"], [class*="tawk-title"], [class*="tawk-widget-header"], [class*="chat-header"]');
      
      if (chatPopup && !document.querySelector('.tawk-custom-close-btn')) {
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tawk-custom-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          z-index: 10003;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: all 0.2s ease;
        `;
        
        // Add hover effect
        closeBtn.addEventListener('mouseenter', () => {
          closeBtn.style.background = '#cc0000';
          closeBtn.style.transform = 'scale(1.1)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
          closeBtn.style.background = '#ff4444';
          closeBtn.style.transform = 'scale(1)';
        });
        
        // Add click handler
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCloseChat();
        });
        
        // Try to append to chat header first, then to chat popup
        if (chatHeader) {
          chatHeader.style.position = 'relative';
          chatHeader.appendChild(closeBtn);
        } else if (chatPopup) {
          chatPopup.style.position = 'relative';
          chatPopup.appendChild(closeBtn);
        }
        
        console.log('Close button added to chat popup');
      } else if (!chatPopup) {
        // If chat popup not found, try again after a short delay
        setTimeout(checkForChatPopup, 500);
      }
    };
    
    // Start checking for chat popup
    checkForChatPopup();
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);

  // Check if Tawk.to is already loaded from elsewhere
  useEffect(() => {
    if (window.Tawk_API && window.Tawk_API.maximize) {
      setChatScriptLoaded(true);
    }
  }, []);

  // Apply positioning CSS on mount to ensure Tawk.to widget is positioned correctly
  useEffect(() => {
    // Add CSS to position the Tawk.to widget on the right side
    // Check if style already exists to avoid duplicates
    if (document.getElementById('tawk-positioning-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'tawk-positioning-style';
    style.textContent = `
        /* Position Tawk.to widget on the right side */
        #tawk-widget,
        .tawk-widget,
        [id*="tawk"],
        [class*="tawk"] {
          right: 20px !important;
          left: auto !important;
        }
        
        /* Position the chat bubble/button on the right */
        .tawk-widget-bubble,
        .tawk-widget-button,
        [class*="tawk-bubble"],
        [class*="tawk-button"] {
          right: 20px !important;
          left: auto !important;
        }
        
        /* Position the chat window on the right */
        .tawk-widget-chat,
        .tawk-widget-window,
        [class*="tawk-chat"],
        [class*="tawk-window"] {
          right: 20px !important;
          left: auto !important;
        }
        
        /* Style the close button */
        .tawk-chat-close-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .tawk-chat-close-btn:hover {
          background: #cc0000;
          transform: scale(1.1);
        }
        
        /* Add close button to chat widget header */
        .tawk-widget-chat .tawk-widget-header::after,
        .tawk-widget-window .tawk-widget-header::after,
        [class*="tawk-chat"] [class*="header"]::after,
        [class*="tawk-window"] [class*="header"]::after,
        iframe[src*="tawk"]::after {
          content: "×";
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          z-index: 10003;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: all 0.2s ease;
        }
        
        .tawk-widget-chat .tawk-widget-header::after:hover,
        .tawk-widget-window .tawk-widget-header::after:hover,
        [class*="tawk-chat"] [class*="header"]::after:hover,
        [class*="tawk-window"] [class*="header"]::after:hover,
        iframe[src*="tawk"]::after:hover {
          background: #cc0000;
          transform: scale(1.1);
        }
        
        /* Ensure close button appears on opened chat popup */
        .tawk-custom-close-btn {
          position: absolute !important;
          top: 10px !important;
          right: 10px !important;
          background: #ff4444 !important;
          color: white !important;
          border: none !important;
          border-radius: 50% !important;
          width: 35px !important;
          height: 35px !important;
          cursor: pointer !important;
          font-size: 20px !important;
          font-weight: bold !important;
          z-index: 10003 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
          transition: all 0.2s ease !important;
        }
        
        /* Additional positioning for all possible Tawk elements */
        iframe[src*="tawk"],
        div[class*="tawk"],
        div[id*="tawk"] {
          right: 20px !important;
          left: auto !important;
        }
        
        /* Hide welcome message and icon */
        .tawk-welcome-message,
        [class*="welcome"],
        [class*="welcome-message"],
        [id*="welcome"],
        .tawk-widget-welcome,
        [class*="tawk-welcome"],
        [class*="tawk-widget-welcome"],
        div[class*="welcome"],
        span[class*="welcome"],
        .tawk-widget-bubble[class*="welcome"],
        [data-tawk-welcome] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
        
        /* Hide any notification or announcement messages */
        .tawk-notification,
        .tawk-announcement,
        [class*="notification"],
        [class*="announcement"],
        [class*="we-are-here"],
        [class*="we-are-here-to-help"] {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      document.head.appendChild(style);
  }, []);

  // Determine if this is a minimal widget (no title/description)
  const isMinimalWidget = !showTitle && !showDescription;
  
  // Default button styles
  const defaultButtonClassName = `font-bold px-6 ${isMinimalWidget ? 'mt-0' : 'mt-3'} py-4 text-sm cursor-pointer lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] transition-colors duration-200 ${
    isLoading 
      ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
      : 'bg-white text-black hover:bg-gray-100'
  }`;

  // If className is provided, use it; otherwise use default
  const finalButtonClassName = className ? 
    `font-bold px-6 ${isMinimalWidget ? 'mt-0' : 'mt-3'} py-4 text-sm lg:text-[0.938vw] cursor-pointer lg:h-[3.958vw] xl:h-[3.958vw] 2xl:h-[3.958vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] transition-colors duration-200 ${
      isLoading 
        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
        : className
    }` : 
    defaultButtonClassName;

  // Default styles
  const defaultTitleClassName = "text-[20px] mt-10 text-white lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full  text-center";
  const defaultDescriptionClassName = "text-sm lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]  max-w-[500px] mt-4 mb-0 text-center text-white";
  
  const finalTitleClassName = titleClassName || defaultTitleClassName;
  const finalDescriptionClassName = descriptionClassName || defaultDescriptionClassName;

  // If this is a minimal widget (no title/description), don't render the button
  // The Tawk.to widget will show its own bubble automatically
  if (isMinimalWidget) {
    return null; // Return nothing - Tawk.to will handle the UI
  }

  return (
    <>
      <div className={`flex flex-col items-center justify-center ${!showTitle && !showDescription ? 'm-0' : ''}`}>
        {showTitle && (
          <>
            <h3 className={finalTitleClassName}>
              {title}
            </h3>
            <img
              src="/assets/Images/small-heading-line.png"
              alt="lineimg"
              className="my-[5px] lg:w-[6.25vw] xl:w-[6.25vw] 2xl:w-[6.25vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[100px] mx-auto"
            />
          </>
        )}
        {showDescription && (
          <p className={finalDescriptionClassName}>
            Chat with us live between 10–6pm (Mon–Sat) or 12–5pm (Sun).
            <br /> Offline? Leave a message—we'll reply by email.
          </p>
        )}
        <button 
          className={finalButtonClassName}
          onClick={handleStartLiveChat}
          disabled={isLoading}
        >
          {isLoading ? loadingText : buttonText}
        </button>
      </div>
      
      {/* Close button for chat widget */}
      {isChatOpen && (
        <button 
          className="tawk-chat-close-btn"
          onClick={handleCloseChat}
          title="Close Chat"
        >
          ×
        </button>
      )}
    </>
  );
};

export default LiveChat;
