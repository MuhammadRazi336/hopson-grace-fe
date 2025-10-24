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

  const handleStartLiveChat = () => {
    if (chatScriptLoaded) {
      // If script is already loaded, just open the chat widget
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
        setIsChatOpen(true);
        onChatStart && onChatStart();
      }
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
    
    // Configure Tawk to position on the left side
    window.Tawk_API.customStyle = {
      zIndex: 1000,
      visibility: {
        desktop: {
          position: 'bl', // bottom-left
          xOffset: 20,
          yOffset: 20
        },
        mobile: {
          position: 'bl', // bottom-left
          xOffset: 20,
          yOffset: 20
        }
      }
    };

    // Handle script load completion
    script.onload = () => {
      setChatScriptLoaded(true);
      setIsLoading(false);
      
      // Open the chat widget immediately after script loads
      if (window.Tawk_API && window.Tawk_API.maximize) {
        setTimeout(() => {
          window.Tawk_API.maximize();
          setIsChatOpen(true);
          onChatStart && onChatStart();
          
          // Add close button to chat widget after it opens
          setTimeout(() => {
            addCloseButtonToChat();
          }, 1000);
          
          // Also watch for DOM changes to catch chat popup when it appears
          const observer = new MutationObserver(() => {
            addCloseButtonToChat();
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id']
          });
          
          // Stop observing after 10 seconds
          setTimeout(() => {
            observer.disconnect();
          }, 10000);
        }, 500);
      }
    };

    // Handle script load errors
    script.onerror = () => {
      setIsLoading(false);
      const errorMessage = 'Failed to load chat. Please try again or contact us via email/phone.';
      alert(errorMessage);
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
      alert(errorMessage);
      onChatError && onChatError(errorMessage);
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

  // Apply left-side positioning CSS when chat is loaded
  useEffect(() => {
    if (chatScriptLoaded) {
      // Add CSS to position the Tawk.to widget on the left side
      const style = document.createElement('style');
      style.textContent = `
        /* Position Tawk.to widget on the left side */
        #tawk-widget,
        .tawk-widget,
        [id*="tawk"],
        [class*="tawk"] {
          left: 20px !important;
          right: auto !important;
        }
        
        /* Position the chat bubble/button on the left */
        .tawk-widget-bubble,
        .tawk-widget-button,
        [class*="tawk-bubble"],
        [class*="tawk-button"] {
          left: 20px !important;
          right: auto !important;
        }
        
        /* Position the chat window on the left */
        .tawk-widget-chat,
        .tawk-widget-window,
        [class*="tawk-chat"],
        [class*="tawk-window"] {
          left: 20px !important;
          right: auto !important;
        }
        
        /* Style the close button */
        .tawk-chat-close-btn {
          position: fixed;
          top: 20px;
          left: 20px;
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
          left: 20px !important;
          right: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [chatScriptLoaded]);

  // Default button styles
  const defaultButtonClassName = `font-bold px-6 mt-3 py-4 text-sm transition-colors duration-200 ${
    isLoading 
      ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
      : 'bg-white text-black hover:bg-gray-100'
  }`;

  // If className is provided, use it; otherwise use default
  const finalButtonClassName = className ? 
    `font-bold px-6 mt-3 py-4 text-sm transition-colors duration-200 ${
      isLoading 
        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
        : className
    }` : 
    defaultButtonClassName;

  // Default styles
  const defaultTitleClassName = "text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full max-w-[410px] text-center";
  const defaultDescriptionClassName = "text-sm lg:text-xl mt-4 mb-4 text-center text-white";
  
  const finalTitleClassName = titleClassName || defaultTitleClassName;
  const finalDescriptionClassName = descriptionClassName || defaultDescriptionClassName;

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {showTitle && (
          <>
            <h3 className={finalTitleClassName}>
              {title}
            </h3>
            <img
              src="/assets/Images/white-bdr.png"
              alt="lineimg"
              className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%] mx-auto"
            />
          </>
        )}
        {showDescription && (
          <p className={finalDescriptionClassName}>
            Chat with us live between 10am–6pm (Mon–Sat) or 12pm–5pm (Sun).
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
