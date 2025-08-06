import {Link} from '@remix-run/react';

const FooterBottom = () => {
  return (
    <div className="flex text-white gap-3 lg:gap-28">
      <Link className="text-white text-[14px] lg:text-lg tracking-[0.08em] hidden lg:block">
        &copy; 2025 THE REGISTRY
      </Link>
      <span className="flex gap-2.5">
        <Link
          className="text-white text-[14px] lg:text-lg tracking-[0.08em]"
          to="/privacy-policy"
        >
          Privacy & Cookie Policy
        </Link>
        <span className="text-white text-[14px] lg:text-lg tracking-[0.08em]">
          /
        </span>
        <Link
          className="text-white text-[14px] lg:text-lg tracking-[0.08em]"
          to="/terms-conditions"
        >
          Terms & Conditions
        </Link>
      </span>
    </div>
  );
};

export default FooterBottom;
