import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
 import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import ShowroomImg from '/assets/Images/showroom.png';

const MeetOurTeam = () => {
  return (
    <section>
      <Header />
      <img
        src={ShowroomImg}
        alt=""
        className="w-full h-[510px] lg:h-[800px] object-cover"
      />

      <div className="container mx-auto py-16">
        <Heading
          text="meet our sister store"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <h2 className="text-center font-semibold text-2xl lg:text-4xl py-16">
          HOPSON GRACE
        </h2>
        <p className="text-center text-2xl lg:text-3xl font-normal">
          The Registry was born out of Hopson Grace, Toronto’s destination for
          beautifully curated homewares, design-forward essentials, and timeless
          gifts. Hopson Grace is where modern entertaining meets considered
          design. Whether you're looking for an espresso cup, a serving platter,
          or a Belgian modular sofa—this is where you'll find it.
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
        PERFECT FOR POST-WEDDING LIFE
        </h2>
        <p className="text-center text-2xl lg:text-3xl font-normal pt-2">
        Visit Hopson Grace for beautiful home essentials and timeless gifts.
        </p>
        <div className="flex justify-center py-16">
          <Button
            text="TAKE ME THERE"
            className="text-white bg-[#446184] py-[22px] lg:py-[30px] lg:w-[320px] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg"
          />
        </div>
      </div>

      <div className="w-full py-16">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
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

export default MeetOurTeam;
