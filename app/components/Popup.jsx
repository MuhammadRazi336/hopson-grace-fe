import popupimg from "/assets/Images/CherryBg.png"
// import imageFPO from "/assets/Images/imageFPO.png"
import reglogo from "/assets/Images/reglogo.png"
import closebtn from "/assets/Images/closebtn.png"
import { Link } from "@remix-run/react";

const Popup = ({ onClose }) => {
    return ( 
    <div className="fixed p-20 top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center bg-[#1F1D1BE5] max-[768px]:flex-col max-[768px]:px-4 max-[768px]:items-end">
        <div className="relative left-[96px] max-[768px]:left-[initial]">
            <img src={popupimg} alt="" className="max-[768px]:max-w-[80%]" />
        </div>
        <div className="w-[618px] bg-[#446184] p-16 relative flex items-center justify-center text-white pb-[127px] -left-[96px] max-[768px]:left-[initial] max-[768px]:w-[80%] max-[768px]:-top-[60px] max-[768px]:p-8">
            <img src={reglogo} alt="" className="absolute -top-[71px] max-[768px]:w-[70px] max-[768px]:-top-7" />
            <button onClick={onClose}>
                <img src={closebtn} alt="Close" className="absolute right-7 top-7 max-[768px]:w-6" />
            </button>
            <div className="mt-[116px] flex flex-col items-center justify-center max-[768px]:mt-12 ">
                <h3 className="text-xl mb-10 font-medium max-[768px]:text-lg max-[768px]:mb-4">CONGRATULATIONS!</h3>
                <p className="text-6xl max-[1601px]:text-5xl max-[1441px]:text-4xl prata mb-16 text-center max-[768px]:text-2xl max-[768px]:mb-8">let's build your dream registry.</p>
                <Link onClick={onClose} to="/register" className="py-[30px] bg-white text-center text-black uppercase text-lg w-[225px] max-[1601px]:w-[260px] max-[1601px]:p-5 lg:w-[320px] font-medium">LET'S GO</Link>
            </div>
        </div>
    </div>
     );
}
 
export default Popup;