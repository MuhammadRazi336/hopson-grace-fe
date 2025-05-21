import { Link } from "@remix-run/react"
import arrow from "/assets/Images/arrow.png"
import registrylogoSteps from "/assets/Images/registrylogoSteps.png"
import StepLine from "/assets/Images/StepLine.png"
import Steps from "/assets/Images/Steps.png"

const StepsAndImage = ({ content, title, stepNo, totalSteps, className }) => {
    return ( 
        <div className={`flex py-32 max-[768px]:py-10 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-4 container`}>
            <div className="relative left-[37.5px] max-w-[50%] max-[768px]:max-w-[100%] max-[768px]:left-[initial]">
                <div className="relative">
                    <img src={Steps} alt="" />
                    <img src={registrylogoSteps} alt="" className="absolute bottom-4 -left-[72px] max-[768px]:left-[initial] max-[768px]:-right-[7px] max-[768px]:w-[71px] max-[768px]:bottom-0 max-[768px]:top-0 max-[768px]:my-auto" />
                    <h5 className="absolute -bottom-16 max-[768px]:hidden">Already Registered? <Link to="/login" className="font-bold border-b-black border-b-2 uppercase ">Login</Link></h5>
                </div>
            </div>
            <div className={`${className} bg-steel-blue text-white py-[110px] px-[90px] max-[1601px]:max-w-[60%] pb-28 pt-[100px] relative -left-[37.5px] top-[59px] max-[768px]:max-w-[100%] max-w-[1000px] max-[1024px]:p-6 max-[768px]:-top-[140px] max-[768px]:left-2.5 max-[768px]:pb-20 max-[768px]:pt-14  max-[768px]:w-full text-center`}>
                <h3 className="text-5xl prata text-center max-[768px]:text-2xl afterimg">{title}</h3>
                {/* <img src={StepLine} alt="" className="mx-auto mt-4" /> */}
                <div className="mb-10">
                    {content}
                </div>
                <div className="step absolute bottom-6 max-[768px]:bottom-2.5 right-0 left-0 text-center flex items-center gap-2 justify-center">
                    <span className="text-6xl max-[768px]:text-4xl">{stepNo}</span>
                    <span className="text-3xl max-[768px]:text-lg font-normal">/</span>
                    <span className="text-3xl max-[768px]:text-lg font-normal">{totalSteps}</span>
                </div>
            </div>
        </div>
     );
}
 
export default StepsAndImage;