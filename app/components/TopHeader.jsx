import {Link} from '@remix-run/react';
import Popup from './Popup';
import ModalPortal from './ModalPortal';
import CurrencyNoticePopup from './CurrencyNoticePopup';
import {useState, useEffect} from 'react';
import TopLogo from '/assets/Images/Hopson-toplogo.png';

const TopHeader = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showCurrencyPopup, setShowCurrencyPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('@Token') || localStorage.getItem('@token');
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const handleOpenCurrencyPopup = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('@CurrencyNoticeShown', 'true');
      localStorage.setItem('@CurrencyNoticeShown', 'true');
    }
    setShowCurrencyPopup(true);
  };
  const handleCloseCurrencyPopup = () => {
    setShowCurrencyPopup(false);
  };

  // Auto-show currency popup only once after login/register
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!isLoggedIn) return undefined;

    const alreadyShown = localStorage.getItem('@CurrencyNoticeShown') === 'true';
    if (alreadyShown) return undefined;

    setShowCurrencyPopup(true);
    localStorage.setItem('@CurrencyNoticeShown', 'true');
    return undefined;
  }, [isLoggedIn]);
  return (
    <div className="bg-[#1F1D1B] h-[3.333vw] max-[1024px]:h-[36px] max-[1024px]:py-[5px] max-[1024px]:px-[0px] max-[1024px]:mb-0 mb-[2.813vw] flex items-center justify-center text-white py-[15px] text-center text-sm min[767px]:text-[20px] tracking-[3.6px]">
      <div className="px-[2.083vw] text-[1.042vw] max-[1024px]:text-[9px] max-[1024px]:leading-[36px] w-full flex items-center justify-between">
        <div className="w-[20%] max-[1024px]:hidden">
          <a href="https://www.hopsongrace.com/" target="_blank">
            <img
              src={TopLogo}
              alt="logo"
              className="w-[10.052vw] h-[0.781vw]"
            />
          </a>
        </div>
        <div className="flex-1 flex items-center justify-center text-[1.042vw] leading-[1.875vw] max-[1024px]:text-[9px] max-[1024px]:leading-[14px] max-[1024px]:justify-start max-[767px]:tracking-[1px] max-[767px]:justify-center">
          {isLoggedIn ? (
            <>
              IT’S NEVER TOO LATE TO ADD GIFTS!
              <span className="lg:px-2 px-1">|</span>
              <Link
                to="/dashboard/addgifts"
                className="text-white px-1 lg:tracking-[3.6px] tracking-[0] font-bold"
              >
                ADD GIFTS{' '}
                <span className="lg:text-[0.833vw] ml-[8px] text-[14px] max-[1024px]:text-[8px] max-[1024px]:ml-[5px]">
                  ▶
                </span>
              </Link>
            </>
          ) : (
            <>
              REGISTRY, REDEFINED
              <span className="lg:px-2 px-1">|</span>
              <Link
                onClick={handleOpenPopup}
                className="text-white px-1 lg:tracking-[3.6px] tracking-[0] font-bold"
              >
                START YOUR JOURNEY{' '}
                <span className="lg:text-[0.833vw] ml-[8px] text-[14px] max-[1024px]:text-[8px] max-[1024px]:ml-[5px]">
                  ▶
                </span>
              </Link>
            </>
          )}
        </div>
        <div className="w-[20%] max-[1024px]:w-auto flex items-center justify-end text-[1.042vw] leading-[1.875vw] max-[1024px]:text-[10px] max-[1024px]:leading-[14px]">
          <button
            type="button"
            onClick={handleOpenCurrencyPopup}
            className="inline-flex items-center whitespace-nowrap bg-transparent border-0 text-white cursor-pointer p-0"
          >
            CAD$
            {/* <img
              src="/assets/Images/dollar.png"
              alt="cad"
              className="w-[24px] h-[24px] mr-0 p-0"
            /> */}
          </button>
        </div>
      </div>
      {showPopup && (
        <ModalPortal>
          <Popup onClose={handleClosePopup} />
        </ModalPortal>
      )}
      {showCurrencyPopup && (
        <CurrencyNoticePopup onClose={handleCloseCurrencyPopup} />
      )}
    </div>
  );
};

export default TopHeader;
