import Button from '~/components/Button.jsx';
import Steps from './Steps';
import { NavLink } from '@remix-run/react';
import { useState, useEffect } from 'react';

const ImageAndText = ({
    title,
    description,
    imgBanner,
    lineimg,
    buttontype,
    buttontext,
    direction,
    stepsCheck,
  onClick,
  type,
  buttonLink,
  disabled = false,
  className,
}) => {
    const [showCalendly, setShowCalendly] = useState(false);

    const handleButtonClick = () => {
        if (buttontext === 'BOOK NOW') {
            setShowCalendly(true);
        }
    };

    // Load Calendly script when modal is opened
    useEffect(() => {
        if (showCalendly) {
            // Check if Calendly script is already loaded
            if (!window.Calendly) {
                const script = document.createElement('script');
                script.src = 'https://assets.calendly.com/assets/external/widget.js';
                script.async = true;
                script.onload = () => {
                    // Initialize Calendly widget after script loads
                    if (window.Calendly) {
                        window.Calendly.initInlineWidget({
                            url: 'https://calendly.com/concierge-theregistry/setting-up-your-registry',
                            parentElement: document.querySelector('.calendly-inline-widget'),
                            minWidth: '320px',
                            height: '700px'
                        });
                    }
                };
                document.head.appendChild(script);
            } else {
                // If Calendly is already loaded, initialize the widget
                window.Calendly.initInlineWidget({
                    url: 'https://calendly.com/concierge-theregistry/setting-up-your-registry',
                    parentElement: document.querySelector('.calendly-inline-widget'),
                    minWidth: '320px',
                    height: '700px'
                });
            }
        }
    }, [showCalendly]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            // Remove Calendly script when component unmounts
            const existingScript = document.querySelector('script[src*="calendly.com"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, []);

    return ( 
        <div className={`flex lg:gap-8 gap-2 ${direction === 'left' ? 'items-stretch' : 'items-stretch flex-row-reverse'}`}>
            <div className={`bg-[#F5F2ED] py-16 relative flex items-center justify-center flex-col lg:w-[40%] w-1/2 max-[768px]:p-10 ${direction === 'left' ? 'lg:mb-20 mb-6' : 'lg:mt-20 mt-6'}`}>
                <h3 className='text-2xl lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center'>{title}</h3>
                <img src={lineimg} alt="lineimg" className='mb-8 mt-8 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[50%]' />
                {stepsCheck ? <Steps className="max-w-[520px]" /> : <p className='text-sm lg:text-2xl leading-normal lg:leading-[44px] max-w-[488px] mt-4 mb-4 text-center'>{description}</p>}
                <div>
                    {buttontext === 'BOOK NOW' ? (
                        <Button 
                            text={buttontext} 
                            className={`text-lg py-4 lg:py-[30px] w-full lg:w-[320px] mt-4 lg:mt-8 bastardogrotesk button-cs  ${stepsCheck ? "max-[768px]:w-4/5 max-[768px]:m-0 max-[768px]:p-3.5" : ""}  ${buttontype == "link" ? "text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800" : "text-white bg-[#446184] rounded-none font-mono "}`} 
                            onClick={handleButtonClick}
                        />
                    ) : (
                        <NavLink to={buttonLink}>
                            <Button text={buttontext} className={`text-lg py-4 lg:py-[30px] w-full lg:w-[320px] mt-4 lg:mt-8 bastardogrotesk button-cs  ${stepsCheck ? "max-[768px]:w-4/5 max-[768px]:m-0 max-[768px]:p-3.5" : ""}  ${buttontype == "link" ? "text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800" : "text-white bg-[#446184] rounded-none font-mono "}`} />
                        </NavLink>
                    )}
                </div>
            </div>
            <div className={`lg:w-[60%] w-1/2  ${direction === 'left' ? 'lg:mt-20 mt-6' : 'lg:mb-20 mb-6'}`}>
                <img src={imgBanner} alt="Image Banner" className='max-[1024px]:h-full object-cover object-[80%]' />
            </div>

            {/* Calendly Widget Modal */}
            {showCalendly && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">Book a Virtual Appointment</h3>
                            <button
                                onClick={() => setShowCalendly(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            {/* Calendly inline widget */}
                            <div 
                                className="calendly-inline-widget" 
                                data-url="https://calendly.com/concierge-theregistry/setting-up-your-registry"
                                style={{minWidth: '320px', height: '700px'}}
                            />
                        </div>
                    </div>
                    {/* Click outside to close */}
                    <div 
                        className="absolute inset-0 -z-10" 
                        onClick={() => setShowCalendly(false)}
                    />
                </div>
            )}
        </div>
     );
}
 
export default ImageAndText;