import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import {useState} from 'react';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import ImageAndText from '~/components/ImageAndText';
import CheckoutSteps from '~/components/CheckoutSteps';
export default function CheckoutFlow() {
  const cartItems = [
    {
      name: 'Coluna Fruit Bowl',
      price: 125,
      size: 'Medium',
      image: '/assets/Images/product-image.png',
    },
    {
      name: 'Marble Butter Keeper',
      price: 80,
      image: '/assets/Images/product-image.png',
    },
    {
      name: 'Belle-V Icecream Scoop',
      price: 95,
      image: '/assets/Images/product-image.png',
    },
    {
      name: 'Staub Cast Iron Q4',
      price: 430,
      image: '/assets/Images/product-image.png',
    },
  ];
  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      <div className=" p-4 mt-[100px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          your <span className="prata uppercase">gifts</span>
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          Your gift(s) from Wendy and Roger Pearlman
        </p>
      </div>

      <div className="xl:mx-20 pt-8 mx-6">
        <div className="container mx-auto bg-[#446184]  py-16">
          <div className="flex flex-wrap">
            <div className="xl:w-5/12 w-full">
              <h4 className="text-xl text-white text-center uppercase">
                Gift details
              </h4>
            </div>
            <div className="xl:w-7/12 w-full">
              <h4 className="text-xl text-white text-center uppercase">note</h4>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="xl:w-5/12 w-full">
              <div className="max-h-[440px] overflow-y-auto bg-[#FAF9F6]  px-4 py-2">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center py-3 border-b border-[#ececec] last:border-b-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[99px] h-[99px] object-cover mr-8"
                    />
                    <div className="flex-1">
                      <div className="font-bold uppercase text-md leading-tight tracking-wide">
                        {item.name.split(' ').map((word, i, arr) =>
                          i % 3 === 0 && i !== 0 ? (
                            <>
                              <br />
                              {word}{' '}
                            </>
                          ) : (
                            word + ' '
                          ),
                        )}
                      </div>
                      {item.size && (
                        <div className="text-sm text-gray-600 mt-1">
                          Size, {item.size}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-600 mt-1">
                        CONTRIBUTION AMOUNT
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <div className="text-xl  text-black">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="xl:w-7/12 w-full">
              <div className="relative max-w-4xl mx-auto ">
                <img
                  src="/assets/Images/checkout-bg.png"
                  alt="checkout-flow"
                  className="w-full object-contain"
                />
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="flex items-center justify-start h-full flex-row">
                    <div
                      className={`w-9/12 xl:pl-16 pl-8  xl:pt-16 pt-8 
                  }`}
                    >
                      <img
                        src="/assets/Images/greeting-flower-checkout.png"
                        alt="checkout-bg-1"
                        className="w-[15%] xl:w-auto h-auto mx-auto xl:mb-6 md:mb-4 lg:mb-4 mb-1"
                      />

                      <PreviewForm />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-x-4 mt-12">
          <button className="border border-gray-700 px-6 py-4 text-base font-medium hover:bg-gray-100 w-full max-w-xs">
            SENT BY MAIL MARK COMPLETE
          </button>
          <button className=" text-white font-bold py-4 px-6 bg-[#446184] rounded-none cursor-pointer w-full max-w-xs">
            SEND EMAIL THANK YOU
          </button>
        </div>
      </div>

      <div className="mb-16"></div>
      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="questions? "
          description="We've got answers."
          buttontext={'PHONE, EMAIL OR LIVE CHAT'}
          buttontype={'Color'}
        />
      </section>

      <Footer />
    </div>
  );
}

const PreviewForm = () => {
  return (
    <div className="relative max-w-4xl mx-auto max-h-[290px] overflow-y-hidden">
      <h3 className="text-center italic text-3xl sm:text-2xl font-bold prata">
        jo & jon
      </h3>

      <p className="text-center prata italic leading-relaxed text-xl sm:text-lg xl:mt-4 md:mt-5 mt-5">
        We cannot wait to celebrate you as you embark on this most exciting next
        chapter of your lives together. We love you always and are here for you
        everyday along the way.
      </p>
      <p className="text-center prata italic text-xl sm:text-lg mt-6">
        All our love,
      </p>
      <p className="text-center prata italic text-xl sm:text-lg mt-2">
        Aunty Jess & Uncle Paul
      </p>
    </div>
  );
};
