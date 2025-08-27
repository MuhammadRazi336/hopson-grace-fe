import {useCallback, useState} from 'react';
import {defer, Form, redirect, useLoaderData} from '@remix-run/react';
import {Link} from '@remix-run/react';
import SideCart from '~/components/SideCart';
import {CoupleFooter} from '~/components/CoupleFooter';

export default function CoupleProfileView() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedGiftData, setSelectedGiftData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sideCartOpen, setSideCartOpen] = useState(false);

  const onClose = () => setSideCartOpen(false);

  const handleTitleClick = (item) => {
    setSelectedGiftData(item);
    setSelectedImageIndex(0); // Reset selected image for the new item
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedGiftData(null);
  };

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
      <CoupleProfileViewHeader onCartClick={() => setSideCartOpen(true)} />
      <div className="text-center pt-[80px] container mx-auto font-sans">
        <img
          src="/assets/Images/couple-profile-bg.png"
          alt="Couple"
          className="w-full h-auto"
        />
        <div className="flex flex-wrap xl:flex-nowrap justify-center xl:items-end items-center -mb-10 xl:-translate-y-[200px] ">
          <div className="xl:w-4/12 w-full">
            <h1 className="md:text-[75px] my-2 max-w-[340px] leading-[1.25] prata ml-auto xl:text-left text-center xl:mx-0 mx-auto">
              joanna & jonathan
            </h1>
          </div>
          <div className="xl:w-4/12 w-full">
            <img
              src="/assets/Images/couple-picture.png"
              alt="Couple"
              className="rounded-full xl:w-full xl:h-full h-[300px] w-[300px] mx-auto"
            />
          </div>
          <div className="xl:w-4/12 w-full">
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
        <h2 className="md:text-[42px] xl:mt-0 mt-16 font-normal ivyora">
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

              <h3
                className="text-lg font-semibold cursor-pointer"
                onClick={() => handleTitleClick(item)}
              >
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
      <div className="container pt-12 md:flex-nowrap flex-wrap mx-auto flex lg:gap-8 gap-2 items-stretch flex-row-reverse">
        <div className="py-10 px-6 md:py-12 md:px-[6rem] lg:px-[8rem] bg-[#446184] relative flex items-center justify-center flex-col  lg:w-[65%] w-full max-[768px]:p-10 lg:mt-20 mt-6">
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
            We're so grateful.
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
        <div className="lg:w-[35%] w-full  ">
          <img
            src="/assets/Images/gift.png"
            alt="Image Banner"
            className="max-[1024px]:h-full object-cover object-[80%]"
          />
        </div>
      </div>

      {isPopupOpen && selectedGiftData && (
        <div
          className="fixed inset-0  bg-[#00000073]  flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={closePopup}
        >
          <div
            className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800"
            >
              X
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
              {/* Product Image Section */}
              <div className="relative py-8 pl-8 md:pr-0 pr-8">
                <img
                  src={selectedGiftData.image || '/placeholder.svg'}
                  alt={selectedGiftData.name}
                  className="w-full h-auto object-cover md:rounded-l-lg"
                />
                {/* Simplified Thumbnail Display - shows current image as a non-interactive thumbnail */}
                <div className="flex gap-2 mt-4 px-4 md:px-0">
                  <div
                    className={`border p-1 w-20 h-20 border-[#3d5a80] border-2`}
                  >
                    <img
                      src={selectedGiftData.image || '/placeholder.svg'}
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={` p-1 w-20 h-20 border-[#3d5a80] border-2`}>
                    <img
                      src={selectedGiftData.image || '/placeholder.svg'}
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={` p-1 w-20 h-20 border-[#3d5a80] border-2`}>
                    <img
                      src={selectedGiftData.image || '/placeholder.svg'}
                      alt={`Thumbnail 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="uppercase text-sm tracking-wider text-gray-700 font-medium">
                  HOPSON GRACE
                </div>
                <h1 className="text-3xl md:text-4xl font-serif mt-2 mb-4">
                  {selectedGiftData.name}
                </h1>
                <div className="text-xl font-medium mb-6">
                  ${selectedGiftData.price}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {/* Display Requested/Still Needs */}
                  <div className="flex flex-col items-start border border-gray-300 p-2 rounded text-sm">
                    <div>
                      Requested:{' '}
                      <span className="font-medium">
                        {selectedGiftData.requested !== undefined
                          ? selectedGiftData.requested
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      Still Needs:{' '}
                      <span className="font-medium">
                        {selectedGiftData.stillNeeds !== undefined
                          ? selectedGiftData.stillNeeds
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    className={`bg-[#3d5a80] text-white py-3 px-6 uppercase text-sm tracking-wider flex-grow rounded transition-colors
                      ${
                        selectedGiftData.stillNeeds === 0 ||
                        selectedGiftData.status === 'gifted'
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'hover:bg-[#2c425e]'
                      }
                    `}
                    disabled={
                      selectedGiftData.stillNeeds === 0 ||
                      selectedGiftData.status === 'gifted'
                    }
                  >
                    {selectedGiftData.stillNeeds === 0 ||
                    selectedGiftData.status === 'gifted'
                      ? selectedGiftData.status === 'gifted'
                        ? 'GIFTED'
                        : 'NOT AVAILABLE'
                      : selectedGiftData.buttonLabel || 'ADD TO CART'}
                  </button>
                </div>

                {/* Product Description */}
                <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                  {selectedGiftData.description ||
                    "Keep your butter spreadable and fresh in this butter keeper, a French invention when refrigeration didn't exist. Marble naturally keeps butter cool, and the French naturally know their way around the kitchen. Need we say more?"}
                </p>

                <div className="mb-6">
                  <h2 className="font-medium uppercase text-xs tracking-wider mb-1 text-gray-500">
                    HOW IT WORKS:
                  </h2>
                  <p className="text-gray-700 text-sm">
                    Fill your butter keeper with 1/4" cold water to keep butter
                    soft. Change water every 3-5 days to keep butter fresh.
                  </p>
                </div>

                <div>
                  <h2 className="font-medium uppercase text-xs tracking-wider mb-1 text-gray-500">
                    DETAILS:
                  </h2>
                  <p className="text-gray-700 text-sm">H 4.25" | 4" DIA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {sideCartOpen && (
        <div
          className="fixed inset-0 bg-[#2b2b2b61] bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      <SideCart open={sideCartOpen} onClose={onClose} />
      <CoupleFooter />
    </>
  );
}

export function CoupleProfileViewHeader({onCartClick, showCart = true}) {
  return (
    <div className="container mx-auto flex justify-between md:items-start items-center md:pt-6 pt-2 absolute top-0 left-0 right-0">
      <img
        src="/assets/Images/couple-header-logo.png"
        alt="Hamburger"
        className="md:w-[150px] w-[100px] xl:-mb-6 mb-0 h-auto md:-ml-10 -ml-2"
      />

      {showCart && (
        <span className="my-0 cursor-pointer" onClick={onCartClick}>
          <img
            src="/assets/Images/cart-icon.png"
            alt="cart"
            className="w-7 h-7"
          />
        </span>
      )}
    </div>
  );
}
