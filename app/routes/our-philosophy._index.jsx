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
        className="w-full h-[510px] lg:h-[800px] object-cover"
      />

      <div className="container mx-auto py-16">
        <Heading
          text="our philosophy "
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <h2 className="text-center font-[500] text-[22px] leading-[36px] lg:text-[22px] leading-[36px] py-16">
          FEWER, BETTER THINGS.
        </h2>
        <p className="text-center text-[26px] lg:text-[26px] leading-[38px] font-normal">
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
      <div className="w-full container mx-auto py-16">
        <img
          src={RegistryLogo}
          alt=""
          className="w-[100px] object-cover mx-auto"
        />
        <img
          src={lineImghead}
          alt=""
          width={100}
          height={100}
          className="object-cover mx-auto"
        />

        <h2 className="text-center tracking-[0.8px] font-[500] text-[22px] lg:text-[22px] leading-[32px] pt-[41px]">
        DISCOVER THE BRANDS & PRODUCTS THAT REFLECT  <br/>OUR ‘FEWER, BETTER THINGS’ PHILOSOPHY
        </h2>
        <div className="flex justify-center pb-16 pt-[30px]">
          <Button
            text="BROWSE OUR CURATED COLLECTION   "
            className="text-white font-normal bg-[#446184] py-[22px] lg:py-[21.5px] lg:w-[465px] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg"
          />
        </div>
      </div>

      <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="are you ready?"
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
