import { Link } from "@remix-run/react";

function WhiteThemeButton({Text, link, onClick, className, buttonClassName}) {
  if (onClick) {
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <button
          className={`border cursor-pointer mb-[2.344vw] lg:w-[360px] uppercase text-center justify-center lg:h-[77px] font-bold bg-white text-black px-6 mt-3 py-0 text-[18px] leading-[18px] text-sm hover:bg-gray-100 ${buttonClassName}`}
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
        <button className="border cursor-pointer mb-[2.344vw] lg:w-[360px] uppercase text-center justify-center lg:h-[77px] font-bold bg-white text-black px-2 mt-3 py-0 text-[18px] leading-[18px] hover:bg-gray-100 flex items-center gap-2">
          {Text}
          {/* <img src="/assets/Images/arrowBlack.png" alt="arrow-right" className="w-9 h-3" /> */}
        </button>
      </Link>
    </div>
  );
}

export default WhiteThemeButton;
