import Button from '~/components/Button.jsx';
import Steps from './Steps';
import { NavLink } from '@remix-run/react';

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
        <div className={`flex lg:gap-8 gap-2 ${direction === 'left' ? 'items-stretch' : 'items-stretch flex-row-reverse'}`}>
            <div className={`bg-[#F5F2ED] py-16 relative flex items-center justify-center flex-col lg:w-[40%] w-1/2 max-[768px]:p-10 ${direction === 'left' ? 'lg:mb-20 mb-6' : 'lg:mt-20 mt-6'}`}>
                <h3 className='text-2xl lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center'>{title}</h3>
                <img src={lineimg} alt="lineimg" className='mb-8 mt-8 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[50%]' />
                {stepsCheck ? <Steps className="max-w-[520px]" /> : <p className='text-sm lg:text-2xl leading-normal lg:leading-[44px] max-w-[488px] mt-4 mb-4 text-center'>{description}</p>}
                <div>
                    <NavLink to={buttonLink}>
                    <Button text={buttontext} className={`text-lg py-4 lg:py-[30px] w-full lg:w-[320px] mt-4 lg:mt-8 bastardogrotesk button-cs  ${stepsCheck ? "max-[768px]:w-4/5 max-[768px]:m-0 max-[768px]:p-3.5" : ""}  ${buttontype == "link" ? "text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800" : "text-white bg-[#446184] rounded-none font-mono "}`} />
                    </NavLink>
                </div>
            </div>
            <div className={`lg:w-[60%] w-1/2  ${direction === 'left' ? 'lg:mt-20 mt-6' : 'lg:mb-20 mb-6'}`}>
                <img src={imgBanner} alt="Image Banner" className='max-[1024px]:h-full object-cover object-[80%]' />
            </div>
        </div>
     );
}
 
export default ImageAndText;