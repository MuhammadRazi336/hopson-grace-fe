// import { Link } from "remix";
import {Outlet, useLoaderData} from '@remix-run/react';

import {useEffect, useRef, useState} from 'react';
import NotificationCard from '~/components/NotificationCard';
import { Footer } from '~/components/Footer';
import lineImg3 from '/assets/Images/heading-bottom-curve.png';
import { Header } from '~/components/Header';
import AnimatedSVG from '~/components/AnimatedSVG'

const introSteps = [
  {
    tab: 'MY DETAILS',
    message: 'Store your names, address, email, and wedding date securely here. Filling this out helps us tailor your experience and ensures everything runs smoothly - from personalized recommendations to timely reminders.',
    arrow: {
      tailOffsetX: -260,
      tailOffsetY: -200,
      headOffsetX: 80,
      headOffsetY: 70,
      controlOffsetX: -250,
      controlOffsetY: 20,
    },
  },
  {
    tab: 'MY REGISTRY HOMEPAGE',
    message: 'This is the page your guests will see - so have fun with it! Upload photos, share your story, and add a personal message or video to welcome your guests. Prefer not to use your own photos? Choose from our curated illustrations to make your page feel beautifully personal.',
    arrow: {
      tailOffsetX: -250,
      tailOffsetY: -230,
      headOffsetX: 10,
      headOffsetY: 70,
      controlOffsetX: -150,
      controlOffsetY: 20,
    },
  },
  {
    tab: 'ADD OR EDIT GIFTS',
    message: 'Browse by category, filter by price, or get inspired with our curated edits. Add, update, or switch things up whenever you like.',
    arrow: {
      tailOffsetX: -200,
      tailOffsetY: -300,
      headOffsetX: 15,
      headOffsetY: 60,
      controlOffsetX: -30,
      controlOffsetY: -10,
    },
  },
  {
    tab: 'ADD A CASH OR TRAVEL FUND',
    message: 'Browse honeymoon destinations, pick from curated cash funds, choose a gift card, or create something totally unique - like a spa day on your honeymoon or a wine subscription from your favorite vineyard. Whatever your dream, this is the place to make it happen.',
    arrow: {
      tailOffsetX: -60,
      tailOffsetY: -330,
      headOffsetX: -15,
      headOffsetY: 60,
      controlOffsetX: 0,
      controlOffsetY: 0,
    },
  },
  {
    tab: 'GIFTS + THANK YOU TRACKER',
    message: 'Keep track of who purchased what - and make saying thank you simple and seamless.',
    arrow: {
      tailOffsetX: 110,
      tailOffsetY: -300,
      headOffsetX: 15,
      headOffsetY: 60,
      controlOffsetX: 0,
      controlOffsetY: 0,
    },
  },
  {
    tab: 'SHIP MY GIFTS',
    message: 'Enjoy one-time free shipping after the wedding - just let us know when you\'re ready. Prefer to receive something sooner? You can ship gifts anytime; standard shipping rates will apply.',
    arrow: {
      tailOffsetX: 180,
      tailOffsetY: -200,
      headOffsetX: -20,
      headOffsetY: 60,
      controlOffsetX: 100,
      controlOffsetY: 10,
    },
  },
  {
    tab: 'SUPPORT',
    message: 'Questions? We\'re here for you. From setup to thank-you notes, you can reach us anytime for help, guidance, or just a second opinion.',
    arrow: {
      tailOffsetX: 180,
      tailOffsetY: -160,
      headOffsetX: -30,
      headOffsetY: 60,
      controlOffsetX: 160,
      controlOffsetY: 30,
    },
  },
  {
    tab: 'MY MESSAGES',
    message: "This is where you'll receive updates about your registry - including notifications when gifts are purchased and messages from our team to help guide your journey.",
    arrow: {
      tailOffsetX: 270,
      tailOffsetY: -230,
      headOffsetX: -170,
      headOffsetY: 10,
      controlOffsetX: 80,
      controlOffsetY: -90
    }
  },
  {
    tab: 'SHARE MY REGISTRY',
    message: "Ready to go live? Share your registry with loved ones so they can browse and shop your handpicked favorites.",
    arrow: {
      tailOffsetX: 310,
      tailOffsetY: -40,
      headOffsetX: -190,
      headOffsetY: 20,
      controlOffsetX: 150,
      controlOffsetY: 30
    }
  }
];

