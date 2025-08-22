import {Link} from '@remix-run/react';

const FooterBottom = () => {
  return (
    <div className="flex text-white gap-[7.76vw] max-md:flex-wrap max-md:gap-[33px] max-md:justify-center">
      <Link className="text-white text-[0.938vw] leading-[0.938vw] tracking-[0.08em] lg:block max-md:w-full max-md:text-[10px] max-md:leading-[18px]">
        &copy; 2025 THE REGISTRY
      </Link>
      <span className="flex gap-2.5">
        <Link
          className="text-white text-[0.833vw] leading-[0.938vw] tracking-[0.08em] max-md:text-[9px] max-md:leading-[18px]"
          to="/privacy-policy"
        >
          Privacy & Cookie Policy
        </Link>
        <span className="text-white text-[0.833vw] leading-[0.938vw] tracking-[0.08em] max-md:text-[9px] max-md:leading-[18px]">
          /
        </span>
        <Link
          className="text-white text-[0.833vw] leading-[0.938vw] tracking-[0.08em] max-md:text-[9px] max-md:leading-[18px]"
          to="/terms-conditions"
        >
          Terms & Conditions
        </Link>
      </span>
    </div>
  );
};

export default FooterBottom;
