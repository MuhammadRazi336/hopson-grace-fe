import {NavLink} from '@remix-run/react';
import brandImg from '/assets/Images/menu-our-brand.png';
import productImg from '/assets/Images/menu-product.png';
import lineImg from '/assets/Images/line.png';
import arrowImg from '/assets/Images/arrow.png';

const NavBarLinks = (mobileClasses) => {
  return (
    <div className={`navbar container-menu ${mobileClasses}`}>
      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="flex justify-between py-8">
          <li className="group py-2.5">
            <NavLink
              to="/our-brands"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              OUR BRANDS
            </NavLink>
            {/* Nested Menu */}
            <div className="absolute left-0 mt-2.5 hidden group-hover:flex shadow-lg z-20 w-full p-[90px] bg-[#F5F2ED]">
              <div className="flex mx-auto">
                <div className="mr-[90px]">
                  <h4 className="text-lg font-semibold mb-11">
                    TOP TRENDING BRANDS
                  </h4>
                  <ul className="">
                    <li>
                      <NavLink
                        to="/our-brands/ginori-1753"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        Ginori 1753
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/our-brands/mud-australia"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        Mud Australia
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/our-brands/richard-brendan"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        Richard Brendan
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/our-brands/zalto"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        Zalto
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/our-brands/coluna"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        Coluna
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/our-brands/pom-bedding"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        Pom Bedding
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/our-brands/a-table"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        A Table
                      </NavLink>
                    </li>
                  </ul>
                  <h4 className="text-lg font-semibold">BRANDS A-Z</h4>
                </div>
                <div className="relative">
                  <img src={brandImg} alt="Our brands" />
                  <h3 className="absolute top-14 left-14 prata text-white 2xl:text-6xl xl:text-4xl lg:text-2xl">
                    Our Brands
                  </h3>
                </div>
              </div>
            </div>
          </li>
          <li className="group p-2.5">
            <NavLink
              to="/products"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              PRODUCTS
            </NavLink>
            <div className="absolute left-0 mt-2.5 hidden group-hover:flex shadow-lg z-20 w-full p-[90px] bg-[#F5F2ED]">
              <div className="flex mx-auto">
                <div className="mr-[90px]">
                  <ul className="">
                    <li>
                      <NavLink
                        to="/products/new-arrivals"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        NEW ARRIVALS
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/bestsellers"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        BESTSELLERS
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/kitchen-essentials"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        KITCHEN ESSENTIALS
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/tableware-entertaining"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        TABLEWARE & ENTERTAINING
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/decor-furniture"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        DECOR & FURNITURE
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/bed-bath"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        BED & BATH
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/travel-outdoors"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        TRAVEL & OUTDOORS
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/music-tech"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        MUSIC & TECH
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/gift-cards"
                        className="block mb-[26px] text-black hover:bg-gray-200"
                      >
                        GIFT CARDS
                      </NavLink>
                    </li>
                    <li className='flex items-center gap-2'>
                      <NavLink
                        to="/products/gift-cards"
                        className="mb-[26px] text-black font-semibold underline hover:bg-gray-200 flex items-center gap-2"
                      >
                        SHOP ALL
                        <img src={arrowImg} className='text-black brightness-0' alt="" />
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <img src={productImg} alt="Our brands" />
                  <h3 className="absolute top-56 left-14 prata text-black 2xl:text-6xl xl:text-4xl lg:text-2xl">
                    products
                  </h3>
                  <img src={lineImg} alt="Our brands" className="absolute top-[300px] left-14 w-[300px]" />
                </div>
              </div>
            </div>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/cash-funds"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              CASH FUNDS
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/ready-made-registries"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              READY-MADE REGISTRIES
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/inspiration"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              INSPIRATION
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/aboutus"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              ABOUT US
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/contact-us"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              CONTACT US
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBarLinks;
