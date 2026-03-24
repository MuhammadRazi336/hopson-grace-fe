import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import lineImg3 from '/assets/Images/line.png';
import ImageAndText from '~/components/ImageAndText';
import SpoonImg from '/assets/Images/SpoonImg.png';
import WeddingRegistrySteps from '~/components/WeddingRegistrySteps';
import Popup from '~/components/Popup';
import ModalPortal from '~/components/ModalPortal';
import {useState} from 'react';

const HowItWorks = () => {
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

      <div className="container mx-auto py-16 pb-0">
        <Heading
          text="how it works"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center text-2xl lg:text-[1.25vw] lg:max-w-[55.729vw] lg:mx-auto lg:leading-[1.875vw] font-normal py-16 pb-0 max-[1024px]:text-xl max-[1024px]:pt-8">
           Creating your registry is simple. Just follow the steps below to see
          how it all comes together.
        </p>
      </div>

      <div className="w-full py-16 container mx-auto">
        <WeddingRegistrySteps />
      </div>

      <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={SpoonImg}
          lineimg={lineImg3}
          title="ready?"
          description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
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
  );
};

export default HowItWorks;
