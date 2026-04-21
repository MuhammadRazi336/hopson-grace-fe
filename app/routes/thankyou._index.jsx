import ButtonComponent from '~/components/Button';
import Input from '~/components/Input';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import ImageAndText from '~/components/ImageAndText';
import thankyou from '/assets/Images/thankyou-img.png';
import lineImg3 from '/assets/Images/line.png';
import CheckoutSteps from '~/components/CheckoutSteps';
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

      <CheckoutSteps step={3} />

      <div className="container mx-auto py-[100px]">
        <div className=" bg-[#446184]  py-16 px-16">
          <h2 className="md:text-[36px] font-normal text-center text-white prata">
            <span className="uppercase">Thank You</span> <span className="italic ">for your order</span>
          </h2>
          <div class="flex item-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="29" height="26" viewBox="0 0 29 26" fill="none">
              <path d="M14.5 24.3334C14.5 24.3334 28 17.8684 28 8.04336C27.9883 6.43797 27.4325 4.884 26.4234 3.63536C25.4143 2.38672 24.0115 1.51723 22.4443 1.16896C20.8771 0.820693 19.2381 1.01424 17.7951 1.71797C16.3522 2.4217 15.1905 3.59401 14.5 5.04336C13.8095 3.59401 12.6478 2.4217 11.2049 1.71797C9.76188 1.01424 8.1229 0.820693 6.55569 1.16896C4.98849 1.51723 3.58572 2.38672 2.57661 3.63536C1.56749 4.884 1.01169 6.43797 1 8.04336C1 17.8684 14.5 24.3334 14.5 24.3334Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your will receive a confirmation of your order at your email.
          </p>
          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            The couple is being notified right now of your gift and message. As
            a reminder, your gift will be delivered when and where the couple
            prefers – no action is needed on your end
          </p>

         
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
          description="Visit our sister brand, Hopson Grace, where elevated living meets modern luxury, and <span class='semibold'>unlock 15% off your first order</span>."
          buttontext={'take me there'}
          buttontype={'link'}
          buttonLink={'https://hopsongrace.com/pages/registry-hg-discount'}
          titleClassName='max-w-[500px]'
          buttonClassName="text-black"
        />
      </section>
      <Footer />
    </div>
  );
}
