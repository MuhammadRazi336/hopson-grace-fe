import {NavLink} from '@remix-run/react';
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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [isMenuOpenBottom, setIsMenuOpenBottom] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
  const toggleMenuDesktop = () => {
    setIsMenuOpenBottom((prev) => !prev);
  };

  const handleScroll = () => {
    if (window.scrollY > 2500) {
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

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="">
      <TopHeader />

      <header
        className={`flex justify-between px-4 lg:px-[74px] max-[1024px]:flex-row-reverse max-[1024px]:items-center max-[1024px]:py-4   ${
          isFixed
            ? 'fixed top-0 left-0 w-full z-20 bg-black py-4 pt-6'
            : 'bg-white pt-4 lg:pt-11'
        }`}
      >
        {/* User Icon */}
        <div
          className={`flex lg:w-[25%] ${
            isFixed ? 'items-center' : 'items-start'
          }`}
        >
          {isFixed && (
            <button className="" onClick={toggleMenuDesktop}>
              <span role="img" aria-label="Search Icon">
                <img
                  src={hamburgerscroll}
                  alt="hamburger Icon"
                  className="max-[1024px]:hidden"
                />
              </span>
            </button>
          )}

          {/* Search Icon */}
          <button
            className={`text-xl hover:text-blue-500 ${
              isFixed ? 'pl-[44px]' : 'p-0'
            } max-[1024px]:hidden`}
          >
            <span role="img" aria-label="Search Icon">
              <img
                src={isFixed ? searchImgscroll : searchImg}
                alt="Search Icon"
                className=""
              />
            </span>
          </button>

          <NavLink
            to="/login"
            className="text-xl hover:text-blue-500 min-[768px]:pl-[44px]"
          >
            <span role="img" aria-label="User Icon">
              <img
                src={isFixed ? userImgscroll : userImg}
                alt="User Icon"
                className=""
              />
            </span>
          </NavLink>
          <button className="text-xl hover:text-blue-500"></button>
        </div>

        {/* Logo */}
        <div className="font-bold text-xl">
          <NavLink to="/Home" className="text-black">
            <img
              src={isFixed ? registryLogoScroll : registryLogo}
              alt="Registry Logo"
              className={`${
                isFixed ? 'max-[1024px]:w-[60px]' : 'max-[1024px]:w-[200px]'
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
        <div className="flex items-start max-[1024px]:hidden">
          <div className="flex items-center gap-4">
            {/* link Button */}
            <NavLink
              to="#"
              className={`px-4 py-2 text-[17px]  font-[800] uppercase tracking-[2px] ${
                isFixed ? 'text-white' : 'text-[#1F1D1B]'
              }`}
            >
              FIND A COUPLE
            </NavLink>
            {/* CTA Button */}
            <button
              onClick={handleOpenPopup}
              className="py-5 px-2 text-[17px] bg-[#446184] hover:opacity-90 uppercase font-[800] text-white w-[225px] text-center"
            >
              CREATE A REGISTRY
            </button>
          </div>
        </div>
        {showPopup && (
          <Popup onClose={handleClosePopup} />
        )}
      </header>

      <div
        className={`mt-8 max-[1024px]:hidden ${
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
