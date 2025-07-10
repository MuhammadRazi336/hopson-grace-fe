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
         A smarter, more stylish way to register—curated for how couples live now.
        </p>
      </div>

      <div className='mb-16'>
        <FeaturesGrid/>
      </div>

      <div className='w-full py-16'>
      <ImageAndText
        direction={'right'}
        imgBanner={teaImg}
        lineimg={lineImg3}
        title="are you ready?"
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
