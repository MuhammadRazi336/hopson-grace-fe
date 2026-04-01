import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/about-us-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import GlassBg from '/assets/Images/your-registry-concierge-banner.jpg';
import DinnerSetImg from '/assets/Images/DinnerSetImg.png';
import BookVitual from '/assets/Images/book-a-virtual.jpg';
import {Link} from '@remix-run/react';

const YourRegistryConcierge = () => {
  return (
    <section>
      <Header />

      <div className="relative w-full h-[510px] lg:h-[27.083vw] max-[1024px]:h-[300px] banner-overlay">
        <img src={GlassBg} alt="" className="w-full h-full object-cover" />
        {/* Heading with underline - Left aligned on image */}
        <div className="absolute top-[50%] -translate-y-1/2 left-0 px-[11.094vw] max-[1024px]:px-[20px] max-[1024px]:pb-[20px] flex flex-col items-center ">
          {/* <h1 className="">
            about us
          </h1> */}
          <Heading
            text="your registry concierge"
            classes={
              'prata text-white text-4xl lg:text-[2.5vw] lg:leading-[4vw] xl:leading-[4vw] 2xl:leading-[4vw] font-normal text-left mb-[1.042vw] max-[1024px]:text-[28px] max-[1024px]:mb-[15px] px-[1.406vw]'
            }
            imageClasses=""
          />
          <img
            src={lineImghead}
            alt=""
            className="max-[1024px]:max-w-[230px] lg:w-[22.135vw] xl:w-[22.135vw] 2xl:w-[22.135vw] brightness-0 invert-100 max-[1024px]:mx-auto"
          />
          <h2 className="text-center text-white font-[500] text-2xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[1vw] m-0 max-[1024px]:text-[18px] max-[1024px]:leading-[22px]">
            REAL PEOPLE, HERE TO HELP.
          </h2>
        </div>
      </div>

      <div className="container mx-auto pt-[5.833vw] pb-[4.896vw] max-[1024px]:py-[50px]">
        <p className="text-center text-2xl leading-relaxed lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] font-normal max-[1024px]:text-[16px] w-[67.396vw] max-w-full mx-auto">
          From styling your registry to managing gift fulfillment, a Registry
          Concierge is always available to guide you every step of the way.
          Whether you need help choosing the perfect serving bowl, coordinating
          delivery timing, or simply want a second opinion — we’re just a call,
          email, or chat away.
        </p>
      </div>

      <div className="w-full container mx-auto">
        <img
          src={RegistryLogo}
          alt=""
          className="w-[100px] object-cover mx-auto max-[1024px]:w-[60px]"
        />

        <h2 className="text-center font-[500] text-2xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[2.865vw] mb-[0.625vw] max-[1024px]:text-[18px] max-[1024px]:leading-[22px] max-[1024px]:py-[20px]">
          QUESTIONS? STYLE DILEMMAS? NOT SURE WHERE TO START?
        </h2>
        <div className="flex justify-center pt-[2.292vw] max-[1024px]:py-[20px]">
          <Link to="/contact-us">
            <button className="text-white font-normal cursor-pointer bg-[#446184] py-[5px] lg:w-[24.219vw] xl:w-[24.219vw] 2xl:w-[24.219vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-full max-[1024px]:h-[40px]">
              CONTACT A REGISTRY CONCIERGE
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full pt-16 pb-[13.313vw] max-[1024px]:py-[50px]">
        <ImageAndText
          direction={'left'}
          imgBanner={BookVitual}
          lineimg={lineImg3}
          title="book a virtual appointment"
          description="Our virtual appointments offer personalized guidance — without leaving home. "
          buttontext={'BOOK NOW'}
          buttontype={'link'}
          buttonLink={'https://calendly.com/concierge-theregistry/learn-more'}
          buttonClassName="!text-[#1F1D1B]"
        />
      </div>
      <Footer />
    </section>
  );
};

export default YourRegistryConcierge;
