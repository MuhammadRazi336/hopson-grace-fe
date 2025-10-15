import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import OurPhilosophyBg from '/assets/Images/OurPhilosophyBg.png';
import teaImg from '/assets/Images/tea.png';

const OurPhilosophy = () => {
  return (
    <section>
      <Header />
      <img
        src={OurPhilosophyBg}
        alt=""
        className="w-full h-[400px] lg:h-[27.083vw] xl:h-[27.083vw] 2xl:h-[27.083vw] object-cover"
      />

      <div className="container mx-auto pt-[5vw]">
        <Heading
          text="our philosophy "
          classes={
            'prata text-2xl lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px] lg:w-[18.542vw] xl:w-[18.542vw] 2xl:w-[18.542vw]'}
        />
        <h2 className="text-center font-[500] text-[22px] leading-[36px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] m-0 pt-[1.771vw] pb-[4.427vw]">
          FEWER, BETTER THINGS.
        </h2>
        <p className="text-center text-[26px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.979vw] leading-[38px] font-normal lg:w-[75.469vw] xl:w-[75.469vw] 2xl:w-[75.469vw] mx-auto">
          We believe in fewer, better things. That the gifts you choose should
          be beautifully made, deeply personal, and built to last. That great
          design never goes out of style. And that weddings should be a
          celebration of who you are, not just what you need. We’ve curated our
          collection with intention—partnering with brands who care about
          craftsmanship, sustainability, and timeless appeal. The result? A
          registry that feels effortless, elevated, and entirely yours.
        </p>
        <br />
      </div>
      <div className="w-full container mx-auto pb-16">
        <div className="flex justify-center pt-[30px]">
          <Button
            text="BROWSE OUR CURATED COLLECTION   "
            className="text-white font-normal bg-[#446184] py-[5px] lg:w-[24.219vw] xl:w-[24.219vw] 2xl:w-[24.219vw] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg"
          />
        </div>
      </div>

      <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="ready?"
          description="TIMELESS GIFTS. THOUGHTFULLY CURATED. EXCEPTIONAL SERVICE."
          buttontext={'GET STARTED'}
          buttontype={'Color'}
          buttonLink={'/register'}
        />
      </div>
      <Footer />
    </section>
  );
};

export default OurPhilosophy;
