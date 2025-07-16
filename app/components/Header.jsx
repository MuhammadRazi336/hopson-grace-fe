import {NavLink, useLoaderData} from '@remix-run/react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [isMenuOpenBottom, setIsMenuOpenBottom] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();
  const [status, setStatus] = useState('draft');
  const isDraft = status === 'draft';

  // Get token from localStorage only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@Token') || localStorage.getItem('@token');
      setUser(token);
    }
  }, []);

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

  const handleToggle = async () => {
    const newStatus = isDraft ? 'published' : 'draft';
    const token = user;
    
    if (!token) {
      console.error('No token available');
      return;
    }
    
    try {
      await fetch(`http://localhost:3040/api/registries/status/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({status: newStatus}),
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating registry status:', error);
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
        className={`flex justify-between px-4 lg:px-[74px] max-[1024px]:flex-row-reverse max-[1024px]:items-center max-[1024px]:py-4 transition-all duration-300 ease-in-out ${
          isFixed
            ? 'fixed top-0 left-0 w-full z-50 bg-black py-4 pt-6 shadow-lg'
            : 'relative bg-white pt-4 lg:pt-11'
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
            <div className="flex items-center justify-center bg-[#F5F2ED] py-1 px-6 w-[380px] rounded-full">
              <button className="text-xl hover:text-blue-500 max-[1024px]:hidden">
                <span role="img" aria-label="Search Icon">
                  <img src={searchImg} alt="Search Icon" />
                </span>
              </button>
              <input
                type="text"
                className="w-full bg-transparent outline-none border-none text-[#999898] flex items-center leading-normal text-xl"
                placeholder="find products, brands, vendors...."
              />
            </div>
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
              className={`transition-all duration-300 ease-in-out ${
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
                <div className={`rounded-full p-2 w-[60px] h-[60px] flex items-center justify-center border-2 ${
                  isFixed 
                    ? 'bg-[#F5F2ED] border-white' 
                    : 'bg-[#F5F2ED] border-black'
                }`}>
                  <h2 className={`flex items-center justify-center m-0 ${
                    isFixed ? 'text-white' : 'text-black'
                  }`}>JP</h2>
                </div>
                <div className="">
                  <span className="relative inline-block">
                    {/* Bell Icon (SVG) */}
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
                    {/* Red Dot */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#f5f2ed]"></span>
                  </span>
                </div>
                <div className='pt-1'>
                  <button
                    type="button"
                    aria-pressed={!isDraft}
                    onClick={handleToggle}
                    className={`mx-auto w-16 h-8 flex items-center rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                      isDraft
                        ? 'bg-white border-black'
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
                  <div className={`uppercase text-lg font-bold tracking-wide ${
                    isFixed ? 'text-white' : 'text-black'
                  }`}>
                    {isDraft ? 'Draft' : 'Published'}
                  </div>
                </div>
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
