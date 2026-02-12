import React, { useEffect } from 'react';
import { useLocation } from '@remix-run/react';
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
  const location = useLocation();
  
  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const toggleFAQ = (index) => {
    setOpenFAQ((prev) => (prev === index ? null : index));
  };


  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
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
            className={`px-[2.083vw] lg:w-[13.22vw] xl:w-[13.22vw] 2xl:w-[13.22vw] lg:h-[3.125vw] xl:h-[3.125vw] 2xl:h-[3.125vw] text-[0.833vw] cursor-pointer lg:leading-[0.938vw] font-[800] uppercase tracking-[0.48px] transition-all duration-200 max-[1024px]:px-[20px] max-[1024px]:py-[10px] max-[1024px]:text-[12px] ${
              activeTab === 'couples'
                ? 'bg-black text-white'
                : 'bg-white text-black border border-black'
            }`}
          >
            FOR COUPLES
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-[2.083vw] py-[0.833vw] lg:w-[13.22vw] xl:w-[13.22vw] 2xl:w-[13.22vw] lg:h-[3.125vw] xl:h-[3.125vw] 2xl:h-[3.125vw] cursor-pointer text-[0.833vw] lg:leading-[0.938vw] font-[800] uppercase tracking-[0.48px] transition-all duration-200 max-[1024px]:px-[20px] max-[1024px]:py-[10px] max-[1024px]:text-[12px] ${
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                {activeTab === 'couples' ? 'Why choose The Registry?' : "How do I find a couple’s registry?"}
              </h2>
              <AccordionIcon isOpen={openFAQ === 1} />
            </button>
            {openFAQ === 1 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Your wedding should reflect your taste — and your future. That’s why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (and inspiring) to create a registry that’s anything but ordinary.
                    </p>{' '}
                    <br />
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Enjoy a seamless experience with a customizable dashboard, gift tracking, and built-in thank-you note management. Explore our designer-curated Ready-Made Registries or build your own from scratch. After the wedding, enjoy 15% off any items you loved but didn’t receive — and when you’re ready, we’ll ship your gifts free of charge anywhere in continental North America.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    Simply click Find a Couple on our homepage and enter the couple’s name. You’ll be taken directly to their registry.
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'How does it work?'
              ) : (
                'When are gifts shipped?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 2} />
            </button>
            {openFAQ === 2 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Start by creating your registry at your own pace. Once you’re onboarded, you’ll have access to a private dashboard where you can set up your registry page and begin adding gifts.
                    </p>{' '}
                    <br />
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      You’re always welcome to book a one-on-one virtual appointment — whether you want help choosing dinnerware or simply narrowing things down. You’ll be selecting from a curated mix of products, digital gift cards, cash funds, and bespoke travel experiences, with thoughtfully prepared ready-made registries to guide you along the way.
                    </p>{' '}
                    <br />
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Our considered edit means no overwhelm — just intentional choices. When you’re ready, share your registry with a simple link on your wedding website. As gifts are purchased, your dashboard updates automatically with gift values and thank-you reminders.
                    </p>{' '}
                    <br />
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      After your wedding, enjoy 15% off any remaining items on your registry. Nothing ships without your approval.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      The Registry will hold your gift(s) and coordinate its delivery to the couple at their request and at a time that suits them — usually after the wedding.
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
              3.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(3)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'Can we register in person?'
              ) : (
                'Can I contribute to a group gift or fund?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 3} />
            </button>
            {openFAQ === 3 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                  <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    While we don’t offer in-person appointments, you can easily build your registry online or book a virtual session with a Registry Concierge. Think of them as a design guide — someone who helps you make confident decisions, from choosing dinnerware that works together to building a registry that reflects your style, space, and how you actually live.
                  </p>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Absolutely. Many gifts and funds on The Registry allow group contributions, so friends and family can give together. Whether it’s new bedding or a travel fund, you can contribute any amount that feels right.
                    </p>
                  </>
                )}
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'Can We register for cash?'
              ) : (
                'How do I contribute to a couple’s cash fund?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 4} />
            </button>
            {openFAQ === 4 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                <>
                  <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    Yes! Create a personalized fund for anything from your honeymoon to a kitchen renovation or down payment. There’s no cost to you — guests pay a 2.5% processing fee, which covers payment processing and transaction fees.
                  </p>
                  <br />
                  <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    You can withdraw your funds at any time, or wait until after your wedding to receive the full amount. All that’s required is a Canadian or U.S. bank account and a valid physical address, as required for payment verification.
                  </p>
                </>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Giving to a cash fund is as effortless as choosing a product. When viewing a couple’s registry, simply select the fund and enter the amount you’d like to give. Your contribution goes directly toward the couple’s fund, and you’ll have the chance to include a personal message at checkout. Funds are released when the couple is ready, with every contribution securely managed by The Registry.
                    </p>
                  </>
                )}
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'What is Group Gifting?'
              ) : (
                'Do couples see what I’ve given them?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 5} />
            </button>
            {openFAQ === 5 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Group Gifting allows multiple guests to contribute toward higher-ticket items. Just mark any product as a Group Gift and we’ll handle the rest. It’s ideal for larger items like furniture or travel.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Yes! Once your gift is purchased, the couple receives a notification along with your personal message. All gifts and notes are easily tracked in their Registry dashboard, so they can see and thank you once they’re ready.
                    </p>
                  </>
                )}
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'How do your gift cards work?'
              ) : (
                'Can I include a personal message?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 6} />
            </button>
            {openFAQ === 6 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Not sure what to put on your registry? A Registry Gift Card is the perfect option. You can include it in place of a product, giving your guests an easy and flexible way to contribute toward anything you love. Gift card contributions can be used toward any product available on The Registry, so you’ll have the freedom to choose what feels right when the time comes.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Of course. Every gift is accompanied by a digital note card — a small gesture that makes your present even more meaningful.
                    </p>
                  </>
                )}
                
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'How many gifts should I add to my registry?'
              ) : (
                "Can I have the couple's gift shipped to me?"
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 7} />
            </button>
            {openFAQ === 7 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                  We recommend adding around 1.5 gifts per guest to give everyone plenty of choice. The more variety you include — across different categories and price points — the easier it is for guests to find something they'd love to give.
                </p>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      No — gifts purchased through The Registry are sent directly to the couple, not to guests. If you’d like to purchase and receive a gift yourself to hand-deliver to the couple, you can visit our sister store, <a href="https://hopsongrace.com/" className="underline hover:text-gray-600" target="_blank">Hopson Grace</a>, or reach out for support at <a href="mailto:hello@theregistry.ca" className="underline hover:text-gray-600" target="_blank">hello@theregistry.ca</a>
                    </p>
                  </>
                )}
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
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'Can we edit our registry after publishing it?'
              ) : (
                'Can I purchase a gift that’s no longer available?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 8} />
            </button>
            {openFAQ === 8 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    Yes. You can edit your registry anytime. Add or remove gifts, adjust quantities or throw in a few gift cards if you can't decide just yet. Any changes update automatically.
                </p>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      If something you love has been discontinued, we'll suggest a similar item or let you contribute toward a fund instead.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
          <div className='pt-[3.021vw]'>
            <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
              9.
            </h2>
          </div>
          <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
            <button
              onClick={() => toggleFAQ(9)}
              className="w-full flex items-center justify-between cursor-pointer text-left"
            >
              <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
              {activeTab === 'couples' ? (
                'Who can see our registry?'
              ) : (
                'How do I get help?'
              )}
              </h2>
              <AccordionIcon isOpen={openFAQ === 9} />
            </button>
            {openFAQ === 9 && (
              <div className="mt-[1.25vw] transition-all duration-300">
                {activeTab === 'couples' ? (
                <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    You control who sees your registry. Keep it private while you’re setting it up, and make it visible when you’re ready to share. Once it’s live, guests can access it only through your unique link or by searching your names on The Registry. You can also add a hyperlink to your wedding website, making it easy for guests to find your registry in one click. And if you ever want to make changes or take a break, you can unpublish your registry at any time.
                </p>
                ) : (
                  <>
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      We're available to help with any questions, from navigating the site to choosing the perfect gift. Reach us anytime at <a href="mailto:hello@theregistry.ca" className="underline hover:text-gray-600" target="_blank">hello@theregistry.ca</a>.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {activeTab === 'couples' ? (
          <>
            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  10.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(10)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    How do we track who gave what?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 10} />
                </button>
                {openFAQ === 10 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Your dashboard automatically records each gift and note as it’s purchased. You’ll have an organized list ready for thank-you notes — no guesswork required.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  11.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(11)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    Can we exchange our gifts?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 11} />
                </button>
                {openFAQ === 11 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      You can edit or swap items anytime before your registry is fulfilled. Since gifts ship after your wedding, there’s plenty of time to make changes. Once items have shipped, all sales are final — unless a product arrives damaged or incorrect.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  12.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(12)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    What happens if a product becomes unavailable?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 12} />
                </button>
                {openFAQ === 12 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      If an item is discontinued or temporarily out of stock, we’ll reach out to offer alternatives or convert the value into a credit toward another item on your list if you prefer not to wait. You’ll always have options before finalizing your order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  13.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(13)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    What's your return policy?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 13} />
                </button>
                {openFAQ === 13 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Because each order is prepared specifically for you, we’re unable to accept returns or exchanges after fulfillment. If an item arrives damaged or incorrect, simply fill in our return request form within 7 days of delivery. We’ll replace it right away and cover the return shipping — at no cost to you.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  14.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(14)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    Where do you ship, and how much does it cost?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 14} />
                </button>
                {openFAQ === 14 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      As a registry couple, you’ll receive two complimentary shipments—perfect for sending your gifts when and where you need them. Standard shipping fees apply after your two free deliveries.  We ship to most addresses within Canada and the continental United States.  At this time, we’re unable to ship to Alaska, Hawaii, Puerto Rico, U.S. territories, or Canada’s northern regions (Yukon, Nunavut, Northwest Territories). Please note: all transactions are processed in Canadian dollars. Guests paying with U.S. credit cards will see the conversion on their bank or credit card statement. U.S. shipments may be subject to duties and taxes determined by U.S. customs. 
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  15.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(15)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    Is there a financial guarantee for cash funds?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 15} />
                </button>
                {openFAQ === 15 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      The Registry uses secure, third-party fund management to safeguard your cash fund at every step. All contributions are processed through Stripe, one of the world’s most trusted payment providers, and held in deposit with a Canadian chartered bank until the couple is ready to withdraw them. Couples can rest assured knowing that every contribution made through The Registry is safe, traceable, and honoured in full.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  16.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(16)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    How do I access my funds after the wedding?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 16} />
                </button>
                {openFAQ === 16 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                      Accessing your cash funds is seamless. Request a withdrawal from your dashboard and receive your funds within 5 business days. Two withdrawals are on us; additional transfers include a small processing fee. 
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row 2xl:flex-row gap-[4.115vw] max-[1024px]:flex-row">
              <div className='pt-[3.021vw]'>
                <h2 className="prata text-4xl min-w-[80px] mb-0 lg:text-[4.792vw] lg:leading-[1.875vw] font-normal text-left max-[1024px]:min-w-[40px]">
                  17.
                </h2>
              </div>
              <div className="flex-1 pt-[3.021vw] border-b border-[#000000] pb-[3.854vw]">
                <button
                  onClick={() => toggleFAQ(17)}
                  className="w-full flex items-center justify-between cursor-pointer text-left"
                >
                  <h2 className="text-xl lg:text-[1.25vw] xl:text-[1.5vw] 2xl:text-[1.5vw] uppercase lg:leading-[1.875vw] tracking-[1.2px] mb-0 font-[600] pr-4 max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:w-[90%]">
                    What currency will my guests be charged in?
                  </h2>
                  <AccordionIcon isOpen={openFAQ === 17} />
                </button>
                {openFAQ === 17 && (
                  <div className="mt-[1.25vw] transition-all duration-300">
                    <p className="text-xl lg:text-[1.25vw] lg:leading-[1.875vw] font-[400] lg:w-[50.781vw] xl:w-[50.781vw] 2xl:w-[50.781vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    All transactions are processed in Canadian dollars. Guests outside Canada will see the conversion on their bank or credit card statement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}

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
