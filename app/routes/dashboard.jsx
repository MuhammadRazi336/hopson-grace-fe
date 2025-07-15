// import { Link } from "remix";
import {Outlet} from '@remix-run/react';
import CustomTabs from '~/components/Tabs.jsx';
import {useEffect, useRef, useState} from 'react';
import NotificationCard from '~/components/NotificationCard';
import RegistryStatusCard from '~/components/RegistryStatusCard';
import { Footer } from '~/components/Footer';
import lineImg3 from '/assets/Images/line.png';

const introSteps = [
  {
    tab: 'MY DETAILS',
    message: 'Store your names, address, email, and wedding date securely here. Filling this out helps us tailor your experience and ensures everything runs smoothly - from personalized recommendations to timely reminders.',
    arrow: {
      tailOffsetX: -200,
      tailOffsetY: -180,
      headOffsetX: 10,
      headOffsetY: 80,
      controlOffsetX: -180,
      controlOffsetY: -20,
    },
  },
  {
    tab: 'MY REGISTRY HOMEPAGE',
    message: 'This is the page your guests will see - so have fun with it! Upload photos, share your story, and add a personal message or video to welcome your guests. Prefer not to use your own photos? Choose from our curated illustrations to make your page feel beautifully personal.',
    arrow: {
      tailOffsetX: -200,
      tailOffsetY: -160,
      headOffsetX: 10,
      headOffsetY: 90,
      controlOffsetX: -60,
      controlOffsetY: -20,
    },
  },
  {
    tab: 'ADD OR EDIT GIFTS',
    message: 'Browse by category, filter by price, or get inspired with our curated edits. Add, update, or switch things up whenever you like.',
    arrow: {
      tailOffsetX: -150,
      tailOffsetY: -230,
      headOffsetX: -15,
      headOffsetY: 60,
      controlOffsetX: -30,
      controlOffsetY: -10,
    },
  },
  {
    tab: 'ADD A CASH OR TRAVEL FUND',
    message: 'Browse honeymoon destinations, pick from curated cash funds, choose a gift card, or create something totally unique - like a spa day on your honeymoon or a wine subscription from your favorite vineyard. Whatever your dream, this is the place to make it happen.',
    arrow: {
      tailOffsetX: -30,
      tailOffsetY: -260,
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
      tailOffsetY: -220,
      headOffsetX: -35,
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
      tailOffsetY: -180,
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
      tailOffsetX: 150,
      tailOffsetY: -190,
      headOffsetX: -220,
      headOffsetY: 130,
      controlOffsetX: 100,
      controlOffsetY: -70
    }
  },
  {
    tab: 'SHARE MY REGISTRY',
    message: "Ready to go live? Share your registry with loved ones so they can browse and shop your handpicked favorites.",
    arrow: {
      tailOffsetX: 180,
      tailOffsetY: -120,
      headOffsetX: -220,
      headOffsetY: 300,
      controlOffsetX: 100,
      controlOffsetY: 0
    }
  }
];

