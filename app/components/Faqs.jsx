import vector14 from "../assets/Images/Vector 14.png"
import faqline from "../assets/Images/faqline.png"
import moreImg from "../assets/Images/more.png"
import { useState } from 'react';

const Faqs = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleFaqs = () => {
        setIsExpanded(!isExpanded);
    };

    return (  
        <div className="max-w-[1560px] px-4 mx-auto flex items-center flex-col">
            <h2 className="prata text-center text-5xl font-normal mb-0">Frequently Asked Questions</h2>
            <img src={vector14} alt="" className="mt-11 mb-24"/>
            <div className="faq-section flex gap-16">
                <div className="left-faqs">
                    <div className="flex ">
                        <div className="prata font-normal text-[98px] leading-[36px] text-center vertical-align-middle mr-10">1.</div>
                        <div>
                            <h4 className="font-medium text-[28px] leading-[36px] tracking-[5%] vertical-align-middle mb-[50px]">WHY CHOOSE THE REGISTRY?</h4>
                            <p className="font-normal text-2xl leading-[36px] tracking-normal vertical-align-middle">Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)</p>
                        </div>
                    </div>
                    <div className="flex mt-20">
                        <div className="prata font-normal text-[98px] leading-[36px] text-center vertical-align-middle mr-10">3.</div>
                        <div>
                            <h4 className="font-medium text-[28px] leading-[36px] tracking-[5%] vertical-align-middle mb-[50px]">WHY CHOOSE THE REGISTRY?</h4>
                            <p className="font-normal text-2xl leading-[36px] tracking-normal vertical-align-middle">Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)</p>
                        </div>
                    </div>
                    <div className={`mt-20 ${isExpanded ? 'flex' : 'hidden'}`}>
                        <div className="prata font-normal text-[98px] leading-[36px] text-center vertical-align-middle mr-10">5.</div>
                        <div>
                            <h4 className="font-medium text-[28px] leading-[36px] tracking-[5%] vertical-align-middle mb-[50px]">WHY CHOOSE THE REGISTRY?</h4>
                            <p className="font-normal text-2xl leading-[36px] tracking-normal vertical-align-middle">Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)</p>
                        </div>
                    </div>
                </div>
                <div>
                    <img src={faqline} alt="" className="max-w-initial h-full" />
                </div>
                <div className="right-faqs">
                <div className="flex ">
                        <div className="prata font-normal text-[98px] leading-[36px] text-center vertical-align-middle mr-10">2.</div>
                        <div>
                            <h4 className="font-medium text-[28px] leading-[36px] tracking-[5%] vertical-align-middle mb-[50px]">WHY CHOOSE THE REGISTRY?</h4>
                            <p className="font-normal text-2xl leading-[36px] tracking-normal vertical-align-middle">Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)</p>
                        </div>
                    </div>
                    <div className="flex mt-20">
                        <div className="prata font-normal text-[98px] leading-[36px] text-center vertical-align-middle mr-10">4.</div>
                        <div>
                            <h4 className="font-medium text-[28px] leading-[36px] tracking-[5%] vertical-align-middle mb-[50px]">WHY CHOOSE THE REGISTRY?</h4>
                            <p className="font-normal text-2xl leading-[36px] tracking-normal vertical-align-middle">Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)</p>
                        </div>
                    </div>
                    <div className={`mt-20 ${isExpanded ? 'flex' : 'hidden'}`}>
                        <div className="prata font-normal text-[98px] leading-[36px] text-center vertical-align-middle mr-10">6.</div>
                        <div>
                            <h4 className="font-medium text-[28px] leading-[36px] tracking-[5%] vertical-align-middle mb-[50px]">WHY CHOOSE THE REGISTRY?</h4>
                            <p className="font-normal text-2xl leading-[36px] tracking-normal vertical-align-middle">Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="more-less mt-[45px]">
                <button className="flex items-center flex-col" onClick={toggleFaqs}>
                    <span>{isExpanded ? 'Less' : 'More'}</span>
                    <img src={moreImg} alt="" className={`${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}
 
export default Faqs;