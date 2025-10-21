import popupimg from "/assets/Images/registrypopup.jpg";
import reglogo from "/assets/Images/reglogo.png";
import closebtn from "/assets/Images/closebtn.png";
import { Link } from "@remix-run/react";
import { useEffect, useRef } from "react";

const Popup = ({ onClose }) => {
  const overlayRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#1F1D1B]/90
                 max-[1024px]:flex-col max-[1024px]:px-4 max-[1024px]:items-end p-5 md:p-20"
    >
      <div className="relative lg:scale-80 xl:scale-80 2xl:scale-80 lg:w-[47.396vw] xl:w-[47.396vw] 2xl:w-[47.396vw] lg:h-[40.625vw] xl:h-[40.625vw] 2xl:h-[40.625vw] left-[96px] max-[1024px]:left-auto max-[1024px]:w-full">
        <img
          src={popupimg}
          alt=""
          className="w-full h-full object-cover max-[1024px]:max-w-[95%]"
        />
      </div>

      <div className="w-[618px] lg:scale-80 xl:scale-80 2xl:scale-80 lg:w-[32.188vw] xl:w-[32.188vw] 2xl:w-[32.188vw] bg-[#446184] py-10 px-8 relative flex items-center justify-center text-white pb-[6.615vw]
                      -left-[96px] max-[1024px]:left-auto max-[1024px]:w-[95%] max-[1024px]:-top-[10vw] max-[1024px]:px-[24px] max-[1024px]:py-[27px]">
        <img
          src={reglogo}
          alt=""
          className="absolute lg:w-[8.698vw] xl:w-[8.698vw] 2xl:w-[8.698vw] -top-[71px] lg:-top-[3.8vw] xl:-top-[3.8vw] 2xl:-top-[3.8vw] max-[1024px]:w-[71px] max-[1024px]:-top-[20vw] max-[1024px]:right-[0px]"
        />
        <button onClick={onClose} aria-label="Close modal">
          <img src={closebtn} alt="Close" className="absolute right-7 top-7 max-[1024px]:w-6" />
        </button>

        <div className="mt-[116px] lg:mt-[5.625vw] xl:mt-[5.625vw] 2xl:mt-[5.625vw] flex flex-col items-center justify-center max-[1024px]:mt-0">
          <h3 className="text-xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.146vw] xl:leading-[1.146vw] 2xl:leading-[1.146vw] mb-[2.083vw] font-medium max-[1024px]:text-[18px] max-[1024px]:leading-[20px] max-[1024px]:mb-[20px]">
            CONGRATULATIONS!
          </h3>
          <p className="text-6xl lg:text-[2.708vw] xl:text-[2.708vw] 2xl:text-[2.708vw] lg:leading-[2.917vw] xl:leading-[2.917vw] 2xl:leading-[2.917vw] prata mb-16 text-center max-[1024px]:text-[26px] max-[1024px]:leading-[30px] max-[1024px]:mb-8">
            let's build <br /> your dream registry.
          </p>
          <Link
            onClick={onClose}
            to="/register"
            className="py-[5px] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] bg-white text-center text-black uppercase text-lg w-[225px]
                       max-[1601px]:w-[260px] max-[1601px]:p-5 flex items-center justify-center lg:w-[16.667vw] xl:w-[16.667vw] 2xl:w-[16.667vw] font-medium"
          >
            LET'S GO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Popup;
