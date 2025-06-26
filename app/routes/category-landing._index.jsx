import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import product3 from '/assets/Images/gift-img-collection-1.png';
import product2 from '/assets/Images/gift-img-collection-2.png';
import product1 from '/assets/Images/gift-img-collection-3.png';
import product4 from '/assets/Images/gift-img-collection-4.png';
import youll1 from '/assets/Images/youll-1.png';
import youll2 from '/assets/Images/youll-2.png';
import youll3 from '/assets/Images/youll-3.png';
import nextitem from '/assets/Images/next.png';
import {useState} from 'react';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import Heading from '~/components/Heading';
import CustomTab from '~/components/CustomTab';
import ButtonComponent from '~/components/Button';
import lineImghead from '/assets/Images/line.png';
import brandline from '/assets/Images/brandline.png';
import ProductSlider from '~/components/ProductSlider';
import PreviewRegistry from '~/components/PreviewRegistry';

export default function CategoryLanding() {
  const tabsData = [
    {
      label: 'REAL REGISTRIES',
      value: 1,
      route: 'realregistries',
    },
    {
      label: 'THEMED REGISTRIES',
      value: 2,
      route: 'themedregistries',
    },
    {
      label: 'LOREM IPSUM',
      value: 3,
      route: 'lorem',
    },
  ];
  const products = [
    {
      id: 1,
      name: 'Marble Butter Keeper',
      price: '$80.00',
      image: '/assets/Images/gift-prod-1.png',
    },
    {
      id: 2,
      name: 'Belle-V Icecream Scoop',
      price: '$95.00',
      image: '/assets/Images/gift-prod-2.png',
    },
    {
      id: 3,
      name: 'Staub Cast Iron Q4',
      price: '$430.00',
      image: '/assets/Images/gift-prod-3.png',
    },
    {
      id: 4,
      name: 'Marble Butter Keeper',
      price: '$80.00',
      image: '/assets/Images/gift-prod-1.png',
    },
    {
      id: 5,
      name: 'Belle-V Icecream Scoop',
      price: '$95.00',
      image: '/assets/Images/gift-prod-2.png',
    },
    {
      id: 6,
      name: 'Staub Cast Iron Q4',
      price: '$430.00',
      image: '/assets/Images/gift-prod-3.png',
    },
    {
      id: 7,
      name: 'Marble Butter Keeper',
      price: '$80.00',
      image: '/assets/Images/gift-prod-1.png',
    },
    {
      id: 8,
      name: 'Belle-V Icecream Scoop',
      price: '$95.00',
      image: '/assets/Images/gift-prod-2.png',
    },
    {
      id: 9,
      name: 'Staub Cast Iron Q4',
      price: '$430.00',
      image: '/assets/Images/gift-prod-3.png',
    },
  ];
  return (
    <div className="">
      <Header />
      <div className="pt-[80px] relative p-4 mt-[80px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          <span className="prata uppercase">Add</span> or{' '}
          <span className="prata uppercase">edit gifts</span>
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          Browse by category, filter by price, or get inspired with our curated
          edits. Add, update, or switch things up whenever you like.
        </p>

        <PreviewRegistry />
      </div>

      <section className=" ">
        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className=" ">
            <div className="z-10 swiper-button-prev-prod absolute  left-[1%] max-[1601px]:-left-[0%] cursor-pointer text-white uppercase  max-[1601px]:w-[90px] items-center bg-white top-[45%] px-8 py-10  justify-center max-[1024px]:w-[33px]">
              <img src={nextitem} alt="" className="rotate-180 size-6" />
            </div>

            <Swiper
              spaceBetween={15}
              slidesPerView={3.25} // Shows 3 full + a portion of 4th
              centeredSlides={true} // Enables .5 on both sides
              loop={true}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-prod',
                prevEl: '.swiper-button-prev-prod',
              }}
              className="px-[178px]"
              breakpoints={{
                345: {
                  slidesPerView: 1.25,
                  spaceBetween: 10,
                  centeredSlides: true,
                },
                475: {
                  slidesPerView: 2.25,
                  spaceBetween: 15,
                  centeredSlides: true,
                },
                768: {
                  slidesPerView: 2.25,
                  spaceBetween: 20,
                  centeredSlides: true,
                },
                1024: {
                  slidesPerView: 2.75,
                  spaceBetween: 30,
                  centeredSlides: true,
                },
                1366: {
                  slidesPerView: 3.25,
                  spaceBetween: 39,
                  centeredSlides: true,
                },
                1600: {
                  slidesPerView: 3.5,
                  spaceBetween: 39,
                  centeredSlides: true,
                },
              }}
            >
              {/* slides here */}
              <SwiperSlide>
                <img src={product1} alt="New Arrival" className="w-full" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  New Arrival
                </h3>
              </SwiperSlide>
              <SwiperSlide>
                <img src={product2} alt="Tableware" className="w-full" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  Tableware
                </h3>
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src={product3}
                  alt="Staub Cast Iron Q4"
                  className="w-full"
                />
                <h3 className="mt-2.5 text-center uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  glassware & bareware
                </h3>
              </SwiperSlide>
              <SwiperSlide>
                <img src={product4} alt="New arrivals" className="w-full" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  New arrivals
                </h3>
              </SwiperSlide>
              <SwiperSlide>
                <img src={product1} alt="tableware" className="w-full" />
                <h3 className="mt-2.5 text-center lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  tableware
                </h3>
              </SwiperSlide>
            </Swiper>
            <div className="swiper-button-next-prod absolute  right-[1%] max-[1601px]:-right-[0%] cursor-pointer  uppercase max-[1601px]:w-[90px] items-center bg-white z-10 top-[45%] px-8 py-10  justify-center text-white max-[1024px]:w-[33px]">
              <img src={nextitem} className="size-6" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-10">
          <SidebarFilter />
          <ProductGrid products={products} />
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full xl:w-1/4 "> </div>
          <div className="w-full xl:w-3/4 flex flex-col items-center">
            <p className="text-center text-md my-10">LOADING 12 of 427</p>

            <WhiteThemeButton Text="View more" link="/quick-start-guide" />

            <button className="border-b mx-auto cursor-pointer mb-20 font-bold bg-white text-black px-6 mt-3 text-sm hover:bg-gray-100">
              Back to Top
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#FAF9F6] py-8">
        <Heading
          text="Ready-Made Registries"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <CustomTab tabsData={tabsData} />
        <div className="text-center">
          <ButtonComponent
            text="EXPLORE SAMPLE REGISTRIES"
            className="button-cs text-black border-3 border-black py-4 lg:py-[30px] bg-transparent rounded-none mt-11"
          />
        </div>
      </section>

      <section className="py-[70px]  my-12 lg:my-[240px] container">
        <Heading
          text="bestsellers"
          classes={
            'prata text-3xl lg:text-5xl font-normal text-center  max-[1024px]:m-0'
          }
          image={brandline}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <ProductSlider />
        <div className="text-center">
          <ButtonComponent
            text="browse bestsellers"
            className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[30px] max-[1024px]:py-4 bg-transparent rounded-none mt-2 lg:mt-11"
          />
        </div>
      </section>

      <section className="bg-[#FAF9F6] pt-12 pb-8 mb-[100px]">
        <Heading
          text="we think you’ll love"
          classes={
            'prata text-2xl lg:text-4xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />

        <div className=" relative items-start mt-[105px] mb-10 max-[1024px]:my-10">
          <div className=" 2xl:max-w-[1560px] xl:max-w-[1100px] lg:max-w-[767px] max-[1600px]:max-w-[80%] max-w-[85%] mx-auto">
            <div className="swiper-button-prev-prod absolute top-0 left-[0] max-[1601px]:-left-[0%] cursor-pointer uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  h-[19.5vw] max-[768px]:h-[41.35vw] justify-center max-[1024px]:w-[33px]">
              <img src={nextitem} alt="" className="rotate-180 " />
              <span className="-rotate-90 text-black block tracking-wider max-[1024px]:hidden">
                more
              </span>
            </div>

            <Swiper
              spaceBetween={15}
              slidesPerView={3}
              loop={true}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-prod',
                prevEl: '.swiper-button-prev-prod',
              }}
              className="px-[178px]"
              breakpoints={{
                345: {
                  spaceBetween: 10,
                  centeredSlides: true,
                },
                475: {
                  spaceBetween: 15,
                  centeredSlides: true,
                },
                768: {
                  spaceBetween: 20,
                  centeredSlides: true,
                },
                1024: {
                  spaceBetween: 30,
                  centeredSlides: true,
                },
                1366: {
                  spaceBetween: 39,
                  centeredSlides: true,
                },
                1600: {
                  spaceBetween: 39,
                  centeredSlides: true,
                },
              }}
            >
              {/* slides here */}
              <SwiperSlide>
                <img src={youll1} alt="New Arrival" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  ARKE GLASS BOTTLE FOR CARBONATOR PRO
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll2} alt="Tableware" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  SMEG TOASTER, 2 SLICE
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll3} alt="Staub Cast Iron Q4" className="w-full" />
                <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  THE BARISTA TOUCH ESPRESSO MAKER
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll1} alt="New arrivals" className="w-full" />
                <h3 className="mt-2.5  lg:mt-[30px] uppercase lg:text-2xl text-sm font-medium tracking-wider">
                  ARKE GLASS BOTTLE FOR CARBONATOR PRO
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
              <SwiperSlide>
                <img src={youll2} alt="Staub Cast Iron Q4" className="w-full" />
                <h3 className="mt-2.5  uppercase lg:mt-[30px]  lg:text-2xl text-sm font-medium tracking-wider">
                  THE BARISTA TOUCH ESPRESSO MAKER
                </h3>
                <p className="lg:text-2xl text-sm">$95</p>
              </SwiperSlide>
            </Swiper>
            <div className="swiper-button-next-prod absolute top-0 right-[0] max-[1601px]:right-0 cursor-pointer  uppercase flex w-[139px] max-[1601px]:w-[90px] items-center  max-[768px]:h-[41.35vw] h-[19.5vw] justify-center text-white max-[1024px]:w-[33px]">
              <span className="rotate-90 text-black block tracking-wider max-[1024px]:hidden">
                more
              </span>
              <img src={nextitem} className="" alt="" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SidebarFilter() {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    styles: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full xl:w-1/4 p-6 h-fit bg-[#FAF9F6]">
      <div className="mb-6">
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('categories')}
        >
          Product Categories
          <span className="text-lg">
            {openSections.categories ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-3 h-3 rotate-270"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-3 h-3 rotate-90"
              />
            )}
          </span>
        </h2>
        {openSections.categories && (
          <ul className="space-y-2 text-sm">
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                New Arrivals
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Tableware
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Glassware & Barware
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Kitchen & Pantry
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Decor & Furniture
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Bed and Bath
              </label>
            </li>
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('brands')}
        >
          Our Brands
          <span className="text-lg">
            {openSections.brands ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-3 h-3 rotate-270"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-3 h-3 rotate-90"
              />
            )}
          </span>
        </h2>
        {openSections.brands && (
          <p className="text-sm text-gray-500 italic">No data</p>
        )}
      </div>

      <div>
        <h2
          className="text-sm font-bold uppercase mb-2 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('styles')}
        >
          Shop by Style
          <span className="text-lg">
            {openSections.styles ? (
              <img
                src="/assets/Images/next.png"
                alt="minus"
                className="w-3 h-3 rotate-270"
              />
            ) : (
              <img
                src="/assets/Images/next.png"
                alt="plus"
                className="w-3 h-3 rotate-90"
              />
            )}
          </span>
        </h2>
        {openSections.styles && (
          <ul className="space-y-2 text-sm">
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Modern Farmhouse
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Art Deco
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Garden
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Bohemian
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Traditional
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" className="mr-2" />
                Shop All
              </label>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

function ProductGrid({products}) {
  return (
    <div className="w-full xl:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-0 p-4">
      {products.map((product) => (
        <div key={product.id} className="text-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[300px] object-cover mb-4"
          />
          <h3 className="text-sm font-semibold uppercase">{product.name}</h3>
          <p className="text-sm mt-1">{product.price}</p>
        </div>
      ))}
    </div>
  );
}
