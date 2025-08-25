import {NavLink, useLoaderData, useNavigate} from '@remix-run/react';
import registryLogo from '/assets/Images/registryLogo.png';
import registryLogoScroll from '/assets/Images/copyrightLogo.png';
import searchImg from '/assets/Images/search.png';
import searchImgscroll from '/assets/Images/searchwhite.png';
import userImg from '/assets/Images/shape.png';
import userImgscroll from '/assets/Images/shapewhite.png';
import hamburger from '/assets/Images/hamburger.png';
import hamburgerscroll from '/assets/Images/Group 42.png';
import TopHeader from './TopHeader';
import {Navbar} from '@material-tailwind/react';
import NavBarLinks from './NavBarLinks';
import HeaderMobileMenu from './HeaderMobileMenu';
import {useState, useEffect} from 'react';
import Popup from './Popup';
import {useLocation} from 'react-router-dom';

export function Header() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [registryData, setRegistryData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [isMenuOpenBottom, setIsMenuOpenBottom] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [status, setStatus] = useState(registryData?.status || 'draft');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusFeedback, setShowStatusFeedback] = useState(false);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
  const isDraft = status === 'draft';
  const navigate = useNavigate();
  
  // Get API base URL from loader data
  const { env } = useLoaderData() || {};
  const apiBaseUrl = 'https://dev-hopsongrace.codup.io' || 'http://localhost:3040';

  // Notification system state
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // const notificationRef = useRef(null);
  // const socketRef = useRef(null);

  // Update status when registry data changes
  useEffect(() => {
    if (registryData?.status) {
      setStatus(registryData.status);
    }
  }, [registryData]);

  // Get token from localStorage only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@Token') || localStorage.getItem('@token');
      setUser(token);
      
      // If no token, set loading to false immediately
      if (!token) {
        setIsLoadingRegistry(false);
      }
      
      // Decode and fetch user data
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = parts[1];
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
            const tokenData = JSON.parse(decodedPayload);
            const tokenId = Number(tokenData.id);
            
            // Fetch user data using the ID from token
            if (tokenId) {
              fetch(`${apiBaseUrl}/api/users/${tokenId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              .then(res => res.json())
              .then(data => {
                if (data.code === 200 && data.data && data.data.user) {
                  setUserData(data.data.user);
                }
              })
              .catch(error => {
                console.error('Error fetching user data:', error);
              });

              // Fetch registry data using the user ID
              fetch(`${apiBaseUrl}/api/registries/by-userId/${tokenId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              .then(res => res.json())
              .then(registryData => {
                console.log('Registry API response:', registryData);
                if (registryData.code === 200 && registryData.data && registryData.data.length > 0) {
                  const registry = registryData.data[0];
                  setRegistryData(registry);
                  setStatus(registry.status || 'draft');
                }
                setIsLoadingRegistry(false);
              })
              .catch(error => {
                console.error('Error fetching registry data:', error);
                setIsLoadingRegistry(false);
              });

            }
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }, []);

  // Generate user initials from fetched user data
  const getUserInitials = () => {
    if (!userData) {
      return 'U'; // Default fallback
    }
    
    const firstName = userData.firstName || userData.first_name || '';
    const lastName = userData.lastName || userData.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    
    return 'U'; // Fallback
  };

  // Check if event has image
  const hasEventImage = () => {
    if (!registryData || !registryData.events || registryData.events.length === 0) {
      return false;
    }
    const event = registryData.events[0];
    // Check if image exists and has fileUrl property
    if (event.image && event.image.fileUrl) {
      return true;
    }
    // Fallback for different image structures
    if (event.image && typeof event.image === 'string') {
      return true;
    }
    return false;
  };

  // Get event image URL
  const getEventImage = () => {
    if (!registryData || !registryData.events || registryData.events.length === 0) {
      return null;
    }
    const event = registryData.events[0];
    // Check if image exists and has fileUrl property
    if (event.image && event.image.fileUrl) {
      return event.image.fileUrl;
    }
    // Fallback for different image structures
    if (event.image && typeof event.image === 'string') {
      return event.image;
    }
    return null;
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
  const toggleMenuDesktop = () => {
    setIsMenuOpenBottom((prev) => !prev);
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const threshold = 100; // Lower threshold for earlier activation

    if (scrollY > threshold) {
      setIsFixed(true);
    } else {
      setIsFixed(false);
    }
  };

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to unified search page with search query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search input after navigation
    }
  };

  const handleToggle = async () => {
    const newStatus = isDraft ? 'published' : 'draft';
    const token = user;
    
    if (!token || !registryData?.id) {
      console.error('No token or registry ID available');
      return;
    }
    
    setIsUpdatingStatus(true);
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/registries/status/${registryData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({status: newStatus}),
      });
      
      if (response.ok) {
        setStatus(newStatus);
        // Update the registry data locally
        setRegistryData(prev => prev ? {...prev, status: newStatus} : prev);
        // Show success feedback
        setShowStatusFeedback(true);
        setTimeout(() => setShowStatusFeedback(false), 2000);
      } else {
        console.error('Failed to update registry status');
      }
    } catch (error) {
      console.error('Error updating registry status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    let ticking = false;

    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []);

  return (
    <div className={`${isFixed ? 'lg:h-[442px]' : ''}`}>
      <TopHeader />

      <header
        className={`header-animated flex justify-between px-4 lg:px-[3.854vw] max-[1024px]:items-center transition-all duration-200 ease-in-out ${
          isFixed
            ? 'fixed top-0 left-0 w-full z-50 bg-black shadow-lg h-[100px]'
            : 'relative bg-white h-[160px] max-md:h-[80px]'
        }`}
      >
        {/* User Icon */}
        <div
          className={`flex lg:w-[33%] mt-[-0.625vw] max-md:hidden ${
            isFixed ? 'items-center' : 'items-start'
          }`}
        >
          {isFixed && (
            <button className="" onClick={toggleMenuDesktop}>
              <span role="img" aria-label="Search Icon">
                <img
                  src={hamburgerscroll}
                  alt="hamburger Icon"
                  className="max-[1024px]:hidden w-8"
                />
              </span>
            </button>
          )}

          {/* Search Icon */}
          {!isFixed && (
            <form onSubmit={handleSearch} className="flex items-center justify-center bg-[#F5F2ED] py-1 px-[1.563vw] w-[22.448vw] h-[3.281vw] rounded-full">
              <button type="submit" className="text-xl hover:text-blue-500 max-[1024px]:hidden">
                <span role="img" aria-label="Search Icon">
                  <img src={searchImg} class="w-[1.979vw] h-[1.979vw] min-w-[1.979vw] min-h-[1.979vw]" alt="Search Icon" />
                </span>
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-[#999898] px-[15px] py-0 m-0 text-[18px] flex items-center leading-normal text-xl"
                placeholder="find products, brands, vendors...."
              />
            </form>
          )}
          {isFixed && (
            <button className="text-xl pl-[44px] hover:text-blue-500 max-[1601px]:w-8">
              <span role="img" aria-label="Search Icon">
                <img
                  src={searchImgscroll}
                  alt="Search Icon"
                  className="max-[1601px]:w-8"
                />
              </span>
            </button>
          )}

          <button className="text-xl hover:text-blue-500"></button>
        </div>

        {/* Logo */}
        <div className="font-bold text-xl lg:w-[34%] flex max-md:order-2 items-center justify-center">
          <NavLink to="/Home" className="text-black flex justify-center">
            <img
              src={isFixed ? registryLogoScroll : registryLogo}
              alt="Registry Logo"
              className={`transition-all duration-600 ease-in-out ${
                isFixed
                  ? 'max-[1024px]:w-[60px]'
                  : 'lg:w-[21.667vw] max-md:w-[133px]'
              }`}
            />
          </NavLink>
        </div>

        <div className="min-[768px]:hidden max-md:order-1 hamburger" onClick={toggleMenu}>
          <img
            src={isFixed ? hamburgerscroll : hamburger}
            alt=""
            className={`w-8 max-md:w-[20px] ${isFixed ? 'brightness-unset' : 'brightness-0'}`}
          />
        </div>

        {/* Icons and CTA */}
        <div className={`flex max-md:order-3 justify-end lg:w-[33%] ${isFixed ? 'mt-[0] items-center' : 'mt-[-0.625vw] items-start'}`}>
          {!user && (
            <div className="flex items-center gap-[0.573vw]">
                {!isFixed && (
                  <div className="bg-[#F5F2ED] rounded-full p-2 w-[2.917vw] h-[2.917vw] max-md:h-[40px] max-md:w-[40px] flex items-center justify-center">
                    <NavLink
                      to="/login"
                      className="text-xl hover:text-blue-500"
                    >
                      <span role="img" aria-label="User Icon">
                        <img className='w-[1.25vw] h-[1.25vw] max-md:w-[18px] max-md:h-[17px]' src={userImg} alt="User Icon" />
                      </span>
                    </NavLink>
                  </div>
                )}
                {isFixed && (
                  <NavLink to="/login" className="text-xl hover:text-blue-500">
                    <span role="img" aria-label="User Icon">
                      <img
                        src={userImgscroll}
                        alt="User Icon"
                        className="max-[1590px]:w-7"
                      />
                    </span>
                  </NavLink>
                )}

                <div className="flex items-center gap-4 max-md:hidden">
                  {/* link Button */}
                  <NavLink
                    to="/couple"
                    className={`text-center text-[0.833vw] leading-[0.938vw] max-[1601px]:text-[15px] font-[800] uppercase tracking-[2px] max-[1601px]:w-[200px] ${
                      isFixed ? 'text-white' : 'text-[#1F1D1B]'
                    }`}
                  >
                    FIND A COUPLE
                  </NavLink>
                  {/* CTA Button */}
                  <button
                    onClick={handleOpenPopup}
                    className="text-[0.833vw] leading-[0.938vw] h-[3.095vw] bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[11.719vw] text-center"
                  >
                    CREATE A REGISTRY
                  </button>
                </div>
            </div>
          )}
          {user && (
            <>
              <div className='flex items-start justify-end gap-[1.042vw]'>
                <div className={`rounded-full p-0 w-[2.917vw] h-[2.917vw] flex items-center justify-center border-2 ${
                  isFixed 
                    ? 'bg-[#F5F2ED] border-white' 
                    : 'bg-[#F5F2ED] border-black'
                }`}>
                  {hasEventImage() ? (
                    <img
                      src={getEventImage()}
                      alt="Event"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <h2 className={`flex items-center font-prata justify-center m-0 text-[1.25vw] leading-[0.938vw] ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>{getUserInitials()}</h2>
                  )}
                </div>
                <div className="">
                  <span className="relative inline-block">
                    {/* Bell Icon (SVG) */}
                    <svg width="60" height="60" class="w-[3.125vw] h-[3.125vw]" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 36.725H47.5M30 9.22498C33.6467 9.22498 37.1441 10.6736 39.7227 13.2523C42.3013 15.8309 43.75 19.3282 43.75 22.975V36.725H16.25V22.975C16.25 19.3282 17.6987 15.8309 20.2773 13.2523C22.8559 10.6736 26.3533 9.22498 30 9.22498ZM35 45.775C35 48.5364 32.7614 50.775 30 50.775C27.2386 50.775 25 48.5364 25 45.775C25 43.0135 27.2386 40.775 30 40.775C32.7614 40.775 35 43.0135 35 45.775Z" stroke="#1C1C1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M40.625 30C46.493 30 51.25 25.243 51.25 19.375C51.25 13.507 46.493 8.75 40.625 8.75C34.757 8.75 30 13.507 30 19.375C30 25.243 34.757 30 40.625 30Z" fill="#C52248"/></svg>

                    {/* Red Dot */}
                    {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#f5f2ed]"></span> */}
                  </span>
                </div>
                {isLoadingRegistry ? (
                  <div className='pt-1'>
                    <div className={`text-xs font-medium tracking-wide text-center mb-2 ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                      Registry Status
                    </div>
                    <div className={`text-xs text-center ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                      Loading...
                    </div>
                  </div>
                ) : registryData?.id ? (
                  <div className='pt-1'>
                    <button
                      type="button"
                      aria-pressed={!isDraft}
                      aria-label={`Toggle registry status to ${isDraft ? 'published' : 'draft'}`}
                      onClick={handleToggle}
                      disabled={isUpdatingStatus}
                      className={`mx-auto w-16 h-8 flex items-center rounded-full border-2 transition-colors duration-200 w-[3.125vw] h-[1.354vw] focus:outline-none ${
                        isDraft
                          ? 'bg-white border-black'
                          : 'bg-white border-black'
                      }`}
                    >
                                          <span
                      className={`w-7 h-7 rounded-full shadow-md transform w-[2.031vw] h-[1.1vw] transition-transform duration-200 ${
                        isDraft
                          ? 'translate-x-0 bg-gray-300'
                          : 'translate-x-8 bg-[#FF6F61]'
                      }`}
                    />
                    </button>
                    <div className={`uppercase text-lg font-bold tracking-wide mt-[0.365vw] text-[0.729vw] leading-[0.938vw] ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                      {isUpdatingStatus ? 'Updating...' : (isDraft ? 'Draft' : 'Published')}
                    </div>
                  </div>
                ) : (
                  <div className='pt-1'>
                    <div className={`text-xs font-medium tracking-wide text-center mb-2 ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                      Registry Status
                    </div>
                    <div className={`text-xs text-center ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                      No registry found
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
          
        </div>
        {showPopup && <Popup onClose={handleClosePopup} />}
      </header>

      <div
        className={`mt-6 max-[1024px]:hidden  ${
          isFixed
            ? `fixed transition-all ${
                isMenuOpenBottom ? 'top-[70px] bg-white' : 'top-[-50px]'
              } left-0 w-full z-10`
            : ''
        }`}
      >
        <NavBarLinks />
      </div>

      {/* Dashboard Tabs Navigation - Only show when user is logged in */}
      {user && (
        <div className="w-full">
          <div className="w-full">
            <div className="w-full">
              <div className="w-full shadow-md flex justify-between bg-[#F5F2ED]">
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-bold text-black" data-discover="true" href="/dashboard">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="MY DETAILS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">MY DETAILS<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-black w-full" style={{width: '100%', minWidth: '24px'}}></span></span>
                    </div>
                    <div className="absolute inset-0 z-10 h-full bg-white rounded-md shadow" style={{opacity: 1}}></div>
                  </div>
                </a>
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" data-discover="true" href="/dashboard/registry">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="MY REGISTRY HOMEPAGE">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">MY REGISTRY HOMEPAGE<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" data-discover="true" href="/dashboard/addgifts">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="ADD OR EDIT GIFTS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">ADD OR EDIT GIFTS<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" data-discover="true" href="/dashboard/cashfunds">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="ADD A CASH OR TRAVEL FUND">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">ADD A CASH OR TRAVEL FUND<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" data-discover="true" href="/dashboard/gifttracker">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="GIFTS + THANK YOU TRACKER">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">GIFTS + THANK YOU TRACKER<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" data-discover="true" href="/dashboard/shipgifts">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="SHIP MY GIFTS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">SHIP MY GIFTS<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" data-discover="true" href="/dashboard/support">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="SUPPORT">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">SUPPORT<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <button 
                  className="flex-1 text-center px-4 py-1 text-xs transition-all ease-in-out relative hover:font-bold group font-normal text-gray-600" 
                  onClick={() => {
                    // Clear all localStorage
                    localStorage.clear();
                    
                    // Clear all sessionStorage
                    sessionStorage.clear();
                    
                    // Clear specific items to be sure
                    localStorage.removeItem('@token');
                    localStorage.removeItem('@Token');
                    localStorage.removeItem('@User');
                    localStorage.removeItem('@Registry');
                    
                    // Submit form to logout route to clear server-side session
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/logout';
                    document.body.appendChild(form);
                    form.submit();
                  }}
                >
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans text-base font-normal leading-relaxed select-none cursor-pointer w-full bg-transparent shadow-none p-0 min-w-0 !bg-transparent" data-value="LOGOUT">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block">LOGOUT<span className="block h-0.5 mt-1 rounded transition-all duration-300 mx-auto bg-transparent group-hover:bg-gray-300 group-hover:w-full" style={{width: '0%', minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`hidden max-[768px]:block bg-white fixed top-0 left-0 w-full h-full ease-in-out duration-[700ms] transition-all overflow-auto z-30 ${
          isMenuOpen ? 'left-0' : 'left-[-800px]'
        }`}
      >
        <HeaderMobileMenu onClose={toggleMenu} onPopup={handleOpenPopup} />
      </div>
    </div>
  );
}
