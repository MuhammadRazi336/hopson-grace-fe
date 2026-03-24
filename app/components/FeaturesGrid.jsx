// import {
//     Monitor,
//     CreditCard,
//     Plane,
//     BarChart3,
//     List,
//     Users,
//     Percent,
//     Truck,
//     Heart,
//     Lightbulb,
//     Home,
//   } from "lucide-react"

import WorldBestBrands from '/assets/Images/WORLDSBESTBRANDSW.png';
import CashTravel from '/assets/Images/CASHTRAVELW.png';
import BespokeTravel from '/assets/Images/BESPOKETRAVELW.png';
import TYNote from '/assets/Images/TYNOTEW.png';
import ReadyMadeRegistries from '/assets/Images/READYMADEICONW.png';
import GropGift from '/assets/Images/GROUPGIFT.png';
import NEWLYWED from '/assets/Images/NEWLYWED.png';
import FREESHIPPING from '/assets/Images/FREESHIPPING.png';
import FEWERBETTER from '/assets/Images/FEWERBETTER.png';
import PERSONALIZE from '/assets/Images/PERSONALIZE.png';
import STYLEADVICE from '/assets/Images/STYLEADVICE.png';

export default function FeaturesGrid() {
  const features = [
    {
      icon: WorldBestBrands,
      title: <>THE WORLD'S <br/>BEST BRANDS</>,
      description:
        'From storied heritage brands to next-generation designers, we offer gifts from over 150 makers—chosen for every style and budget.',
    },
    {
      icon: CashTravel,
      title: 'CASH FUNDS',
      description:
        'Your day, your way — add honeymoon funds, home upgrades, or anything in between.',
    },
    {
      icon: BespokeTravel,
      title: 'BESPOKE TRAVEL',
      description:
        'Register for a custom travel fund, curated by our friends at Porte Travel.',
    },
    {
      icon: TYNote,
      title: <>THANK YOU NOTE <br/>TRACKER</>,
      description:
        'Track who gave what, view guest messages, and manage thank-you notes in one simple place.',
    },
    {
      icon: ReadyMadeRegistries,
      title: <>READY-MADE <br/>REGISTRIES</>,
      description:
        'Pre-built, ready-to-shop registries curated by us and real couples to make getting started easy.',
    },
    {
      icon: GropGift,
      title: 'GROUP GIFTING',
      description:
        'Guests can pool their contributions toward bigger gifts—perfect for larger or once-in-a-lifetime pieces.',
    },
    {
      icon: NEWLYWED,
      title: <>NEWLYWED <br/>DISCOUNT</>,
      description: 'Take 15% off anything left on your list after the wedding.',
    },
    {
      icon: FREESHIPPING,
      title: 'FREE SHIPPING',
      description:
        'We cover shipping on two separate deliveries, so you can receive your gifts when the timing’s right.',
    },
    {
      icon: FEWERBETTER,
      title: <>FEWER, <br/>BETTER THINGS</>,
      description:
        'A curated collection of design-forward pieces chosen for their longevity, durability and the belief that lasting is the most sustainable choice of all.',
    },
    {
      icon: PERSONALIZE,
      title: <>PERSONALIZED <br/>REGISTRY PAGE</>,
      description:
        'Customize your registry page with photos and a message for a more personal touch.',
    },
    {
      icon: STYLEADVICE,
      title: <>STYLE ADVICE & <br/>GUIDED TOOLS</>,
      description:
        'We offer expert guidance and smart tools to help you build your registry with style and confidence.',
    },
  ];

  return (
    <div className="pt-[6.563vw] pb-[11.823vw] px-2">
      <div className="max-w-[96.615vw] mx-auto">
        <div className="flex justify-center gap-y-[7.031vw] gap-x-[4.167vw] flex-wrap max-[1024px]:gap-y-[12vw]">
          {features.map((feature, index) => {
            return (
              <div
                key={index}
                className="text-center space-y-4 lg:w-[20.24vw] max-[1024px]:w-[45%] max-[600px]:w-[90%]"
              >
                {/* Icon Circle */}
                <div className="mx-auto w-[11.563vw] h-[11.563vw] max-[600px]:w-[120px] max-[600px]:h-[120px] bg-[#446184] rounded-full flex items-center justify-center mb-[2.135vw]">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-[8.906vw] object-contain max-[600px]:w-[100px] max-[600px]:h-[100px]"
                  />
                </div>

                {/* Title */}
                <h3 className="text-[20px] leading-[26px] min-h-[3vw] max-[1024px]:min-h-[56px] max-[600px]:min-h-[unset] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] font-semibold tracking-wider uppercase text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[22px] leading-[26px] max-[1024px]:text-[18px] max-[1024px]:leading-[24px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.354vw] xl:leading-[1.354vw] 2xl:leading-[1.354vw] text-[#1F1D1B mx-auto">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
