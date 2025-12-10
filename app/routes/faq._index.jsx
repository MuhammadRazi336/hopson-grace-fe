import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import faqBg from '/assets/Images/faqcouple.jpg';
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
import ModalPortal from '~/components/ModalPortal';
import AccordionIcon from '~/components/AccordionIcon';

const FAQ = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('couples'); // 'couples' or 'guests'
  const [openFAQ, setOpenFAQ] = useState(1); // Start with first FAQ open (null to start with none open)
  
  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const toggleFAQ = (index) => {
    setOpenFAQ((prev) => (prev === index ? null : index));
  };
  
  return (
    <section>
      <Header />

      {/* Hero Section with Background Image and Text Overlay */}
      <div className="relative w-full h-[510px] lg:h-[27.083vw] max-[1024px]:h-[300px]">
        <img
          src={faqBg}
          alt=""
          className="w-full h-full object-cover object-position-[0%_-40vw] max-[1024px]:object-center"
        />
        {/* Heading with underline - Left aligned on image */}
        <div className="absolute top-[50%] -translate-y-1/2 left-0 px-[11.094vw] pb-[2.083vw] max-[1024px]:px-[20px] max-[1024px]:pb-[20px]">
          <h1 className="prata text-white text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-left mb-[1.042vw] max-[1024px]:text-[20px] max-[1024px]:mb-[0px]">
            frequently asked questions
          </h1>
          <img
            src={lineImghead}
            alt=""
            className="max-[1024px]:max-w-[250px] lg:w-[32.24vw] lg:h-[0.400vw] brightness-0 invert"
          />
        </div>
      </div>

      {/* Toggle Buttons - Centered below image */}
      <div className="w-full flex justify-center pt-[2.083vw] pb-[4.167vw] mx-auto max-[1024px]:pt-[30px] max-[1024px]:pb-[40px]">
        <div className="flex gap-[1.719vw] max-[1024px]:gap-[15px]">
          <button
            onClick={() => setActiveTab('couples')}
            className={`px-[2.083vw] text-[0.833vw] cursor-pointer lg:leading-[0.938vw] font-[800] uppercase tracking-[0.48px] transition-all duration-200 max-[1024px]:px-[20px] max-[1024px]:py-[10px] max-[1024px]:text-[12px] ${
              activeTab === 'couples'
                ? 'bg-black text-white'
                : 'bg-white text-black border border-black'
            }`}
          >
            FOR COUPLES
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-[2.083vw] py-[0.833vw] cursor-pointer text-[0.833vw] lg:leading-[0.938vw] font-[800] uppercase tracking-[0.48px] transition-all duration-200 max-[1024px]:px-[20px] max-[1024px]:py-[10px] max-[1024px]:text-[12px] ${
              activeTab === 'guests'
                ? 'bg-black text-white'
                : 'bg-white text-black border border-black'
            }`}
          >
            FOR GUESTS
          </button>
        </div>
      </div>

      {/* FAQ Content Section */}
      <div className="w-full h-fit pt-[2.083vw] px-[11.094vw] max-[1024px]:px-[20px] max-[1024px]:pt-[40px]">
        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              1.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(1)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                {activeTab === 'couples' ? 'Why Choose The Registry?' : "How Can I Find a Couple's Registry?"}
              </h2>
              <AccordionIcon isOpen={openFAQ === 1} />
            </button>
            {openFAQ === 1 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Your wedding should reflect your taste and your future. That's why
                      The Registry offers more than just beautiful gifts. From top-tier
                      brands to bespoke travel and personalized cash funds, we make it
                      easy (and inspiring) to create a registry that's anything but
                      ordinary.
                    </p>{' '}
                    <br />
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Enjoy a seamless experience with tools like a customizable
                      dashboard, gift tracker, and thank-you note manager. Browse our
                      designer curated Ready-Made Registries or build your own from
                      scratch. After the wedding, take advantage of our 15% Newlywed
                      Discount for any items you wanted but didn't receive and when
                      you're ready, we'll ship your gifts free of charge, anywhere in
                      continental North America.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Finding a couple's registry is easy! Simply use the "Find a Couple" search feature on our homepage. You can search by the couple's names, or if they've shared their registry link with you, you can access it directly.
                    </p>{' '}
                    <br />
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Once you find their registry, you'll be able to browse all the items they've selected, contribute to cash funds or group gifts, and purchase items directly. The couple will be notified when you make a purchase, and you can add a personal message with your gift.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              2.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(2)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                How Does it Work?
              </h2>
              <AccordionIcon isOpen={openFAQ === 2} />
            </button>
            {openFAQ === 2 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  Create your registry at your own pace, or let us guide you with a one-on-one virtual appointment. Register online or book an
                  appointment at our Toronto showroom.
                </p>{' '}
                <br />
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  You can choose from curated products, digital gift cards, cash
                  funds (like a honeymoon or home reno), and bespoke travel
                  experiences all in one place. Our curated edit means no overwhelm
                  just intentional choices.
                </p>{' '}
                <br />
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  When you're ready to share your registry, simply make it visible
                  and add the link to your wedding website. As gifts are purchased,
                  you'll be notified, and your dashboard will update automatically
                  with gift values and thank-you reminders.
                </p>{' '}
                <br />
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  After your wedding, enjoy 15% off remaining items on your list.
                  We'll help you finalize your order, and nothing ships without your
                  approval.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              3.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(3)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                Can We Register in Person?
              </h2>
              <AccordionIcon isOpen={openFAQ === 3} />
            </button>
            {openFAQ === 3 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  While we don't offer in-person appointments, you can easily build
                  your registry online or book a virtual session with our Registry
                  Concierge we'll walk you through everything.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              4.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(4)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                Can We Register for Cash?
              </h2>
              <AccordionIcon isOpen={openFAQ === 4} />
            </button>
            {openFAQ === 4 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  Yes! Set up a personalized fund for anything from your honeymoon
                  to a kitchen reno or down payment. There's no cost to you just a
                  2.5% processing fee for guests, which covers Stripe's transaction
                  fee.
                </p>
                <br />
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  You can withdraw your cash at any time or wait until after your
                  wedding to receive the full amount. All you need is a Canadian or
                  U.S. bank account and address.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              5.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(5)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                What is Group Gifting?
              </h2>
              <AccordionIcon isOpen={openFAQ === 5} />
            </button>
            {openFAQ === 5 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  Group Gifting allows multiple guests to contribute toward
                  higher ticket items. Just mark any product as a Group Gift and
                  we'll handle the rest. It's ideal for larger items like furniture
                  or travel.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              6.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(6)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                Can we Exchange Our Gifts?
              </h2>
              <AccordionIcon isOpen={openFAQ === 6} />
            </button>
            {openFAQ === 6 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  Yes, this is one of the best features of our registry. You can
                  edit your list anytime before confirming your final order. Since
                  we don't ship gifts until after the wedding, you have the
                  flexibility to swap items, adjust quantities, or choose something
                  entirely different once the celebrations are over.
                </p>
                <br />
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  It's a seamless way to get exactly what you want without the
                  hassle of returns or exchanges. We recommend reviewing your list
                  carefully after the wedding to avoid unnecessary returns. Please
                  note that Special Order items are final sale and not eligible for
                  exchange.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              7.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(7)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                What's your return policy?
              </h2>
              <AccordionIcon isOpen={openFAQ === 7} />
            </button>
            {openFAQ === 7 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  If an item arrives damaged or defective, we'll replace it and
                  cover the return shipping no cost to you. For all other returns,
                  shipping fees will apply. We recommend finalizing your registry
                  carefully after the wedding to avoid the need for returns wherever
                  possible. Items must be returned within 60 days of receipt.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              8.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(8)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                Where do you Ship, and How Much does it cost?
              </h2>
              <AccordionIcon isOpen={openFAQ === 8} />
            </button>
            {openFAQ === 8 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  As a registry couple, you'll receive two complimentary
                  shipments perfect for sending your gifts when and where you need
                  them. Within Canada: We ship anywhere in Canada. As a registry
                  couple, you'll receive two complimentary shipments perfect for
                  sending your gifts when and where you need them. Standard shipping
                  fees may apply after your two free deliveries. To the United
                  States: We ship to most U.S. addresses within the continental
                  United States. Please note: all transactions are processed in
                  Canadian dollars. Guests paying with U.S. credit cards will see
                  the conversion at checkout. U.S. shipments may be subject to
                  duties and taxes determined by U.S. customs. These are the
                  responsibility of the recipient. We'll confirm details with you
                  before shipping your order to ensure there are no surprises. At
                  this time, we're unable to ship to Alaska, Hawaii, Puerto Rico,
                  U.S. territories, or Canada's northern regions (Yukon, Nunavut,
                  Northwest Territories).
                </p>
              </div>
            )}
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
          <p className="text-center text-1xl lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] pt-[2.865vw] pb-[1.875vw] max-[1024px]:py-[20px]">
            READY TO START YOUR REGISTRY?
          </p>
          <div className="flex justify-center">
            {/* <NavLink to="/register"> */}
              <Button onClick={handleOpenPopup}
                text="Let's Go"
                className="text-white font-[500] tracking-[0.8px] text-[18px] leading-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] bg-[#446184] py-0 lg:w-[20.677vw] lg:h-[4.063vw] mx-auto w-[280px] rounded-none button-cs max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[200px] max-[1024px]:h-[40px]"
              />
            {/* </NavLink> */}
            {showPopup && (
              <ModalPortal>
                <Popup onClose={handleClosePopup} />
              </ModalPortal>
            )}
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
