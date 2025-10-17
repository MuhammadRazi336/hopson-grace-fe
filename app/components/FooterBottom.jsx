import {Link} from '@remix-run/react';

const FooterBottom = () => {
  return (
    <div className="flex text-white gap-[7.76vw] max-[1024px]:flex-wrap max-[1024px]:gap-[33px] max-[1024px]:justify-center">
      <p className="text-white text-[0.938vw] leading-[0.938vw] tracking-[0.08em] lg:block max-[1024px]:w-full max-[1024px]:text-[10px] max-[1024px]:leading-[18px]">
        &copy; 2025 THE REGISTRY
      </p>
      <span className="flex gap-2.5">
        <Link
          className="text-white text-[0.833vw] leading-[0.938vw] tracking-[0.08em] max-[1024px]:text-[9px] max-[1024px]:leading-[18px]"
          to="/privacy-policy"
        >
          Privacy & Cookie Policy
        </Link>
        <span className="text-white text-[0.833vw] leading-[0.938vw] tracking-[0.08em] max-[1024px]:text-[9px] max-[1024px]:leading-[18px]">
          /
        </span>
        <Link
          className="text-white text-[0.833vw] leading-[0.938vw] tracking-[0.08em] max-[1024px]:text-[9px] max-[1024px]:leading-[18px]"
          to="/terms-conditions"
        >
          Terms & Conditions
        </Link>
      </span>
    </div>
  );
};

export default FooterBottom;
