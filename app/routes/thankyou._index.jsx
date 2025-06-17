import ButtonComponent from '~/components/Button';
import Input from '~/components/Input';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import ImageAndText from '~/components/ImageAndText';
import thankyou from '/assets/Images/thankyou-img.png';
import lineImg3 from '/assets/Images/line.png';

export default function ThankYou() {
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

      <div className="max-w-4xl mx-auto mt-[80px]">
        <div className="flex items-center justify-around">
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Add your messsage
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">2.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Billing & Payment
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-[100px]">
        <div className=" bg-[#446184]  py-16 px-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            <span className="font-italic">Thank You</span> for your order
          </h2>

          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your will receive a confirmation of your order at xxx@xxx.
          </p>
          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            The couple is being notified right now of your gift and message. As
            a reminder, your gift will be delivered when and where the couple
            prefers – no action is needed on your end
          </p>

          <div className="flex justify-center mt-8">
            {/* CTA Button */}
            <button className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black w-[350px] max-[1601px]:w-[350px] text-center">
              view order confirmation
            </button>
          </div>
        </div>
      </div>
      <div className="mb-8"></div>
      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'left'}
          imgBanner={thankyou}
          lineimg={lineImg3}
          title="did you see 
something you loved? "
          description="Visit our sister brand, Hopson Grace, where elevated living meets modern luxury, and unlock 15% off your first order."
          buttontext={'take me there'}
          buttontype={'link'}
        />
      </section>
      <Footer />
    </div>
  );
}
