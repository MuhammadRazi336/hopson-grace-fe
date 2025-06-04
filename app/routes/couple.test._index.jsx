import {useCallback, useState} from 'react';
import {defer, Form, redirect, useLoaderData} from '@remix-run/react';
import {Link} from '@remix-run/react';
// import {Header} from '~/components/Header';

export default function CoupleProfileView() {
  const giftRegistry = [
    {
      name: 'Marble Butter Keeper',
      price: 80,
      image: '/assets/Images/product-image.png',
      requested: 1,
      stillNeeds: 1,
      status: 'available',
      buttonLabel: 'ADD TO CART',
    },
    {
      name: 'Belle-V Icecream Scoop',
      price: 95,
      image: '/assets/Images/product-image.png',
      requested: 1,
      stillNeeds: 0,
      status: 'gifted',
      buttonLabel: 'ADD TO CART',
    },
    {
      name: 'Coluna Fruit Bowl',
      price: 125,
      size: 'Medium',
      image: '/assets/Images/product-image.png',
      requested: 1,
      stillNeeds: 0,
      status: 'gifted',
      buttonLabel: 'ADD TO CART',
    },
    {
      name: 'Staub Cast Iron Q4',
      price: 430,
      image: '/assets/Images/product-image.png',
      requested: 1,
      stillNeeds: 0,
      status: 'gifted',
      buttonLabel: 'ADD TO CART',
    },
    {
      name: 'Champagne on Arrival',
      description: 'A toast from you waiting for us',
      price: 100,
      image: '/assets/Images/product-image.png',
      status: 'available',
      buttonLabel: 'ADD TO CART',
    },
    {
      name: 'Sahara Sunset Experience',
      description: 'Dinner in the desert',
      price: 250,
      image: '/assets/Images/product-image.png',
      status: 'available',
      buttonLabel: 'ADD TO CART',
    },
    {
      name: 'First Class Upgrades',
      description: 'Help make our journey extra-special and relaxing',
      price: 1000,
      remaining: 1000,
      image: '/assets/Images/product-image.png',
      groupGift: true,
      buttonLabel: 'CONTRIBUTE',
    },
    {
      name: 'The Four Seasons Marrakech',
      description: 'Contribute to our dream stay',
      price: 5000,
      remaining: 2000,
      image: '/assets/Images/product-image.png',
      groupGift: true,
      buttonLabel: 'CONTRIBUTE',
    },
  ];
  return (
    <>
        <CoupleProfileViewHeader />
      <div className="text-center pt-[80px] container mx-auto font-sans">
        <img
          src="/assets/Images/couple-profile-bg.png"
          alt="Couple"
          className="w-full h-auto"
        />
        <div className="flex justify-center items-end -mb-10 -translate-y-[200px]">
          <div className="w-4/12">
            <h1 className="md:text-[75px] my-2 max-w-[340px] leading-[1.25] prata ml-auto">
              joanna & jonathan
            </h1>
          </div>
          <div className="w-4/12">
            <img
              src="/assets/Images/couple-picture.png"
              alt="Couple"
              className="rounded-full w-full h-full mx-auto"
            />
          </div>
          <div className="w-4/12">
            <div className="mr-16">
              <p className="md:text-[42px] text-right my-2 leading-[1.25] prata ml-auto">
                05.20.2027
              </p>
              <img
                src="/assets/Images/profile-view-page-bdr.png"
                alt="Couple"
                className="max-w-[370px] h-auto ml-auto"
              />
              <div className="text-right ">
                <p className="text-lg my-1">THE DRAKE HOTEL TORONTO</p>
                <p className="text-lg my-1">TORONTO, ONTARIO</p>
                <p className="text-lg my-1">6 O'CLOCK IN THE EVENING</p>
              </div>
            </div>
          </div>
        </div>
        <h2 className="md:text-[42px] font-normal ivyora">
          we are looking <span className="font-italic">SO FORWARD</span> to
          celebrating with you
        </h2>

        <p className="max-w-2xl mx-auto my-5 leading-relaxed">
          Lorem ipsum dolor sit amet. Et perferendis quaerat qui tenetur nemo
          qui molestiae animi. Est quos tempore nam culpa voluptates ea deserunt
          deserunt ut deserunt quaerat.
        </p>
      </div>

      <div className="container mx-auto bg-[#FAF9F6] py-10 px-6">
        <h2 className="mt-0 lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-5">
          our registry selections
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] h-auto mx-auto"
        />

        <div className="filters">
          <div className="filter-item flex gap-x-12 mt-12 justify-center">
            <h3 className="text-lg uppercase border-b-2 border-[#446184]">
              {' '}
              <strong>Categories</strong> All{' '}
            </h3>
            <h3 className="text-lg uppercase border-b-2 border-[#446184]">
              {' '}
              <strong>price</strong> low to high{' '}
            </h3>
            <h3 className="text-lg uppercase border-b-2 border-[#446184]">
              {' '}
              <strong>status</strong> All{' '}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-12">
          {giftRegistry.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded  flex flex-col items-start ${
                item.status === 'gifted' ? 'overlay-gifted' : ''
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-[340px] object-cover mb-4"
              />

              <h3 className="text-lg font-semibold ">
                {item.name}
                {item.size ? ` (${item.size})` : ''}
              </h3>
              <p className="font-normal ">
                {item.description || `$${item.price}`}
              </p>

              {item.requested !== undefined && (
                <p className="text-sm my-2 ivyora text-gray-600">
                  Requested: {item.requested} &nbsp; Still Needs:{' '}
                  {item.stillNeeds}
                </p>
              )}

              {item.remaining !== undefined && (
                <p className="text-sm my-2 ivyora text-left w-full mb-2 text-gray-600">
                  ${item.remaining} Remaining
                </p>
              )}

              <button
                className={`mt-auto bg-white w-full border px-4 py-4 uppercase text-sm font-semibold mt-4
              ${
                item.stillNeeds === 0 || item.status === 'gifted'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-black hover:text-white'
              }
            `}
                disabled={item.stillNeeds === 0 || item.status === 'gifted'}
              >
                {item.stillNeeds === 0 || item.status === 'gifted'
                  ? 'ADD TO CART'
                  : item.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="container pt-12  mx-auto flex lg:gap-8 gap-2 items-stretch flex-row-reverse">
        <div className="py-10 px-6 md:py-12 md:px-[6rem] lg:px-[8rem] bg-[#446184] relative flex items-center justify-center flex-col lg:w-[65%] w-1/2 max-[768px]:p-10 lg:mt-20 mt-6">
          <h3 className="text-2xl text-white lg:text-5xl 2xl:text-3xl 3xl:w-full prata max-w-[410px] text-center">
          gift any amount
          </h3>
          <img
            src="/assets/Images/white-bdr.png"
            alt="couple"
            className="max-w-[315px] mb-4 mt-4"
          />
          <h5 className="text-white text-xl font-normal">
            CONTRIBUTE TO OUR JOURNEY!
          </h5>
          <p className="text-sm lg:text-xl text-white max-w-[488px] mt-4 mb-4 font-normal text-center">
            Help us create our dream wedding, honeymoon or life experience.
            We’re so grateful.
          </p>
          <div>
            <div className="flex justify-center items-center gap-x-6">
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                $100
              </button>
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
                $500
              </button>
              <button
                type="button"
                className=" text-black font-bold py-4 px-8 bg-[#fff] rounded-none cursor-pointer"
              >
               None
              </button>
            </div>
          </div>
        </div>
        <div className="lg:w-[35%] w-1/2  ">
          {' '}
          <img
            src="/assets/Images/gift.png"
            alt="Image Banner"
            className="max-[1024px]:h-full object-cover object-[80%]"
          />
        </div>
      </div>
    </>
  );
}

export function CoupleProfileViewHeader() {
  return (
    <div className="container mx-auto flex justify-between items-start pt-6 absolute top-0 left-0 right-0">
        
            <img src="/assets/Images/couple-header-logo.png" alt="Hamburger" className="w-[150px] -mb-6 h-auto -ml-10" />
        
        <h1 className="my-0">Cart</h1>
    </div>
  );
}
