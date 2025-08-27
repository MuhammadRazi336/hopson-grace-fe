import React, { useState, useEffect } from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitle.png';

const ContactUs = () => {
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
      console.log('Tawk.to chat script loaded successfully');
      
      // Open the chat widget immediately after script loads
      if (window.Tawk_API && window.Tawk_API.maximize) {
        setTimeout(() => {
          window.Tawk_API.maximize();
        }, 500); // Reduced delay to open chat faster
      }
    };

    // Handle script load errors
    script.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load Tawk.to chat script');
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
      console.error('Error inserting Tawk.to script:', error);
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
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="at your service"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-1xl lg:text-2xl font-normal text-center py-16 w-[40%] lg:w-[60%]  mx-auto">
          Questions? We’re here for you. From setup to thank-you notes, you can
          reach us anytime for help, guidance, or just a second opinion.
        </p>

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
                  <a
                    href="mailto:support@theregistry.ca"
                    className="text-white"
                  >
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
                  We’re available at 1-800-555-5555 <br />
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
                  Chat with us live between 10am–6pm (Mon–Sat) or 12pm–5pm
                  (Sun).
                  <br /> Offline? Leave a message—we’ll reply by email.
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

        <div className="w-full mx-auto text-center pt-[150px]">
          <img
            src={RegistryLogo}
            alt=""
            className="w-[100px] object-cover mx-auto"
          />
          <img
            src={lineImghead}
            alt=""
            width={100}
            height={100}
            className="object-cover mx-auto"
          />

          <p className="text-1xl lg:text-2xl font-semibold pt-8">
            WANT TO SEE SOME OF OUR PRODUCTS IN PERSON?
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-8 pb-[200px] lg:px-[350px] md:px-[200px]">
             If you’re in Toronto, visit our sister store{' '}
            <span className="font-semibold underline">Hopson Grace</span> for
            modern home essentials and timeless gifts, where you’ll be able to
            see some products from The Registry in person.
          </p>
        </div>

        <div className='w-full h-[900px] lg:h-[650px] flex flex-col lg:flex-row items-center justify-center px-0 lg:px-[200px]'>
            <div className='w-[50%] h-full bg-white relative'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <img src={HopsonGrace} alt="Hopson Grace" className='w-[300px] object-cover mx-auto' />
                    <p className='text-1xl lg:text-2xl font-semibold text-center pt-10'>LOCATION</p>
                    <p className='text-1xl lg:text-2xl font-light text-center pt-2'>200 DUPONT STREET</p>
                    <p className='text-1xl lg:text-2xl font-light text-center'>TORONTO, ON M5R 2E6</p>

                    <p className='text-1xl lg:text-2xl font-semibold text-center pt-10'>OPENING TIMES</p>
                    <p className='text-1xl lg:text-2xl font-light text-center pt-2'>MONDAY - SATURDAY: 10AM - 6PM</p>
                    <p className='text-1xl lg:text-2xl font-light text-center'>SUNDAY: 12PM - 5PM</p>

                    <p className='text-1xl lg:text-2xl font-semibold text-center pt-10'>GET IN TOUCH</p>
                    <p className='text-1xl lg:text-2xl font-light text-center pt-2'>416-926-1120</p>
                    <p className='text-1xl lg:text-2xl font-normal underline text-center'>INFO@HOPSONGRACE.COM</p>
                    <p className='text-1xl lg:text-2xl font-normal underline text-center'>WWW.HOPSONGRACE.COM</p>
                </div>
            </div>
            <div className='w-[50%] h-full'>
               <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2885.678587398061!2d-79.40446910000001!3d43.675654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3357e8ee4cdf%3A0x8b95f40a5c1da6f!2sHopson%20Grace!5e0!3m2!1sen!2s!4v1753451602628!5m2!1sen!2s" width="100%" height="100%" style={{border: 0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>

        <div className='pb-[200px]'></div>
      </div>

      <Footer />
    </section>
  );
};

export default ContactUs;
