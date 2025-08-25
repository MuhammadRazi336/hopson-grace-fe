import { Link } from "@remix-run/react";

const TopHeader = () => {
    return ( 
        <div className="bg-black h-[3.333vw] max-md:h-[36px] max-md:py-[5px] max-md:px-[10px] max-md:mb-0 mb-[2.813vw] flex items-center justify-center text-white py-[15px] text-center text-sm min[767px]:text-[20px] tracking-[4px]">
            <div className="container text-[1.042vw] max-md:text-[9px] max-md:leading-[36px]">
                REGISTRY, REDEFINED 
                <span className="lg:px-2 px-1">|</span> 
                <Link to="/register" className="text-white px-1 lg:tracking-[1px] tracking-[0] font-bold">
                    START YOUR JOURNEY <span className="lg:text-[16px] tracking-[1px] text-[14px] max-md:text-[8px] max-md:ml-[5px]">▶</span>
                </Link> 
            </div>
        </div>
     );
}
 
export default TopHeader;