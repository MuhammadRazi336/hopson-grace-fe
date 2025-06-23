import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';

export default function CheckoutFlow() {
  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      <div className=" p-4 mt-[80px]">
        <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          <span className="prata uppercase">SHIP</span> my gifts
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
      <section className="container mx-auto pb-10">
        <div className="flex lg:gap-8 gap-2 items-stretch">
          <div className="lg:w-[60%] w-1/2">
            <img
              src="/assets/Images/ship-my-gifts.png"
              alt="Image Banner"
              className="max-[1024px]:h-full object-cover object-[80%]"
            />
          </div>
          <div className="bg-[#F5F2ED] py-16 relative flex items-center justify-center flex-col lg:w-[40%] w-1/2 max-[768px]:p-10">
            <h3 className="text-2xl lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center">
              Your Title
            </h3>
            <img
              src="/assets/Images/line.png"
              alt="lineimg"
              className="mb-8 mt-8 max-[768px]:m-1 max-[768px]:w-[170px] 2xl:w-[50%]"
            />
            <p className="text-sm lg:text-2xl leading-normal lg:leading-[44px] max-w-[488px] mt-4 mb-4 text-center">
              A description goes here.
            </p>
            <div>
              <button className="text-lg py-4 lg:py-[30px] w-full lg:w-[320px] mt-4 lg:mt-8 text-white bg-[#446184] rounded-none font-mono">
                Click Me
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
