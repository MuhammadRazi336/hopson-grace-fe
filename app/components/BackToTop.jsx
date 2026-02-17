import { useRef } from "react";

const BackToTop = ({ topRef , className }) => {
    const handleScroll = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };
    
    return ( 
    <>
     <button 
               onClick={handleScroll}
              className={`border-b mx-auto cursor-pointer mb-[9.635vw] uppercase font-bold bg-white text-black mt-0 text-[18px] leading-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] tracking-[0.075vw] hover:bg-gray-100 max-[767px]:text-[14px] max-[767px]:leading-[14px] max-[767px]:mt-[10px] max-[767px]:mb-[50px] ${className}`}>
              Back to Top
            </button>
    </> 
    );
}
 
export default BackToTop;