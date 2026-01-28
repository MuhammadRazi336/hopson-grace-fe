import { Link } from "@remix-run/react"
import arrow from "/assets/Images/arrow.png"
import registrylogoSteps from "/assets/Images/registrylogoSteps.png"
import StepLine from "/assets/Images/StepLine.png"
import Steps from "/assets/Images/Steps.png"
import AnimatedSVG from "./AnimatedSVG"

// Import different images for different steps
import step1Image from "/assets/Images/onboardingstep1.jpg"
import step2Image from "/assets/Images/ceremony-step.jpg"
import step3Image from "/assets/Images/laurenstep.jpg"
import step4Image from "/assets/Images/no-of-guests.jpg"
import step5Image from "/assets/Images/amanyarastep.jpg"
import step6Image from "/assets/Images/giftkindstep.jpg"
import step7Image from "/assets/Images/dreamFunds.png"
import step8Image from "/assets/Images/giftkindstep.jpg"
import step9Image from "/assets/Images/BeachBg.png"
import step10Image from "/assets/Images/BreadBg.png"
import congratulationsPage from "/assets/Images/scootycouple.jpg"
import { useState } from "react"
import Popup from "./Popup"

const StepsAndImage = ({ content, title, stepNo, totalSteps, className, showLoginLink = true, showPagination = true, onBackClick, showBackButton = false, customImageFooter }) => {
    // Function to get the appropriate image based on step number
    const getStepImage = (step) => {
        const stepNumber = parseInt(step);
        switch(stepNumber) {
            case 1: return step1Image;
            case 2: return step2Image;
            case 3: return step3Image;
            case 4: return step4Image;
            case 5: return step5Image;
            case 6: return step6Image;
            case 7: return step7Image;
            case 8: return congratulationsPage;
            case 9: return step9Image;
            case 10: return step10Image;
            default: return step1Image; // fallback
        }
    };

    const [showPopup, setShowPopup] = useState(false);
    
    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return ( 
        <div className={`flex py-32 max-[1024px]:py-10 justify-center max-[1024px]:w-full max-[1024px]:flex-col max-[1024px]:items-center max-[1024px]:px-4`}>
            <div className="relative left-[37.5px] max-w-[50%] lg:w-[36.458vw] max-[1024px]:max-w-[100%] max-[1024px]:w-full max-[1024px]:left-[initial] lg:w-[36.458vw] xl:w-[36.458vw] 2xl:w-[36.458vw] lg:h-[40.625vw] xl:h-[40.625vw] 2xl:h-[40.625vw]">
                <div className="relative h-full w-full">
                    <img src={getStepImage(stepNo)} alt={`Step ${stepNo}`} className="w-full h-full object-cover max-[1024px]:w-[calc(100%-30px)] max-[1024px]:max-h-[72vw]" />
                    <img src={registrylogoSteps} alt="" className="absolute bottom-4 -left-[72px] lg:-left-[2.083vw] xl:-left-[2.083vw] 2xl:-left-[2.083vw] max-[1024px]:left-[initial] max-[1024px]:-right-[7px] max-[1024px]:w-[71px] max-[1024px]:bottom-0 max-[1024px]:top-0 max-[1024px]:my-auto lg:w-[4.49vw] xl:w-[4.49vw] 2xl:w-[4.49vw] w-[71px]" />
                    {showLoginLink && (
                        <h5 className="absolute -bottom-16 max-[1024px]:hidden lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw]">Already Registered? <Link to="/login" className="font-bold border-b-black border-b-2 uppercase ">Login</Link></h5>
                    )}
                    {customImageFooter && (
                        <div className="absolute -bottom-[100px] max-[1024px]:-bottom-[350px] max-[1024px]:right-auto max-[1024px]:left-auto max-[1024px]:w-full max-[1024px]:text-center lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw]">
                            {customImageFooter}
                        </div>
                    )}
                </div>
            </div>
            <div className={`${className} ${Number(stepNo) >= Number(totalSteps) ? "lg:py-[3.333vw] xl:py-[3.333vw] 2xl:py-[3.333vw]" : "lg:py-[5.417vw] xl:py-[5.417vw] 2xl:py-[5.417vw]"} bg-steel-blue text-white lg:px-[5.417vw] xl:px-[5.417vw] 2xl:px-[5.417vw] lg:w-[52.083vw] xl:w-[52.083vw] 2xl:w-[52.083vw] relative -left-[37.5px] top-[59px] lg:top-[3.073vw] xl:top-[3.073vw] 2xl:top-[3.073vw] max-[1024px]:max-w-[100%] max-w-[1000px] max-[1024px]:-top-[10.292vw] max-[1024px]:left-2.5 max-[1024px]:w-[95%] max-[1024px]:px-[24px] max-[1024px]:py-[27px] text-center`}>
                <h3 className="text-5xl font-[400] lg:text-[2.292vw] xl:text-[2.292vw] 2xl:text-[2.292vw] lg:leading-[3.125vw] xl:leading-[3.125vw] 2xl:leading-[3.125vw] prata text-center max-[1024px]:text-[26px] max-[1024px]:leading-[30px] afterimg">{title}</h3>
                {/* <img src={StepLine} alt="" className="mx-auto mt-4" /> */}
                <div className={Number(stepNo) >= Number(totalSteps) ? "" : "mb-10"}>
                    {content}
                </div>
                {/* Back button in left corner */}
                {showBackButton && (
                    <button
                        onClick={onBackClick}
                        type="button"
                        className="flex justify-end mt-8 absolute lg:bottom-[2.135vw] xl:bottom-[2.135vw] 2xl:bottom-[2.135vw] lg:left-[1.823vw] xl:left-[1.823vw] 2xl:left-[1.823vw] max-[1024px]:left-[28px] flex items-center uppercase font-bold gap-2 text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] bg-transparent border-none"
                        style={{ cursor: 'pointer', zIndex: 9999 }}
                    >
                        <img src="/assets/Images/arrow.png" alt="" className="rotate-180 lg:w-[1.25vw] xl:w-[1.25vw] 2xl:w-[1.25vw] w-[24px] max-[1024px]:w-[17px]" /> Back
                    </button>
                )}
                
                {showPagination && (
                    <div className="step absolute bottom-6 lg:bottom-[2vw] xl:bottom-[2vw] 2xl:bottom-[2vw] max-[1024px]:bottom-2.5 right-0 left-0 text-center flex items-center gap-2 justify-center">
                        <span className="text-6xl max-[1024px]:text-4xl">{stepNo}</span>
                        <span className="text-3xl max-[1024px]:text-lg font-normal">/</span>
                        <span className="text-3xl max-[1024px]:text-lg font-normal">{totalSteps}</span>
                    </div>
                )}
            </div>
               
        </div>
     );
}
 
export default StepsAndImage;