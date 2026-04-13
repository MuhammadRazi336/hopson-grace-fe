import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/about-us-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import ShowroomImg from '/assets/Images/showroom.png';
import lineImghead from '/assets/Images/line.png';
import {Link} from '@remix-run/react';

const MeetOurSisterStore = () => {
  return (
    <section>
      <Header />

      <div className="relative h-[33.854vw] max-[1024px]:h-[40vw] banner-overlay max-[768px]:h-[400px]">
        <img src={ShowroomImg} alt="" className="w-full h-[40vw] lg:h-[33.854vw] xl:h-[33.854vw] 2xl:h-[33.854vw] object-cover object-center max-[1024px]:object-position-[0%_50%] max-[768px]:h-[400px]" />
        {/* Heading with underline - Left aligned on image */}
        <div className="absolute top-[50%] -translate-y-1/2 left-0 px-[11.094vw] max-[1024px]:px-[20px] max-[1024px]:pb-[20px] flex flex-col items-center max-[768px]:-translate-x-1/2 max-[768px]:left-1/2 max-[768px]:top-1/2 max-[768px]:p-0">
          {/* <h1 className="">
            about us
          </h1> */}
          <Heading
            text="meet our sister store"
            classes={
              'prata text-black text-[20px] leading-[36px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-left mb-[1.719vw] max-[1024px]:mb-[0px] max-[768px]:text-[22px]'
            }
            imageClasses={'max-[1024px]:max-w-[330px] w-[22.135vw]'}
          />
          <img
            src={lineImghead}
            alt=""
            className="max-[1024px]:max-w-[230px] lg:w-[22.135vw] xl:w-[22.135vw] 2xl:w-[22.135vw] brightness-0 max-[1024px]:mx-auto"
          />
          <h2 className="text-center text-black font-[500] text-[12px] leading-[36px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[1vw] mb-0 max-[1024px]:pt-[5px] max-[768px]:text-[14px]">
            HOPSON GRACE
          </h2>
        </div>
      </div>

      <div className="container mx-auto pt-[5.833vw] pb-[4.896vw] max-[1024px]:py-[50px]">
        <p className="text-center text-[26px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.979vw] leading-[38px] font-normal lg:w-[75.469vw] xl:w-[75.469vw] 2xl:w-[75.469vw] mx-auto max-[1024px]:text-[16px] max-[1024px]:leading-[26px]">
          The Registry was born out of Hopson Grace, Toronto’s destination for
          beautifully curated homewares, design-forward essentials, and timeless
          gifts. Hopson Grace is where modern entertaining meets considered
          design. Whether you're looking for an espresso cup, a serving platter,
          or a Belgian modular sofa—this is where you'll find it.
        </p>
      </div>

      <div className="w-full container mx-auto">
        <img
          src={RegistryLogo}
          alt=""
          className="w-[100px] object-cover mx-auto max-[1024px]:w-[60px]"
        />

        <h2 className="text-center font-[500] text-2xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[2.865vw] mb-[0.625vw] max-[1024px]:text-[18px] max-[1024px]:leading-[22px] max-[1024px]:py-[20px]">
          PERFECT FOR POST-WEDDING LIFE
        </h2>
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
          Visit Hopson Grace for beautiful home essentials and timeless gifts.
        </p>
        <div className="flex justify-center pt-[2.292vw] max-[1024px]:py-[20px]">
          <Link to="https://hopsongrace.com/" target="_blank">
            <Button
                text="TAKE ME THERE"
                className="text-white font-normal cursor-pointer bg-[#446184] py-[5px] lg:w-[24.219vw] xl:w-[24.219vw] 2xl:w-[24.219vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg max-[1024px]:text-[14px] max-[1024px]:w-full max-[1024px]:h-[40px] max-[1024px]:px-8"
              />
          </Link>
        </div>
      </div>

      <div className="w-full py-[9.063vw]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="questions?"
          description="We’ve got answers."
          buttontext={'CONTACT US'}
          buttontype={'link'}
          buttonLink={'/contact-us'}
          buttonClassName="!text-[#1F1D1B]"
        />
      </div>
      <Footer />
    </section>
  );
};

export default MeetOurSisterStore;
