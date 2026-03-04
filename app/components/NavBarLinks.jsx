import {NavLink} from '@remix-run/react';
import {useState, useEffect} from 'react';
import productImg from '/assets/Images/menu-product.png';
import lineImg from '/assets/Images/line.png';
import arrowImg from '/assets/Images/arrow.png';

const isExcludedFundsCollection = (col) => {
  const t = (col.title && String(col.title).toUpperCase().trim()) || '';
  return t === 'CASH FUNDS' || t === 'TRAVEL FUNDS';
};

const NavBarLinks = (mobileClasses) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

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
          const raw = data.collections || [];
          setCollections(raw.filter((col) => !isExcludedFundsCollection(col)));
        } else {
          setCollections([]);
        }
      } catch (error) {
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className={`navbar container-menu ${mobileClasses}`}>
      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="flex justify-between pt-0 pb-[1.615vw] gap-[1.654vw]">
          <li className="">
            <NavLink
              to="/our-brands"
              className="text-black hover:no-underline tracking-[1.60px] menu-item-hover font-[800] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
            >
              OUR BRANDS
            </NavLink>
          </li>
          <li className="group">
            <NavLink
              to="/products"
              className="text-black mega-menu-triggers hover:no-underline menu-item-hover font-[800] tracking-[1.44px] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
            >
              PRODUCTS
            </NavLink>
            <div className="absolute custom-mega-menu left-0 mt-2.5 custom-mega-menu shadow-lg z-999 w-full p-[90px] bg-[#F5F2ED]">
              <div className="flex mx-auto">
                <div className="mr-[90px]">
                  <ul className="">
                    {/* Static items */}
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
                        to="/products/new-arrivals"
                        className="block mb-[26px] text-[18px] lg:text-[0.938vw] tracking-[1.44px] text-black"
                      >
                        NEW IN
                      </NavLink>
                    </li>
                    
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
                        to="/products"
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
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
            >
              CASH + TRAVEL FUNDS
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/ready-made-registries"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
            >
              READY-MADE REGISTRIES
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/inspiration"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
            >
              INSPIRATION
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/aboutus"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
            >
              ABOUT US
            </NavLink>
          </li>
          <li className="">
            <NavLink
              to="/contact-us"
              className="text-black hover:no-underline menu-item-hover font-[800] uppercase lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:tracking-[0.075vw] xl:tracking-[0.075vw] 2xl:tracking-[0.075vw]"
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
