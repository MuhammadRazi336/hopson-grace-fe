import Heading from './Heading';
import lineImghead from '/assets/Images/line.png';
import product1 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product3 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';


function ExploreCategories() {
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
        <div>
          <img src={product1} alt="New Arrival" className="w-full" />
          <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
            New Arrival
          </h3>
        </div>
        <div>
          <img src={product2} alt="Tableware" className="w-full" />
          <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
            Tableware
          </h3>
        </div>
        <div>
          <img src={product3} alt="Staub Cast Iron Q4" className="w-full" />
          <h3 className="mt-2.5 text-center uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
            glassware & bareware
          </h3>
        </div>
        <div>
          <img src={product4} alt="New arrivals" className="w-full" />
          <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
            New arrivals
          </h3>
        </div>
        <div>
          <img src={product1} alt="tableware" className="w-full" />
          <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
            tableware
          </h3>
        </div>
        <div>
          <img src={product2} alt="Tableware" className="w-full" />
          <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
            Tableware
          </h3>
        </div>
      </div>
    </section>
  );
}

export default ExploreCategories;
