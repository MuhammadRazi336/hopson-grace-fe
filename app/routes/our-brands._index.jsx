import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import BrandImages from '~/components/BrandImages';
import BrandNames from '~/components/BrandNames';

const OurBrands = () => {
  return (
    <section>
      <Header />

      <div className='w-full h-[2px] bg-black'></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="our brands"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-center text-2xl lg:text-3xl font-normal mt-16 w-[80%] lg:w-[60%] mx-auto">
          Only the best make the list. From iconic heritage names to local
          artisans and emerging designers, every brand on The Registry is chosen
          for quality, craftsmanship and lasting appeal. Our curated collection
          reflects a global point of view and a belief in design-forward,
          functional products. Browse our A-Z brand directory below.
        </p>

        <div className='w-full flex justify-center py-[100px]'>
            <div className='w-[70%] h-fit px-16'>
                <BrandImages/>
           </div>
           <div className='w-[30%] h-fit px-16'>
                <BrandNames/>
           </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default OurBrands;
