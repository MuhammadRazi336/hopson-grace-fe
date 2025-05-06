import {Suspense} from 'react';
import {Await, Link, NavLink} from '@remix-run/react';
import footerImg from '../assets/images/footerLogoNew.png';
import instagramIcon  from '../assets/images/insta.png';
import pinterestIcon from '../assets/images/pin.png';
import facebookIcon from '../assets/images/facebook.png';
import FooterBottom from './FooterBottom';
import Copyright from './Copyright';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <div className='bg-[#1F1D1B] pt-[90px] pb-[60px] text-white'>
      <div className='max-w-[90%] mx-auto'>
          {/* Footer Logo */}
          <div className='footer-logo'>
              <img src={footerImg} alt="Footer Icon" className="" />
          </div>

          {/* First Menu in Footer */}
          <div className="mt-[90px]">
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>About</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                      <li><Link className='text-white' to="/about-us">ABOUT US</Link></li>
                      <li><Link className='text-white' to="/our-services">OUR SERVICES</Link></li>
                      <li><Link className='text-white' to="/meet-our-team">MEET OUR TEAM</Link></li>
                    </ul>
                  </nav>
                </div>

                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>Customer Care</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                      <li><Link className='text-white' to="/your-orders">YOUR ORDERS</Link></li>
                      <li><Link className='text-white' to="/returns">RETURNS & EXCHANGES</Link></li>
                      <li><Link className='text-white' to="/delivery">DELIVERY</Link></li>
                      <li><Link className='text-white' to="/faq">FAQs</Link></li>
                    </ul>
                  </nav>
                </div>

                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>Your Registry</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                      <li><Link className='text-white' to="/start-registry">START YOUR REGISTRY</Link></li>
                      <li><Link className='text-white' to="/manage-registry">MANAGE YOUR REGISTRY</Link></li>
                      <li><Link className='text-white' to="/book-showroom-appt">BOOK A SHOWROOM APPT</Link></li>
                      <li><Link className='text-white' to="/find-inspiration">FIND INSPIRATION</Link></li>
                    </ul>
                  </nav>
                </div>

                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>For Wedding Guests</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                      <li><Link className='text-white' to="/find-registry">FIND A REGISTRY</Link></li>
                      <li><Link className='text-white' to="/guest-track">GUEST T&Cs</Link></li>
                    </ul>
                  </nav>
                </div>
              </div>
          </div>

          {/* Second Menu in Footer */}
          <div className="mt-[90px]">
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>Contact Us</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                      <li><Link className='text-white' to="/live-chat">LIVE CHAT</Link></li>
                    </ul>
                  </nav>
                </div>

                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>Follow Us</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em] flex gap-4">
                      <li>
                        <a className='text-white' href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                          <img src={pinterestIcon} alt="pinterest" />
                        </a>
                      </li>
                      <li>
                        <a className='text-white' href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src={instagramIcon} alt="Search Icon" className="" />
                        </a>
                      </li>
                      <li>
                        <a className='text-white' href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                          <img src={facebookIcon} alt="facebook" />
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>

                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>Refer a Friend</h4>
                  <p className='prata text-[22px] font-[400] leading-[26px] max-w-[295px]'>
                     Refer a friend for exclusive discounts & special offers
                  </p>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em] mt-3">
                      <li><Link className='text-white' to="/refer">GET STARTED</Link></li>
                    </ul>
                  </nav>
                </div>

                <div>
                  <h4 className='text-[18px] font-[800] uppercase mb-[30px] text-white tracking-[0.08em]'>Stay in the Loop with Weekly Inspo</h4>
                  <nav>
                    <ul className="text-white text-[16px] font-[500] leading-[36px] tracking-[0.08em]">
                      <li>
                        <div className="flex">
                          <input type="email" placeholder="hello@theregistry.com" className="px-4 py-2 w-[250px] bg-[#F5F2ED] m-0 border-0 text-[#948E8A] rounded-none font-['bastardogrotesk'] font-[400] text-[17px] leading-[24px] tracking-[0.03em]" />
                          <button className="px-8 py-3 bg-[#446184] text-[14px] font-bold text-black uppercase font-[800] rounded-none tracking-[0.08em] text-white ">Sign Up</button>
                        </div>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
          </div>

          {/* Footer bottom */}
          <div className='flex justify-between mt-20'>
            <FooterBottom />
            <Copyright />
          </div>
      </div>
    </div>
    // <Suspense>
    //   123
    //   <Await resolve={footerPromise}>
    //     {(footer) => (
    //       <footer className="footer">
    //         {footer?.menu && header.shop.primaryDomain?.url && (
    //           <FooterMenu
    //             menu={footer.menu}
    //             primaryDomainUrl={header.shop.primaryDomain.url}
    //             publicStoreDomain={publicStoreDomain}
    //           />
    //         )}
    //       </footer>
    //     )}
    //   </Await>
    // </Suspense>
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
