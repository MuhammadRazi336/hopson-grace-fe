import {useEffect} from 'react';
import ModalPortal from './ModalPortal';
import reglogo from '/assets/Images/reglogo.png';
import regLogoLine from '/assets/Images/currencyLine.png';

const ShipGiftsActionPopup = ({onClose}) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[99999] bg-[#1F1D1B]/70 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[840px] bg-[#446184] text-white text-center px-6 pt-16 pb-10 md:px-10 md:pt-20 md:pb-12"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            src={reglogo}
            alt="logo"
            className="absolute left-1/2 -translate-x-1/2 -top-[41px] md:-top-[55px] w-[82px] md:w-[110px]"
          />
          <img
            src={regLogoLine}
            alt="logo line"
            className="absolute left-1/2 -translate-x-1/2 top-[42px] w-[120px] h-[3px]"
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 md:right-7 md:top-7 text-white text-[36px] leading-none font-light cursor-pointer"
            aria-label="Close popup"
          >
            ×
          </button>

          <h2 className="text-[22px] leading-[34px] md:text-[38px] md:leading-[44px] font-semibold tracking-[0.06em] uppercase mb-4">
            Request Received!
          </h2>

          <p className="text-[16px] leading-[24px] md:text-[24px] md:leading-[32px] font-medium">
            We&apos;ll be in touch via email
            <br />
            within 24 hours.
          </p>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ShipGiftsActionPopup;
