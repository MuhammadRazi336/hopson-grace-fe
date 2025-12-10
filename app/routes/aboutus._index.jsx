import React from 'react';
import AboutUsBg from '/assets/Images/AboutUsBg.png';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import BottleImg from '/assets/Images/BottleImg.png';
import AboutUsHero from '/assets/Images/aboutusHero.jpg';
import lineImg3 from '/assets/Images/line.png';
import Popup from '~/components/Popup';
import ModalPortal from '~/components/ModalPortal';
import {NavLink} from '@remix-run/react';
import {useState} from 'react';

const AboutUs = () => {
  
  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <section>
      <Header />
      <div className="relative w-full h-[510px] lg:h-[27.083vw] max-[1024px]:h-[300px]">
        <img
          src={AboutUsHero}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Heading with underline - Left aligned on image */}
        <div className="absolute top-[50%] -translate-y-1/2 left-0 px-[11.094vw] max-[1024px]:px-[20px] max-[1024px]:pb-[20px]">
          {/* <h1 className="">
            about us
          </h1> */}
          <Heading
            text="about us"
            classes={
              'prata text-white text-4xl lg:text-[2.5vw] lg:leading-[4vw] xl:leading-[4vw] 2xl:leading-[4vw] font-normal text-left mb-[1.042vw] max-[1024px]:text-[28px] max-[1024px]:mb-[15px] px-[1.406vw] border-b border-white'
            }
            imageClasses=""
          />
          <h2 className="text-center text-white font-[500] text-2xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[1vw] m-0 max-[1024px]:text-[18px] max-[1024px]:leading-[22px]">
          ELEVATED, EFFORTLESS, YOURS.
        </h2>
        </div>
        
      </div>

      <div className="container mx-auto pt-[5.833vw] pb-[4.896vw] max-[1024px]:py-[50px]">
        
        
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
          After years of working with engaged couples at our sister store,
          Hopson Grace, we noticed a shift: couples still wanted beautiful,
          lasting things but they wanted to build their registries online
          without compromising on style, service, or experience. So we created
          <span>
            {' '}
            The Registry: a digital destination that marries ease with elegance.
          </span>{' '}
        </p>
        <br />
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal py-4 max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
          Where thoughtful design meets exceptional quality. Where registries
          feel less like checklists and more like reflections of who you are and
          the life you're building together. We’ve curated timeless pieces,
          iconic brands and meaningful extras from bespoke honeymoon experiences
          to flexible cash funds so you can build a registry that reflects your
          taste, values, and lifestyle. Use our tools to build it your way, or
          lean on our team for support and inspiration.
        </p>
        <br />
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
          <span>Our philosophy?</span> Fewer, better things. A registry that’s
          elevated and personal. And a wedding gift experience that’s as
          thoughtful as the day itself.
        </p>
      </div>
      <div className="w-full container mx-auto">
        <img
          src={RegistryLogo}
          alt=""
          className="w-[100px] object-cover mx-auto max-[1024px]:w-[60px]"
        />
        <img
          src={lineImghead}
          alt=""
          width={100}
          height={100}
          className="object-cover mx-auto lg:w-[6.164vw] xl:w-[6.164vw] 2xl:w-[6.164vw] max-[1024px]:w-[60px]"
        />

        <h2 className="text-center font-[500] text-2xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[2.865vw] mb-[0.625vw] max-[1024px]:text-[18px] max-[1024px]:leading-[22px] max-[1024px]:py-[20px]">
          READY TO START BUILDING A REGISTRY?
        </h2>
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
          Create your account or book a virtual appointment to get started.
        </p>
        <div className="flex justify-center pt-[2.292vw] max-[1024px]:py-[20px]">
          <button
            onClick={handleOpenPopup}
            
            className="text-white font-[500] cursor-pointer tracking-[0.8px] text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] bg-[#446184] py-0 lg:w-[17.292vw] lg:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-full max-[1024px]:h-[40px]"
          >
            Let's Go
          </button>
          {showPopup && (
            <ModalPortal>
              <Popup onClose={handleClosePopup} />
            </ModalPortal>
          )}
        </div>
      </div>

      <div className="w-full pt-16 pb-[13.313vw] max-[1024px]:py-[50px]">
        <ImageAndText
          direction={'left'}
          imgBanner={BottleImg}
          lineimg={lineImg3}
          title="at your service?"
          description="There's no question too small or request too big for our Registry advisors. We're always at your service."
          buttontext={'CONTACT US'}
          buttontype={'link'}
          buttonLink={'/contact-us'}
        />
      </div>
      <Footer />
    </section>
  );
};

export default AboutUs;
