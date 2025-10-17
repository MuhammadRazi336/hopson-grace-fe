import vector14 from '/assets/Images/Vector 14.png';
import faqline from '/assets/Images/faqline.png';
import moreImg from '/assets/Images/more.png';
import {useState, useEffect} from 'react';
import ButtonComponent from './Button';
import { Link } from '@remix-run/react';

const Faqs = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleFaqs = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine how many items to show initially based on screen size
  const initialItemsCount = isMobile ? 2 : 4;

  const faqs = [
    {
      number: 1,
      heading: 'WHY CHOOSE THE REGISTRY?',
      paragraph:
        "Your wedding should reflect your taste— and your future. That's why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy (...)",
    },
    {
      number: 2,
      heading: 'HOW DOES IT WORK?',
      paragraph:
        "Once you sign up, you'll be guided through creating your registry page and adding gifts, funds, and experiences. Register online or book an appointment at our Toronto showroom. (...)",
    },
    {
      number: 3,
      heading: 'CAN WE REGISTER IN PERSON?',
      paragraph:
        'Absolutely. You can set up your registry online, Let our concierge help set up, manage or fulfill your registry. with one of our advisors, or visit us in person at our Toronto showroom. Ready to start your registry? Click Here.',
    },
    {
      number: 4,
      heading: 'CAN WE REGISTER FOR CASH?',
      paragraph:
        "Yes! Set up a personalized fund for anything from your honeymoon to a kitchen reno or down payment. There's no cost to you — only a 2.5% processing fee to guests, which covers Stripe's transaction fee. (...)",
    },
    {
      number: 5,
      heading: 'WHAT IS GROUP GIFTING?',
      paragraph:
        "Group Gifting allows multiple guests to contribute toward higher-ticket items. Just mark any product as a Group Gift and we'll handle the rest. Ready to start your registry? Click here.",
    },
    {
      number: 6,
      heading: 'CAN WE EXCHANGE OUR GIFTS?',
      paragraph:
        'Of course. You can make changes to your registry at any time before confirming your final order — most couples fine-tune their list after the wedding for maximum flexibility.Ready to start your registry? Click here.',
    },
  ];

  return (
    <div
      className="max-w-[1560px] px-4 mx-auto flex items-center flex-col"
      id="faq-section"
    >
      <h2 className="prata text-center text-[22px] leading-[36px] lg:text-[2.5vw] lg:leading-[1.875vw] font-normal mb-0">
        frequently asked questions
      </h2>
      <img
        src={vector14}
        alt=""
        className="mt-11 mb-[4.792vw] lg:w-[43.125vw] max-[1024px]:my-2 max-[1024px]:w-[278px] max-[440px]:w-[250px]"
      />
      <div className="faq-section flex flex-col max-[1024px]:gap-2">
        <div
          className={`flex flex-wrap ${
            isExpanded ? 'line-vertical-extend' : 'line-vertical'
          }`}
        >
          {faqs.slice(0, initialItemsCount).map((faq) => (
            <div
              className="flex w-full lg:w-1/2 mt-0 max-[1024px]:mt-10 px-[3.906vw] max-[1024px]:flex-col max-[1024px]:justify-center max-[1024px]:items-center "
              key={faq.number}
            >
              <div className="prata font-normal text-[5.104vw] lg:w-[4.427vw] lg:min-w-[4.427vw] leading-[5.104vw] text-center vertical-align-middle mr-10 max-[1024px]:text-[44px] max-[1024px]:m-0 max-[1024px]:mb-[15px]">
                {faq.number}.
              </div>
              <div className="max-[1024px]:w-[300px]">
                <h4 className="font-medium text-[1.458vw] leading-[1.875vw] tracking-[5%] vertical-align-middle mb-[2.604vw] mt-[1vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:mb-[8px] max-[1024px]:text-center">
                  {faq.heading}
                </h4>
                <p className="font-normal text-[1.25vw] leading-[1.875vw] mb-[4.583vw] tracking-normal vertical-align-middle max-[1024px]:text-[12px] max-[1024px]:leading-[18px] max-[1024px]:text-center">
                  {faq.paragraph}
                </p>
              </div>
            </div>
          ))}
          {isExpanded &&
            faqs.slice(initialItemsCount).map((faq) => (
              <div
                className="flex w-full lg:w-1/2 mt-0 max-[1024px]:mt-10 px-[3.906vw] max-[1024px]:flex-col max-[1024px]:justify-center max-[1024px]:items-center"
                key={faq.number}
              >
                <div className="prata font-normal text-[5.104vw] lg:w-[4.427vw] lg:min-w-[4.427vw] leading-[5.104vw] text-center vertical-align-middle mr-10 max-[1024px]:text-[44px] max-[1024px]:m-0 max-[1024px]:mb-[15px]">
                  {faq.number}.
                </div>
                <div className="max-[1024px]:w-[300px]">
                  <h4 className="font-medium text-[1.458vw] leading-[1.875vw] tracking-[5%] vertical-align-middle mb-[2.604vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:mb-[8px] max-[1024px]:text-center">
                    {faq.heading}
                  </h4>
                  <p className="font-normal text-[1.25vw] leading-[1.875vw] mb-[4.583vw] tracking-normal vertical-align-middle max-[1024px]:text-[12px] max-[1024px]:leading-[18px] max-[1024px]:text-center">
                    {faq.paragraph}
                  </p>
                </div>
              </div>
            ))}
        </div>
        {isExpanded && (
          <div className="w-full text-center">
            <Link to="/faq">
            <ButtonComponent
              className="button-cs text-[#1F1D1B] border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-[2px] bg-transparent rounded-none mt-2 cursor-pointer lg:mt-[4.688vw] w-80 lg:w-[18.75vw] lg:h-[4.01vw] max-[1024px]:w-[224px] max-[1024px]:h-[44px] max-[1024px]:mt-8"
              text={'SEE ALL FAQS'}
            />
            </Link>
          </div>
        )}
      </div>

      <div className="more-less mt-[45px]">
        <button
          className="flex items-center flex-col"
          onClick={() => {
            toggleFaqs();
            if (isExpanded) {
              const faqSection = document.getElementById('faq-section');
              if (faqSection) {
                faqSection.scrollIntoView({behavior: 'smooth'});
              }
            }
          }}
        >
          <span className='lg:text-[1.146vw] font-[500] uppercase max-[1024px]:text-[12px] max-[1024px]:leading-[32px]'>{isExpanded ? 'Less' : 'More'}</span>
          <img
            src={moreImg}
            alt=""
            className={`${isExpanded ? 'rotate-180 max-[1024px]:w-[12px] max-[1024px]:h-[12px]' : 'max-[1024px]:w-[14px] max-[1024px]:h-[14px]'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default Faqs;
