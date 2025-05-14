import {NavLink} from '@remix-run/react';
import brandImg from '/assets/Images/menu-our-brand.png';

const NavBarLinks = (mobileClasses) => {
  return (
    <div className={`navbar ${mobileClasses}`}>
      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="flex justify-center gap-4 min-[1600px]:gap-16 py-8">
          <li className="group py-2.5">
            <NavLink
              to="/our-brands"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
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
          <li className="p-2.5">
            <NavLink
              to="/products"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              SHOP
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/cash-funds"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              CASH FUNDS
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/bespoke-travel"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              BESPOKE TRAVEL
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/ready-made-registries"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              READY-MADE REGISTRIES
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/inspiration"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              INSPIRATION
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/showroom"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              SHOWROOM
            </NavLink>
          </li>
          <li className="py-2.5">
            <NavLink
              to="/about-us"
              className="text-black hover:no-underline menu-item-hover font-[800] text-sm min-[1440px]:text-lg uppercase tracking-[1px]"
            >
              ABOUT US
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBarLinks;
