import {NavLink} from '@remix-run/react';
import {useState, useEffect} from 'react';
import brandImg from '/assets/Images/menu-our-brand.png';
import productImg from '/assets/Images/menu-product.png';
import lineImg from '/assets/Images/line.png';
import arrowImg from '/assets/Images/arrow.png';

const NavBarLinks = (mobileClasses) => {
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // Make the request to our API endpoint
        const response = await fetch('/api/navigation-collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Navigation collections data:', data);
          setCollections(data.collections || []);
        } else {
          console.error('Failed to fetch collections');
          setCollections([]);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Make the request to our brands API endpoint
        const response = await fetch('/api/navigation-brands', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Navigation brands data:', data);
          setBrands(data.brands || []);
        } else {
          console.error('Failed to fetch brands');
          setBrands([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div className={`navbar container-menu ${mobileClasses}`}>
      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="flex justify-between pt-0 pb-[1.615vw] gap-[3.854vw]">
          <li className="group">
            <NavLink
              to="/our-brands"
              className="text-black mega-menu-triggers hover:no-underline tracking-[1.60px] menu-item-hover font-[800] uppercase"
            >
              OUR BRANDS
            </NavLink>
            <div className="absolute custom-mega-menu left-0 mt-2.5 custom-mega-menu shadow-lg z-999 w-full p-[90px] bg-[#F5F2ED]">
              <div className="flex mx-auto">
                <div className="mr-[90px]">
                  <ul className="">
                    {/* Dynamic brands */}
                    {brandsLoading ? (
                      <li className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-gray-500">Loading brands...</li>
                    ) : brands.length > 0 ? (
                      brands.map((brand) => (
                        <li key={brand.id}>
                          <NavLink
                            to={`/brand/${brand.handle}`}
                            className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-black"
                          >
                            {brand.title.toUpperCase()}
                          </NavLink>
                        </li>
                      ))
                    ) : (
                      <li className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-gray-500">No brands available</li>
                    )}
                    
                    <li className='flex items-center gap-2'>
                      <NavLink
                        to="/our-brands"
                        className="mb-[26px] text-black font-semibold underline flex items-center gap-2"
                      >
                        VIEW ALL BRANDS
                        <img src={arrowImg} className='text-black brightness-0' alt="" />
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <img src={brandImg} alt="Our brands" />
                  <h3 className="absolute top-56 left-14 prata text-black 2xl:text-6xl xl:text-4xl lg:text-2xl">
                    our brands
                  </h3>
                  <img src={lineImg} alt="Our brands" className="absolute top-[300px] left-14 w-[300px]" />
                </div>
              </div>
            </div>
          </li>
          <li className="group">
            <NavLink
              to="/products"
              className="text-black mega-menu-triggers hover:no-underline menu-item-hover font-[800] tracking-[1.44px] uppercase"
            >
              PRODUCTS
            </NavLink>
            <div className="absolute custom-mega-menu left-0 mt-2.5 custom-mega-menu shadow-lg z-999 w-full p-[90px] bg-[#F5F2ED]">
              <div className="flex mx-auto">
                <div className="mr-[90px]">
                  <ul className="">
                    {/* Static items - keep these as is */}
                    <li>
                      <NavLink
                        to="/products/new-arrivals"
                        className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-black"
                      >
                        NEW ARRIVALS
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products/bestsellers"
                        className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-black"
                      >
                        BESTSELLERS
                      </NavLink>
                    </li>
                    
                    {/* Dynamic collections */}
                    {loading ? (
                      <li className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-gray-500">Loading collections...</li>
                    ) : collections.length > 0 ? (
                      collections.map((collection) => (
                        <li key={collection.id}>
                          <NavLink
                            to={`/products/${collection.handle}`}
                            className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-black"
                          >
                            {collection.title.toUpperCase()}
                          </NavLink>
                        </li>
                      ))
                    ) : (
                      <li className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-gray-500">No collections available</li>
                    )}
                    
                    <li>
                      <NavLink
                        to="/dashboard/giftcards"
                        className="block mb-[26px] text-black"
                      >
                        GIFT CARDS
                      </NavLink>
                    </li>
                    <li className='flex items-center gap-2'>
                      <NavLink
                        to="/dashboard/giftcards"
                        className="mb-[26px] text-black font-semibold underline flex items-center gap-2"
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
          <li className="">
            <NavLink
              to="/cash-funds"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              CASH + TRAVEL FUNDS
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/ready-made-registries"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              READY-MADE REGISTRIES
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/inspiration"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              INSPIRATION
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/aboutus"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase"
            >
              ABOUT US
            </NavLink>
          </li>
          <li className="">
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
