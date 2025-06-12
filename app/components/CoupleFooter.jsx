import {Await, Link, NavLink} from '@remix-run/react';
import footerImg from '/assets/Images/footerLogoNew.png';
import instagramIcon from '/assets/Images/insta.png';
import pinterestIcon from '/assets/Images/pin.png';
import facebookIcon from '/assets/Images/facebook.png';
import dropdown from '/assets/Images/dropdown.png';
import FooterBottom from './FooterBottom';
import Copyright from './Copyright';
import {useState} from 'react';

/**
 * @param {FooterProps}
 */
export function CoupleFooter({footer: footerPromise, header, publicStoreDomain}) {
  const [openNavIndex, setOpenNavIndex] = useState(null);

  const toggleNav = (index) => {
    setOpenNavIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div>
      <div className="bg-[#1F1D1B] pt-[30px] pb-[30px] lg:pt-[90px] lg:pb-[60px] text-white">
        <div className="px-8 lg:px-0 lg:max-w-[90%] mx-auto">
          {/* Footer Logo */}
          <div className="footer-logo">
            <img
              src={footerImg}
              alt="Footer Icon"
              className="w-[260px] lg:w-[380px]"
            />
          </div>

          {/* First Menu in Footer */}
          <div className="mt-8 lg:mt-[90px]">
            <div className="grid grid-cols-1 2xl:grid-cols-4 lg:grid-cols-2 gap-0 lg:gap-8">
              <div>
                <h4
                  className="text-[14px] lg:text-lg font-[800] uppercase mt-[15px] mb-[15px] lg:mb-[30px] lg:mt-[8px] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(0)}
                >
                  About <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 0 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/about-us">
                        ABOUT US
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/our-services">
                        OUR SERVICES
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/meet-our-team">
                        MEET OUR TEAM
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                <h4
                  className="text-[14px] lg:text-lg font-[800] uppercase mt-[15px] mb-[15px] lg:mb-[30px] lg:mt-[8px] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(1)}
                >
                  Customer Care{' '}
                  <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 1 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/your-orders">
                        YOUR ORDERS
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/returns">
                        RETURNS & EXCHANGES
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/delivery">
                        DELIVERY
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/faq">
                        FAQs
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                <h4
                  className="text-[14px] lg:text-lg font-[800] uppercase mt-[15px] mb-[15px] lg:mb-[30px] lg:mt-[8px] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(2)}
                >
                  Your Registry{' '}
                  <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 2 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/start-registry">
                        START YOUR REGISTRY
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/manage-registry">
                        MANAGE YOUR REGISTRY
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/book-showroom-appt">
                        BOOK A SHOWROOM APPT
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/find-inspiration">
                        FIND INSPIRATION
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                <h4
                  className="text-[14px] lg:text-lg font-[800] uppercase mt-[15px] mb-[15px] lg:mb-[30px] lg:mt-[8px] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(3)}
                >
                  For Wedding Guests{' '}
                  <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 3 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/find-registry">
                        FIND A REGISTRY
                      </Link>
                    </li>
                    <li>
                      <Link className="text-white" to="/guest-track">
                        GUEST T&Cs
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-0 lg:mt-[90px]">
            <div className="grid grid-cols-1 2xl:grid-cols-4 lg:grid-cols-2 gap-8">
              <div>
                <h4
                  className="text-[14px] lg:text-lg font-[800] uppercase mt-[15px] mb-[15px] lg:mb-[30px] lg:mt-[8px] text-white tracking-[0.08em] flex justify-between lg:justify-start items-start"
                  onClick={() => toggleNav(4)}
                >
                  Contact Us <img src={dropdown} alt="" className="lg:hidden" />
                </h4>
                <nav
                  className={`transition-all duration-300 ${
                    openNavIndex === 4 ? 'block' : 'hidden'
                  } lg:block`}
                >
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <Link className="text-white" to="/live-chat">
                        LIVE CHAT
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                <h4 className="text-[14px] lg:text-lg font-[800] uppercase mb-[30px] text-white tracking-[0.08em] hidden lg:block">
                  Follow Us
                </h4>
                <nav>
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em] flex gap-4">
                    <li>
                      <a
                        className="text-white"
                        href="https://pinterest.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={pinterestIcon} alt="pinterest" />
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
                          className=""
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
                        <img src={facebookIcon} alt="facebook" />
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                <h4 className="text-[14px] lg:text-lg font-[800] uppercase mb-[30px] text-white tracking-[0.08em] hidden lg:block">
                  Refer a Friend
                </h4>
                <p className="prata text-[22px] font-[400] leading-[26px] max-w-[295px]">
                  Refer a friend for exclusive discounts & special offers
                </p>
                <nav>
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em] mt-3">
                    <li>
                      <Link className="text-white" to="/refer">
                        GET STARTED
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                <h4 className="text-[14px] lg:text-lg font-[800] uppercase mb-[30px] text-white tracking-[0.08em]">
                  Stay in the Loop with Weekly Inspo
                </h4>
                <nav>
                  <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                    <li>
                      <div className="flex">
                        <input
                          type="email"
                          aria-label="Email address"
                          placeholder="hello@theregistry.com"
                          className="px-4 py-2 md:w-[250px] bg-[#F5F2ED] m-0 border-0 text-[#948E8A] rounded-none font-['bastardogrotesk'] font-[400] text-[17px] leading-[24px] tracking-[0.03em] w-full"
                        />
                        <button
                          aria-label="Sign up for newsletter"
                          className="py-3 bg-[#446184] text-[14px] font-bold uppercase rounded-none tracking-[0.08em] text-white w-[140px]"
                        >
                          Sign Up
                        </button>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="flex flex-col-reverse lg:flex-row text-center justify-center items-center lg:text-start lg:justify-between mt-20">
            <FooterBottom />
            <Copyright />
          </div>
        </div>
      </div>
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
