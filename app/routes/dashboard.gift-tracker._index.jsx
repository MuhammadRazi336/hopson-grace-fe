import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import {useState} from 'react';
import teaImg from '/assets/Images/reading-image.png';
import NotificationCard from '~/components/NotificationCard';
import RegistryStatusCard from '~/components/RegistryStatusCard';

export default function DashboardHome() {
  return (
    <div className="container mx-auto pt-[80px]">
      <CoupleProfileViewHeader />

      <div className="flex xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-16">
        <div className="w-full flex flex-col gap-y-4 items-center pb-8">
          <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
            gift <span className="prata uppercase">tracker</span>
          </h2>
          <p className="text-center text-base text-gray-600">
            Keep track of who purchased what—and make saying thank you simple
            and seamless.
          </p>
          <img
            src="/assets/Images/profile-view-page-bdr.png"
            alt="Couple"
            className="max-w-[630px] h-auto mx-auto"
          />

          <div className="w-full space-y-3 bg-[#F5F2ED] p-5 mt-8">
            {/* Header */}
            <div className="grid grid-cols-6 bg-[#F5F2ED] px-4 pt-6 pb-4 text-xs font-semibold uppercase text-gray-600">
              <div>Order #</div>
              <div>Purchased By</div>
              <div>Date</div>
              <div>Purchase Amount</div>
              <div>Gift / Message</div>
              <div>Thank Yous</div>
            </div>

            {/* Rows */}
            {orders.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 items-center  bg-white px-4 py-6 text-sm"
              >
                <div>{item.order}</div>
                <div>{item.name}</div>
                <div>{item.date}</div>
                <div>{item.amount}</div>
                <div>
                  <button className="border border-gray-700 px-3 py-3 text-sm font-medium hover:bg-gray-100">
                    View Gifts/Message
                  </button>
                </div>
                <div>
                  {item.thanked ? (
                    <span className="text-xl text-center block text-[#446184] font-bold">✓</span>
                  ) : (
                    <button className=" text-white font-bold py-3 px-3 bg-[#446184] rounded-none cursor-pointer">
                      CREATE A REGISTRY
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
