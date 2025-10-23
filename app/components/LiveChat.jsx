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

  // Apply right-side positioning CSS when chat is loaded
  useEffect(() => {
    if (chatScriptLoaded) {
      // Add CSS to position the Tawk.to widget on the right side
      const style = document.createElement('style');
      style.textContent = `
        /* Position Tawk.to widget on the right side */
        #tawk-widget {
          right: 20px !important;
          left: auto !important;
        }
        
        /* Style the close button */
        .tawk-chat-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tawk-chat-close-btn:hover {
          background: #cc0000;
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