const Dashboard_index = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tabNode, setTabNode] = useState(null);
  const [notificationNode, setNotificationNode] = useState(null);
  const [statusNode, setStatusNode] = useState(null);
  const introCardRef = useRef(null);
  const overlayRef = useRef(null);
  const [coupleName, setCoupleName] = useState('');

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
          const response = await fetch(`https://dev-hopsongrace.codup.io/api/users/${userId}`, {
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

  const tabData = [
    {
      label: 'MY DETAILS',
      value: 1,
      route: '',
    },
    {
      label: 'MY REGISTRY HOMEPAGE',
      value: 2,
      route: 'registry',
    },
    {
      label: 'ADD OR EDIT GIFTS',
      value: 3,
      route: 'addgifts',
    },
    {
      label: 'ADD A CASH OR TRAVEL FUND',
      value: 4,
      route: 'cashfunds',
    },
    {
      label: 'GIFTS + THANK YOU TRACKER',
      value: 5,
      route: 'gifttracker',
    },
    {
      label: 'SHIP MY GIFTS',
      value: 6,
      route: 'shipgifts',
    },
    {
      label: 'SUPPORT',
      value: 7,
      route: 'support',
    },
  ];

  // Animated Arrow (relative to overlay container, with per-step config)
  const AnimatedArrow = ({ fromRef, toRef, show, containerRef, arrowConfig }) => {
    const [coords, setCoords] = useState(null);
    const [key, setKey] = useState(0);

    useEffect(() => {
      setKey(prev => prev + 1); // Reset animation when show changes
    }, [show]);

    useEffect(() => {
      if (fromRef.current && toRef && containerRef.current) {
        const fromRect = fromRef.current.getBoundingClientRect();
        const toRect = toRef.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const {
          tailOffsetX = 0,
          tailOffsetY = 0,
          headOffsetX = 0,
          headOffsetY = 0,
          controlOffsetX = -120,
          controlOffsetY = -100,
        } = arrowConfig || {};
        const x1 = fromRect.left + fromRect.width / 2 - containerRect.left + tailOffsetX;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top + tailOffsetY;
        const x2 = toRect.left + toRect.width / 2 - containerRect.left + headOffsetX;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top + headOffsetY;
        const controlX = x1 + controlOffsetX;
        const controlY = y1 + controlOffsetY;
        setCoords({ x1, y1, x2, y2, controlX, controlY });
      }
    }, [fromRef, toRef, show, containerRef, arrowConfig]);

    if (!coords || !show) return null;
    return (
      <svg
        key={key}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill="#222">
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.1s"
                begin="drawArrow.end"
                fill="freeze"
              />
            </path>
          </marker>
        </defs>
        <path
          id="drawArrow"
          d={`M${coords.x1},${coords.y1} Q${coords.controlX},${coords.controlY} ${coords.x2},${coords.y2}`}
          stroke="#222"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowhead)"
          style={{
            strokeDasharray: "1000",
            strokeDashoffset: "1000",
            animation: show ? "drawArrow 1.5s ease-out forwards" : "none"
          }}
        />
      </svg>
    );
  };

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
    if (currentStepData.type === 'notification') return notificationNode;
    if (currentStepData.type === 'status') return statusNode;
    return tabNode;
  };

  return (
    <div className="w-full min-h-screen">
      <style>{animationStyle}</style>
      <div className="w-full">
        <CustomTabs
          tabsData={tabData}
          defaultActive={currentStep < introSteps.length - 2 ? tabData.find(tab => tab.label === introSteps[currentStep].tab)?.value : null}
          headerClassName="bg-[#F5F2ED]"
          onTabRef={setTabNode}
          activeTab={currentStep < introSteps.length - 2 ? introSteps[currentStep].tab : null}
        />
      </div>
      <div className="">
        {showIntro ? (
          <div ref={overlayRef} className="flex flex-col items-center justify-center w-full relative bg-white min-h-[70vh]">
            {/* Welcome and couple name */}
            <div className="mb-6 mt-16">
              <div className="md:text-[42px] text-center xl:mt-0 mt-16 font-normal ivyora">welcome to your dashboard</div>
              <div className="font-serif text-3xl text-center mb-2">{coupleName}</div>
              <img src={lineImg3} alt="line" className="w-[60%] h-auto mx-auto" />
              <div className="uppercase mt-6 text-sm text-center tracking-widest text-black/70">How this works</div>
            </div>

            {/* Right side cards */}
            <div className="absolute right-4 top-4 flex flex-col gap-4">
              <div ref={(node) => setNotificationNode(node)}>
                <NotificationCard 
                  className={currentStep === 7 ? 'border-2 border-black' : ''} 
                  count={2} 
                  onView={() => {}} 
                />
              </div>
              <div ref={(node) => setStatusNode(node)}>
                <RegistryStatusCard 
                  className={currentStep === 8 ? 'border-2 border-black' : ''} 
                  status="draft" 
                  onToggle={() => {}} 
                />
              </div>
            </div>

            {/* Blue card */}
            <div ref={introCardRef} className="bg-[#3d5676] text-white p-8 w-full max-w-lg text-center shadow-lg z-40 relative">
              <div className="uppercase text-lg font-bold tracking-wide mb-2">
                {introSteps[currentStep].type ? introSteps[currentStep].type.toUpperCase() : introSteps[currentStep].tab}
              </div>
              <div className="w-16 h-1 bg-white mx-auto mb-4 rounded"></div>
              <div className="mb-6">
                {introSteps[currentStep].message}
              </div>
              <div className="absolute left-4 bottom-3">
                <img src="/assets/Images/reglogo.png" width={35} alt="" />
              </div>
            </div>

            {/* Pagination centered below the card */}
            <div className="flex flex-col items-center mt-6 w-full max-w-lg">
            <div className="w-full flex justify-end">
                <button
                  className="font-bold uppercase tracking-wide text-black"
                  onClick={() => {
                    if (currentStep < introSteps.length - 1) {
                      setCurrentStep(s => s + 1);
                    } else {
                      handleFinishIntro();
                    }
                  }}
                >
                  {currentStep < introSteps.length - 1 ? 'Got it, Next →' : 'Done'}
                </button>
              </div>
              <div className="text-lg font-bold text-center mb-2">
                <span className="text-3xl md:text-4xl font-semibold">{currentStep + 1}</span> <span className="font-normal text-lg">/ {introSteps.length}</span>
              </div>
              <button
                className="font-bold uppercase tracking-wide text-black underline mb-4"
                onClick={handleFinishIntro}
              >
                Skip Intro
              </button>
              
            </div>

            {/* Animated Arrow */}
            {getCurrentStepNode() && (
              <AnimatedArrow
                fromRef={introCardRef}
                toRef={getCurrentStepNode()}
                show={showIntro}
                containerRef={overlayRef}
                arrowConfig={introSteps[currentStep].arrow}
              />
            )}
          </div>
        ) : (
          <Outlet />
        )}
      </div>
      <Footer/>
    </div>
    
  );
};

export default Dashboard_index;
