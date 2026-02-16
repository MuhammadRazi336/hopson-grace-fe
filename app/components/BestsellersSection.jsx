import React from 'react';
import {Link} from '@remix-run/react';
import Heading from '~/components/Heading';
import ProductSlider from '~/components/ProductSlider';
import ButtonComponent from '~/components/Button';
import brandline from '/assets/Images/brandline.png';

const BestsellersSection = ({
  bestsellerProducts = [],
  title = 'the registry bestsellers',
  buttonText = 'BROWSE BESTSELLERS',
  buttonLink = '/products/bestsellers',
  sectionClassName = 'py-[80px] my-12 lg:py-[10.625vw] max-[1024px]:px-0 lg:my-0',
  headingClasses = 'prata text-[22px] leading-[36px] lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center lg:mb-[0.833vw] max-[1024px]:m-0',
  imageClasses = 'max-[1024px]:max-w-[220px] lg:w-[33.021vw] lg:h-[0.450vw]',
  buttonClassName = 'button-cs w-[224px] h-[44px] text-[#1F1D1B] lg:w-[18.75vw] lg:h-[4.01vw] cursor-pointer max-[1024px]:border-2 border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-[2px] bg-transparent rounded-none mt-2 lg:mt-[4.271vw] hover:bg-gray-100',
}) => {
  return (
    <section className={sectionClassName}>
      <Heading
        text={title}
        classes={headingClasses}
        image={brandline}
        imageClasses={imageClasses}
      />
      <ProductSlider products={bestsellerProducts} />
      <div className="text-center">
        <Link to={buttonLink}>
          <ButtonComponent
            text={buttonText}
            className={buttonClassName}
          />
        </Link>
      </div>
    </section>
  );
};

export default BestsellersSection;

