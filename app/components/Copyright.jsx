import copyrightLogo from "../assets/Images/copyrightLogo.png"


const Copyright = () => {
    return ( 
        <div className="flex gap-4 items-end text-white tracking-[0.08em]">
            <p className="text-[18px]">THE REGISTRY. 2025</p>
            <img src={copyrightLogo} alt="" />
        </div>
     );
}
 
export default Copyright;