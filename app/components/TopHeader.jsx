import { Link } from "@remix-run/react";
import Popup from "./Popup";
import { useState } from "react";

const TopHeader = () => {
    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => {
        setShowPopup(true);
    };
    const handleClosePopup = () => {
        setShowPopup(false);
    };
    return ( 
        <div className="bg-[#1F1D1B] h-[3.333vw] max-md:h-[36px] max-md:py-[5px] max-md:px-[0px] max-md:mb-0 mb-[2.813vw] flex items-center justify-center text-white py-[15px] text-center text-sm min[767px]:text-[20px] tracking-[3.6px]">
            <div className="container text-[1.042vw] max-md:text-[9px] max-md:leading-[36px]">
                REGISTRY, REDEFINED 
                <span className="lg:px-2 px-1">|</span> 
                <Link  onClick={handleOpenPopup} className="text-white px-1 lg:tracking-[3.6px] tracking-[0] font-bold">
                    START YOUR JOURNEY <span className="lg:text-[0.833vw] ml-[8px] text-[14px] max-md:text-[8px] max-md:ml-[5px]">▶</span>
                </Link> 
            </div>
            {showPopup && <Popup onClose={handleClosePopup} />}
        </div>
     );
}
 
export default TopHeader;