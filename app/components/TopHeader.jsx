import { Link } from "@remix-run/react";

const TopHeader = () => {
    return ( 
        <div className="bg-black text-white py-[15px] text-center text-sm min[767px]:text-[20px] tracking-[4px]">
            <div className="container">
                REGISTRY, REDEFINED 
                <span className="lg:px-2 px-1">|</span> 
                <Link to="#" className="text-white px-1 lg:tracking-[1px] tracking-[0] font-bold">
                    START YOUR JOURNEY <span className="lg:text-[16px] tracking-[1px] text-[14px]">▶</span>
                </Link> 
            </div>
        </div>
     );
}
 
export default TopHeader;