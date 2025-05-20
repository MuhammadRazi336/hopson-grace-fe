import {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from '@remix-run/react';

import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Button from '~/components/Button.jsx';
import Stepper from '~/components/Stepper.jsx';
import CustomSelect from '~/components/CustomSelect.jsx';
import DatePicker from '~/components/DatePicker.jsx';
import moment from 'moment';
import Registry_Services from '~/Services/Registry.js';
import { STEPS_CONSTANTS } from '../constants/UiConstants';
import arrow from "/assets/Images/arrow.png"
import collectionitems from "/assets/Images/collectionitems.png"
import selected from "/assets/Images/selected.png"
import {Image} from '@shopify/hydrogen';

import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import placeholder from '/assets/Images/placeholder.jpg';



const OnboardingClient = ({ onStepChange }) => {
  const { user, collections, context } = useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS_CONSTANTS.EVENT_DATE_INFO);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedSubCollections, setSelectedSubCollections] = useState([]);
  const [addressData, setAddressData] = useState({
    phoneNumber: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    country: '',
    id: null,
  });
  const [eventData, setEventData] = useState({
    noOfGuest: '',
    selectedOption: {},
    selectedDate: new Date(),
    eventName: '',
    id: null,
    eventId: null,
  });
  const handleGuestNoChange = (e) => {
    setEventData({
      ...eventData,
      noOfGuest: e.target.value,
    });
  };
  const setSelectedDate = (date) => {
    setEventData({
      ...eventData,
      selectedDate: date,
    });
  };
  // General change handler for all fields
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setAddressData({
      ...addressData,
      [name]: value,
    });
  };
  useEffect(() => {
    getEvents();
  }, []);

  useEffect(() => {
    if (user) {
      const token = user.accessToken;
      localStorage.setItem('@Token', token);
      if (user.stepNumber !== 0) {
        if (user.stepNumber === 1) {
          setStep(STEPS_CONSTANTS.GUEST_INFO);
        } else if (user.stepNumber === 2) {
          setStep(STEPS_CONSTANTS.SHIPPING_INFO);
        } else if (user.stepNumber === 3) {
          setStep(STEPS_CONSTANTS.PREFER_GIFT_INFO);
        } else {
          setStep(STEPS_CONSTANTS.EVENT_DATE_INFO);
        }
      }
      const event = localStorage.getItem('@EventData');
      const shipping = localStorage.getItem('@ShippingData');
      if (user.registry?.events?.length) {
        setEventData({
          noOfGuest: user.registry?.events[0].noOfGuest,
          selectedOption: {
            label: user.registry?.events[0].eventType.name,
            id: user.registry?.events[0].eventType.id,
          },
          selectedDate: user.registry?.events[0].eventDate,
          eventName: user.registry?.events[0].name,
          id: user.registry.id,
          eventId: user.registry?.events[0].id,
        });
      } else if (event) {
        setEventData(JSON.parse(event));
      }
      if (user.shippingAddress) {
        setAddressData({
          address: user.shippingAddress.address,
          city: user.shippingAddress.city,
          country: user.shippingAddress.country,
          id: user.shippingAddress.id,
          phoneNumber: user.shippingAddress.phoneNumber,
          postalCode: user.shippingAddress.postalCode,
          province: user.shippingAddress.province,
        });
      } else if (shipping) {
        setAddressData(JSON.parse(shipping));
      }
    }
  }, [user]);

  const getEvents = async () => {
    try {
      const data = await Registry_Services.getEvents();
      const events = data.data.map((e) => {
        return {
          label: e.name,
          id: e.id,
        };
      });
      setEventTypes(events);
    } catch (e) {
      console.log(e, 'Catch');
    }
  };

  const handleSelectChange = (value) => {
    setEventData({
      ...eventData,
      selectedOption: {label: value.label, id: value.id},
    });
  };
  // Main state for selected date
  const handleEventNameChange = (e) => {
    setEventData({
      ...eventData,
      eventName: e.target.value,
    });
  };

  const handleRegistry = async () => {
    const payload = {
      name: eventData.eventName,
      eventDate: moment(eventData.selectedDate).format('YYYY-MM-DD'),
      eventTypeId: Number(eventData.selectedOption.id),
      ...(eventData.id && {id: eventData.id}),
    };

    const token = localStorage.getItem('@Token');
    let data = null;
    try {
      if (payload.id) {
        data = await Registry_Services.updateRegistry(payload, token);
      } else {
        data = await Registry_Services.createRegistry(payload, token);
      }
      if (data) {
        const event = {
          ...eventData,
          id: data.data.id,
          ...(!payload.id && {eventId: data.data.event.id}),
        };
        localStorage.setItem('@EventData', JSON.stringify(event));
        setEventData(event);
        setStep(step + 1);
      }
    } catch (e) {
      console.log(e, 'eee');
    }
  };

  const handleShipping = async () => {
    const payload = {
      phoneNumber: addressData.phoneNumber,
      address: addressData.address,
      postalCode: addressData.postalCode,
      city: addressData.city,
      province: addressData.province,
      country: addressData.country,
      ...(addressData.id && {id: Number(addressData.id)}),
    };
    const token = localStorage.getItem('@Token');
    try {
      let data;
      if (payload?.id) {
        data = await Registry_Services.addShippingAddress(payload, token);
      } 
      const shippingData = {
        ...addressData,
        id: data.data.id,
      };
      localStorage.setItem('@ShippingData', JSON.stringify(shippingData));
      setAddressData(shippingData);
      setStep(step + 1);
    } catch (e) {
      console.log(e, 'Exception');
    }
  };

  const handleNoOfGuest = async () => {
    const payload = {
      noOfGuest: Number(eventData.noOfGuest),
      id: Number(eventData.eventId),
    };
    const token = localStorage.getItem('@Token');

    try {
      const data = await Registry_Services.updateEvent(payload, token);
      setStep(step + 1);
    } catch (e) {
      console.log('UPpate', e);
    }
  };
  const handleOnboard = async () => {
    const payload = {
      isOnBoard: true,
      id: Number(user.user.id),
    };
    const token = localStorage.getItem('@Token');

    try {
      const data = await Registry_Services.updateOnBoarding(payload, token);

      // First, store the selected sub-collections
      try {
        const collectionsString = JSON.stringify(selectedSubCollections);
        localStorage.setItem('@SelectedSubCollections', collectionsString);
        
        // Verify storage immediately
        const storedCollections = localStorage.getItem('@SelectedSubCollections');

        if (!storedCollections) {
          throw new Error('Failed to store collections in localStorage');
        }
      } catch (storageError) {
        alert('There was an error saving your selections. Please try again.');
        return; // Don't proceed if storage failed
      }

      // Then fetch and store products
      try {
        const productsQuery = `#graphql
          query GetProductsByCollection($collectionId: ID!) {
            collection(id: $collectionId) {
              id
              title
              products(first: 50) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    collections(first: 50) {
                      edges {
                        node {
                          id
                          title
                          handle
                        }
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          id
                          src
                        }
                      }
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          id
                          priceV2 {
                            amount
                            currencyCode
                          }
                          inventoryQuantity
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        // Process each sub-collection one at a time
        for (const subCollection of selectedSubCollections) {

          try {
            // Fetch products for this collection
            const result = await context.storefront.query(productsQuery, {
              variables: {
                collectionId: subCollection.id
              }
            });

            if (result?.collection?.products?.edges) {
              // Store products for this collection
              const productsKey = `@Products_${subCollection.id}`;
              const productsString = JSON.stringify(result.collection.products.edges);
              
              localStorage.setItem(productsKey, productsString);
              
              // Verify storage
              const storedProducts = localStorage.getItem(productsKey);
            }
          } catch (error) {
          }
        }

        // Navigate after all operations are complete
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (error) {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (e) {
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };
  // Handlers for navigation
  async function goNext() {
    if (step === 1) {
      setStep(step + 1);
    } else if (step === 2) {
      await handleRegistry();
    } else if (step === 3) {
      await handleNoOfGuest();
    } else if (step === 4) {
      await handleShipping();
    } else if (step === 5) {
      setStep(step + 1);
    } else if (step === 6) {
      setStep(step + 1);
    } else if (step === 7) {
      await handleOnboard();
    }
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  console.log(user.user.id);
  // Function to render steps dynamically
  const renderStepContent = (currentStep) => {
    switch (currentStep) {
      case STEPS_CONSTANTS.EVENT_DATE_INFO:
        return (
          <Step1
            setSelectedDate={setSelectedDate}
            selectedDate={eventData.selectedDate}
          />
        );
      case STEPS_CONSTANTS.EVENT_ADD_INFO:
        return (
          <Step2
            eventData={eventTypes}
            setSelectedDate={setSelectedDate}
            selectedDate={eventData.selectedDate}
            handleEventNameChange={handleEventNameChange}
            eventName={eventData.eventName}
            selectedOption={eventData.selectedOption}
            handleSelectChange={handleSelectChange}
          />
        );
      case STEPS_CONSTANTS.GUEST_INFO:
        return (
          <Step3 value={eventData.noOfGuest} onChange={handleGuestNoChange} />
        );
      case STEPS_CONSTANTS.SHIPPING_INFO:
        return (
          <Step4 formData={addressData} handleInputChange={handleInputChange} />
        );
      case STEPS_CONSTANTS.PREFER_GIFT_INFO:
        return <Step5 />;
      case STEPS_CONSTANTS.COLLECTION_INFO:
        return <Step6 collections={collections} onCollectionsSelect={setSelectedCollections} />;
      case STEPS_CONSTANTS.STYLE_INFO:
        return <Step7 
          selectedCollections={selectedCollections} 
          storefront={context.storefront}
          onSubCollectionsSelect={setSelectedSubCollections}
        />;
      default:
        return null;
    }
  };
  console.log(step, 'STEP');

  // Add this effect to notify parent of step changes
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  return (
    <div className="flex justify-center items-center">
      {/* Main content wrapper */}
      <Stepper step={step} totalSteps={8} />

      <div className="container p-6  max-[768px]:p-2 bg-rounded-md w-full">
        {/* Stepper for progress */}

        <div className="mb-6">
          {/* Render the step content dynamically */}
          {renderStepContent(step)}
        </div>

        {/* Back and Next buttons */}
        <div className="flex justify-between mt-4">
          {/* <Button text="Back" onClick={goBack} disabled={step === 1} /> */}
           <button onClick={goBack} disabled={step === 1}  type="submit" text="Next" className="absolute left-10 bottom-10 max-[768px]:bottom-5 max-[768px]:left-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]" >
           <img src={arrow} alt="" className='rotate-180 max-[768px]:w-4' /> Back
          </button>
           <button onClick={goNext}  type="submit" text="Next" className="absolute right-10 bottom-10 max-[768px]:bottom-5 max-[768px]:right-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]" >
            {step === 7 ? 'Submit' : 'Next'} <img src={arrow} alt="" className='max-[768px]:w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

const Step1 = ({selectedDate, setSelectedDate}) => {
  return (
    <div className='text-center'>
      <div className="p-4 w-[300px] mx-auto customdatepicker">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          placeholder="Choose a Date"
          inputProps={{
            className:"rounded-none p-8 border-[#B9B4AE] border-2 bg-white text-black customDatePicker",
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
        />
      </div>
        <button className='border-b-2 border-b-white text-center mt-10'>I'LL ADD THIS LATER</button>
    </div>
  );
};

const Step2 = ({
  setSelectedDate,
  selectedDate,
  handleEventNameChange,
  eventName,
  selectedOption,
  handleSelectChange,
  eventData,
}) => {
  return (
    <div>
      <div className="text-center">
        <Heading text={'Do You Have Other Events where guest may buy gifts?'} />
        <h2 className="text-l font-bold mb-4">
          {'(ie. bridal shower , engagement party)'}
        </h2>
      </div>
      <div className='customselect mb-6'>
        <CustomSelect
          title={'Event Type'}
          options={eventData}
          selected={selectedOption}
          setSelected={handleSelectChange}
          placeholder="Choose an option"
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black"
        />
      </div>
      {/* Event Name Input */}
      <Input
        label="Event Name"
        value={eventName}
        onChange={handleEventNameChange}
        placeholder="Enter event name"
        className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
      />
      <div className='mt-6 customdatepicker'>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Choose a Date"
          inputProps={{
            className: 'rounded-none p-8 border-[#B9B4AE] border-2 bg-white text-black h-[68px] customDatePicker',
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
        />
      </div>
    </div>
  );
};
const Step3 = ({value, onChange}) => {
  return (
    <div>
      <div className="text-center">
        {/* <Heading text={'How many guests are you inviting?'} /> */}
        <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto">
          This will help us calculate the magic number to ensure all guests have a good amount of gifts to choose from.
        </h2>
      </div>
      {/* Event Name Input */}
      <Input
        label="Number of Guests"
        value={value}
        onChange={onChange}
        placeholder="Enter No Of Guest"
        className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black mx-auto mt-4 text-center text-3xl font-bold placeholder:text-lg placeholder:font-normal"
        classNameLabel="text-center mt-10 mb-3 text-[22px] max-[768px]:text-lg"
      />
      <div className='text-center'>
        <button type='button' className='mt-10 border-b-2 border-b-white'>
        I'LL ADD THIS LATER
        </button>
      </div>
    </div>
  );
};

const Step4 = ({formData, handleInputChange}) => {
  // Submit handler to log the form data

  return (
    <div className="">
      <div className="text-center">
        {/* <Heading text={'Where would you like your gifts shipped?'} /> */}
        <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto">
          You can update your address at any time.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
        {/* Phone Number */}
        <Input
          placeholder="Phone Number *"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        />

        {/* Address */}
        <Input
          placeholder="Address *"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        />

        {/* Postal Code */}
        <Input
          placeholder="Postal Code *"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        />

        {/* City */}
        <Input
          placeholder="City *"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        />

        {/* Province */}
        <Input
          placeholder="Province *"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        />

        {/* Country */}
        <Input
          placeholder="Country *"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        />
      </div>
      <div className='text-center'>
        <button className='mt-10 border-b-2 border-b-white'>
          I'LL ADD THIS LATER
        </button>
      </div>
    </div>
  );
};

const Step5 = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the grid
  const options = [
    {
      id: 1,
      label: 'Cash',
      image: collectionitems,
      selectedImage: selected
    },
    {id: 2, label: 'Gifts & Cash', image: collectionitems,  selectedImage: selected},
    {id: 3, label: 'Gifts', image: collectionitems,  selectedImage: selected},
    {id: 4, label: 'Not Sure Yet', image: collectionitems,  selectedImage: selected},
  ];

  return (
    <div className="flex flex-col items-center">
      {/* <Heading text={'What is your preferred gift?'} /> */}
      <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto text-center">
      Most guests prefer to give a gift that you can keep forever.
        </h2>
      <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto text-center">
      CHOOSE AS MANY AS YOU'D LIKE:
        </h2>
      {/* Grid */}
      <div className="grid grid-cols-3 max-[768px]:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-6 flex items-center justify-center flex-col max-[768px]:p-2 rounded-full text-center text-white font-normal text-[20px] ${
              selectedOption === option.id
                ? ''
                : ''
            }`}
          >
            <div className={`p-4 max-[768px]:p-2 max-[768px]:w-28 rounded-full w-40 aspect-[1/1] flex items-center justify-center ${
              selectedOption === option.id
                ? 'bg-[#223247]'
                : 'bg-[#F5F2ED]'
            }`}>
              {selectedOption === option.id 
                ? <img src={option.selectedImage} className='max-[768px]:w-16' alt="" />
                : <img src={option.image} className='max-[768px]:w-16' alt="" />
              }
            </div>
            <span className='text-[20px] max-[768px]:text-[14px] font-bold text-center mt-4 uppercase flex justify-center'>
            {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Step6 = ({ collections, onCollectionsSelect }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Filter collections to only show parent collections
  const parentCollections = collections?.nodes?.filter(
    (collection) => {
      return collection?.metafield?.value === "true";
    }
  ) || [];

  // Add this console.log to check the data
  console.log('Parent Collections:', parentCollections);

  const handleOptionClick = (collection) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((item) => item.id === collection.id);
      const newSelection = isSelected
        ? prev.filter((item) => item.id !== collection.id)
        : [...prev, collection];
      
      onCollectionsSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="">

      <p className="font-normal mb-10 mt-4 w-[80%] text-2xl mx-auto text-center">
        Pick a style, and we'll make gift recommendations tailored to your taste.
      </p>

      <p className="font-normal mb-4 mt-4 w-[80%] text-2xl mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </p>

      <div className="relative">
      <div className="swiper-button-prev-collection absolute top-[90px] -left-16  cursor-pointer text-white uppercase flex ">
          <img src={nextitem} alt="" className="rotate-180 invert-100" />
          <span className="-rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>
        <Swiper spaceBetween={20} slidesPerView={4} loop={true} className=""  modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next-collection',
            prevEl: '.swiper-button-prev-collection',
          }}>
          {parentCollections.length > 0 ? (
          parentCollections.map((collection) => {
          // Add this console.log to check each collection
          console.log('Collection:', collection);
          console.log('Collection Image:', collection.image);

          return (
          <SwiperSlide key={collection.id}>
            <button key={collection.id} onClick={()=> handleOptionClick(collection)}
              className={` ${
              selectedOptions.some((item) => item.id === collection.id)
              ? ''
              : ''
              }`}
              >
              {collection.image && (
                <div className={selectedOptions.some((item) => item.id === collection.id) ? 'tickafter' : ''} >
                  <Image alt={collection.image.altText || collection.title} aspectRatio="1/1" data={collection.image}
                    loading="lazy" sizes="(min-width: 45em) 400px, 100vw" />
                </div>
              )}
              <span className='mt-4 block tracking-wider text-[15px] font-medium'>
                {collection.title}
              </span>
            </button>
          </SwiperSlide>
          );
          })
          ) : (
          <p className="col-span-2 text-center text-gray-500">No collections available.</p>
          )}

        </Swiper>
        <div className="swiper-button-next-collection absolute top-[90px] -right-16 cursor-pointer text-white uppercase flex">
          <span className="rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="invert-100" alt="" />
        </div>
      </div>

    </div>
  );
};

