import {NavLink, useLoaderData, useNavigate} from '@remix-run/react';
import registryLogo from '/assets/Images/registryLogos.png';
import registryLogoScroll from '/assets/Images/copyrightLogo.png';
import searchImg from '/assets/Images/search.png';
import searchImgscroll from '/assets/Images/searchwhite.png';
import userImg from '/assets/Images/shape.png';
import userImgscroll from '/assets/Images/shapewhite.png';
import loginReplacementGif from '/assets/Images/login-replacement.gif';
import hamburger from '/assets/Images/hamburger.png';
import hamburgerscroll from '/assets/Images/Group 42.png';
import TopHeader from './TopHeader';
import {Navbar} from '@material-tailwind/react';
import NavBarLinks from './NavBarLinks';
import HeaderMobileMenu from './HeaderMobileMenu';
import {useState, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import Popup from './Popup';
import ModalPortal from './ModalPortal';
import {useLocation} from 'react-router-dom';
import { io } from 'socket.io-client';
import { ToastContainer } from 'react-toastify';

export function Header() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [registryData, setRegistryData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [isMenuOpenBottom, setIsMenuOpenBottom] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const [status, setStatus] = useState(registryData?.status || 'draft');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusFeedback, setShowStatusFeedback] = useState(false);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [fixedHeaderTop, setFixedHeaderTop] = useState(0);
  const headerRef = useRef(null);
  const isDraft = status === 'draft';
  const navigate = useNavigate();
  const [stickyMenuCollections, setStickyMenuCollections] = useState([]);
  const [stickyMenuLoading, setStickyMenuLoading] = useState(true);
  const [isProductSubMenuOpen, setIsProductSubMenuOpen] = useState(false);
  
  // Get API base URL from loader data
  const { env } = useLoaderData() || {};
  const apiBaseUrl = 'https://dev-hopsongrace.codup.io';

  // Notification system state
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const socketRef = useRef(null);
  const searchInputRef = useRef(null);

  // User avatar dropdown state
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);


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
              .then(res => {
                // Check for session expiration
                if (res.status === 401 || res.status === 403) {
                  // Clear all localStorage
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Clear specific items to be sure
                  localStorage.removeItem('@token');
                  localStorage.removeItem('@Token');
                  localStorage.removeItem('@User');
                  localStorage.removeItem('@Registry');
                  
                  // Redirect to login
                  window.location.href = '/login';
                  return null;
                }
                return res.json();
              })
              .then(data => {
                if (data && data.code === 200 && data.data && data.data.user) {
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
              .then(res => {
                // Check for session expiration
                if (res.status === 401 || res.status === 403) {
                  // Clear all localStorage
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Clear specific items to be sure
                  localStorage.removeItem('@token');
                  localStorage.removeItem('@Token');
                  localStorage.removeItem('@User');
                  localStorage.removeItem('@Registry');
                  
                  // Redirect to login
                  window.location.href = '/login';
                  return null;
                }
                return res.json();
              })
              .then(registryData => {
                if (registryData) {
                  if (registryData.code === 200 && registryData.data && registryData.data.length > 0) {
                    const registry = registryData.data[0];
                    setRegistryData(registry);
                    setStatus(registry.status || 'draft');
                  }
                }
                setIsLoadingRegistry(false);
              })
              .catch(error => {
                setIsLoadingRegistry(false);
              });

            }
          }
        } catch (error) {
        }
      }
    }
  }, []);

  // Fetch unread count when user data is available
  useEffect(() => {
    if (userData?.id && user) {
      fetchUnreadCount();
    }
  }, [userData?.id, user]);


  // Socket connection and notification handling
  useEffect(() => {
    if (userData?.id && user) {
      
      // Initialize socket connection
      const socket = io(apiBaseUrl, {
        auth: {
          token: user,
          userId: userData.id
        }
      });

      socketRef.current = socket;

      // Listen for new notifications
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      // Listen for connection status
      socket.on('connect', () => {
      });

      socket.on('disconnect', () => {
      });

      socket.on('connect_error', (error) => {
      });

      // Fetch existing notifications and unread count
      fetchNotifications();
      fetchUnreadCount();

      // TEMPORARY: Create a test notification (remove this after testing)
      setTimeout(() => {
        fetch(`${apiBaseUrl}/api/notifications/test`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user}`,
            'Content-Type': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          // Refresh notifications after creating test
          setTimeout(() => fetchNotifications(), 1000);
        })
        .catch(err => console.log('Test notification failed (this is expected if endpoint doesn\'t exist):', err));
      }, 2000);

      // Cleanup on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [userData?.id, user, apiBaseUrl]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!userData?.id || !user) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${user}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Handle new API structure with data wrapper
        if (result.code === 200 && result.data && Array.isArray(result.data)) {
          setNotifications(result.data);
          // Calculate unread count from notifications
          const unreadNotifications = result.data.filter(n => n.status === 'unread');
          setUnreadCount(unreadNotifications.length);
        } else {
        }
      } else {
        const errorText = await response.text();
      }
    } catch (error) {
    }
  };

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    if (!userData?.id || !user) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/unread/count`, {
        headers: {
          'Authorization': `Bearer ${user}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200 && result.data) {
          setUnreadCount(result.data.count || 0);
        }
      } else {
        const errorText = await response.text();
        console.error('Unread count API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userData?.id || !user) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(prev => !prev);
    // Close user dropdown when opening notification dropdown
    if (!showNotificationDropdown) {
      setShowUserDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setShowUserDropdown(prev => !prev);
    // Close notification dropdown when opening user dropdown
    if (!showUserDropdown) {
      setShowNotificationDropdown(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
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
  };

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

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
  const toggleMenuDesktop = () => {
    setIsMenuOpenBottom((prev) => !prev);
  };

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen((prev) => !prev);
  };

  const handleScroll = () => {
    // Get the app-clip element which is the scroll container
    const appClip = document.getElementById('app-clip');
    const scrollY = appClip ? appClip.scrollTop : window.scrollY;
    const threshold = 100; // Lower threshold for earlier activation

    if (scrollY > threshold) {
      setIsFixed(true);
      setIsSearchExpanded(false); // Collapse search when header becomes fixed
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

  const scrollToTop = () => {
    // Get the app-clip element which is the scroll container
    const appClip = document.getElementById('app-clip');
    if (appClip) {
      appClip.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Focus the search input after scrolling completes
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    }, 500); // Wait for smooth scroll to complete
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
        
        // Refresh the page after successful status update
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Wait 1 second to show the success feedback before refreshing
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

    // Get the app-clip element which is the scroll container
    const appClip = document.getElementById('app-clip');
    const scrollTarget = appClip || window;

    scrollTarget.addEventListener('scroll', throttledHandleScroll, {passive: true});
    return () => {
      scrollTarget.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []);

  // Focus search input when it expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchExpanded]);

  // Calculate correct top position for fixed header in scaled container
  useEffect(() => {
    if (!isFixed) {
      setFixedHeaderTop(0);
      return;
    }

    const calculateTop = () => {
      const isDesktop = window.innerWidth >= 1025;
      if (!isDesktop) {
        setFixedHeaderTop(0);
        return;
      }

      const appScale = document.getElementById('app-scale');
      const headerElement = headerRef.current;
      
      if (!appScale || !headerElement) {
        setFixedHeaderTop(0);
        return;
      }

      // Get app-scale's bounding rect to find its top position in viewport
      const appScaleRect = appScale.getBoundingClientRect();
      
      // Find TopHeader (previous sibling of header's parent)
      const headerWrapper = headerElement.parentElement;
      if (headerWrapper) {
        const topHeader = headerWrapper.previousElementSibling;
        if (topHeader) {
          // Get TopHeader's bottom position in viewport
          const topHeaderRect = topHeader.getBoundingClientRect();
          
          // Calculate the offset: TopHeader's bottom minus app-scale's top
          // This gives us the position relative to app-scale container
          // Since position: fixed inside transform positions relative to transformed container,
          // we need this offset
          const offset = topHeaderRect.bottom - appScaleRect.top;
          
          setFixedHeaderTop(Math.max(0, offset));
        } else {
          // Fallback: calculate from CSS dimensions
          // TopHeader: h-[3.333vw] + mb-[2.813vw] + py-[15px] = ~6.146vw + 30px
          const vw = window.innerWidth / 100;
          const calculatedHeight = (6.146 * vw) + 30;
          setFixedHeaderTop(calculatedHeight);
        }
      }
    };

    // Calculate immediately and on resize
    calculateTop();
    window.addEventListener('resize', calculateTop);
    
    // Also recalculate when app-clip scrolls (in case TopHeader position changes)
    const appClip = document.getElementById('app-clip');
    if (appClip) {
      appClip.addEventListener('scroll', calculateTop, { passive: true });
      return () => {
        window.removeEventListener('resize', calculateTop);
        appClip.removeEventListener('scroll', calculateTop);
      };
    }
    
    return () => window.removeEventListener('resize', calculateTop);
  }, [isFixed]);

  // Get portal target for sticky header
  const [headerPortalTarget, setHeaderPortalTarget] = useState(null);
  
  useEffect(() => {
    setHeaderPortalTarget(document.getElementById('header-root'));
  }, []);

  // Fetch collections for sticky menu
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/navigation-collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          setStickyMenuCollections(data.collections || []);
        } else {
          console.error('Failed to fetch collections');
          setStickyMenuCollections([]);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setStickyMenuCollections([]);
      } finally {
        setStickyMenuLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <>
      {/* Sticky Header - Rendered via Portal outside app-scale */}
      {isFixed && headerPortalTarget && createPortal(
        <header
          className="header-sticky-animated flex justify-between px-4 lg:px-[3.854vw] max-[1024px]:items-center transition-all duration-200 ease-in-out fixed top-0 left-0 right-0 w-full z-50 bg-black shadow-lg h-[4.823vw] max-[1024px]:h-[60px]"
        >
        {/* User Icon */}
        <div
          className={`flex lg:w-[33%] mt-[-0.625vw] max-[1024px]:hidden ${
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
            <div className="flex items-end justify-center py-1 px-[1.563vw] max-[1024px]:hidden relative w-[22.448vw] h-[3.281vw]">
              {/* Search Icon Button - fades out when expanded */}
              <button 
                type="button"
                onClick={() => setIsSearchExpanded(true)}
                className={`text-xl hover:text-blue-500 transition-opacity duration-300 ease-in-out absolute left-0 ${
                  isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                }`}
              >
                <span role="img" aria-label="Search Icon">
                  <img src={searchImg} className="w-[1.979vw] h-[1.979vw] min-w-[1.979vw] min-h-[1.979vw]" alt="Search Icon" />
                </span>
              </button>
              
              {/* Search Form - fades in when expanded */}
              <form 
                onSubmit={(e) => { handleSearch(e); setIsSearchExpanded(false); }} 
                className={`flex items-end justify-center w-full h-full transition-opacity duration-300 ease-in-out absolute left-0 ${
                  isSearchExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <button type="submit" className="text-xl hover:text-blue-500">
                  <span role="img" aria-label="Search Icon">
                    <img src={searchImg} className="w-[1.979vw] h-[1.979vw] min-w-[1.979vw] min-h-[1.979vw]" alt="Search Icon" />
                  </span>
                </button>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    // Delay to allow form submission to work
                    setTimeout(() => {
                      if (!searchQuery.trim()) {
                        setIsSearchExpanded(false);
                      }
                    }, 200);
                  }}
                  className="w-full bg-transparent font-normal outline-none rounded-none border border-[#1F1D1B] border-t-0 border-l-0 border-r-0 border-b-[1.5px] text-[#999898] px-[11px] py-0 m-0 text-[18px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[2.5vw] xl:leading-[2.5vw] 2xl:leading-[2.5vw] ml-[1.042vw] flex items-center leading-normal text-xl"
                  placeholder="Find products, brands, vendors...."
                />
              </form>
            </div>
          )}
          {isFixed && (
            <button 
              className="text-xl pl-[44px] hover:text-blue-500 max-[1601px]:w-8"
              onClick={scrollToTop}
              title="Scroll to top"
            >
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
        <div className="font-bold text-xl lg:w-[34%] mb-0 flex max-[1024px]:order-2 items-center justify-center max-[1024px]:absolute max-[1024px]:left-[50%] max-[1024px]:translate-x-[-50%]">
          <NavLink to="/Home" className="text-black flex justify-center">
            <img
              src={isFixed ? registryLogoScroll : registryLogo}
              alt="Registry Logo"
              className={`transition-all duration-600 ease-in-out lg:w-[4vw] ${
                isFixed
                  ? 'max-[1024px]:w-[60px] w-[5.53vw] h-auto'
                  : 'lg:w-[19.2vw] max-[1024px]:w-[133px]'
              }`}
            />
          </NavLink>
        </div>

        <div className="min-[1025px]:hidden max-[1024px]:order-1 hamburger" onClick={toggleMenu}>
          <img
            src={isFixed ? hamburgerscroll : hamburger}
            alt=""
            className={`w-8 max-[1024px]:w-[20px] ${isFixed ? 'brightness-unset' : 'brightness-0'}`}
          />
        </div>

        {/* Icons and CTA */}
        <div className={`flex max-[1024px]:order-3 justify-end lg:w-[33%] ${isFixed ? 'mt-[0] items-center' : 'mt-[-0.625vw] items-start'}`}>
          {!user && (
            <div className="flex items-center gap-[1.406vw]">
                {!isFixed && (
                  <div className="bg-[#F5F2ED] rounded-full p-2 w-[2.917vw] h-[2.917vw] max-[1024px]:h-[40px] max-[1024px]:w-[40px] flex items-center justify-center">
                    <NavLink
                      to="/login"
                      className="text-xl hover:text-blue-500"
                    >
                      <span role="img" aria-label="User Icon">
                        <img className='w-[1.25vw] h-[1.25vw] max-[1024px]:w-[18px] max-[1024px]:h-[17px]' src={userImg} alt="User Icon" />
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

                <div className="flex items-center gap-4 max-[1024px]:hidden">
                  {/* link Button */}
                  <NavLink
                    to="/couple"
                    className={`text-center flex justify-center items-center hover:opacity-90 lg:text-[0.833vw] lg:leading-[0.938vw] font-[800] uppercase tracking-[0.48px] ${
                      isFixed ? 'text-white mr-[15px]' : 'text-[#1F1D1B] bg-[#F5F2ED] lg:w-[11.719vw] lg:h-[3.095vw]'
                    }`}
                  >
                    FIND A COUPLE
                  </NavLink>
                  {/* CTA Button */}
                  <button
                    onClick={handleOpenPopup}
                    className="text-[0.833vw] leading-[0.938vw] cursor-pointer h-[3.095vw] bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[11.719vw] text-center"
                  >
                    CREATE A REGISTRY
                  </button>
                </div>
            </div>
          )}
          {user && (
            <>
              <div className='flex items-start justify-end gap-[1.042vw]'>
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className={`useravat rounded-full p-0 w-[2.917vw] h-[2.917vw] max-[1024px]:w-[30px] max-[1024px]:h-[30px] flex items-center justify-center border-2 cursor-pointer hover:opacity-80 transition-opacity ${
                      isFixed 
                        ? 'bg-[#F5F2ED] border-white' 
                        : 'bg-[#F5F2ED] border-black'
                    }`}
                  >
                    <img
                      src={loginReplacementGif}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute w-[80px] h-[51px] flex items-center justify-center top-full mt-4 left-[50%] translate-x-[-50%] bg-[#F5F2ED] shadow-lg z-50 before:content-[''] before:absolute before:top-[-8px] before:left-[50%] before:translate-x-[-50%] before:w-0 before:h-0 before:border-l-[8px] before:border-r-[8px] before:border-b-[8px] before:border-l-transparent before:border-r-transparent before:border-b-[#F5F2ED]">
                      <div className="px-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-center border-b-2 cursor-pointer uppercase tracking-[0.016vw] text-[12px] leading-[12px] text-[#1F1D1B] transition-colors flex items-center"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={toggleNotificationDropdown}
                    className="relative inline-block hover:opacity-80 transition-opacity"
                  >
                    <svg
                      width="60"
                      height="60"
                      className="w-[3.125vw] h-[3.125vw] max-[1024px]:w-[30px] max-[1024px]:h-[30px]"
                      viewBox="0 0 60 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Bell Icon */}
                      <path
                        d="M12.5 36.725H47.5M30 9.22498C33.6467 9.22498 37.1441 10.6736 39.7227 13.2523C42.3013 15.8309 43.75 19.3282 43.75 22.975V36.725H16.25V22.975C16.25 19.3282 17.6987 15.8309 20.2773 13.2523C22.8559 10.6736 26.3533 9.22498 30 9.22498ZM35 45.775C35 48.5364 32.7614 50.775 30 50.775C27.2386 50.775 25 48.5364 25 45.775C25 43.0135 27.2386 40.775 30 40.775C32.7614 40.775 35 43.0135 35 45.775Z"
                        stroke={isFixed ? "#FFFFFF" : "#1C1C1E"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Red Circle Badge */}
                      {unreadCount > 0 && (
                        <>
                          <circle cx="40.625" cy="19.375" r="10" fill="#C52248" />

                          {/* Number inside the circle */}
                          <text
                            x="40.625"
                            y="19.375"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </text>
                        </>
                      )}
                    </svg>

                  </button>

                  {/* Notification Dropdown */}
                  {showNotificationDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                notification.status === 'unread' ? 'bg-[#F5F2ED]' : ''
                              }`}
                              onClick={() => {
                                if (notification.status === 'unread') {
                                  markNotificationAsRead(notification.id);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.status === 'unread' ? 'bg-[#C52248]' : 'bg-gray-300'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                          <button
                            onClick={() => setShowNotificationDropdown(false)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                      className={`relative mx-auto inline-flex h-8 w-16 items-center rounded-full bg-white border-2 border-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 lg:h-[2vw] lg:w-[4vw]`}
                  >
                    <span
                      className={`absolute left-[1.4px] top-[1.1px] h-6 w-6 rounded-full shadow-lg transform transition-colors duration-300 lg:h-[1.6vw] lg:w-[1.6vw] ${
                        isDraft 
                          ? 'bg-[var(--color-gray-300,#d1d5db)] translate-x-0' 
                          : 'bg-[#C52248] translate-x-8 lg:translate-x-[2vw]'
                      }`}
                    />
                  </button>
                    <div className={`uppercase text-lg font-bold tracking-wide mt-[0.365vw] text-[0.729vw] leading-[0.938vw] max-[1024px]:text-[10px] max-[1024px]:leading-[14px] ${
                    isFixed ? 'text-white' : 'text-black'
                  }`}>
                      {isUpdatingStatus ? 'Updating...' : (isDraft ? 'Draft' : 'Published')}
                    </div>
                  </div>
                ) : (
                <div className='pt-1'>
                  <button
                    type="button"
                    aria-pressed={!isDraft}
                      aria-label={`Toggle registry status to ${isDraft ? 'published' : 'draft'}`}
                    onClick={handleToggle}
                      disabled={isUpdatingStatus}
                      className={`relative mx-auto inline-flex h-8 w-16 items-center rounded-full bg-white border-2 border-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 lg:h-[2vw] lg:w-[4vw]`}
                  >
                    <span
                      className={`absolute left-[1.4px] top-[1.1px] h-6 w-6 rounded-full shadow-lg transform transition-colors duration-300 lg:h-[1.6vw] lg:w-[1.6vw] ${
                        isDraft 
                          ? 'bg-[var(--color-gray-300,#d1d5db)] translate-x-0' 
                          : 'bg-[#C52248] translate-x-8 lg:translate-x-[2vw]'
                      }`}
                    />
                  </button>
                    <div className={`uppercase text-lg font-bold tracking-wide mt-[0.365vw] text-[0.729vw] leading-[0.938vw] ${
                    isFixed ? 'text-white' : 'text-black'
                  }`}>
                      {isUpdatingStatus ? 'Updating...' : (isDraft ? 'Draft' : 'Published')}
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
          
        </div>
        {showPopup && (
          <ModalPortal>
            <Popup onClose={handleClosePopup} />
          </ModalPortal>
        )}
      </header>,
        headerPortalTarget
      )}

      {/* Sticky Vertical Menu - Rendered via Portal outside app-scale */}
      {isFixed && headerPortalTarget && createPortal(
        <div
          className={`max-[1024px]:hidden fixed transition-all duration-300 ${
            isMenuOpenBottom 
              ? 'top-[72px] opacity-100 pointer-events-auto' 
              : 'top-[-500px] opacity-0 pointer-events-none'
          } left-0 w-full z-40 bg-white shadow-lg max-h-[calc(100vh-100px)] overflow-y-auto`}
        >
          <div className="container mx-auto px-4 lg:px-[3.854vw] py-8">
            <nav>
              <ul className="flex flex-col space-y-4">
                <li>
                  <NavLink
                    to="/our-brands"
                    onClick={() => setIsMenuOpenBottom(false)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.60px] text-lg py-2 block hover:text-gray-600 transition-colors"
                  >
                    OUR BRANDS
                  </NavLink>
                </li>
                <li className="group">
                  <button
                    onClick={() => setIsProductSubMenuOpen(!isProductSubMenuOpen)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.44px] text-lg py-2 flex items-center justify-between w-full hover:text-gray-600 transition-colors"
                  >
                    PRODUCTS
                    <span className={`transform transition-transform ${isProductSubMenuOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {/* Products Submenu */}
                  <div className={`mt-2 pl-4 space-y-2 overflow-hidden transition-all duration-300 ${
                    isProductSubMenuOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <NavLink
                      to="/products/new-arrivals"
                      onClick={() => setIsMenuOpenBottom(false)}
                      className="block text-black hover:text-gray-600 py-2 text-base"
                    >
                      NEW ARRIVALS
                    </NavLink>
                    <NavLink
                      to="/products/bestsellers"
                      onClick={() => setIsMenuOpenBottom(false)}
                      className="block text-black hover:text-gray-600 py-2 text-base"
                    >
                      BESTSELLERS
                    </NavLink>
                    {stickyMenuLoading ? (
                      <div className="text-gray-500 py-2 text-base">Loading collections...</div>
                    ) : stickyMenuCollections.length > 0 ? (
                      stickyMenuCollections.map((collection) => (
                        <NavLink
                          key={collection.id}
                          to={`/products/${collection.handle}`}
                          onClick={() => setIsMenuOpenBottom(false)}
                          className="block text-black hover:text-gray-600 py-2 text-base"
                        >
                          {collection.title.toUpperCase()}
                        </NavLink>
                      ))
                    ) : null}
                    <NavLink
                      to="/dashboard/giftcards"
                      onClick={() => setIsMenuOpenBottom(false)}
                      className="block text-black hover:text-gray-600 py-2 text-base"
                    >
                      GIFT CARDS
                    </NavLink>
                  </div>
                </li>
                <li>
                  <NavLink
                    to="/cash-funds"
                    onClick={() => setIsMenuOpenBottom(false)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.44px] text-lg py-2 block hover:text-gray-600 transition-colors"
                  >
                    CASH + TRAVEL FUNDS
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/ready-made-registries"
                    onClick={() => setIsMenuOpenBottom(false)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.44px] text-lg py-2 block hover:text-gray-600 transition-colors"
                  >
                    READY-MADE REGISTRIES
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/inspiration"
                    onClick={() => setIsMenuOpenBottom(false)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.44px] text-lg py-2 block hover:text-gray-600 transition-colors"
                  >
                    INSPIRATION
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/aboutus"
                    onClick={() => setIsMenuOpenBottom(false)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.44px] text-lg py-2 block hover:text-gray-600 transition-colors"
                  >
                    ABOUT US
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact-us"
                    onClick={() => setIsMenuOpenBottom(false)}
                    className="text-black hover:no-underline font-[800] uppercase tracking-[1.44px] text-lg py-2 block hover:text-gray-600 transition-colors"
                  >
                    CONTACT US
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>,
        headerPortalTarget
      )}

      {/* Default Header - Hidden when sticky */}
      <div className={`${isFixed ? 'lg:h-[442px]' : ''}`}>
        <TopHeader />

        <header
          ref={headerRef}
          className={`header-animated flex justify-between px-4 lg:px-[3.854vw] max-[1024px]:items-center transition-all duration-200 ease-in-out relative bg-white h-[160px] max-[1024px]:h-[80px] ${
            isFixed ? 'invisible' : ''
          }`}
        >
          {/* User Icon */}
          <div
            className={`flex lg:w-[33%] mt-[-0.625vw] max-[1024px]:hidden ${
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
              <div className="flex items-end justify-center py-1 px-[1.563vw] max-[1024px]:hidden relative w-[22.448vw] h-[3.281vw]">
                {/* Search Icon Button - fades out when expanded */}
                <button 
                  type="button"
                  onClick={() => setIsSearchExpanded(true)}
                  className={`text-xl hover:text-blue-500 transition-opacity duration-300 ease-in-out absolute left-0 ${
                    isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                  }`}
                >
                  <span role="img" aria-label="Search Icon">
                    <img src={searchImg} className="w-[1.979vw] h-[1.979vw] min-w-[1.979vw] min-h-[1.979vw]" alt="Search Icon" />
                  </span>
                </button>
                
                {/* Search Form - fades in when expanded */}
                <form 
                  onSubmit={(e) => { handleSearch(e); setIsSearchExpanded(false); }} 
                  className={`flex items-end justify-center w-full h-full transition-opacity duration-300 ease-in-out absolute left-0 ${
                    isSearchExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button type="submit" className="text-xl hover:text-blue-500">
                    <span role="img" aria-label="Search Icon">
                      <img src={searchImg} className="w-[1.979vw] h-[1.979vw] min-w-[1.979vw] min-h-[1.979vw]" alt="Search Icon" />
                    </span>
                  </button>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      // Delay to allow form submission to work
                      setTimeout(() => {
                        if (!searchQuery.trim()) {
                          setIsSearchExpanded(false);
                        }
                      }, 200);
                    }}
                    className="w-full bg-transparent font-normal outline-none rounded-none border border-[#1F1D1B] border-t-0 border-l-0 border-r-0 border-b-[1.5px] text-[#1F1D1B] px-[11px] py-0 m-0 text-[18px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[2.5vw] xl:leading-[2.5vw] 2xl:leading-[2.5vw] ml-[1.042vw] flex items-center leading-normal text-xl"
                    placeholder="Find products, brands, vendors...."
                  />
                </form>
              </div>
            )}
            {isFixed && (
              <button 
                className="text-xl pl-[44px] hover:text-blue-500 max-[1601px]:w-8"
                onClick={scrollToTop}
                title="Scroll to top"
              >
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
          <div className="font-bold text-xl lg:w-[34%] lg:mb-[4vw] flex max-[1024px]:order-2 items-center justify-center max-[1024px]:absolute max-[1024px]:left-[50%] max-[1024px]:translate-x-[-50%]">
            <NavLink to="/Home" className="text-black flex justify-center">
              <img
                src={isFixed ? registryLogoScroll : registryLogo}
                alt="Registry Logo"
                className={`transition-all duration-600 ease-in-out lg:w-[4vw] ${
                  isFixed
                    ? 'max-[1024px]:w-[60px]'
                    : 'lg:w-[19.2vw] max-[1024px]:w-[133px]'
                }`}
              />
            </NavLink>
          </div>

          <div className="min-[1025px]:hidden max-[1024px]:order-1 hamburger" onClick={toggleMenu}>
            <img
              src={isFixed ? hamburgerscroll : hamburger}
              alt=""
              className={`w-8 max-[1024px]:w-[20px] ${isFixed ? 'brightness-unset' : 'brightness-0'}`}
            />
          </div>

          {/* Icons and CTA */}
          <div className={`flex max-[1024px]:order-3 justify-end lg:w-[33%] ${isFixed ? 'mt-[0] items-center' : 'mt-[-0.625vw] items-start'}`}>
            {!user && (
              <div className="flex items-center gap-[1.406vw]">
                  {!isFixed && (
                    <div className="bg-[#F5F2ED] rounded-full p-2 w-[2.917vw] h-[2.917vw] max-[1024px]:h-[40px] max-[1024px]:w-[40px] flex items-center justify-center">
                      <NavLink
                        to="/login"
                        className="text-xl hover:text-blue-500"
                      >
                        <span role="img" aria-label="User Icon">
                          <img className='w-[1.25vw] h-[1.25vw] max-[1024px]:w-[18px] max-[1024px]:h-[17px]' src={userImg} alt="User Icon" />
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

                  <div className="flex items-center gap-4 max-[1024px]:hidden">
                    {/* link Button */}
                    <NavLink
                      to="/couple"
                      className={`text-center flex justify-center items-center hover:opacity-90 lg:text-[0.833vw] lg:leading-[0.938vw] font-[800] uppercase tracking-[0.48px] ${
                        isFixed ? 'text-white mr-[15px]' : 'text-[#1F1D1B] bg-[#F5F2ED] lg:w-[11.719vw] lg:h-[3.095vw]'
                      }`}
                    >
                      FIND A COUPLE
                    </NavLink>
                    {/* CTA Button */}
                    <button
                      onClick={handleOpenPopup}
                      className="text-[0.833vw] leading-[0.938vw] cursor-pointer h-[3.095vw] bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[11.719vw] text-center"
                    >
                      CREATE A REGISTRY
                    </button>
                  </div>
              </div>
            )}
            {user && (
              <>
                <div className='flex items-start justify-end gap-[1.042vw]'>
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className={`useravat rounded-full p-0 w-[2.917vw] h-[2.917vw] max-[1024px]:w-[30px] max-[1024px]:h-[30px] flex items-center justify-center border-2 cursor-pointer hover:opacity-80 transition-opacity ${
                        isFixed 
                          ? 'bg-[#F5F2ED] border-white' 
                          : 'bg-[#F5F2ED] border-black'
                      }`}
                    >
                      <img
                        src={loginReplacementGif}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute w-[80px] h-[51px] flex items-center justify-center top-full mt-4 left-[50%] translate-x-[-50%] bg-[#F5F2ED] shadow-lg z-50 before:content-[''] before:absolute before:top-[-8px] before:left-[50%] before:translate-x-[-50%] before:w-0 before:h-0 before:border-l-[8px] before:border-r-[8px] before:border-b-[8px] before:border-l-transparent before:border-r-transparent before:border-b-[#F5F2ED]">
                        <div className="px-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-center border-b-2 cursor-pointer uppercase tracking-[0.016vw] text-[12px] leading-[12px] text-[#1F1D1B] transition-colors flex items-center"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={toggleNotificationDropdown}
                      className="relative inline-block hover:opacity-80 transition-opacity"
                    >
                      <svg
                        width="60"
                        height="60"
                        className="w-[3.125vw] h-[3.125vw] max-[1024px]:w-[30px] max-[1024px]:h-[30px]"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Bell Icon */}
                        <path
                          d="M12.5 36.725H47.5M30 9.22498C33.6467 9.22498 37.1441 10.6736 39.7227 13.2523C42.3013 15.8309 43.75 19.3282 43.75 22.975V36.725H16.25V22.975C16.25 19.3282 17.6987 15.8309 20.2773 13.2523C22.8559 10.6736 26.3533 9.22498 30 9.22498ZM35 45.775C35 48.5364 32.7614 50.775 30 50.775C27.2386 50.775 25 48.5364 25 45.775C25 43.0135 27.2386 40.775 30 40.775C32.7614 40.775 35 43.0135 35 45.775Z"
                          stroke={isFixed ? "#FFFFFF" : "#1C1C1E"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Red Circle Badge */}
                        {unreadCount > 0 && (
                          <>
                            <circle cx="40.625" cy="19.375" r="10" fill="#C52248" />
                            {/* Number inside the circle */}
                            <text
                              x="40.625"
                              y="19.375"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </text>
                          </>
                        )}
                      </svg>

                    </button>

                    {/* Notification Dropdown */}
                    {showNotificationDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-[#C52248] hover:text-[#911b36] font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <p>No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  notification.status === 'unread' ? 'bg-[#F5F2ED]' : ''
                                }`}
                                onClick={() => {
                                  if (notification.status === 'unread') {
                                    markNotificationAsRead(notification.id);
                                  }
                                  if (notification.type === "gift_purchased"){
                                    navigate("/dashboard/gifttracker")
                                  }
                                  if (notification.type === "registry"){
                                    navigate(`/couple/single/${notification.userId}`)
                                  }
                                  if (notification.type === "signup" || notification.type === "login"){
                                    navigate(`/dashboard`)
                                  }
                                  if (notification.type === "product_discontinued" || notification.type === "product_new_added" || notification.type === "gift"){
                                    navigate(`/dashboard/addgifts`)
                                  }
                                  if (notification.type === "event"){
                                    const eventId = registryData?.events?.[0]?.id;
                                    const registryId = registryData?.id;
                                    if (eventId) {
                                      navigate(
                                        `/dashboard/registry/${eventId}${registryId ? `?registryId=${registryId}` : ''}`,
                                      );
                                    }
                                  }
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    notification.status === 'unread' ? 'bg-[#C52248]' : 'bg-gray-300'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200 text-center">
                            <button
                              onClick={() => setShowNotificationDropdown(false)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
                        className={`relative mx-auto inline-flex h-8 w-16 items-center rounded-full bg-white border-2 border-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 lg:h-[2vw] lg:w-[4vw]`}
                    >
                      <span
                        className={`absolute left-[1.4px] top-[1.1px] h-6 w-6 rounded-full shadow-lg transform transition-colors duration-300 lg:h-[1.6vw] lg:w-[1.6vw] ${
                          isDraft 
                            ? 'bg-[var(--color-gray-300,#d1d5db)] translate-x-0' 
                            : 'bg-[#C52248] translate-x-8 lg:translate-x-[2vw]'
                        }`}
                      />
                    </button>
                      <div className={`uppercase text-lg font-bold tracking-wide mt-[0.365vw] text-[0.729vw] leading-[0.938vw] max-[1024px]:text-[10px] max-[1024px]:leading-[14px] ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                        {isUpdatingStatus ? 'Updating...' : (isDraft ? 'Draft' : 'Published')}
                      </div>
                    </div>
                  ) : (
                  <div className='pt-1'>
                    <button
                      type="button"
                      aria-pressed={!isDraft}
                        aria-label={`Toggle registry status to ${isDraft ? 'published' : 'draft'}`}
                      onClick={handleToggle}
                        disabled={isUpdatingStatus}
                        className={`relative mx-auto inline-flex h-8 w-16 items-center rounded-full bg-white border-2 border-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 lg:h-[2vw] lg:w-[4vw]`}
                    >
                      <span
                        className={`absolute left-[1.4px] top-[1.1px] h-6 w-6 rounded-full shadow-lg transform transition-colors duration-300 lg:h-[1.6vw] lg:w-[1.6vw] ${
                          isDraft 
                            ? 'bg-[var(--color-gray-300,#d1d5db)] translate-x-0' 
                            : 'bg-[#C52248] translate-x-8 lg:translate-x-[2vw]'
                        }`}
                      />
                    </button>
                      <div className={`uppercase text-lg font-bold tracking-wide mt-[0.365vw] text-[0.729vw] leading-[0.938vw] ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>
                        {isUpdatingStatus ? 'Updating...' : (isDraft ? 'Draft' : 'Published')}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          
          </div>
          {showPopup && (
            <ModalPortal>
              <Popup onClose={handleClosePopup} />
            </ModalPortal>
          )}
        </header>
      </div>

      {/* Default Menu - Hidden when sticky (menu is rendered via portal) */}
      <div
        className={`mt-0 max-[1024px]:hidden ${
          isFixed ? 'hidden' : ''
        }`}
      >
        <NavBarLinks />
      </div>

      {/* Dashboard Tabs Navigation - Only show when user is logged in */}
      {user && (
        <div className="w-full">
          <div className="w-full">
            <div className="w-full">
              {/* Mobile hamburger button for dashboard navigation */}
              {/* <div className="lg:hidden w-full shadow-md bg-[#F5F2ED] px-4 py-3 flex items-center">
                <button 
                  onClick={toggleMobileDrawer}
                  className="hover:bg-gray-200 rounded-md transition-colors mr-3"
                >
                  <svg 
                    className="w-6 h-6 text-gray-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  </svg>
                </button>
                <span className="text-gray-600 font-medium">Dashboard Menu</span>
              </div> */}
              
              {/* Desktop navigation - hidden on mobile */}
              <div className="relative flex w-full shadow-md justify-center min-[1025px]:gap-x-[4.167vw] bg-[#F5F2ED] lg:px-[5.125vw] xl:px-[5.125vw] 2xl:px-[5.125vw] min-h-[70px] max-[1024px]:overflow-x-auto max-[1024px]:justify-start">
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/dashboard' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/dashboard">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer shadow-none p-0 min-w-0 !bg-transparent" data-value="MY DETAILS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">MY DASHBOARD<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/dashboard' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${registryData?.events?.[0]?.id && location.pathname === `/dashboard/registry/${registryData.events[0].id}` ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href={registryData?.events?.[0]?.id ? `/dashboard/registry/${registryData.events[0].id}` : '/dashboard/registry'}>
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer shadow-none p-0 min-w-0 !bg-transparent" data-value="MY DETAILS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">MY DETAILS<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${registryData?.events?.[0]?.id && location.pathname === `/dashboard/registry/${registryData.events[0].id}` ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/dashboard/registry' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/dashboard/registry">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer shadow-none p-0 min-w-0 !bg-transparent" data-value="MY REGISTRY HOMEPAGE">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">MY REGISTRY HOMEPAGE<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/dashboard/registry' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/dashboard/addgifts' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/dashboard/addgifts">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer w-full shadow-none p-0 min-w-0 !bg-transparent" data-value="ADD OR EDIT GIFTS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">ADD OR EDIT GIFTS<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/dashboard/addgifts' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/cash-fund' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/cash-funds">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer w-full shadow-none p-0 min-w-0 !bg-transparent" data-value="ADD A CASH OR TRAVEL FUND">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">ADD A CASH OR TRAVEL FUND<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/cash-funds' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/dashboard/gifttracker' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/dashboard/gifttracker">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer w-full shadow-none p-0 min-w-0 !bg-transparent" data-value="GIFTS + THANK YOU TRACKER">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">GIFTS + THANK YOU TRACKER<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/dashboard/gifttracker' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`text-center px-1 py-1 lg:tracking-[0.067vw] xl:tracking-[0.067vw] 2xl:tracking-[0.067vw] text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/dashboard/shipgifts' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/dashboard/shipgifts">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer w-full shadow-none p-0 min-w-0 !bg-transparent" data-value="SHIP MY GIFTS">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">FULFILL + SHIP GIFTS<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/dashboard/shipgifts' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
                <a className={`invisible hidden w-0 text-center px-1 py-1 text-[14px] leading-[36px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] transition-all ease-in-out relative hover:font-bold group max-[1024px]:min-w-max max-[1024px]:px-4 ${location.pathname === '/dashboard/support' ? 'font-bold text-black' : 'font-normal text-gray-600'}`} data-discover="true" href="/dashboard/support">
                  <div className="flex items-center justify-center text-center h-full relative text-blue-gray-900 antialiased font-sans max-[1024px]:text-sm font-normal leading-relaxed select-none cursor-pointer w-full shadow-none p-0 min-w-0 !bg-transparent" data-value="SUPPORT">
                    <div className="z-20 text-inherit">
                      <span className="relative inline-block leading-6">SUPPORT<span className={`block h-0.5 mt-1 rounded transition-all duration-300 mx-auto ${location.pathname === '/dashboard/support' ? 'bg-black w-full' : 'bg-transparent group-hover:bg-gray-300 group-hover:w-full w-0'}`} style={{minWidth: '24px'}}></span></span>
                    </div>
                  </div>
                </a>
              </div>
              
              {/* Mobile Drawer */}
              <div className={`lg:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
                isMobileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`} onClick={toggleMobileDrawer}>
                <div className={`fixed top-0 left-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ${
                  isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                }`} onClick={(e) => e.stopPropagation()}>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Dashboard Menu</h2>
                    <button 
                      onClick={toggleMobileDrawer}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Drawer Navigation Items */}
                  <div className="p-4 space-y-2">
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard"
                      onClick={toggleMobileDrawer}
                    >
                      MY DETAILS
                    </a>
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard/registry' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard/registry"
                      onClick={toggleMobileDrawer}
                    >
                      MY REGISTRY HOMEPAGE
                    </a>
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard/addgifts' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard/addgifts"
                      onClick={toggleMobileDrawer}
                    >
                      ADD OR EDIT GIFTS
                    </a>
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard/cashfunds' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard/cashfunds"
                      onClick={toggleMobileDrawer}
                    >
                      ADD A CASH OR TRAVEL FUND
                    </a>
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard/gifttracker' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard/gifttracker"
                      onClick={toggleMobileDrawer}
                    >
                      GIFTS + THANK YOU TRACKER
                    </a>
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard/shipgifts' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard/shipgifts"
                      onClick={toggleMobileDrawer}
                    >
                      FULFILL + SHIP GIFTS
                    </a>
                    <a 
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/dashboard/support' 
                          ? 'bg-gray-100 text-black font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      href="/dashboard/support"
                      onClick={toggleMobileDrawer}
                    >
                      SUPPORT
                    </a>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`hidden max-[768px]:block bg-white fixed top-0 left-0 w-full h-full ease-in-out duration-[700ms] transition-all overflow-auto z-99 ${
          isMenuOpen ? 'left-0' : 'left-[-800px]'
        }`}
      >
        <HeaderMobileMenu onClose={toggleMenu} onPopup={handleOpenPopup} />
      </div>
      
    </>
  );
}
