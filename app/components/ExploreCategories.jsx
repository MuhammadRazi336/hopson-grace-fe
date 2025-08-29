import Heading from './Heading';
import lineImghead from '/assets/Images/line.png';
import product1 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-1.png';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product4 from '/assets/Images/gift-img-collection-1.png';

function ExploreCategories({ collections = [] }) {
  // Filter collections to only show parent collections (parentMetafield.value === 'true')
  const parentCollections = collections.filter(
    (col) => col.parentMetafield?.value === 'true'
  );

  return (
    <section className="bg-[#FAF9F6] py-12  container mx-auto">
      <Heading
        text="explore more categories"
        classes={
          'prata text-2xl lg:text-4xl font-normal text-center max-[1024px]:m-0'
        }
        image={lineImghead}
        imageClasses={'max-[1024px]:max-w-[330px] px-4 '}
      />

      {/* slides here */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-16 gap-x-6 mt-16 mx-10">
        {parentCollections.map((col) => (
          <div key={col.id}>
            <img src={col.image?.url || '/assets/Images/placeholder.png'} alt={col.title} className="w-full h-[500px] object-cover" />
            <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
              {col.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExploreCategories;