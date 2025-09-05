import Heading from './Heading';
import lineImghead from '/assets/Images/line.png';
import product1 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-1.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product4 from '/assets/Images/gift-img-collection-1.png';
import headingCurve from '../assets/Images/heading-bottom-curve.png';

function ExploreCategories({ collections = [] }) {
  // Filter collections to only show parent collections (parentMetafield.value === 'true')
  const parentCollections = collections.filter(
    (col) => col.parentMetafield?.value === 'true'
  );

  return (
    <section className="bg-[#FAF9F6] py-[5.26vw] px-[4.583vw] lg:w-[86.719vw] mx-auto">
      <Heading
        text="explore more categories"
        classes={
          'prata text-2xl lg:text-[2.083vw] lg:leading-[1.979vw] font-normal text-center max-[1024px]:m-0'
        }
        image={headingCurve}
        imageClasses={'max-[1024px]:max-w-[330px]'}
      />

      {/* slides here */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-row-[5.208vw] gap-col-[3.438vw] mt-[5.573vw]">
        {parentCollections.map((col) => (
          <div key={col.id}>
            <img src={col.image?.url || '/assets/Images/placeholder.png'} alt={col.title} className="w-full h-[23.698vw] object-cover" />
            <h3 className="mt-2.5 text-center lg:mt-[1.771vw] uppercase lg:text-[1.25vw] lg:leading-[1.25vw] text-sm font-[500] tracking-wider">
              {col.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExploreCategories;