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
import {useState, useEffect, useRef} from 'react';
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
  const apiBaseUrl = env?.API_BASE_URL || 'https://dev-hopsongrace.codup.io' || 'http://localhost:3040';

  // Notification system state
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const socketRef = useRef(null);

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

  // Socket connection for real-time notifications
  useEffect(() => {
    if (user && userData && userData.id) {
      console.log('Setting up WebSocket for user:', userData.id);
      
      // Initialize socket connection with error handling
      try {
        const socket = new WebSocket(`ws://${apiBaseUrl.replace('http://', '').replace('https://', '')}/notifications`);
        
        socket.onopen = () => {
          console.log('WebSocket connected for notifications');
          // Send user authentication
          socket.send(JSON.stringify({
            type: 'auth',
            userId: userData.id,
            token: user
          }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            if (data.type === 'notification') {
              // Add new notification to the list
              console.log('New notification received:', data.notification);
              setNotifications(prev => [data.notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            } else if (data.type === 'notification_list') {
              // Initial notification list
              console.log('Initial notifications received:', data.notifications);
              setNotifications(data.notifications || []);
              setUnreadCount(data.notifications?.filter(n => !n.read).length || 0);
            }
          } catch (error) {
            console.error('Error parsing notification message:', error);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          console.log('WebSocket connection failed - notifications will work via API only');
        };

        socket.onclose = () => {
          console.log('WebSocket disconnected');
        };

        socketRef.current = socket;

        // Cleanup on unmount
        return () => {
          if (socketRef.current) {
            socketRef.current.close();
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        console.log('Notifications will work via API only');
      }
    }
  }, [user, userData]);

  // Fetch existing notifications on component mount
  useEffect(() => {
    if (user && userData && userData.id) {
      console.log('Fetching notifications for user:', userData.id);
      fetchNotifications();
    }
  }, [user, userData]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications from API...');
      const response = await fetch(`${apiBaseUrl}/api/notifications/user/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${user}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Notifications API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications API response data:', data);
        
        if (data.code === 200) {
          const notifications = data.data || [];
          console.log('Setting notifications:', notifications);
          setNotifications(notifications);
          
          const unreadCount = notifications.filter(n => !n.read).length;
          console.log('Setting unread count:', unreadCount);
          setUnreadCount(unreadCount);
        } else {
          console.log('API returned non-200 code:', data.code);
        }
      } else if (response.status === 404) {
        console.log('Notifications API endpoint not found - backend may not be ready yet');
        console.log('Setting empty notifications array as fallback');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Notifications API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.log('Setting empty notifications array as fallback');
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    const newState = !showNotificationDropdown;
    setShowNotificationDropdown(newState);
    
    // If opening dropdown, refresh notifications
    if (newState && userData?.id) {
      console.log('Refreshing notifications when opening dropdown');
      fetchNotifications();
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        className={`header-animated flex justify-between px-4 lg:px-[74px] max-[1024px]:flex-row-reverse max-[1024px]:items-center transition-all duration-200 ease-in-out ${
          isFixed
            ? 'fixed top-0 left-0 w-full z-50 bg-black py-4 pt-6 shadow-lg h-[100px]'
            : 'relative bg-white pt-4 lg:pt-11 h-[160px]'
        }`}
      >
        {/* User Icon */}
        <div
          className={`flex lg:w-[33%] ${
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
            <form onSubmit={handleSearch} className="flex items-center justify-center bg-[#F5F2ED] py-1 px-6 w-[380px] rounded-full">
              <button type="submit" className="text-xl hover:text-blue-500 max-[1024px]:hidden">
                <span role="img" aria-label="Search Icon">
                  <img src={searchImg} alt="Search Icon" />
                </span>
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-[#999898] flex items-center leading-normal text-xl"
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
        <div className="font-bold text-xl lg:w-[34%] flex items-center justify-center">
          <NavLink to="/Home" className="text-black flex justify-center">
            <img
              src={isFixed ? registryLogoScroll : registryLogo}
              alt="Registry Logo"
              className={`transition-all duration-600 ease-in-out ${
                isFixed
                  ? 'max-[1024px]:w-[60px]'
                  : 'max-[1024px]:w-[200px] w-[90%]'
              }`}
            />
          </NavLink>
        </div>

        <div className="min-[768px]:hidden hamburger" onClick={toggleMenu}>
          <img
            src={isFixed ? hamburgerscroll : hamburger}
            alt=""
            className={`w-8`}
          />
        </div>

        {/* Icons and CTA */}
        <div className="flex items-start justify-end max-[1024px]:hidden lg:w-[33%]">
          {!user && (
            <div className="flex items-center gap-4">
                {!isFixed && (
                  <div className="bg-[#F5F2ED] rounded-full p-2 w-[60px] h-[60px] flex items-center justify-center">
                    <NavLink
                      to="/login"
                      className="text-xl hover:text-blue-500"
                    >
                      <span role="img" aria-label="User Icon">
                        <img src={userImg} alt="User Icon" />
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

                <div className="flex items-center gap-4">
                  {/* link Button */}
                  <NavLink
                    to="/couple"
                    className={`px-4 py-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 font-[800] uppercase text-center tracking-[2px] max-[1601px]:w-[200px] ${
                      isFixed ? 'text-white' : 'text-[#1F1D1B]'
                    }`}
                  >
                    FIND A COUPLE
                  </NavLink>
                  {/* CTA Button */}
                  <button
                    onClick={handleOpenPopup}
                    className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] max-[1601px]:w-[200px] text-center"
                  >
                    CREATE A REGISTRY
                  </button>
                </div>
            </div>
          )}
          {user && (
            <>
              <div className='flex items-start justify-end gap-7'>
                <div className={`rounded-full p-0 w-[60px] h-[60px] flex items-center justify-center border-2 ${
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
                    <h2 className={`flex items-center justify-center m-0 ${
                      isFixed ? 'text-white' : 'text-black'
                    }`}>{getUserInitials()}</h2>
                  )}
                </div>
                <div className="">
                  <span className="relative inline-block">
                    {/* Bell Icon (SVG) */}
                    <button
                      onClick={toggleNotificationDropdown}
                      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg
                        width="50"
                        height="50"
                        fill="none"
                        viewBox="0 0 24 24"
                        className={`inline-block align-middle ${
                          isFixed ? 'text-white' : 'text-black'
                        }`}
                      >
                        <path
                          d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {/* Red Dot - only show if there are unread notifications */}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#f5f2ed] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        </span>
                      )}
                    </button>

                                         {/* Notification Dropdown */}
                     {showNotificationDropdown && (
                       <div 
                         ref={notificationRef}
                         className="absolute right-0 mt-2 w-80 bg-[#F5F2ED] rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-y-auto"
                       >
                                                 <div className="p-4 border-b border-gray-200">
                           <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                           {unreadCount > 0 && (
                             <p className="text-sm text-gray-600 mt-1">
                               {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                             </p>
                           )}
                           {/* System Status */}
                           <div className="mt-2 text-xs text-gray-500">
                             <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                               socketRef.current?.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-yellow-500'
                             }`}></span>
                             {socketRef.current?.readyState === WebSocket.OPEN ? 'Real-time connected' : 'API mode'}
                           </div>
                           {/* Debug button - remove after testing */}
                           <button
                             onClick={() => {
                               console.log('Current notifications:', notifications);
                               console.log('Current unread count:', unreadCount);
                               console.log('WebSocket status:', socketRef.current?.readyState);
                               fetchNotifications();
                             }}
                             className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                           >
                             Debug: Refresh Notifications
                           </button>
                         </div>
                        
                                                 <div className="max-h-64 overflow-y-auto">
                           {notifications.length === 0 ? (
                             <div className="p-4 text-center text-gray-500">
                               <p>No notifications yet</p>
                               <p className="text-xs mt-2 text-gray-400">
                                 Backend notification system is being set up
                               </p>
                             </div>
                           ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      !notification.read ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className={`text-xs mt-1 ${
                                      !notification.read ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200">
                            <button
                              onClick={() => setShowNotificationDropdown(false)}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
                      className={`mx-auto w-16 h-8 flex items-center rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                        isFixed
                          ? 'bg-white border-white'
                          : 'bg-white border-black'
                      }`}
                    >
                                          <span
                      className={`w-7 h-7 rounded-full shadow-md transform transition-transform duration-200 ${
                        isDraft
                          ? 'translate-x-0 bg-gray-300'
                          : 'translate-x-8 bg-[#FF6F61]'
                      }`}
                    />
                    </button>
                    <div className={`uppercase text-xl font-bold tracking-wide text-center ${
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
                isMenuOpenBottom ? 'top-[70px] bg-white' : 'top-0'
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
