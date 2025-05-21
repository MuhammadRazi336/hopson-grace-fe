import { Link } from "@remix-run/react";

const TopHeader = () => {
    return ( 
        <div className="bg-black text-white py-[15px] text-center text-sm min[767px]:text-[20px] tracking-[4px]">
            <div className="container">
                REGISTRY, REDEFINED 
                <span className="px-2">|</span> 
                <Link to="#" className="text-white px-1 tracking-[1px] font-bold">
                    START YOUR JOURNEY <span className="text-[16px]">▶</span>
                </Link> 
            </div>
        </div>
     );
}
 
export default TopHeader;