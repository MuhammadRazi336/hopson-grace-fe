import Button from '~/components/Button.jsx';
import Steps from './Steps';
import { Link, NavLink } from '@remix-run/react';

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
    return ( 
        <div className={`flex lg:gap-[34px] gap-2 ${direction === 'left' ? 'items-stretch' : 'items-stretch flex-row-reverse'}`}>
            <div className={`bg-[#F5F2ED] py-16 relative flex justify-center flex-col lg:w-[35%] w-1/2 lg:px-[81px] max-[768px]:p-10 ${direction === 'left' ? 'lg:mb-20 mb-6' : 'lg:mt-20 mt-6'}`}>
                <h3 className='text-2xl lg:text-[2.5vw] 2xl:text-[2.5vw] lg:mx-auto lg:leading-[3.125vw] 3xl:w-full prata max-w-[410px]'>{title}</h3>
                <img src={lineimg} alt="lineimg" className='mb-8 mt-2 lg:mx-auto max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[50%]' />
                {stepsCheck ? <Steps className="max-w-[520px]" /> : <p className='text-sm lg:text-[26px] leading-normal lg:leading-[44px] max-w-[488px] mt-4 mb-12 text-center'>{description}</p>}
                <div className='lg:mx-auto'>
                    {buttontext === 'BOOK NOW' ? (
                        <Link to="https://calendly.com/concierge-theregistry/30min">
                        <Button 
                            text={buttontext} 
                            className={`text-lg py-4 lg:py-[30px] w-full lg:px-[20px] mt-4 lg:mt-8 bastardogrotesk button-cs  ${stepsCheck ? "max-[768px]:w-4/5 max-[768px]:m-0 max-[768px]:p-3.5" : ""}  ${buttontype == "link" ? "text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800" : "text-white bg-[#446184] rounded-none font-mono "}`} 
                        />
                        </Link>
                    ) : (
                        <NavLink to={buttonLink}>
                            <Button text={buttontext} className={`text-[18px] py-4 lg:py-[23.5px] w-full lg:w-[320px] mt-4 lg:mt-0 bastardogrotesk button-cs  ${stepsCheck ? "max-[768px]:w-4/5 max-[768px]:m-0 max-[768px]:p-3.5" : ""}  ${buttontype == "link" ? "text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800" : "text-white bg-[#446184] rounded-none font-mono "}`} />
                        </NavLink>
                    )}
                </div>
            </div>
            <div className={`lg:w-[65%] w-1/2  ${direction === 'left' ? 'lg:mt-20 mt-6' : 'lg:mb-20 mb-6'}`}>
                <img src={imgBanner} alt="Image Banner" className='w-full max-[1024px]:h-full object-cover object-[80%]' />
            </div>
        </div>
     );
}
 
export default ImageAndText;