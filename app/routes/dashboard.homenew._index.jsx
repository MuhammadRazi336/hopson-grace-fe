import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import {useState} from 'react';
import teaImg from '/assets/Images/reading-image.png';
import NotificationCard from '~/components/NotificationCard';
// import giftIcon from '/assets/Images/gift-icon.png';

const REGISTRY_CARDS = [
  {
    id: 'add-gifts',
    title: 'ADD GIFTS',
    description:
      "Based on the number of people attending your wedding, we recommend you add at least 95 gifts. When over 25% of your gifts are purchased, we'll advise you to consider adding more.",
    value: '6',
    total: '95',
    label: 'GIFTS ADDED',
    showIcon: true,
    buttonText: 'ADD GIFTS',
  },
  {
    id: 'account',
    title: 'ACCOUNT',
    description:
      'Gifts convert to cash, giving you the flexibility to finalize your registry after the wedding.',
    value: '$0.00',
    label: 'CASH AVAILABLE',
    showIcon: true,
  },
  {
    id: 'gifts-purchased',
    title: 'GIFTS PURCHASED',
    description:
      "Gifts have started to arrive. Click to see what's been purchased.",
    value: '3',
    total: '6',
    label: 'GIFTS PURCHASED',
    showIcon: true,
    buttonText: 'VIEW GIFTS',
  },
];

export default function DashboardHome() {
  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />

      <div className="flex xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-16">
        <div className="w-full xl:w-9/12 flex flex-col gap-y-4 items-center pb-8">
          <div className="w-64 h-32 bg-gray-500"></div>

          <h2 className="md:text-[42px] lg:text-[48px] lg:leading-[56px] text-center xl:mt-0 mt-16 font-normal ivyora">
            welcome to the heart of your wedding,
            <span className="font-italic block">HANNAH & MAX</span>
          </h2>

          <p className="text-lg font-bold prata">SEPTEMBER 25, 2025</p>

          <img
            src="/assets/Images/dashboard-bdr.png"
            alt="Hamburger"
            className="w-auto h-auto mx-auto -mt-2"
          />
          <p className="text-xl font-normal text-center mt-2">
            YOU HAVE &nbsp;
            <span className="font-bold prata text-2xl">96 </span> DAYS &nbsp;
            UNTIL THE WEDDING!
          </p>
        </div>
        <div className="w-full xl:w-3/12 flex flex-col gap-y-4">
          <div>
            <NotificationCard />
          </div>
        </div>
      </div>

      <div className="grid xl:gap-y-0 gap-y-24 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 w-full mt-16 xl:px-12 px-6 pb-[100px]">
        {REGISTRY_CARDS.map((card) => (
          <div
            key={card.id}
            className="bg-[#446184] text-white pb-6 px-[50px] max-h-[700px] flex flex-col items-center"
          >
            {card.showIcon && (
              <div className="flex bg-[#F6F5ED] rounded-full -mt-20 mb-6 w-28 h-28 items-center justify-center">
                <img
                  src="/assets/Images/gift-icon.png"
                  alt="Gift Icon"
                  className="w-16 h-16 mb-4"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold mb-4 mt-[50px]">
              {card.title}
            </h3>
            <p className="text-lg min-h-[240px]  text-center mb-6">
              {card.description}
            </p>
            <div className="text-5xl mt-5 prata flex items-baseline">
              <span>{card.value}</span>
              {card.total && (
                <span className="ml-1 text-4xl">
                  /<span className="text-3xl">{card.total}</span>
                </span>
              )}
            </div>
            <p className="text-sm mt-2">{card.label}</p>
            {card.buttonText && (
              <button className="bg-[#F6F5ED] font-bold text-black px-14 py-3 mt-4 text-base">
                {card.buttonText}
              </button>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
