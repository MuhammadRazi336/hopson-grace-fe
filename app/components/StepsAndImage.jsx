import { Link } from "@remix-run/react"
import arrow from "/assets/Images/arrow.png"
import registrylogoSteps from "/assets/Images/registrylogoSteps.png"
import StepLine from "/assets/Images/StepLine.png"
import Steps from "/assets/Images/Steps.png"

// Import different images for different steps
import step1Image from "/assets/Images/CoupleBg.png"
import step2Image from "/assets/Images/CakeBg.png"
import step3Image from "/assets/Images/CakeBg.png"
import step4Image from "/assets/Images/FigsBg.png"
import step5Image from "/assets/Images/CourtyardBg.png"
import step6Image from "/assets/Images/OrnamentsBg.png"
import step7Image from "/assets/Images/CutleryBg.png"
import step8Image from "/assets/Images/AlleyWayBg.png"
import step9Image from "/assets/Images/BeachBg.png"
import step10Image from "/assets/Images/BreadBg.png"

const StepsAndImage = ({ content, title, stepNo, totalSteps, className }) => {
    // Function to get the appropriate image based on step number
    const getStepImage = (step) => {
        switch(step) {
            case 1: return step1Image;
            case 2: return step2Image;
            case 3: return step3Image;
            case 4: return step4Image;
            case 5: return step5Image;
            case 6: return step6Image;
            case 7: return step7Image;
            case 8: return step8Image;
            case 9: return step9Image;
            case 10: return step10Image;
            default: return step1Image; // fallback
        }
    };

    return ( 
        <div className={`flex py-32 max-[768px]:py-10 justify-center max-[768px]:flex-col max-[768px]:items-center max-[768px]:px-4 container`}>
            <div className="relative left-[37.5px] max-w-[50%] lg:w-[36.458vw] max-[768px]:max-w-[100%] max-[768px]:left-[initial]">
                <div className="relative">
                    <img src={getStepImage(stepNo)} alt={`Step ${stepNo}`} className="w-full h-full object-contain" />
                    <img src={registrylogoSteps} alt="" className="absolute bottom-4 -left-[72px] max-[768px]:left-[initial] max-[768px]:-right-[7px] max-[768px]:w-[71px] max-[768px]:bottom-0 max-[768px]:top-0 max-[768px]:my-auto" />
                    <h5 className="absolute -bottom-16 max-[768px]:hidden">Already Registered? <Link to="/login" className="font-bold border-b-black border-b-2 uppercase ">Login</Link></h5>
                </div>
            </div>
            <div className={`${className} bg-steel-blue text-white py-[110px] px-[90px] lg:w-[52.083vw] pb-28 pt-[100px] relative -left-[37.5px] top-[59px] max-[768px]:max-w-[100%] max-w-[1000px] max-[1024px]:p-6 max-[768px]:-top-[140px] max-[768px]:left-2.5 max-[768px]:pb-20 max-[768px]:pt-14  max-[768px]:w-full text-center`}>
                <h3 className="text-5xl font-[400] lg:text-[2.292vw] lg:leading-[3.125vw] prata text-center max-[768px]:text-2xl afterimg">{title}</h3>
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