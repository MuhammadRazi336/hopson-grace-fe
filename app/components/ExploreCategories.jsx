import Heading from './Heading';
import lineImghead from '/assets/Images/line.png';
import product1 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-1.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product4 from '/assets/Images/gift-img-collection-1.png';
import headingCurve from '../assets/Images/heading-bottom-curve.png';
import { Link } from '@remix-run/react';

function ExploreCategories({ collections = [] }) {
  // Filter collections to only show parent collections (parentMetafield.value === 'true')
  const parentCollections = collections.filter(
    (col) => col.parentMetafield?.value === 'true'
  );

  return (
    <section className="bg-[#FAF9F6] py-[5.208vw] px-[4.583vw] lg:w-[90.938%] xl:w-[90.938%] 2xl:w-[90.938%] mx-auto">
      <Heading
        text="explore more categories"
        classes={
          'prata text-2xl lg:text-[2.083vw] xl:text-[2.083vw] 2xl:text-[2.083vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
        }
        image={headingCurve}
        imageClasses={'max-[1024px]:max-w-[330px] lg:w-[27.24vw] xl:w-[27.24vw] 2xl:w-[27.24vw]'}
      />

      {/* slides here */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-row-[5.208vw] gap-col-[3.438vw] mt-[5.313vw]">
        {parentCollections.map((col) => (
          <Link key={col.id} to={`/products/${col.handle}`} className="hover:no-underline group">
            <div className="cursor-pointer">
              <img 
                src={col.image?.url || '/assets/Images/placeholder.png'} 
                alt={col.title} 
                className="w-[450px] h-[450px] object-cover cursor-pointer hover:opacity-80 transition-opacity" 
              />
              <h3 className="mt-2.5 text-center lg:mt-[1.771vw] uppercase lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw] text-sm font-bold tracking-wider cursor-pointer hover:text-gray-600 transition-colors">
                {col.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ExploreCategories;