import {Await, Link, NavLink} from '@remix-run/react';
import footerImg from '/assets/Images/footerLogoNew.png';
import instagramIcon from '/assets/Images/insta.png';
import pinterestIcon from '/assets/Images/pin.png';
import facebookIcon from '/assets/Images/facebook.png';
import dropdown from '/assets/Images/dropdown.png';
import FooterBottom from './FooterBottom';
import Copyright from './Copyright';
import {useState} from 'react';
import Popup from './Popup';
import LiveChat from './LiveChat';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const [openNavIndex, setOpenNavIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const toggleNav = (index) => {
    setOpenNavIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div>
      <div className="bg-[#1F1D1B] lg:pt-[4.792vw] lg:pb-[3.802vw] text-white max-[1024px]:pb-[25px] max-[1024px]:pt-[77px] max-[1024px]:px-[33px]">
        <div className="lg:px-8 max-[1024px]:px-0 lg:max-w-[90%] max-[1024px]:w-full mx-auto">
          {/* Footer Logo */}
          <div className="footer-logo">
            <Link to="/Home">
              <img
                src={footerImg}
                alt="Footer Icon"
                className="lg:w-[19.896vw] max-[1024px]:w-[171.26px]"
              />
            </Link>
          </div>

          <p className='prata lg:mt-[3.49vw] max-[1024px]:mt-[44px] text-[1.25vw] max-[1024px]:text-[14px] max-[1024px]:leading-[22px] leading-[1.354vw]'>The Registry is a sister brand to <span className='underline'>Hopson Grace</span>, curators of modern tableware and timeless home furnishings.</p>

          {/* First Menu in Footer */}
          <div className="mt-[4.427vw]">
            <div className="flex gap-[3.021vw] max-[1024px]:flex-wrap max-[1024px]:mt-[40px]">
              <div className='w-[25%] max-[1024px]:w-full'>
                <h4
                  className="text-[0.938vw] max-[1024px]:text-[14px] max-[1024px]:leading-[20px] mt-0 font-[800] leading-[0.938vw] uppercase mb-[1.771vw] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(0)}
                >
                  About <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 0 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[0.833vw] max-[1024px]:text-[14px] max-[1024px]:leading-[26px] font-[500] leading-[1.875vw] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/aboutus">
                        ABOUT US
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/why-the-registry">
                      WHY THE REGISTRY?
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/how-it-works">
                      HOW IT WORKS
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/our-philosophy">
                      OUR PHILOSOPHY
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/your-registry-advisor">
                      YOUR REGISTRY CONCIERGE TEAM
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="https://hopsongrace.com" target='_blank'>
                      MEET OUR SISTER STORE HOPSON GRACE
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className='w-[25%] max-[1024px]:w-full'>
                <h4
                  className="text-[0.938vw] leading-[0.938vw] max-[1024px]:text-[14px] max-[1024px]:leading-[20px] font-[800] mt-0 uppercase mb-[1.771vw] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(1)}
                >
                  For Couples{' '}
                  <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 1 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white max-[1024px]:text-[14px] max-[1024px]:leading-[26px] text-[0.833vw] font-[500] leading-[1.875vw] tracking-[0.08em]">
                    <li>
                      <button 
                        className="text-white bg-transparent border-none cursor-pointer hover:underline" 
                        onClick={handleOpenPopup}
                      >
                        START YOUR REGISTRY
                      </button>
                    </li>
                    <li>
                      <Link className="text-white" to="/contact-us">
                        BOOK A VIRTUAL APPOINTMENT
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/inspiration">
                        INSPIRATION
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/ready-made-registries">
                        READY MADE REGISTRIES
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/dashboard/shipgifts">
                        SHIPPING
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/returns">
                        RETURNS & EXCHANGES
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/faq">
                        FAQs
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/submit-wedding">
                        SUBMIT YOUR WEDDING
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className='w-[25%] max-[1024px]:w-full'>
                <h4
                  className="text-[0.938vw] leading-[0.938vw] max-[1024px]:text-[14px] max-[1024px]:leading-[20px] font-[800] uppercase mt-0 mb-[1.771vw] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(2)}
                >
                  For Wedding Guests{' '}
                  <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 2 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white max-[1024px]:text-[14px] max-[1024px]:leading-[26px] text-[0.833vw] font-[500] leading-[1.875vw] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/couple">
                        FIND A COUPLE
                      </Link>
                    </li>
                  </ul>
                </nav>

                <h4
                  className="text-[0.938vw] leading-[0.938vw] max-[1024px]:text-[14px] max-[1024px]:leading-[20px] mb-[1.406vw] font-[800] uppercase mt-[4.688vw] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(3)}
                >
                  Contact Us{' '}
                  <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 3 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[0.833vw] max-[1024px]:text-[14px] max-[1024px]:leading-[26px] font-[500] leading-[1.875vw] tracking-[0.08em]">
                    <li>
                      <div className="flex flex-col items-start justify-start">
                        <LiveChat 
                          title=""
                          buttonText="LIVE CHAT"
                          showTitle={false}
                          showDescription={false}
                          className="text-white bg-transparent border-none cursor-pointer hover:underline font-[500] text-[0.833vw] max-md:text-[14px] max-md:leading-[26px] leading-[1.875vw] tracking-[0.08em] p-0 m-0"
                        />
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className='w-[25%] max-[1024px]:w-full'>
                <h4 className="text-[0.938vw] leading-[0.938vw] mb-[1.771vw] mt-[0] font-[800] uppercase text-white tracking-[0.08em] hidden lg:block">
                  Follow Us
                </h4>
                <nav>
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em] flex gap-4 max-[1024px]:gap-[13px] max-[1024px]:mt-[20px]">
                    <li>
                      <a
                        className="text-white"
                        href="https://pinterest.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={pinterestIcon} className='max-[1024px]:w-[22px] max-[1024px]:h-[22px]' alt="pinterest" />
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-white"
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={instagramIcon}
                          alt="Search Icon"
                          className='max-[1024px]:w-[22px] max-[1024px]:h-[22px]'
                        />
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-white"
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={facebookIcon} className='max-[1024px]:w-[22px] max-[1024px]:h-[22px]' alt="facebook" />
                      </a>
                    </li>
                  </ul>
                </nav>

                <div>
                <h3 className='prata lg:hidden max-[1024px]:visible max-[1024px]:mt-[44px] text-[16px] max-[1024px]:text-[16px] max-[1024px]:leading-[20px]'>Refer a friend for exclusive discounts & special offers</h3>
                <p className='text-[12px] mb-[36px] leading-[36px] font-600 hidden max-[1024px]:block'>GET STARTED</p>
                <h4 className="text-[0.938vw] leading-[1.25vw] mb-[1.615vw] mt-[2.76vw] max-[1024px]:mt-[0px] max-[1024px]:leading-[24px] max-[1024px]:text-[10px] max-[1024px]:mb-[4px] font-[800] uppercase text-white tracking-[0.08em]">
                  Stay in the Loop with Weekly Inspo
                </h4>
                <nav>
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <div className="flex">
                         {/* <input
                          type="email"
                          aria-label="Email address"
                          placeholder="hello@theregistry.com"
                          className="w-[12.135vw] h-[2.917vw] bg-[#F5F2ED] px-[12px] m-0 border-0 text-[#948E8A] rounded-none font-['bastardogrotesk'] font-[400] text-[0.885vw] leading-[1.25vw] tracking-[0.03em] max-md:w-[217px] max-md:h-[44px] max-md:text-[12px] max-md:leading-[24px]"
                         /> */}
                         {/* Klaviyo embedded form (as on coming-soon) */}
                         <div className="klaviyo-form-WV2nJt" />
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="flex mt-[7.969vw] text-center justify-between items-center max-[1024px]:mt-[53px] max-[1024px]:flex-col-reverse">
            <FooterBottom />
            <Copyright />
          </div>
        </div>
      </div>
      {showPopup && <Popup onClose={handleClosePopup} />}
    </div>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
