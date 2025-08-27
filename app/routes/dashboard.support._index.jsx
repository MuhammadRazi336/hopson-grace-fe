import React, { useState, useEffect } from 'react'
import { Footer } from '~/components/Footer';
import WhiteThemeButton from '~/components/WhiteThemeButton';

const Support = () => {
  const [chatScriptLoaded, setChatScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLiveChat = () => {
    if (chatScriptLoaded) {
      // If script is already loaded, just open the chat widget
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
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
        }, 500);
      }
    };

    // Handle script load errors
    script.onerror = () => {
      setIsLoading(false);
      alert('Failed to load chat. Please try again or contact us via email/phone.');
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
      alert('Failed to initialize chat. Please try again or contact us via email/phone.');
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

  return (
    <div className="pt-[80px]">
        <div className=" p-4 mt-[80px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          need <span className="prata uppercase">support</span>
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          Enjoy one-time free shipping after the wedding—just let us know when
          you're ready. Prefer to receive something sooner? You can ship gifts
          anytime; standard shipping rates will apply.
        </p>
      </div>

      <div className="mb-16"></div>
      <section className="container mx-auto mb-10">
        <div className="flex lg:gap-8 gap-2 flex-wrap xl:flex-nowrap items-stretch">
          <div className="lg:w-[40%] w-full">
            <img
              src="/assets/Images/need-support-img.png"
              alt="Image Banner"
              className="max-[1024px]:h-full object-cover object-[80%]"
            />
          </div>
          <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[60%] w-full max-[768px]:p-10">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full  text-center">
                QUESTIONS, PRODUCT REQUESTS, OR ISSUES?
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%]"
              />
              <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center text-white">
                Email us anytime at{' '}
                <a href="mailto:support@theregistry.ca" className="text-white">
                  {' '}
                  support@theregistry.ca{' '}
                </a>{' '}
                <br /> We respond within one business day.
              </p>

              <h3 className="text-2xl mt-10 text-white lg:text-5xl 2xl:text-xl 3xl:w-full  text-center">
                PREFER A PHONE CALL?
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%] mx-auto"
              />
              <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center text-white">
                We're available at 1-800-555-5555 <br />
                10am–6pm (Mon–Sat) | 12pm–5pm (Sun).
              </p>
            </div>
            <div className="mt-14 flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full max-w-[410px] text-center">
                CHAT WITH US
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%] mx-auto"
              />
              <p className="text-sm lg:text-xl  ] mt-4 mb-4 text-center text-white">
                Chat with us live between 10am–6pm (Mon–Sat) or 12pm–5pm (Sun).
                <br /> Offline? Leave a message—we'll reply by email.
              </p>
              <div>
                <button 
                  className={`font-bold px-6 mt-3 py-4 text-sm transition-colors duration-200 ${
                    isLoading 
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                  onClick={handleStartLiveChat}
                  disabled={isLoading}
                >
                  {isLoading ? 'LOADING...' : 'START LIVE CHAT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-[120px]"></div>

      <div className="container  mx-auto flex flex-col items-center justify-center">
        <img
          src="/assets/Images/registrylogoSteps.png"
          width={100}
          alt="Image Banner"
          className="max-[1024px]:h-full object-cover object-[80%]"
        />
        <h3 className="text-xl text-center mt-10">
          NEED A REFRESHER ON SETTING UP YOUR DASHBOARD?
        </h3>

        <WhiteThemeButton className="w-[400px]" Text="SEE OUR QUICK-START GUIDE" link="/quick-start-guide" />
      </div>

      <Footer />
    </div>
  )
}

export default Support;