const Step7 = ({ selectedCollections, storefront, onSubCollectionsSelect }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [subCollectionsData, setSubCollectionsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubCollections = async () => {
      setError(null);
      
      const subCollectionIds = selectedCollections.flatMap(collection => {
        const subCollectionsValue = collection.subCollections?.value;
        if (subCollectionsValue) {
          try {
            return JSON.parse(subCollectionsValue);
          } catch (e) {
            return [];
          }
        }
        return [];
      });

      if (subCollectionIds.length > 0) {
        try {
          const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: subCollectionIds }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch collections');
          }
          
          // Add debugging to check the image data
          console.log('Sub-collections data:', data.collections);
          
          setSubCollectionsData(data.collections || []);
        } catch (error) {
          setError(error.message);
        }
      } else {
        setSubCollectionsData([]);
      }
    };

    fetchSubCollections();
  }, [selectedCollections]);

  const handleOptionClick = (subCollection) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((item) => item.id === subCollection.id);
      const newSelection = isSelected
        ? prev.filter((item) => item.id !== subCollection.id)
        : [...prev, {
            id: subCollection.id,
            title: subCollection.title,
            image: subCollection.image,
            handle: subCollection.handle,
            description: subCollection.description
          }];
      
      onSubCollectionsSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="">
      {/* <Heading text={'Pick your Style'} /> */}
      <p className="font-normal mb-10 mt-4 w-[80%] text-2xl mx-auto text-center">
        Pick a style, and we'll make gift recommendations tailored to your taste.
      </p>

      <p className="font-normal mb-4 mt-4 w-[80%] text-2xl mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </p>
      {error && (
        <p className="text-red-500 mb-4">
          Error: {error}
        </p>
      )}
       <div className="relative">
      <div className="swiper-button-prev-subcollection absolute top-[90px] -left-16  cursor-pointer text-white uppercase flex ">
          <img src={nextitem} alt="" className="rotate-180 invert-100" />
          <span className="-rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>
        <Swiper spaceBetween={20} slidesPerView={4} loop={true} className=""  modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next-subcollection',
            prevEl: '.swiper-button-prev-subcollection',
          }}>
        {subCollectionsData.length > 0 ? (
          subCollectionsData.map((subCollection) => {
            // Add debugging for each sub-collection
            console.log('Rendering sub-collection:', subCollection);
            
            return (
              <SwiperSlide key={subCollection.id}>
                <button
                  key={subCollection.id}
                  onClick={() => handleOptionClick(subCollection)}
                  className={`${
                    selectedOptions.some((item) => item.id === subCollection.id)
                      ? ''
                      : ''
                  }`}
                >
                  {subCollection.image ? (
                    <div className={selectedOptions.some((item) => item.id === subCollection.id) ? 'tickafter' : ''} >
                      <Image 
                        alt={subCollection.image.altText || subCollection.title} 
                        aspectRatio="1/1" 
                        data={{
                          url: subCollection.image.url,
                          altText: subCollection.image.altText,
                          width: subCollection.image.width,
                          height: subCollection.image.height
                        }}
                        loading="lazy" 
                        sizes="(min-width: 45em) 400px, 100vw" 
                      />
                    </div>
                  ) : (
                    <div className={selectedOptions.some((item) => item.id === subCollection.id) ? 'tickafter' : ''} >
                      <Image 
                        alt={subCollection.title} 
                        aspectRatio="1/1" 
                        data={{
                          url: placeholder,
                          altText: subCollection.title,
                          width: 400,
                          height: 400
                        }}
                        loading="lazy" 
                        sizes="(min-width: 45em) 400px, 100vw" 
                      />
                    </div>
                  )}
                  <span className='mt-4 block tracking-wider text-[15px] font-medium'>
                    {subCollection.title}
                  </span>
                </button>
              </SwiperSlide>
            );
          })
        ) : (
          <p className="col-span-2 text-center text-gray-500">
            {error ? 'Error loading sub-categories' : 'No sub-categories available. Please select parent categories in the previous step.'}
          </p>
        )}
         </Swiper>
        <div className="swiper-button-next-subcollection absolute top-[90px] -right-16 cursor-pointer text-white uppercase flex">
          <span className="rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="invert-100" alt="" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingClient;
