import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import { Footer } from '~/components/Footer';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/tea.png';
import lineImg3 from '/assets/Images/line.png';
import FeaturesGrid from '~/components/FeaturesGrid';

const WhyTheRegistry = () => {
  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className='w-full h-fit bg-[#FAF9F6]'>

      <div className="container mx-auto py-16">
        <Heading
          text="why the registry?"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center text-2xl lg:text-3xl font-normal py-16">
         Your wedding isn’t ordinary. Your registry shouldn’t be either.
        </p>
      </div>

      <div className='mb-16'>
        <FeaturesGrid/>
      </div>

      </div>

      <div className='w-full py-16'>
      <ImageAndText
        direction={'right'}
        imgBanner={teaImg}
        lineimg={lineImg3}
        title="ready?"
        description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
        buttontext={'GET STARTED'}
        buttontype={'Color'} 
        />
      </div>
      <Footer/> 
    </section>
  );
};

export default WhyTheRegistry;
