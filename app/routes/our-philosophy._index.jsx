import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import OurPhilosophyBg from '/assets/Images/OurPhilosophyBg.jpg';
import teaImg from '/assets/Images/tea.png';
import { Link } from '@remix-run/react';
import {useState} from 'react';
import Popup from '~/components/Popup';
import ModalPortal from '~/components/ModalPortal';

const OurPhilosophy = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Header />

      <section className='relative h-[33.854vw] max-[1024px]:h-[40vw]'>
      
        <img
          src={OurPhilosophyBg}
          alt=""
          className="w-full h-[40vw] lg:h-[33.854vw] xl:h-[33.854vw] 2xl:h-[33.854vw] object-cover object-position-[0%_-40vw] max-[1024px]:object-position-[0%_50%]"
        />
        <div className="absolute top-[50%] -translate-y-1/2 right-0 px-[11.094vw] max-[1024px]:px-[40px]">
          
            <Heading
              text="our philosophy"
              classes={
                'prata text-black text-[20px] leading-[36px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-left mb-[1.719vw] max-[1024px]:mb-[0px]'
              }
              imageClasses={'max-[1024px]:max-w-[330px] w-[18.542vw]'}
            />
            
            <img
              src={lineImghead}
              alt=""
              className="max-[1024px]:max-w-[141px] lg:w-[18.542vw] xl:w-[18.542vw] 2xl:w-[18.542vw] brightness-0 max-[1024px]:mx-auto"
            />
            <h2 className="text-center text-black font-[500] text-[12px] leading-[36px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[1vw] mb-0 max-[1024px]:pt-[5px]">
            FEWER, BETTER THINGS.
          </h2>
          </div>

        <div className="container mx-auto pt-[7.083vw] max-[1024px]:py-[50px]">
          
          <p className="text-center text-[26px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.979vw] leading-[38px] font-normal lg:w-[75.469vw] xl:w-[75.469vw] 2xl:w-[75.469vw] mx-auto max-[1024px]:text-[16px] max-[1024px]:leading-[26px]">
          We believe in fewer, better things. That the gifts you choose should be beautifully made, deeply personal, and built to last. 
          <br className='max-[1024px]:hidden' />That great design never goes out of style. And that weddings should be a celebration of who you are, not just what you need. 
          <br className='max-[1024px]:hidden' />We’ve curated our collection with intention—partnering with brands who care about craftsmanship, sustainability, and timeless 
          <br className='max-[1024px]:hidden' />appeal. The result? A registry that feels effortless, elevated, and entirely yours.

          </p>
          <br />
        </div>
        <div className="w-full container mx-auto pb-[8.281vw]">
          <div className="flex justify-center pt-[30px] max-[1024px]:pt-0">
            <Link to="/products">
              <Button
                text="BROWSE OUR CURATED COLLECTION   "
                className="text-white font-normal cursor-pointer bg-[#446184] py-[5px] lg:w-[24.219vw] xl:w-[24.219vw] 2xl:w-[24.219vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg max-[1024px]:text-[14px] max-[1024px]:w-full max-[1024px]:h-[40px] max-[1024px]:px-8"
              />
            </Link>
          </div>
        </div>

        <div className="w-full py-16 pb-[10.833vw]">
          <ImageAndText
            direction={'right'}
            imgBanner={teaImg}
            lineimg={lineImg3}
            title="ready?"
            description={<>
              TIMELESS GIFTS.<br />
              THOUGHTFULLY CURATED.<br />
              EXCEPTIONAL SERVICE.
            </>}
            buttontext={'GET STARTED'}
            buttontype={'Color'}
            onClick={handleOpenPopup}
          />
        </div>

        {showPopup && (
          <ModalPortal>
            <Popup onClose={handleClosePopup} />
          </ModalPortal>
        )}

        <Footer />
      </section>
    </>
   
  );
};

export default OurPhilosophy;
