import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import {useState} from 'react';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import ImageAndText from '~/components/ImageAndText';
import CheckoutSteps from '~/components/CheckoutSteps';
export default function CheckoutFlow() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      <div className=" p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5"> checkout</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div>

      <CheckoutSteps step={1} />

      <div className="xl:mx-20 py-[100px] mx-6">
        <div className="container mx-auto bg-[#446184]  py-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            encloses your <span className="font-italic">PERSONAL MESSAGE</span>{' '}
            here
          </h2>

          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your message and gift notification will be sent to the couple
            immediately upon completion of your order.
          </p>

          <div className="relative max-w-4xl mx-auto ">
            <img
              src="/assets/Images/checkout-bg.png"
              alt="checkout-flow"
              className="w-full object-contain"
            />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="flex items-center justify-start h-full flex-row">
                <div
                  className={`w-9/12 xl:pl-16 pl-8  ${
                    !showPreview ? 'xl:pt-16 pt-8 ' : 'pt-10'
                  }`}
                >
                  <img
                    src="/assets/Images/greeting-flower-checkout.png"
                    alt="checkout-bg-1"
                    className="w-[15%] xl:w-auto h-auto mx-auto xl:mb-8 mb-1"
                  />

                  {!showPreview ? <MessageForm /> : <PreviewForm />}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className=" text-[#223247] border-b border-[#223247 ] cursor-pointer font-bold text-lg  mx-auto mt-5 block"
          >
            SAVE AND PREVIEW
          </button>

          <div className="flex items-center gap-x-12 mt-8 justify-center">
            <h4 className="text-[60px] text-white  text-center ">1</h4>
            <h4 className="text-[30px] text-white  text-center ">/</h4>
            <h4 className="text-[30px] text-white  text-center ">3</h4>
          </div>
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
      <h3 className="text-center text-3xl sm:text-2xl italic font-bold prata">
        jo & jon
      </h3>

      <p className="text-center prata italic leading-relaxed text-xl sm:text-lg mt-10">
        We cannot wait to celebrate you as you embark on this most exciting next
        chapter of your lives together. We love you always and are here for you
        everyday along the way.
      </p>
      <p className="text-center prata italic text-xl sm:text-lg mt-6">All our love,</p>
      <p className="text-center prata italic text-xl sm:text-lg mt-2">
        Aunty Jess & Uncle Paul
      </p>
    </div>
  );
};

const MessageForm = () => {
  return (
    <div>
      <input
        type="text"
        placeholder="Couples Name*"
        className="w-full prata text-sm sm:text-xl md:text-2xl text-center mx-auto mb-2 sm:mb-4 border border-gray-300 rounded py-0 sm:py-2 bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
      <div className="w-full flex justify-center">
        <div className="w-full">
          <textarea
            placeholder="Your Message here...*"
            maxLength={500}
            className="w-full xl:h-40 md:h-32 h-[70px] border italic border-gray-300 prata text-sm sm:text-lg md:text-xl text-center outline-none p-1 sm:p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 text-left">
            500/500 characters remaining
          </div>
        </div>
      </div>
    </div>
  );
};
