import { Link } from "@remix-run/react";

const FooterBottom = () => {
    return ( 
        <div className="flex text-white gap-2.5 lg:gap-12">
            <Link className="text-white text-[14px] lg:text-lg tracking-[0.08em]" to="/terms-conditions">Terms & Conditions</Link>
            <Link className="text-white text-[14px] lg:text-lg tracking-[0.08em]" to="/privacy-policy">Privacy & Cookie Policy</Link>
            <Link className="text-white text-[14px] lg:text-lg tracking-[0.08em] hidden lg:block " to="/contact-us">Contact Us</Link>
        </div>
     );
}
 
export default FooterBottom;