import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import Heading from '~/components/Heading';
import lineImg3 from '/assets/Images/line.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import ShowroomImg from '/assets/Images/showroom.png';
import lineImghead from '/assets/Images/line.png';

const MeetOurTeam = () => {
  return (
    <section>
      <Header />
      <img
        src={ShowroomImg}
        alt=""
        className="w-full h-[510px] lg:h-[27.083vw] object-cover"
      />

      <div className="mx-auto px-[12.24vw] py-[5vw]">
        <Heading
          text="meet our sister store"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <h2 className="text-center font-[500] text-2xl lg:text-[1.146vw] m-0 lg:leading-[1.875vw] pb-[4.427vw] pt-[1.667vw]">
          HOPSON GRACE
        </h2>
        <p className="text-center text-2xl lg:text-[1.354vw] lg:leading-[1.979vw] font-normal">
          The Registry was born out of Hopson
          Grace, Toronto’s destination for beautifully curated homewares,
          design-forward essentials, and timeless gifts. Hopson Grace is where
          modern entertaining meets considered design. Whether you're looking
          for an espresso cup, a serving platter, or a Belgian modular sofa this
          is where you'll find it.
        </p>
      </div>
      <div className="mx-auto px-[12.24vw]">
        <h2 className="text-center font-semibold text-2xl lg:text-[1.146vw] lg:leading-[1.875vw]">
          BEYOND THE WEDDING
        </h2>
        <p className="text-center text-2xl lg:text-[1.354vw] lg:leading-[1.979vw] font-normal">
          Like what you see? Many of the pieces featured on The Registry are
          also available at Hopson Grace. Discover beautiful home essentials and
          timeless gifts perfect for post-wedding life and every chapter that
          follows.
        </p>
        <div className="flex justify-center pt-[2.292vw]">
          <Button
            text="TAKE ME THERE"
            className="text-white font-[500] text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] bg-[#446184] py-[22px] lg:py-[5px] lg:w-[17.292vw] lg:h-[4.063vw] cursor-pointer mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg"
          />
        </div>
      </div>

      <div className="w-full py-[9.063vw]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="questions?"
          description="We’ve got answers."
          buttontext={'PHONE, EMAIL OR LIVE CHAT'}
          buttontype={'Color'}
          buttonLink={'/contact-us'}
          sx={{
            button: {
              backgroundColor: 'transparent',
              color: '#1F1D1B',
              border: '2px solid #1F1D1B',
            },
          }}
        />
      </div>
      <Footer />
    </section>
  );
};

export default MeetOurTeam;
