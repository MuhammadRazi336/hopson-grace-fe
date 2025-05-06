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
  disabled = false,
  className,
}) => {
    return ( 
        <div className={direction === 'left' ? 'flex gap-8 items-stretch ' : 'flex gap-8 items-stretch flex-row-reverse'}>
            <div className={`bg-[#F5F2ED] flex items-center justify-center flex-col w-[40%] ${direction === 'left' ? 'mb-20' : 'mt-20'}`}>
                <h3 className='text-5xl prata max-w-[410px] text-center'>{title}</h3>
                <img src={lineimg} alt="lineimg" className='mb-12 mt-8' />
                {stepsCheck ? <Steps className="max-w-[520px]" /> : <p className='text-2xl leading-[44px] max-w-[488px] text-center'>{description}</p>}
                <Button text={buttontext} className={`text-lg py-[30px] w-[320px] mt-16 bastardogrotesk button-cs ${buttontype == "link" ? "text-[#1F1D1B] border-3 border-[#1F1D1B] bg-transparent rounded-none font-semibold tracking-[8%] font-800" : "text-white bg-[#446184] rounded-none font-mono "}`} />
            </div>
            <div className={`w-[60%] ${direction === 'left' ? 'mt-20' : 'mb-20'}`}>
                <img src={imgBanner} alt="Image Banner" />
            </div>
        </div>
     );
}
 
export default ImageAndText;