import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';

export default function CheckoutFlow() {
  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      <div className=" p-4 mt-[80px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          need <span className="prata uppercase">support</span>
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />
        <p className="max-w-xl mx-auto text-center  my-5 font-normal leading-relaxed">
          Enjoy one-time free shipping after the wedding—just let us know when
          you're ready. Prefer to receive something sooner? You can ship gifts
          anytime; standard shipping rates will apply.
        </p>
      </div>

      <div className="mb-16"></div>
      <section className="container mx-auto mb-10">
        <div className="flex lg:gap-8 gap-2 items-stretch">
          <div className="lg:w-[40%] w-1/2">
            <img
              src="/assets/Images/ship-my-gifts.png"
              alt="Image Banner"
              className="max-[1024px]:h-full object-cover object-[80%]"
            />
          </div>
          <div className="bg-[#446184] -bottom-10 -left-16 py-16 relative flex items-center justify-center flex-col lg:w-[60%] w-1/2 max-[768px]:p-10">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full max-w-[410px] text-center">
                READY TO SHIP?
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%]"
              />
              <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center text-white">
                ​ One free shipment of all your gifts is included. If you’d like
                any gifts in the meantime, ​standard shipping rates apply.
              </p>
              <div>
                <button className=" font-bold bg-white text-black px-6 mt-3 py-4 text-sm  hover:bg-gray-100">
                  FULFILL MY REGISTRY & SHIP MY GIFTS
                </button>
              </div>
            </div>
            <div className="mt-14 flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white lg:text-5xl 2xl:text-xl 3xl:w-full max-w-[410px] text-center">
                WANT TO DECIDE IN PERSON?
              </h3>
              <img
                src="/assets/Images/white-bdr.png"
                alt="lineimg"
                className="mb-2 mt-2 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[30%] mx-auto"
              />
              <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center text-white">
                Book a virtual call or showroom appointment ​ to see your gifts
                live before making you final decisions.
              </p>
              <div>
                <button className=" font-bold bg-white text-black px-6 mt-3 py-4 text-sm hover:bg-gray-100">
                  BOOK AN APPOINTMENT
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-[120px]"></div>

      <div className="container  mx-auto flex flex-col items-center justify-center">
        <img
          src="/assets/Images/registrylogoSteps.png"
          alt="Image Banner"
          className="max-[1024px]:h-full object-cover object-[80%]"
        />
        <h3 className="text-xl text-center mt-10">
          DIDN’T GET EVERYTHING ON YOUR LIST?
        </h3>
        <p className="text-sm lg:text-xl  max-w-[488px] mt-4 mb-4 text-center ">
          Take advantage of our 15% discount, a one-time opportunity to complete
          your registry.
        </p>
        <div>
          <button className="border mb-20 font-bold bg-white text-black px-6 mt-3 py-4 text-sm hover:bg-gray-100">
            KEEP SHOPPING
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
