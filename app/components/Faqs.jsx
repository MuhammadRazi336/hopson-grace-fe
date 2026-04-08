import vector14 from '/assets/Images/Vector 14.png';
import faqline from '/assets/Images/faqline.png';
import ButtonComponent from './Button';
import {Link} from '@remix-run/react';
import readMoreIcon from '/assets/Images/next.png';

const Faqs = ({content}) => {

  // Helper function to truncate text by sentences and add clickable "Read More"
  const truncateText = (text, maxSentences = 3) => {
    // Split text by sentence-ending punctuation (. ! ?)
    // This regex splits on periods, exclamation marks, or question marks followed by a space or end of string
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= maxSentences) {
      return text;
    }

    const truncatedSentences = sentences.slice(0, maxSentences);
    const truncatedText = truncatedSentences.join(' ');

    return (
      <>
        {truncatedText}{' '}
        {/* <Link
          to="/faq"
          className="text-[#1F1D1B] flex items-center gap-[8px] max-[1024px]:justify-center cursor-pointer uppercase font-[700] mt-2 text-[1vw] leading-[1.4vw] max-[1024px]:text-[12px] max-[1024px]:leading-[18px]"
        >
          {'Read More'}
          <img src={readMoreIcon} alt="read more icon" className='brightness-0 w-[10px] h-[10px] rotate-270' />
        </Link> */}
      </>
    );
  };
  
  // FAQ data
  const coupleFaqs = [
    {
      number: 1,
      heading: 'How do I find a couple’s registry?',
      paragraph:
        'Simply click Find a Couple on our homepage and enter the couple’s name. You’ll be taken directly to their registry. ',
    },
    {
      number: 2,
      heading: 'When are gifts shipped?',
      paragraph:
        'The Registry will hold your gift(s) and coordinate its delivery to the couple at their request and at a time that suits them — usually after the wedding.',
    },
    {
      number: 3,
      heading: 'Can I contribute to a group gift or fund?',
      paragraph:
        'Absolutely. Many gifts and funds on The Registry allow group contributions, so friends and family can give together. Whether it’s new bedding or a travel fund, you can contribute any amount that feels right.',
    },
    {
      number: 4,
      heading: 'How do I contribute to a couple’s cash fund?',
      paragraph:
        'Giving to a cash fund is as effortless as choosing a product. When viewing a couple’s registry, simply select the fund and enter the amount you’d like to give. Your contribution goes directly toward the couple’s fund, and you’ll have the chance to include a personal message at checkout. Funds are released when the couple is ready, with every contribution securely managed by The Registry.',
    },
  ];

  const generalFaqs = [
    {
      number: 1,
      heading: 'Why choose The Registry?',
      paragraph:
        'Your wedding should reflect your taste and your future. That’s why The Registry offers more than just beautiful gifts. From top-tier brands to bespoke travel and personalized cash funds, we make it easy to create a registry that’s anything but ordinary. Enjoy a seamless experience with a customizable dashboard, gift tracking, and built-in thank-you note management.',
    },
    {
      number: 2,
      heading: 'How does it work?',
      paragraph:
        'Start by creating your registry at your own pace. Once onboarded, you’ll have access to a private dashboard where you can set up your registry page and begin adding gifts. Share your registry with a simple link on your wedding website and track gifts in real time.',
    },
    {
      number: 3,
      heading: 'Can we register in person?',
      paragraph:
        'While we don’t offer in-person appointments, you can easily build your registry online or book a virtual session with a Registry Concierge.',
    },
    {
      number: 4,
      heading: 'Can we register for cash?',
      paragraph:
        'Yes! Create a personalized fund for anything from your honeymoon to a kitchen renovation. Guests pay a small processing fee and you can withdraw funds anytime.',
    },
  ];

  const faqs = content === 'guest' ? coupleFaqs : generalFaqs;
  const faqsBtn = content === 'guest' ? "SEE ALL GUEST FAQS" : "READ ALL";
  const faqsURL = content === 'guest' ? "guests" : "couples";

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
        <div className="flex flex-wrap line-vertical">
          {faqs.map((faq) => (
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
                  {truncateText(faq.paragraph)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full text-center">
          <Link to="/faq" state={{ activeTab: faqsURL }}>
            <ButtonComponent
              className="button-cs text-[#1F1D1B] max-[1024px]:border-2 border-3 border-[#1F1D1B] py-[5px] max-[1024px]:py-[2px] bg-transparent rounded-none mt-2 cursor-pointer lg:mt-[4.688vw] w-80 lg:w-[18.75vw] lg:h-[4.01vw] max-[1024px]:w-[224px] max-[1024px]:h-[44px] max-[1024px]:mt-8"
              text={faqsBtn} 
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
