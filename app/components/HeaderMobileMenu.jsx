import NavBarLinks from "./NavBarLinks";
import registryLogo from "../assets/Images/THE REGISTRY-HG-LOGO-FINAL-BLACK-BY HG 2.png"
import line from "../assets/Images/Vector 23.png"
import cancel from "../assets/Images/Group 125.png"
import Button from '~/components/Button.jsx';
import { Link, NavLink } from "@remix-run/react";
import brandImg from "../assets/Images/menu-our-brand2.png"
import instagram from "../assets/Images/instagram.png"
import facebook from "../assets/Images/facebook2.png"
import more from "../assets/Images/more.png"
import pin from "../assets/Images/pin2.png"
import registryIcon from "../assets/Images/registry-logo.png"
import { useState } from 'react';


const HeaderMobileMenu = ({ onClose }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState(null);

  const handleBrandClick = (brand) => {
      if(isSubMenuOpen){
          setIsSubMenuOpen(false);
        } else {
          setIsSubMenuOpen(true);
      }
    // if (activeBrand === brand) {
    //   // If the same brand is clicked again, navigate to the brand page
    //   window.location.href = `/our-brands/${brand}`;
    // } else {
    //   // Open the submenu for the selected brand
    // //   setActiveBrand(brand);
    //   setIsSubMenuOpen(true);
    // }
  };

  return (
    <div className="relative py-8 bg-white">
      <div>
        <Link className="flex items-center flex-col">
          <img src={registryLogo} alt="" className="w-[250px]" />
          <img src={line} alt="" className="w-[240px] mt-3" />
        </Link>
        <button className="absolute top-5 right-5" onClick={onClose}>
          <img src={cancel} alt="" className="w-6" />
        </button>
      </div>
      <div className="flex gap-2 mt-8 px-8">
        <Button text="Find a Couple"
          className="button-cs-sm text-[#1F1D1B] border-2 text-sm border-[#1F1D1B] bg-transparent rounded-none py-5 px-1 w-full" />
        <Button text="GET STARTED"
          className="text-white bg-[#446184] rounded-none text-sm button-cs-sm py-5 w-full px-1" />
      </div>
      <div className="px-8">
        <input type="text" placeholder="Find gifts, vendors, couples..." className="p-5 pl-[60px] rounded-none border-0 w-full mt-8 search-img" />
      </div>
      <nav className="flex-1">
        <ul className="">
          <li className="group py-2.5">
            <button onClick={handleBrandClick} className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full  px-8">
              OUR BRANDS <img src={more} className={`w-2.5 ${isSubMenuOpen ? 'rotate-180' : 'rotate-0'}`} alt="" />
            </button>
            {/* Submenu */}
            <div className={`mt-2.5 ${isSubMenuOpen ? 'flex' : 'hidden'} z-20 w-full py-8 px-8 bg-[#F5F2ED]`}>
              <div className="flex flex-col ">
                <div className="">
                  <h4 className="text-[16px] font-semibold mb-4">TOP TRENDING BRANDS</h4>
                  <ul className="text-[16px]">
                    <li>
                      <NavLink to="/our-brands/ginori-1753" className="block mb-4 text-black hover:bg-gray-200">
                        Ginori 1753
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/our-brands/mud-australia" className="block mb-4 text-black hover:bg-gray-200">
                        Mud Australia
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/our-brands/richard-brendan" className="block mb-4 text-black hover:bg-gray-200">
                        Richard Brendan
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/our-brands/zalto" className="block mb-4 text-black hover:bg-gray-200">
                        Zalto
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/our-brands/coluna" className="block mb-4 text-black hover:bg-gray-200">
                        Coluna
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/our-brands/pom-bedding" className="block mb-4 text-black hover:bg-gray-200">
                        Pom Bedding
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/our-brands/a-table" className="block mb-4 text-black hover:bg-gray-200">
                        A Table
                      </NavLink>
                    </li>
                  </ul>
                  <h4 className="text-[16px] font-semibold mb-4">BRANDS A-Z</h4>
                </div>
                <div className="relative">
                  <img src={brandImg} alt="Our brands" />
                </div>
              </div>
            </div>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/products"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              SHOP <img src={more} className="w-2.5" />
            </NavLink>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/cash-funds"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              CASH FUNDS <img src={more} className="w-2.5" />
            </NavLink>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/bespoke-travel"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              BESPOKE TRAVEL <img src={more} className="w-2.5" />
            </NavLink>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/ready-made-registries"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              READY-MADE REGISTRIES <img src={more} className="w-2.5" />
            </NavLink>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/inspiration"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              INSPIRATION <img src={more} className="w-2.5" />
            </NavLink>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/showroom"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              SHOWROOM <img src={more} className="w-2.5" />
            </NavLink>
          </li>
          <li className="py-2.5 px-8">
            <NavLink to="/about-us"
              className="text-black hover:no-underline font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px] flex justify-between items-center w-full">
              ABOUT US <img src={more} className="w-2.5" />
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="flex gap-3 mt-14 mb-[30px] px-8">
        <Link to="#"><img src={instagram} alt="" /></Link>
        <Link to="#"><img src={facebook} alt="" /></Link>
        <Link to="#"><img src={pin} alt="" /></Link>
      </div>
      <div className="px-8">
        <p className="text-[16px] prata w-[265px]">Refer a friend for exclusive discounts & special offers</p>
        <Link to="#" className="text-sm font-semibold">GET STARTED</Link>
      </div>
      <div className="flex justify-end w-full px-8">
        <img src={registryIcon} alt="" className="" />
      </div>
    </div>
  );
}

export default HeaderMobileMenu;