export async function loader({context}) {
  const apiBaseUrl = context.env.API_BASE_URL;
  return {apiBaseUrl};
}

const Dashboard_index = ({context}) => {
  const [showIntro, setShowIntro] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [notificationNode, setNotificationNode] = useState(null);
  const [statusNode, setStatusNode] = useState(null);
  const [tabNodes, setTabNodes] = useState({});
  const introCardRef = useRef(null);
  const overlayRef = useRef(null);
  const [coupleName, setCoupleName] = useState('');
  const {apiBaseUrl} = useLoaderData();

  const containerRef = useRef(null);
  const [showSVG, setShowSVG] = useState(true);

  // Simple SVG positioning for each step
  const getSVGStyle = (stepNumber) => {
    switch(stepNumber) {
      case 0: return { left: '26.74vw', top: '0.5vw', width: '22vw', height: '11vw' };
      case 1: return { left: '33vw', top: '1vw', width: '18vw', height: '10vw' };
      case 2: return { left: '51vw', top: '1.25vw', width: '4.949vw', height: '3.196vw' };
      case 3: return { left: '64vw', top: '1.25vw', width: '23vw', height: '9vw' };
      case 4: return { left: '82vw', top: '2vw', width: '23vw', height: '9vw' };
      case 5: return { left: '92vw', top: '1.25vw', width: '25vw', height: '11vw' };
      case 6: return { left: '81vw', top: '-4.75vw', width: '25vw', height: '11vw' };
      case 7: return { left: '84vw', top: '4.25vw', width: '25vw', height: '11vw' };
      case 8: return { left: '33vw', top: '1vw', width: '18vw', height: '10vw' };
      default: return { left: '50%', top: '1.25vw', width: '200px', height: '100px' };
    }
  };

  // On mount, check localStorage for token and intro flag
  useEffect(() => {
    const token = localStorage.getItem('@Token');
    const showFlag = localStorage.getItem('showDashboardIntro');
    if (token && showFlag !== 'false') {
      setShowIntro(true);
    }

    // Fetch user data if token exists
    if (token) {
      const fetchUserData = async () => {
        try {
          const userId = JSON.parse(atob(token.split('.')[1])).id; // Extract user ID from token
          const response = await fetch(`${apiBaseUrl}/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch user data');
          const userData = await response.json();
          setCoupleName(`${userData.data.user.firstName} & ${userData.data.user.fianceFirstName}` || 'Couple Name'); // Use a default if not available
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, []);

  // When intro is finished, set flag so it doesn't show again
  const handleFinishIntro = () => {
    setShowIntro(false);
    localStorage.setItem('showDashboardIntro', 'false');
  };

  // Function to find tab elements by their data-value attribute
  const findTabElements = () => {
    const tabElements = {};
    introSteps.forEach((step, index) => {
      if (index < 7) { // Only first 7 steps have tabs
        const element = document.querySelector(`[data-value="${step.tab}"]`);
        if (element) {
          tabElements[step.tab] = element;
          console.log(`Found tab for ${step.tab}:`, element);
        } else {
          console.log(`Tab not found for ${step.tab}`);
        }
      }
    });
    console.log('All tab elements found:', tabElements);
    setTabNodes(tabElements);
  };

  // Find tab elements when component mounts and when showIntro changes
  useEffect(() => {
    if (showIntro) {
      // Try to find tabs immediately, then retry with delays
      findTabElements();
      setTimeout(findTabElements, 100);
      setTimeout(findTabElements, 500);
      setTimeout(findTabElements, 1000);
    }
  }, [showIntro]);

  // Log when currentStep changes
  useEffect(() => {
    console.log(`Current step changed to: ${currentStep}`);
    console.log(`Step data:`, introSteps[currentStep]);
  }, [currentStep]);

  // Add the animation keyframes at the top of the component
  const animationStyle = `
    @keyframes drawArrow {
      to {
        stroke-dashoffset: 0;
      }
    }
  `;

  // Get current step target node
  const getCurrentStepNode = () => {
    const currentStepData = introSteps[currentStep];
    
    // For steps 0-6, return the corresponding tab node
    if (currentStep < 7) {
      const tabNode = tabNodes[currentStepData.tab];
      console.log(`Step ${currentStep}: Looking for tab "${currentStepData.tab}", found:`, tabNode);
      return tabNode;
    }
    
    // For step 7 (MY MESSAGES), target the notification node
    if (currentStep === 7) {
      console.log(`Step ${currentStep}: Targeting notification node:`, notificationNode);
      return notificationNode;
    }
    
    // For step 8 (SHARE MY REGISTRY), target the status node
    if (currentStep === 8) {
      console.log(`Step ${currentStep}: Targeting status node:`, statusNode);
      return statusNode;
    }
    
    return null;
  };

  return (
    <div className="w-full min-h-screen">
      <style>{animationStyle}</style>
      <Header />
      <div className="">
        {showIntro ? (
          <><div ref={overlayRef} className="flex flex-col items-center justify-center w-full relative min-h-[70vh] max-[1024px]:flex-col max-[1024px]:py-[50px] max-[1024px]:px-[20px]">
            {/* Welcome and couple name */}
            <div className="mt-[6.25vw] max-[1024px]:order-1 max-[1024px]:mt-[0px]">
              <div className="md:text-[42px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] text-center xl:mt-0 mt-16 font-normal ivyora max-[1024px]:mt-0 max-[1024px]:text-[30px]">welcome to your dashboard</div>
              <div className="prata text-[48px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] text-center mb-[3.385vw] mt-[1.615vw]">{coupleName}</div>
              
              {/* <img src={lineImg3} alt="line" className="w-[60%] mt-[1.615vw] lg:w-[23.438vw] xl:w-[23.438vw] 2xl:w-[23.438vw] h-auto mx-auto" /> */}
              {/* <div className="uppercase mt-[2.031vw] mb-[2.865vw] text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] text-center tracking-widest text-black/70">How this works</div> */}
            </div>

            {/* Right side cards */}
            <div className="absolute right-4 top-4 lg:right-[4.271vw] xl:right-[4.271vw] 2xl:right-[4.271vw] lg:top-[2.917vw] xl:top-[2.917vw] 2xl:top-[2.917vw] flex flex-col gap-[18px] max-[1024px]:relative max-[1024px]:order-2 max-[1024px]:top-0 max-[1024px]:right-0 max-[1024px]:w-full max-[1024px]:mb-[30px]">
              <div ref={(node) => setNotificationNode(node)}>
                <NotificationCard
                  className={currentStep === 7 ? 'border-2 border-black' : ''}
                  count={2}
                  onView={() => { } } />
              </div>
              
            </div>

            {/* Blue card */}
            <div ref={introCardRef} className="bg-[#3d5676] text-white py-[1.979vw] px-[3.698vw] w-full lg:w-[41.354vw] xl:w-[41.354vw] 2xl:w-[41.354vw] text-center shadow-lg z-40 relative max-[1024px]:order-3 max-[1024px]:p-[20px]">
              <div className="uppercase text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-bold tracking-wide mb-2 max-[1024px]:text-[20px]">
                {introSteps[currentStep].type ? introSteps[currentStep].type.toUpperCase() : introSteps[currentStep].tab}
                <svg className='mx-auto mt-[1.042vw] mb-[1.771vw] lg:w-[11.172vw] xl:w-[11.172vw] 2xl:w-[11.172vw]' width="223" height="6" viewBox="0 0 223 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2.61322C54.2128 2.61322 106.426 2.61322 158.638 2.61322C174.645 2.61322 190.652 2.61322 206.659 2.61322C209.331 2.61322 219.683 0.547044 221 4" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <div className="mb-6 font-normal text-[22px] lg:w-[33.906vw] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] lg:leading-[32px] max-[1024px]:text-[18px]">
                {introSteps[currentStep].message}
              </div>
              <div className="absolute left-4 bottom-3">
                <img src="/assets/Images/reglogo.png" className="w-[45px] h-[40px] lg:w-[2.344vw] xl:w-[2.344vw] 2xl:w-[2.344vw] lg:h-[2.083vw] xl:h-[2.083vw] 2xl:h-[2.083vw] max-[1024px]:w-[30px] max-[1024px]:h-[30px]" width={35} alt="" />
              </div>
            </div>

            {/* Pagination centered below the card */}
            <div className="flex flex-col items-center mt-[35px] lg:mt-[1.823vw] xl:mt-[1.823vw] 2xl:mt-[1.823vw] w-full max-w-lg lg:w-[41.354vw] lg:max-w-[41.354vw] max-[1024px]:order-4 max-[1024px]:w-full max-[1024px]:max-w-full">
              <div className="w-full flex justify-between items-center">
                {currentStep > 0 ? (
                  <button
                    className="font-bold cursor-pointer lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] uppercase tracking-wide text-black max-[1024px]:text-base"
                    onClick={() => {
                      setCurrentStep(s => s - 1);
                    }}
                  >
                    ← Back
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  className="font-bold cursor-pointer lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] uppercase tracking-wide text-black max-[1024px]:text-base"
                  onClick={() => {
                    if (currentStep < introSteps.length - 1) {
                      setCurrentStep(s => s + 1);
                    } else {
                      handleFinishIntro();
                    }
                  } }
                >
                  {currentStep < introSteps.length - 1 ? 'Got it, Next →' : 'Done'}
                </button>
              </div>
              <div className="text-lg font-bold text-center mb-[35px] mt-[20px] lg:mt-[1.042vw] xl:mt-[1.042vw] 2xl:mt-[1.042vw] lg:mb-[2.396vw] xl:mb-[2.396vw] 2xl:mb-[2.396vw]">
                <span className="text-3xl md:text-4xl font-normal lg:text-[3.229vw] xl:text-[3.229vw] 2xl:text-[3.229vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] top-[10px] relative mr-[10px]">{currentStep + 1}</span> <span className="font-normal text-lg lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.467vw] xl:leading-[1.467vw] 2xl:leading-[1.467vw]">/ {introSteps.length}</span>
              </div>
              <button
                className="font-bold uppercase tracking-wide text-black mb-[140px] lg:mb-[7.604vw] xl:mb-[7.604vw] 2xl:mb-[7.604vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] pb-[0.313vw] cursor-pointer border-b-1.5 border-[#1F1D1B] lg:leading-[18px] max-[1024px]:text-base max-[1024px]:mb-0"
                onClick={handleFinishIntro}
              >
                Skip Intro
              </button>

            </div>

            {/* Animated Arrow */}
            {(() => {
              const targetNode = getCurrentStepNode();
              console.log(`Rendering arrow for step ${currentStep}:`, { targetNode, showIntro });
              // Always show SVG for step 8 (last step) even if statusNode is not found
              if (currentStep === 8 || targetNode) {
                return (
                  <AnimatedSVG 
                    show={showSVG} 
                    containerRef={containerRef}
                    style={getSVGStyle(currentStep)}
                    className='max-[1024px]:hidden'
                    stepNumber={currentStep}
                  />
                );
              }
              return null;
            })()}
          </div>
          <Footer />
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
    
  );
};

export default Dashboard_index;
