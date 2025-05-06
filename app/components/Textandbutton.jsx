import Button from '~/components/Button.jsx';
import lonelingImg from '../assets/images/longline.png';


const Textandbutton = () => {
    return ( 
        <div className='max-w-[1258px] mx-auto'>
            <h2 className='text-[56px] prata text-center leading-[60px] font-normal mb-5'>Your wedding shouldn't be ordinary, nor should your registry.</h2>
            <p className='text-center text-3xl leading-[40px] max-w-[1020px] mx-auto mb-16'>From iconic homeware to bespoke travel experiences and custom cash funds, The Registry is for modern couples who value style, sustainability and service.</p>
            <div className="mx-auto flex gap-6 justify-center">
                <Button text="Begin Your Journey" className="text-white bg-[#446184] py-[30px] w-[320px] rounded-none button-cs" />
                <Button text="Find a Couple" className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] w-[320px] bg-transparent rounded-none" />
            </div>
            <img src={lonelingImg} alt="line" className='max-w-[1020px] mx-auto pt-[110px]' />

        </div>
     );
}
 
export default Textandbutton;