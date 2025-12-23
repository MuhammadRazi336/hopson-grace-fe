import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import ShowroomImg from '/assets/Images/showroom.png';
import lineImghead from '/assets/Images/line.png';
import {useState} from 'react';
import Popup from '~/components/Popup';
import ModalPortal from '~/components/ModalPortal';

const MeetOurTeam = () => {

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

      <div className="relative w-full h-[510px] lg:h-[27.083vw] max-[1024px]:h-[300px] banner-overlay">
        <img
          src={ShowroomImg}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Heading with underline - Left aligned on image */}
        <div className="absolute top-[50%] -translate-y-1/2 left-0 px-[11.094vw] max-[1024px]:px-[20px] max-[1024px]:pb-[20px] flex flex-col items-center ">
          {/* <h1 className="">
            about us
          </h1> */}
          <Heading
            text="meet our sister store"
            classes={
              'prata text-[#1F1D1B] text-4xl lg:text-[2.5vw] lg:leading-[4vw] xl:leading-[4vw] 2xl:leading-[4vw] font-normal text-left mb-[1.042vw] max-[1024px]:text-[28px] max-[1024px]:mb-[15px] px-[1.406vw]'
            }
            imageClasses=""
          />
          <img
              src={lineImghead}
              alt=""
              className="max-[1024px]:max-w-[230px] lg:w-[22.135vw] xl:w-[22.135vw] 2xl:w-[22.135vw] brightness-0 max-[1024px]:mx-auto"
          />
          <h2 className="text-center text-[#1F1D1B] font-[500] text-2xl lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[1vw] m-0 max-[1024px]:text-[18px] max-[1024px]:leading-[22px]">
          HOPSON GRACE
        </h2>
        </div>
        
      </div>

      <div className="container mx-auto pt-[5.833vw] pb-[4.896vw] max-[1024px]:py-[50px]">
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
        The Registry was born out of Hopson Grace, Toronto’s destination for beautifully curated homewares, design-forward essentials, and timeless gifts. Hopson Grace is where modern entertaining meets considered design. Whether you're looking for an espresso cup, a serving platter, or a Belgian modular sofa—this is where you'll find it. 
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
        PERFECT FOR POST-WEDDING LIFE
        </h2>
        <p className="text-center text-2xl lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal max-[1024px]:text-[16px] max-[1024px]:leading-[20px]">
        Visit Hopson Grace for beautiful home essentials and timeless gifts.
        </p>
        <div className="flex justify-center pt-[2.292vw] max-[1024px]:py-[20px]">
          <button
            onClick={handleOpenPopup}
            
            className="text-white font-[500] cursor-pointer tracking-[0.8px] text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] bg-[#446184] py-0 lg:w-[17.292vw] lg:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-full max-[1024px]:h-[40px]"
          >
            TAKE ME THERE
          </button>
          {showPopup && (
            <ModalPortal>
              <Popup onClose={handleClosePopup} />
            </ModalPortal>
          )}
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
          buttontype={'Color'}
          buttonLink={'/contact-us'}
          buttonClassName='!text-[#1F1D1B]'
          sx={{
            button: {
              backgroundColor: 'transparent',
              color: '#1F1D1B',
              border: '2px solid #1F1D1B',
            },
          }}
        />
      </div>
      <Footer />
    </section>
  );
};

export default MeetOurTeam;
