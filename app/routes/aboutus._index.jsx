import React from 'react';
import AboutUsBg from '/assets/Images/AboutUsBg.png';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import ImageAndText from '~/components/ImageAndText';
import BottleImg from '/assets/Images/BottleImg.png';
import lineImg3 from '/assets/Images/line.png';

const AboutUs = () => {
  return (
    <section>
      <Header />
      <img
        src={AboutUsBg}
        alt=""
        className="w-full h-[510px] lg:h-[800px] object-cover"
      />

      <div className="container mx-auto py-16">
        <Heading
          text="about us"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <h2 className="text-center font-semibold text-2xl lg:text-4xl py-16">
          ELEVATED, EFFORTLESS, YOURS.
        </h2>
        <p className="text-center text-2xl lg:text-3xl font-normal">
          After years of working with engaged couples at our sister store,
          Hopson Grace, we noticed a shift: couples still wanted beautiful,
          lasting things—but they wanted to build their registries online
          without compromising on style, service, or experience. So we created
          <span className="font-bold">
            {' '}
            The Registry: a digital destination that marries ease with elegance.
          </span>{' '}
        </p>
        <br />
        <p className="text-center text-2xl lg:text-3xl font-normal py-4">
          Where thoughtful design meets exceptional quality. Where registries
          feel less like checklists and more like reflections of who you are—and
          the life you're building together. We’ve curated timeless pieces,
          iconic brands and meaningful extras—from bespoke honeymoon experiences
          to flexible cash funds—so you can build a registry that reflects your
          taste, values, and lifestyle. Use our tools to build it your way, or
          lean on our team for support and inspiration.
        </p>
        <br />
        <p className="text-center text-2xl lg:text-3xl font-normal">
          <span className="font-bold">Our philosophy?</span> Fewer, better
          things. A registry that’s elevated and personal. And a wedding gift
          experience that’s as thoughtful as the day itself.
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
          READY TO START BUILDING A REGISTRY?
        </h2>
        <p className="text-center text-2xl lg:text-3xl font-normal pt-2">
          Create your account or book a virtual appointment to get started.
        </p>
        <div className="flex justify-center py-16">
          <Button
            text="Let's Go"
            className="text-white bg-[#446184] py-[22px] lg:py-[30px] lg:w-[320px] mx-auto w-[280px] rounded-none button-cs max-[768px]:text-lg"
          />
        </div>
      </div>
      
      <div className='w-full py-16'>
        <ImageAndText
        direction={'left'}
        imgBanner={BottleImg}
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

export default AboutUs;
