import { Link, NavLink, useLocation } from '@remix-run/react';
import Button from '~/components/Button.jsx';
import Steps from './Steps';

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
  const location = useLocation();

  const isContactPage = location.pathname === "/meet-our-team";

  return (
    <div
      className={`flex lg:gap-[2.083vw] gap-2 ${
        direction === 'left'
          ? 'items-stretch'
          : 'items-stretch flex-row-reverse'
      }`}
    >
      <div
        className={`bg-[#F5F2ED] py-16 relative flex justify-center flex-col lg:w-[36.406vw] w-1/2 lg:px-[4.219vw] max-[768px]:p-10 ${
          direction === 'left' ? 'lg:mb-20 mb-6' : 'lg:mt-20 mt-6'
        }`}
      >
        <h3 className="text-[48px] text-center lg:mx-auto lg:leading-[3.125vw] prata max-w-[410px]">
          {title}
        </h3>

        <svg className='mx-auto my-[20px] lg:w-[18.542vw] lg:h-[0.521vw]' width="360" height="10" viewBox="0 0 360 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2C79.5717 2 157.143 2 234.715 2C275.718 2 317.587 8 358 8" stroke="black" stroke-width="3" stroke-linecap="round"/>
        </svg>

        {stepsCheck ? (
          <Steps className="max-w-[520px]" />
        ) : (
          <p className="text-[22px] font-semibold leading-normal lg:leading-[2.292vw] max-w-[488px] lg:mt-[2.042vw] mt-4 mb-12 text-center">
            {description}
          </p>
        )}

        <div className="lg:mx-auto">
          <NavLink to={buttonLink}>
            <Button
              text={buttontext}
              className={`text-[18px] cursor-pointer w-[288px] h-[77px] lg:w-[16.563vw] lg:text-[0.938vw] lg:leading-[0.938vw] lg:h-[3.958vw] mt-4 lg:mt-[1.042vw] bastardogrotesk button-cs 
                ${
                  stepsCheck
                    ? 'max-[768px]:w-4/5 max-[768px]:m-0 max-[768px]:p-3.5'
                    : ''
                }  
                ${
                  buttontype == 'link'
                    ? 'text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800'
                    : 'text-white bg-[#446184] rounded-none font-mono'
                }
                ${isContactPage ? '!bg-transparent lg:w-[375px] !lg:py-[22px] text-[#1F1D1B] border-2 border-[#1F1D1B]' : ''} 
              `}
            />
          </NavLink>
        </div>
      </div>

      <div
        className={`lg:w-[65%] w-1/2  ${
          direction === 'left' ? 'lg:mt-20 mt-6' : 'lg:mb-20 mb-6'
        }`}
      >
        <img
          src={imgBanner}
          alt="Image Banner"
          className="w-full max-[1024px]:h-full object-cover object-[80%]"
        />
      </div>
    </div>
  );
};

export default ImageAndText;
