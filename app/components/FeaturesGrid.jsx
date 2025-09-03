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
        'We cover shipping on two separate deliveries, so you-  can receive your gifts when the timing’s right.',
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
    <div className="py-7 pb-[150px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-[120rem] mx-auto">
        <div className="flex justify-center gap-y-10 flex-wrap">
          {features.map((feature, index) => {
            return (
              <div
                key={index}
                className="text-center space-y-4 lg:w-3/12 md:w-4/12 w-1/2"
              >
                {/* Icon Circle */}
                <div className="mx-auto w-[180px] h-[180px] bg-[#446184] rounded-full flex items-center justify-center">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-[130px] object-contain"
                  />
                </div>

                {/* Title */}
                <h3 className="text-2xl h-20 lg:text-[1.042vw] lg:leading-[1.354vw] font-semibold tracking-wider uppercase text-gray-900 py-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-2xl lg:text-[1.146vw] lg:leading-[1.354vw] text-gray-600 leading-relaxed max-w-xs mx-auto">
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
