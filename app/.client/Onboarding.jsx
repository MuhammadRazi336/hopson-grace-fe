import {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from '@remix-run/react';
import GlassImg from '/assets/Images/GlassImg.png';
import onboardingGif from '/assets/Images/onboardingFPO.gif';
import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Button from '~/components/Button.jsx';
import Stepper from '~/components/Stepper.jsx';
import CustomSelect from '~/components/CustomSelect.jsx';
import DatePicker from '~/components/DatePicker.jsx';
import moment from 'moment';
import Registry_Services from '~/Services/Registry.js';
import {STEPS_CONSTANTS} from '../constants/UiConstants';
import arrow from '/assets/Images/arrow.png';
// import collectionitems from '/assets/Images/collectionitems.png';
import WorldBestBrands from '/assets/Images/WORLDSBESTBRANDS.png';
import CashTravel from '/assets/Images/CASHTRAVEL.png';
import Both from '/assets/Images/CASHTRAVELGIFTS.png';
import selected from '/assets/Images/selected.png';
import {Image} from '@shopify/hydrogen';

// Collection icons for Step6
import Tableware from '/assets/Images/TABLEWARE.png';
import Kitchen from '/assets/Images/KITCHEN.png';
import Homedecor from '/assets/Images/HOMEDECOR.png';
import BedBath from '/assets/Images/BEDBATH.png';
import TravelOutdoors from '/assets/Images/BESPOKETRAVEL.png';
import Music from '/assets/Images/MUSIC.png';

import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import nextitem from '/assets/Images/next.png';
import placeholder from '/assets/Images/placeholder.jpg';

const OnboardingClient = ({onStepChange}) => {
  const {user, collections, context} = useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS_CONSTANTS.EVENT_DATE_INFO);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedSubCollections, setSelectedSubCollections] = useState([]);
  const [selectedGiftPreference, setSelectedGiftPreference] = useState(null);
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
  const [eventDateError, setEventDateError] = useState('');
  const [step3Error, setStep3Error] = useState('');
  const [step4Errors, setStep4Errors] = useState({});
  const handleGuestNoChange = (e) => {
    setEventData((prev) => ({
      ...prev,
      noOfGuest: e.target.value,
    }));
  };
  const setSelectedDate = (date) => {
    setEventData((prev) => ({
      ...prev,
      selectedDate: date,
    }));
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

  // Auto-select first event type when event types are loaded
  useEffect(() => {
    if (eventTypes.length > 0 && !eventData.selectedOption.id) {
      setEventData((prev) => ({
        ...prev,
        selectedOption: {label: eventTypes[0].label, id: eventTypes[0].id},
      }));
    }
  }, [eventTypes]);

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
        const parsedEvent = JSON.parse(event);
        setEventData({
          ...parsedEvent,
          id: parsedEvent.id,
          eventId: parsedEvent.eventId,
        });
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
    } else {
      // If no user, try to restore eventData from localStorage
      const event = localStorage.getItem('@EventData');
      if (event) {
        const parsedEvent = JSON.parse(event);
        setEventData({
          ...parsedEvent,
          id: parsedEvent.id,
          eventId: parsedEvent.eventId,
        });
      }
    }
  }, [user]);

  const getEvents = async () => {
    try {
      const data = await Registry_Services.getEvents();
      if (!Array.isArray(data.data)) {
        setEventTypes([]);
        return;
      }
      const events = data.data.map((e) => ({
        label: e.name,
        id: e.id,
      }));
      setEventTypes(events);
    } catch (e) {}
  };

  const handleSelectChange = (value) => {
    setEventData((prev) => ({
      ...prev,
      selectedOption: {label: value.label, id: value.id},
    }));
  };

  const handleRegistry = async () => {
    const payload = {
      name: eventData.eventName || 'My Event', // Default event name if not provided
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
        // Log the backend response to inspect the keys
        // Use the correct key for registry id and event id (POST or PUT)
        const registryId =
          data.data.registry?.id || data.data.id || eventData.id;
        const eventId = data.data.event?.id || eventData.eventId;
        const event = {
          ...eventData,
          id: registryId, // registry id
          eventId: eventId, // event id
        };
        localStorage.setItem('@EventData', JSON.stringify(event));
        setEventData(event);
        setEventDateError('');
        setStep(step + 1);
      }
    } catch (e) {
      let backendMsg = e?.response?.data?.message || e?.message;
      if (Array.isArray(backendMsg)) backendMsg = backendMsg[0];
      if (
        backendMsg &&
        backendMsg.toLowerCase().includes('event date must be a future date')
      ) {
        setEventDateError('Event date must be a future date');
      } else {
        setEventDateError(backendMsg || 'An error occurred');
      }
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
        data = await Registry_Services.updateShippingAddress(payload, token);
      } else {
        data = await Registry_Services.addShippingAddress(payload, token);
      }
      if (!data || !data.data) {
        throw new Error('No data returned from shipping address API');
      }
      const shippingData = {
        ...addressData,
        id: data.data.id,
      };
      localStorage.setItem('@ShippingData', JSON.stringify(shippingData));
      setAddressData(shippingData);
      setStep(step + 1);
    } catch (e) {
      // Handle Shopify validation errors
      if (e?.response?.data?.shopifyError) {
        const shopifyError = e.response.data.shopifyError;
        const suggestions = e?.response?.data?.suggestions || [];
        
        if (shopifyError.includes('Invalid province/state')) {
          setStep4Errors({
            province: shopifyError,
            suggestions: suggestions
          });
        } else {
          // For other Shopify errors, show a general message with suggestions
          setStep4Errors({
            general: 'Address validation failed. Please check your address details.',
            suggestions: suggestions
          });
        }
      } else {
        // For other errors, show a general message
        setStep4Errors({
          general: 'Failed to save address. Please try again.'
        });
      }
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
    } catch (e) {}
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
        const storedCollections = localStorage.getItem(
          '@SelectedSubCollections',
        );

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
                collectionId: subCollection.id,
              },
            });

            if (result?.collection?.products?.edges) {
              // Store products for this collection
              const productsKey = `@Products_${subCollection.id}`;
              const productsString = JSON.stringify(
                result.collection.products.edges,
              );

              localStorage.setItem(productsKey, productsString);

              // Verify storage
              const storedProducts = localStorage.getItem(productsKey);
            }
          } catch (error) {}
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

  // Update goNext to validate before calling handleRegistry
  async function goNext() {
    if (step === 1) {
      // Skip step 2 (event name selection) and go directly to step 3 (guest info)
      // Auto-create registry with first event type
      await handleRegistry();
    } else if (step === 2) {
      if (!eventData.noOfGuest || eventData.noOfGuest.trim() === '') {
        setStep3Error('Number of guests is required');
        return;
      } else {
        setStep3Error('');
      }
      await handleNoOfGuest();
         } else if (step === 3) {
               // Step 4 validation - Simple validation
        const errors = {};
        
        // Phone Number validation
        if (!addressData.phoneNumber || addressData.phoneNumber.trim() === '') {
          errors.phoneNumber = 'Phone number is required';
        } else if (addressData.phoneNumber.length > 15) {
          errors.phoneNumber = 'Phone number must be 15 characters or less';
        } else if (addressData.phoneNumber.length < 10) {
          errors.phoneNumber = 'Phone number must be at least 10 characters long';
        }
        
        // Address validation
        if (!addressData.address || addressData.address.trim() === '') {
          errors.address = 'Address is required';
        } else if (addressData.address.trim().length < 5) {
          errors.address = 'Address must be at least 5 characters long';
        }
        
        // Postal Code validation
        if (!addressData.postalCode || addressData.postalCode.trim() === '') {
          errors.postalCode = 'Postal code is required';
        } else if (addressData.postalCode.length > 10) {
          errors.postalCode = 'Postal code must be 10 characters or less';
        } else if (addressData.postalCode.trim().length < 3) {
          errors.postalCode = 'Postal code must be at least 3 characters long';
        }
        
        // City validation
        if (!addressData.city || addressData.city.trim() === '') {
          errors.city = 'City is required';
        } else if (addressData.city.trim().length < 2) {
          errors.city = 'City must be at least 2 characters long';
        }
        
        // Province/State validation
        if (!addressData.province || addressData.province.trim() === '') {
          errors.province = 'Province/State is required';
        } else if (addressData.province.trim().length < 2) {
          errors.province = 'Province/State must be at least 2 characters long';
        }
        
        // Country validation
        if (!addressData.country || addressData.country.trim() === '') {
          errors.country = 'Country is required';
        } else if (addressData.country.trim().length < 2) {
          errors.country = 'Country must be at least 2 characters long';
        }
       setStep4Errors(errors);
       if (Object.keys(errors).length > 0) return;
       await handleShipping();
    } else if (step === 4) {
      // Validate that at least one gift preference is selected
      if (!selectedGiftPreference) {
        alert('Please select your gift preference to continue.');
        return;
      }
      setStep(step + 1);
         } else if (step === 5) {
       // Validate that at least one collection is selected
       if (!selectedCollections || selectedCollections.length === 0) {
         alert('Please select at least one collection to continue.');
         return;
       }
       
       // Call API to update preferred categories when finishing Step 5
       if (user && user.user && user.user.id) {
         const preferredCategoryTitles = selectedCollections.map((col) => col.title);
         const token = user.accessToken;
         Registry_Services.updatePreferredCategories(
           user.user.id,
           {
             preferredCategory: preferredCategoryTitles,
             preferredSubCategory: selectedSubCollections.map((col) => col.title),
           },
           token
         );
       }
       setStep(step + 1);
         } else if (step === 6) {
       // Validate that at least one sub-collection is selected
       if (!selectedSubCollections || selectedSubCollections.length === 0) {
         alert('Please select at least one sub-collection to continue.');
         return;
       }
       
       // Call API to update preferred subcategories when finishing Step 6
       if (user && user.user && user.user.id) {
         const preferredSubCategoryTitles = selectedSubCollections.map((col) => col.title);
         const token = user.accessToken;
         Registry_Services.updatePreferredCategories(
           user.user.id,
           {
             preferredCategory: selectedCollections.map((col) => col.title),
             preferredSubCategory: preferredSubCategoryTitles,
           },
           token
         );
       }
       setStep(step + 1);
    } else if (step === 7) {
      await handleOnboard();
    }
  }

  const goBack = () => {
    if (step > 1) {
      const newStep = step - 1;
      setStep(newStep);
      // If going back to step 4 (shipping address), remove shipping data from localStorage
      // if (newStep === STEPS_CONSTANTS.SHIPPING_INFO) {
      //   localStorage.removeItem('@ShippingData');
      // }
    }
  };
  // Handler to skip to the next step without validation
  const handleSkip = () => setStep(step + 1);

  // Function to render steps dynamically
  const renderStepContent = (currentStep) => {
    if (currentStep === 7) {
      return (
        <div className="flex flex-col items-center justify-center text-white py-6 rounded-md">
          <div className="uppercase tracking-widest font-semibold mb-4 text-center text-xl md:text-xl">
            YOUR ACCOUNT IS CREATED.
          </div>
          <div className="my-4 flex flex-col items-center justify-center relative">
            {/* FPO Placeholder Image */}
            <div>
              <img src={onboardingGif} alt="" className="w-[163px] h-[163px]" />
            </div>
            {/* <div className="flex items-center justify-center w-16 h-12 bg-white mx-auto mb-4 absolute top-8 left-14">
              <span className="text-black font-normal text-lg">FPO GIF</span>
            </div> */}
          </div>
          <div className="font-semibold text-center mb-6 mt-4 text-base md:text-xl">
            Now it's time to set up your dashboard — your registry HQ.
          </div>
          <div className="text-center mb-6 text-lg md:text-xl max-w-xl">
            From tracking gifts and checking messages to sending thank-you notes and setting up your home page, everything you need lives here. You'll land here every time you log in.
          </div>
          <div className="uppercase font-semibold mb-6 text-center">READY?</div>
          <button
            className="bg-white text-black font-bold px-8 py-5 shadow hover:bg-gray-100 transition"
            onClick={async () => { await handleOnboard(); navigate('/dashboard'); }}
          >
            GO TO MY DASHBOARD
          </button>
        </div>
      );
    }
    switch (currentStep) {
      case STEPS_CONSTANTS.EVENT_DATE_INFO:
        return (
          <Step1
            setSelectedDate={setSelectedDate}
            selectedDate={eventData.selectedDate}
            onSkip={handleSkip}
          />
        );
      case STEPS_CONSTANTS.GUEST_INFO:
        return (
          <Step3
            value={eventData.noOfGuest}
            onChange={handleGuestNoChange}
            step3Error={step3Error}
            onSkip={handleSkip}
          />
        );
      case STEPS_CONSTANTS.SHIPPING_INFO:
        return (
          <Step4
            formData={addressData}
            handleInputChange={handleInputChange}
            step4Errors={step4Errors}
            onSkip={handleSkip}
          />
        );
      case STEPS_CONSTANTS.PREFER_GIFT_INFO:
        return <Step5 onGiftPreferenceSelect={setSelectedGiftPreference} selectedGiftPreference={selectedGiftPreference} />;
      case STEPS_CONSTANTS.COLLECTION_INFO:
        return (
          <Step6
            collections={collections}
            onCollectionsSelect={setSelectedCollections}
          />
        );
      case STEPS_CONSTANTS.STYLE_INFO:
        return (
          <Step7
            selectedCollections={selectedCollections}
            storefront={context.storefront}
            onSubCollectionsSelect={setSelectedSubCollections}
          />
        );
      default:
        return null;
    }
  };

  // Add this effect to notify parent of step changes
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  return (
    <div className="flex justify-center items-center">
      {/* Main content wrapper */}
      {/* Hide Stepper and buttons on last step */}
      {step !== 7 && <Stepper step={step} totalSteps={8} />}
      <div className="container p-6  max-[768px]:p-2 bg-rounded-md w-full">
        {/* Stepper for progress */}
        <div className="mb-6">
          {/* Render the step content dynamically */}
          {renderStepContent(step)}
        </div>
        {/* Back and Next buttons, hidden on last step */}
        {step !== 7 && (
          <div className="flex justify-between mt-4">
            {/* Only show back button if not on step 1 */}
            {step !== STEPS_CONSTANTS.EVENT_DATE_INFO && (
              <button
                onClick={goBack}
                type="submit"
                text="Next"
                className="absolute left-10 bottom-10 max-[768px]:bottom-5 max-[768px]:left-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]"
              >
                <img src={arrow} alt="" className="rotate-180 max-[768px]:w-4" />{' '}
                Back
              </button>
            )}
            <button
              onClick={goNext}
              type="submit"
              text="Next"
              className="absolute right-10 bottom-10 max-[768px]:bottom-5 max-[768px]:right-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]"
            >
              {step === 8 ? 'Submit' : 'Next'}{' '}
              <img src={arrow} alt="" className="max-[768px]:w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Step1 = ({selectedDate, setSelectedDate, onSkip}) => {
  const {useState, useEffect} = React;
  // Create disabled dates array - disable all dates before today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  
  const disabledDates = [
    { from: new Date(1900, 0, 1), to: new Date(today.getTime() - 24 * 60 * 60 * 1000) }
  ];

  // For step 1, we don't want to show the prefilled date initially
  const [localSelectedDate, setLocalSelectedDate] = useState(null);

  // Update local date when selectedDate changes (but only if it's a new selection, not the initial prefilled value)
  useEffect(() => {
    if (selectedDate && !localSelectedDate) {
      setLocalSelectedDate(selectedDate);
    }
  }, [selectedDate, localSelectedDate]);

  const handleDateChange = (date) => {
    setLocalSelectedDate(date);
    setSelectedDate(date);
  };

  return (
    <div className="text-center">
      <div className="p-4 w-[300px] mx-auto customdatepicker">
        <DatePicker
          selectedDate={localSelectedDate}
          onDateChange={handleDateChange}
          placeholder="Select a Date"
          inputProps={{
            className:
              'rounded-none p-8 border-[#B9B4AE] border-2 bg-white text-black customDatePicker',
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
          disabledDates={disabledDates}
        />
      </div>

    </div>
  );
};

const Step3 = ({value, onChange, step3Error, onSkip}) => {
  return (
    <div>
      <div className="text-center">
        {/* <Heading text={'How many guests are you inviting?'} /> */}
        <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto">
          This will help us calculate the magic number to ensure all guests have
          a good amount of gifts to choose from.
        </h2>
      </div>
      {/* Event Name Input */}
      <Input
        label="Number of Guests"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (/^\d*$/.test(val)) {
            onChange(e);
          }
        }}
        type="number"
        min="1"
        placeholder="Enter No Of Guest"
        className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black mx-auto mt-4 text-center text-3xl font-bold placeholder:text-lg placeholder:font-normal"
        classNameLabel="text-center mt-10 mb-3 text-[22px] max-[768px]:text-lg"
      />
      {step3Error && <div className="input-error-message">{step3Error}</div>}

    </div>
  );
};

const Step4 = ({formData, handleInputChange, step4Errors, onSkip}) => {
  // Submit handler to log the form data

  return (
    <div className="">
      <div className="text-center">
        {/* <Heading text={'Where would you like your gifts shipped?'} /> */}
        <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto">
          You can update your address at any time.
        </h2>
      </div>
      
      {/* General error message */}
      {step4Errors?.general && (
        <div role="alert" className="mb-4 text-left">
          <div className="mt-3">
            <span className="font-medium text-[#B00020] text-[18px]">
              {step4Errors.general}
            </span>
          </div>
          {step4Errors?.suggestions && step4Errors.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="font-medium mb-2">Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                {step4Errors.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-[18px]">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
        {/* Phone Number */}
        <Input
          placeholder="Phone Number *"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.phoneNumber}
        />

        {/* Address */}
        <Input
          placeholder="Address *"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.address}
        />

        {/* Postal Code */}
        <Input
          placeholder="Postal Code *"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.postalCode}
        />

        {/* City */}
        <Input
          placeholder="City *"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.city}
        />

        {/* Province */}
        <Input
          placeholder="Province/State *"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.province}
        />
        {/* Display suggestions for province errors */}
        {step4Errors?.province && step4Errors?.suggestions && step4Errors.suggestions.length > 0 && (
          <div className="col-span-2 mt-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
            <p className="font-semibold mb-2">Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              {step4Errors.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Country */}
        <Input
          placeholder="Country *"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.country}
        />
      </div>

    </div>
  );
};

const Step5 = ({onGiftPreferenceSelect, selectedGiftPreference}) => {
  const [selectedOption, setSelectedOption] = useState(selectedGiftPreference);

  // Sync local state with prop
  useEffect(() => {
    setSelectedOption(selectedGiftPreference);
  }, [selectedGiftPreference]);

  // Options for the grid
  const options = [
    {
      id: 1,
      label: 'Gifts',
      image: WorldBestBrands,
      selectedImage: selected,
    },
    {
      id: 3,
      label: 'Gifts + Cash',
      image: Both,
      selectedImage: selected,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* <Heading text={'What is your preferred gift?'} /> */}
      <h2 className="font-normal mb-4 mt-4 w-[80%] text-2xl max-[768px]:text-lg mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </h2>
      {/* Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              setSelectedOption(option.id);
              onGiftPreferenceSelect(option.id);
            }}
            className={`p-6 flex items-center justify-center flex-col max-[768px]:p-2 rounded-full text-center text-white font-normal text-[20px] ${
              selectedOption === option.id ? '' : ''
            }`}
          >
            <div
              className={`p-4 max-[768px]:p-2 max-[768px]:w-28 rounded-full w-40 aspect-[1/1] flex items-center justify-center ${
                selectedOption === option.id ? 'bg-[#223247]' : 'bg-[#F5F2ED]'
              }`}
            >
              {selectedOption === option.id ? (
                <img
                  src={option.selectedImage}
                  className="max-[768px]:w-16"
                  alt=""
                />
              ) : (
                <img src={option.image} className="max-[768px]:w-16" alt="" />
              )}
            </div>
            <span className="text-[20px] max-[768px]:text-[14px] font-bold text-center mt-4 uppercase flex justify-center">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Step6 = ({collections, onCollectionsSelect}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Filter collections to only show parent collections (excluding ready-made collections)
  const parentCollections =
    collections?.nodes?.filter((collection) => {
      // The metafield is directly accessible as metafield.value from the GraphQL query
      const isParentCollection = collection?.metafield?.value === 'true';
      const isReadyMade = collection?.readyMadeMetafield?.value === 'true';
      return isParentCollection && !isReadyMade;
    }) || [];

  // Mapping function to assign icons to collections based on title
  const getCollectionIcon = (collectionTitle) => {
    const title = collectionTitle.toLowerCase();
    
    // Map collection titles to specific icons
    if (title.includes('tableware') || title.includes('dining') || title.includes('plate') || title.includes('cup')) return Tableware;
    if (title.includes('kitchen') || title.includes('cook') || title.includes('utensil') || title.includes('appliance')) return Kitchen;
    if (title.includes('home decor') || title.includes('decoration') || title.includes('furniture') || title.includes('art')) return Homedecor;
    if (title.includes('bed') || title.includes('bath') || title.includes('bedroom') || title.includes('bathroom') || title.includes('linen')) return BedBath;
    if (title.includes('travel') || title.includes('outdoor') || title.includes('adventure') || title.includes('luggage')) return TravelOutdoors;
    if (title.includes('music') || title.includes('audio') || title.includes('sound') || title.includes('instrument')) return Music;
    if (title.includes('gift') || title.includes('present'));
    
    // Default fallback icon
  };

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
    <div className="flex flex-col items-center">
      <p className="font-normal mb-4 mt-4 w-[80%] text-2xl mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </p>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {parentCollections.length > 0 ? (
          parentCollections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => handleOptionClick(collection)}
              className={`p-6 flex items-center justify-center flex-col max-[768px]:p-2 rounded-full text-center text-white font-normal text-[20px] ${
                selectedOptions.some((item) => item.id === collection.id) ? '' : ''
              }`}
            >
              <div
                className={`p-4 max-[768px]:p-2 max-[768px]:w-28 rounded-full w-40 aspect-[1/1] flex items-center justify-center relative ${
                  selectedOptions.some((item) => item.id === collection.id) 
                    ? 'bg-[#223247]' 
                    : 'bg-[#F5F2ED]'
                }`}
              >
                {selectedOptions.some((item) => item.id === collection.id) ? (
                  <img
                    src={selected}
                    className="max-[768px]:w-16"
                    alt="Selected"
                  />
                ) : (
                  <img
                    src={getCollectionIcon(collection.title)}
                    className="max-[768px]:w-16 w-20 h-20 object-contain"
                    alt={collection.title}
                  />
                )}
              </div>
              <span className="text-[20px] max-[768px]:text-[14px] font-bold text-center mt-4 uppercase flex justify-center">
                {collection.title}
              </span>
            </button>
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500">No collections available.</p>
        )}
      </div>
    </div>
  );
};

const Step7 = ({selectedCollections, storefront, onSubCollectionsSelect}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [subCollectionsData, setSubCollectionsData] = useState([]);
  const [error, setError] = useState(null);
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    const fetchSubCollections = async () => {
      setError(null);
      const subCollectionIds = selectedCollections.flatMap((collection) => {
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
            body: JSON.stringify({ids: subCollectionIds}),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch collections');
          }
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

  // Update Swiper when data changes
  useEffect(() => {
    if (swiper && subCollectionsData.length > 0) {
      swiper.update();
    }
  }, [subCollectionsData, swiper]);

  const handleOptionClick = (subCollection) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((item) => item.id === subCollection.id);
      const newSelection = isSelected
        ? prev.filter((item) => item.id !== subCollection.id)
        : [
            ...prev,
            {
              id: subCollection.id,
              title: subCollection.title,
              image: subCollection.image,
              handle: subCollection.handle,
              description: subCollection.description,
            },
          ];
      onSubCollectionsSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="">
      <p className="font-normal mb-10 mt-4 w-[80%] text-2xl mx-auto text-center">
        Pick a style, and we'll make gift recommendations tailored to your
        taste.
      </p>
      <p className="font-normal mb-4 mt-4 w-[80%] text-2xl mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </p>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="relative">
        <div className="swiper-button-prev-subcollection absolute top-[60px] -left-16  cursor-pointer text-white uppercase flex ">
          <img src={nextitem} alt="" className="rotate-180 invert-100" />
          <span className="-rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>
        <Swiper
          key={subCollectionsData.length}
          spaceBetween={20}
          slidesPerView={4}
          loop={true}
          className="subcollection-swiper"
          modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next-subcollection',
            prevEl: '.swiper-button-prev-subcollection',
          }}
          onSwiper={setSwiper}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
        >
          {subCollectionsData.length > 0 ? (
            subCollectionsData.map((subCollection) => (
              <SwiperSlide key={subCollection.id}>
                <button
                  key={subCollection.id}
                  onClick={() => handleOptionClick(subCollection)}
                  className={`$${
                    selectedOptions.some((item) => item.id === subCollection.id)
                      ? ''
                      : ''
                  }`}
                >
                  {subCollection.image ? (
                    <div
                      className={
                        selectedOptions.some(
                          (item) => item.id === subCollection.id,
                        )
                          ? 'tickafter'
                          : ''
                      }
                    >
                      <Image
                        alt={subCollection.image.altText || subCollection.title}
                        aspectRatio="1/1"
                        data={{
                          url: subCollection.image.url,
                          altText: subCollection.image.altText,
                          width: 200,
                          height: 220,
                        }}
                        loading="lazy"
                        sizes="(min-width: 45em) (min-height: 45em) 400px, 100vw"
                      />
                    </div>
                  ) : (
                    <div
                      className={
                        selectedOptions.some(
                          (item) => item.id === subCollection.id,
                        )
                          ? 'tickafter'
                          : ''
                      }
                    >
                      <Image
                        alt={subCollection.title}
                        aspectRatio="1/1"
                        data={{
                          url: placeholder,
                          altText: subCollection.title,
                          width: 400,
                          height: 400,
                        }}
                        loading="lazy"
                        sizes="(min-width: 45em) 400px, 100vw"
                      />
                    </div>
                  )}
                  <span className="mt-4 block tracking-wider text-[15px] font-medium">
                    {subCollection.title}
                  </span>
                </button>
              </SwiperSlide>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500">
              {error
                ? 'Error loading sub-categories'
                : 'No sub-categories available. Please select parent categories in the previous step.'}
            </p>
          )}
        </Swiper>
        <div className="swiper-button-next-subcollection absolute top-[60px] -right-16 cursor-pointer text-white uppercase flex">
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
