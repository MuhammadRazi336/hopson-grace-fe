import { Link } from "@remix-run/react";

function WhiteThemeButton({Text, link, onClick, className, buttonClassName}) {
  if (onClick) {
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <button
          className={`border cursor-pointer mb-[2.344vw] lg:w-[18.75vw] uppercase text-center justify-center lg:h-[4.01vw] font-bold bg-white text-black px-2 py-0 text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] hover:bg-gray-100 ${buttonClassName}`}
          onClick={onClick}
          type="button"
        >
          {Text}
        </button>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center">
      <Link to={link}>
        <button className="border-2 border-[#1F1D1B] cursor-pointer mb-[2.344vw] tracking-[0.075vw] lg:w-[18.75vw] xl:w-[18.75vw] 2xl:w-[18.75vw] uppercase text-center justify-center lg:h-[4.01vw] xl:h-[4.01vw] 2xl:h-[4.01vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] font-bold bg-white text-black px-2 mt-0 mb-[2.344vw] py-0 text-[18px] leading-[18px] hover:bg-gray-100 flex items-center gap-2 max-[1024px]:text-[16px] max-[767px]:text-[14px] max-[1024px]:px-[20px] max-[1024px]:w-auto max-[1024px]:h-[50px] max-[767px]:mb-[20px]">
          {Text}
          {/* <img src="/assets/Images/arrowBlack.png" alt="arrow-right" className="w-9 h-3" /> */}
        </button>
      </Link>
    </div>
  );
}

export default WhiteThemeButton;
