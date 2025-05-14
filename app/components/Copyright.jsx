import copyrightLogo from "../assets/Images/copyrightLogo.png"
import footercopyright from "../assets/Images/footercopyright.png"


const Copyright = () => {
    return ( 
        <div className="flex flex-col-reverse items-center lg:flex-row gap-2 lg:gap-4 lg:items-end text-white tracking-[0.08em] mb-6 lg:mb-0">
            <img src={footercopyright} alt="line" className="block lg:hidden w-[180px]" />
            <p className="text-[14px] lg:text-lg">THE REGISTRY. 2025</p>
            <img src={copyrightLogo} alt="copyright logo" className="mb-2 lg:mb-0 w-[80px] lg:w-[60px] " />
        </div>
     );
}
 
export default Copyright;