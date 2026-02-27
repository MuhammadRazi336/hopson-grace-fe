import ModalPortal from './ModalPortal';
import reglogo from '/assets/Images/reglogo.png';
import regLogoLine from '/assets/Images/currencyLine.png';

const CurrencyNoticePopup = ({onClose}) => {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[99999] bg-[#1F1D1B]/70 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-[840px] bg-[#446184] text-white text-center px-6 pt-16 pb-10 md:px-10 md:pt-20 md:pb-12">
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

          <h2 className="prata text-[34px] leading-[42px] md:text-[44px] md:leading-[52px] font-normal mb-4">
            Prices are shown in
            <br />
            Canadian Dollars (CAD).
          </h2>

          <p className="text-[16px] leading-[24px] md:text-[24px] md:leading-[32px] mb-10">
            If your shopping from outside Canada, your bank will
            <br />
            convert to your local currency.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-[190px] h-[58px] bg-white text-[#1F1D1B] text-[13px] font-bold uppercase tracking-[0.08em] cursor-pointer"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CurrencyNoticePopup;
