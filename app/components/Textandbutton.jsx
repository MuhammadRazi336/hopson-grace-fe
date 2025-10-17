import Button from '~/components/Button.jsx';
import lonelingImg from '/assets/Images/longline.png';

const Textandbutton = () => {
  return (
    <div className="max-w-[1258px] mx-auto px-3">
      <h2 className="lg:text-[3.542vw] text-[22px] leading-[28px] max-[1024px]:w-[367px] max-[1024px]:max-w-full max-[1024px]:mx-auto prata text-center lg:leading-[3.854vw] font-normal mb-7">
        your wedding <span className="italic ivyora font-normal">isn't</span>{' '}ordinary,
         <br /> your registry<span className="italic ivyora font-normal"> shouldn't be either</span>
      </h2>
      <p className="text-center lg:text-[1.563vw] lg:leading-[2.083vw] max-w-[1080px] max-[768px]:max-w-[390px] mx-auto lg:mb-[2.083vw] mb-[65px] max-[1024px]:w-[291px] max-[1024px]:max-w-full max-[1024px]:mx-auto text-[12px] leading-[16px] tracking-[0.72px]">
        From iconic homeware to bespoke travel experiences and custom cash
        funds, <br className="max-[767px]:hidden" /> The Registry is for modern
        couples who value style, sustainability and service.
      </p>
      <img
        src={lonelingImg}
        alt="line"
        className="md:max-w-[320px] lg:max-w-[540px] xl:max-w-[767px] 2xl:max-w-[1020px] mx-auto  max-[1024px]:hidden"
      />
    </div>
  );
};

export default Textandbutton;
