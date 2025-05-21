import {Footer} from '~/components/Footer';
import HeroSlider from '~/components/HeroSlider';
import Textandbutton from '~/components/Textandbutton';
import SliderItems from '~/components/SliderItems';
import ImageAndText from '~/components/ImageAndText';
import dogImg from '/assets/Images/dog.png';
import showroomImg from '/assets/Images/showroom.png';
import cupImg from '/assets/Images/cups.png';
import teaImg from '/assets/Images/tea.png';
import lineImg from '/assets/Images/line.png';
import lineImg2 from '/assets/Images/Vector 24.png';
import lineImg3 from '/assets/Images/Vector 23.png';
import lineImg4 from '/assets/Images/Vector 14.png';
import Faqs from '~/components/Faqs';
import CollectionItems from '~/components/CollectionItems';
import CustomTab from '~/components/CustomTab';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import brandline from '/assets/Images/brandline.png';
import ButtonComponent from '~/components/Button';
import Marquee from '~/components/Marquee';
import ProductSlider from '~/components/ProductSlider';
import Testimonialslider from '~/components/Testimonialslider';

const Home = () => {
  const tabsData = [
    {
      label: 'REAL REGISTRIES',
      value: 1,
      route: 'realregistries',
    },
    {
      label: 'THEMED REGISTRIES',
      value: 2,
      route: 'themedregistries',
    },
    {
      label: 'LOREM IPSUM',
      value: 3,
      route: 'lorem',
    },
  ];
  return (
    <div>
      <section className="hero-slider">
        <HeroSlider />
      </section>
      <section className="text-and-button-section py-14 lg:py-36">
        <Textandbutton />
      </section>
      <section className="lg:mb-[240px]">
        <CollectionItems />
      </section>

      <section className="mb-[90px]">
        <ImageAndText
          direction={'right'}
          imgBanner={cupImg}
          lineimg={lineImg}
          stepsCheck={true}
          title="How It Works"
          description="There's no question too small or request too big for our Registry advisors. We're always at your service."
          buttontext={'CREATE YOUR REGISTRY'}
          buttontype={'Color'}
        />
      </section>

      <section>
        <Heading
          text="Ready-Made Registries"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <CustomTab tabsData={tabsData} />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE SAMPLE REGISTRIES"
            className="button-cs text-[#446184] border-3 border-[#446184] py-4 lg:py-[30px] bg-transparent rounded-none mt-11"
          />
        </div>
      </section>

      <section className="py-[70px] bg-[#F5F2ED80] my-12 lg:my-[240px]">
        <Heading
          text="A Few of Our Brands"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImg4}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <Marquee />
        <div className="text-center">
          <ButtonComponent
            text="BROWSE BESTSELLERS"
            className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-4 lg:py-[30px] bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section>

      <section className="py-[70px]  my-12 lg:my-[240px] container">
        <Heading
          text="The Registry Bestsellers"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <ProductSlider />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE ALL BRANDS"
            className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section>

      <section className="mb-[70px]">
        <Heading
          text="Feel The Love"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[230px]'}
        />
        <Testimonialslider />
      </section>

      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'left'}
          imgBanner={dogImg}
          lineimg={lineImg}
          title="At Your Service"
          description={
            <>
              There's no question too small or request too big for our Registry
              advisors.
              <br />
              <br />
              We're always at your service.
            </>
          }
          buttontext={'CONTACT US'}
          buttontype={'link'}
        />
      </section>

      <section className="max-[1024px]:py-10">
        <Faqs />
      </section>

      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'left'}
          imgBanner={showroomImg}
          lineimg={lineImg2}
          title="Visit Our Toronto Showroom"
          description="Not in Toronto? We offer the same level of exceptional service in one of our virtual gift registry appointments."
          buttontext={'BOOK NOW'}
          buttontype={'link'}
        />
      </section>

      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="Your Ultimate Registry"
          description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
          buttontext={'GET STARTED'}
          buttontype={'Color'}
        />
      </section>
      <Footer />
    </div>
  );
};

export default Home;
