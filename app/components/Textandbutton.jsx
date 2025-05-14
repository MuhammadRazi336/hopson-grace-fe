import Button from '~/components/Button.jsx';
import lonelingImg from '../assets/images/longline.png';


const Textandbutton = () => {
    return ( 
        <div className='max-w-[1258px] mx-auto px-3'>
            <h2 className=' lg:text-4xl xl:text-5xl 2xl:text-[56px] text-[28px] prata text-center lg:leading-[60px] font-normal mb-5'>Your wedding shouldn't be ordinary, nor should your registry.</h2>
            <p className='text-center md:text-lg lg:text-2xl 2xl:text-3xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[40px] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-16 mb-8'>From iconic homeware to bespoke travel experiences and custom cash funds, <br className='min-[767px]:hidden' /> The Registry is for modern couples who value style, sustainability and service.</p>
            <div className="mx-auto flex lg:flex-row flex-col gap-6 justify-center items-center ">
                <Button text="Begin Your Journey" className="text-white bg-[#446184] py-[22px] lg:py-[30px] lg:w-[320px] w-[280px] rounded-none button-cs max-[768px]:text-lg" />
                <Button text="Find a Couple" className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B]  py-[18px] lg:py-[30px] lg:w-[320px] w-[280px] bg-transparent rounded-none max-[768px]:text-lg" />
            </div>
            <img src={lonelingImg} alt="line" className='md:max-w-[320px] lg:max-w-[540px] xl:max-w-[767px] 2xl:max-w-[1020px] mx-auto pt-[110px] max-[768px]:hidden' />

        </div>
     );
}
 
export default Textandbutton;