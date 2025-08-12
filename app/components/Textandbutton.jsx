import Button from '~/components/Button.jsx';
import lonelingImg from '/assets/Images/longline.png';

const Textandbutton = () => {
  return (
    <div className="max-w-[1258px] mx-auto px-3">
      <h2 className=" lg:text-4xl xl:text-5xl 2xl:text-[56px] text-[28px] prata text-center lg:leading-[60px] font-normal mb-7">
        your wedding <span className="italic ivyora font-normal">isn't</span>{' '}ordinary,
         <br /> your registry<span className="italic ivyora font-normal">shouldn't be either</span>
      </h2>
      <p className="text-center md:text-lg lg:text-2xl 2xl:text-3xl md:leading-[24px] lg:leading-[28px] xl:leading-[30px] 2xl:leading-[40px] max-w-[1020px] max-[768px]:max-w-[390px] mx-auto lg:mb-10 mb-8">
        From iconic homeware to bespoke travel experiences and custom cash
        funds, <br className="min-[767px]:hidden" /> The Registry is for modern
        couples who value style, sustainability and service.
      </p>
      <img
        src={lonelingImg}
        alt="line"
        className="md:max-w-[320px] lg:max-w-[540px] xl:max-w-[767px] 2xl:max-w-[1020px] mx-auto  max-[768px]:hidden"
      />
    </div>
  );
};

export default Textandbutton;
