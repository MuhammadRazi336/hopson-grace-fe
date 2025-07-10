import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import GlassBg from '/assets/Images/GlassBg.png';
import DinnerSetImg from '/assets/Images/DinnerSetImg.png';

const YourRegistryAdvisor = () => {
  return (
    <section>
      <Header />
      <img
        src={GlassBg}
        alt=""
        className="w-full h-[510px] lg:h-[800px] object-cover"
      />

      <div className="container mx-auto py-16">
        <Heading
          text="your registry concierge"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <h2 className="text-center font-semibold text-2xl lg:text-4xl py-16">
          REAL PEOPLE, HERE TO HELP.
        </h2>
        <p className="text-center text-2xl lg:text-3xl font-normal">
          From styling your registry to managing gift fulfillment, our Registry
          Concierge is here to guide you every step of the way. Whether you need
          help choosing the perfect serving bowl, coordinating delivery timing,
          or simply want a second opinion — we’re just a call, email, or chat
          away.
        </p>
        <br />
        <p className="text-center text-2xl lg:text-3xl font-normal py-4">
          Based at our sister store, Hopson Grace in Toronto, our Concierge team
          brings years of experience in weddings, design, gifting, and retail.
        </p>
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

        <h2 className="text-center font-semibold text-2xl lg:text-4xl pt-16">
        QUESTIONS? STYLE DILEMMAS? NOT SURE WHERE TO START?
        </h2>
        <div className="flex justify-center py-16">
          <Button
            text="MEET YOUR REGISTRY CONCIERGE"
            className="text-white bg-[#446184] py-[22px] lg:py-[30px] lg:w-[520px] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg"
          />
        </div>
      </div>

      <div className="w-full py-16">
        <ImageAndText
          direction={'left'}
          imgBanner={DinnerSetImg}
          lineimg={lineImg3}
          title="at your service"
          description="There’s no question too small or request too big for our Registry advisors.  We’re always at your service."
          buttontext={'CONTACT US'}
          buttontype={'Color'}
        />
      </div>
      <Footer />
    </section>
  );
};

export default YourRegistryAdvisor;
