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

      <div className="container mx-auto pt-[8.958vw]">
        <Heading
          text="why the registry?"
          classes={
            'prata text-[30px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] w-[20.521vw]'}
        />
        
      </div>

      <div className='mb-[7.917vw]'>
        <FeaturesGrid/>
      </div>

      </div>

      <div className='w-full pt-16 pb-[7.813vw]'>
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
