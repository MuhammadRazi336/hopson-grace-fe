import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import faqBg from '/assets/Images/faqBg.png';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import Button from '~/components/Button.jsx';
import {Navigate} from '@remix-run/react';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import {NavLink} from '@remix-run/react';
import LiveChat from '~/components/LiveChat';
import { useState } from 'react';
import Popup from '~/components/Popup';

const FAQ = () => {
  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  return (
    <section>
      <Header />

      <img
        src={faqBg}
        alt=""
        className="w-full h-[510px] lg:h-[27.083vw] object-cover"
      />

      <div className="w-full h-fit pt-[6.615vw]">
        <Heading
          text="frequently asked questions"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={
            'max-[1024px]:max-w-[330px] lg:w-[32.24vw] lg:h-[0.400vw]'
          }
        />

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[7.396vw] px-[11.094vw] ">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              1.
            </h2>
          </div>
          <div className="">
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              Why Choose The Registry?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              Your wedding should reflect your taste and your future. That’s why
              The Registry offers more than just beautiful gifts. From top-tier
              brands to bespoke travel and personalized cash funds, we make it
              easy (and inspiring) to create a registry that’s anything but
              ordinary.
            </p>{' '}
            <br />
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              Enjoy a seamless experience with tools like a customizable
              dashboard, gift tracker, and thank-you note manager. Browse our
              designer curated Ready-Made Registries or build your own from
              scratch. After the wedding, take advantage of our 15% Newlywed
              Discount for any items you wanted but didn’t receive and when
              you’re ready, we’ll ship your gifts free of charge, anywhere in
              continental North America.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[5.833vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              2.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              How Does it Work?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              Create your registry at your own pace, or let us guide you with a one-on-one virtual appointment. Register online or book an
              appointment at our Toronto showroom.
            </p>{' '}
            <br />
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              You can choose from curated products, digital gift cards, cash
              funds (like a honeymoon or home reno), and bespoke travel
              experiences all in one place. Our curated edit means no overwhelm
              just intentional choices.
            </p>{' '}
            <br />
            <p className="text-xl lg:text-2xl">
              When you're ready to share your registry, simply make it visible
              and add the link to your wedding website. As gifts are purchased,
              you’ll be notified, and your dashboard will update automatically
              with gift values and thank-you reminders.
            </p>{' '}
            <br />
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              After your wedding, enjoy 15% off remaining items on your list.
              We’ll help you finalize your order, and nothing ships without your
              approval.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[5.833vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              3.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              Can We Register in Person?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              While we don’t offer in-person appointments, you can easily build
              your registry online or book a virtual session with our Registry
              Concierge we’ll walk you through everything.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[5.833vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              4.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              Can We Register for Cash?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              Yes! Set up a personalized fund for anything from your honeymoon
              to a kitchen reno or down payment. There’s no cost to you just a
              2.5% processing fee for guests, which covers Stripe’s transaction
              fee.
            </p>
            <br />
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              You can withdraw your cash at any time or wait until after your
              wedding to receive the full amount. All you need is a Canadian or
              U.S. bank account and address.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[5.833vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              5.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              What is Group Gifting?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              Group Gifting allows multiple guests to contribute toward
              higher ticket items. Just mark any product as a Group Gift and
              we’ll handle the rest. It’s ideal for larger items like furniture
              or travel.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[7.396vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              6.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              Can we Exchange Our Gifts?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              Yes, this is one of the best features of our registry. You can
              edit your list anytime before confirming your final order. Since
              we don’t ship gifts until after the wedding, you have the
              flexibility to swap items, adjust quantities, or choose something
              entirely different once the celebrations are over.
            </p>
            <br />
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              It’s a seamless way to get exactly what you want without the
              hassle of returns or exchanges. We recommend reviewing your list
              carefully after the wedding to avoid unnecessary returns. Please
              note that Special Order items are final sale and not eligible for
              exchange.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[5.833vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              7.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              What's your return policy?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              If an item arrives damaged or defective, we’ll replace it and
              cover the return shipping no cost to you. For all other returns,
              shipping fees will apply. We recommend finalizing your registry
              carefully after the wedding to avoid the need for returns wherever
              possible. Items must be returned within 60 days of receipt.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[4.115vw] pt-[5.833vw] px-[11.094vw]">
          <div>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left">
              8.
            </h2>
          </div>
          <div>
            <h2 className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] tracking-[1.2px] mb-[1.25vw] font-[600]">
              Where do you Ship, and How Much does it cost?
            </h2>
            <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[63.75vw]">
              As a registry couple, you’ll receive two complimentary
              shipments perfect for sending your gifts when and where you need
              them. Within Canada: We ship anywhere in Canada. As a registry
              couple, you’ll receive two complimentary shipments perfect for
              sending your gifts when and where you need them. Standard shipping
              fees may apply after your two free deliveries. To the United
              States: We ship to most U.S. addresses within the continental
              United States. Please note: all transactions are processed in
              Canadian dollars. Guests paying with U.S. credit cards will see
              the conversion at checkout. U.S. shipments may be subject to
              duties and taxes determined by U.S. customs. These are the
              responsibility of the recipient. We’ll confirm details with you
              before shipping your order to ensure there are no surprises. At
              this time, we’re unable to ship to Alaska, Hawaii, Puerto Rico,
              U.S. territories, or Canada’s northern regions (Yukon, Nunavut,
              Northwest Territories).
            </p>
          </div>
        </div>

        <div className="mx-auto w-full h-fit pt-[8.854vw]">
          <img
            src={RegistryLogo}
            alt=""
            className="w-[103.48px] object-cover mx-auto"
          />
          <img
            src={lineImghead}
            alt=""
            width={100}
            height={100}
            className="object-cover mx-auto"
          />
          <p className="text-center text-1xl lg:text-2xl pt-[2.865vw] pb-[1.875vw]">
            READY TO START YOUR REGISTRY?
          </p>
          <div className="flex justify-center">
            {/* <NavLink to="/register"> */}
              <Button onClick={handleOpenPopup}
                text="Let's Go"
                className="text-white font-[500] tracking-[0.8px] text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] bg-[#446184] py-0 lg:w-[20.677vw] lg:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs"
              />
            {/* </NavLink> */}
            {showPopup && <Popup onClose={handleClosePopup} />}
          </div>
        </div>

        <div className="w-full py-[9.375vw]">
          <ImageAndText
            direction={'right'}
            imgBanner={teaImg}
            lineimg={lineImg3}
            title=" questions?"
            description="We've got answers."
            showLiveChat={true}
            liveChatProps={{
              buttonText: 'PHONE, EMAIL OR LIVE CHAT',
              showTitle: false,
              showDescription: false,
              className: 'bg-[#446184] text-white hover:bg-[#3a4f6b]',
            }}
          />
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default FAQ;
