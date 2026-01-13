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
import CashFundsIcon from '/assets/Images/cashFundCategory.png';
import TravelFundsIcon from '/assets/Images/travelFundCategory.png';

import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ModalPortal from '~/components/ModalPortal';
import nextitem from '/assets/Images/next.png';
import placeholder from '/assets/Images/placeholder.jpg';
import notsure from '/assets/Images/notsure.jpg';

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
    selectedDate: null,
    eventName: '',
    id: null,
    eventId: null,
  });
  const [eventDateError, setEventDateError] = useState('');
  const [step3Error, setStep3Error] = useState('');
  const [step4Errors, setStep4Errors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showProvincePopup, setShowProvincePopup] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);
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
    // Clear province error when user manually changes the province field
    if (name === 'province' && step4Errors?.province) {
      setStep4Errors((prev) => {
        const newErrors = {...prev};
        delete newErrors.province;
        delete newErrors.suggestions;
        return newErrors;
      });
      setShowProvincePopup(false);
    }
  };
  useEffect(() => {
    getEvents();
  }, []);

  // Preload the onboarding GIF
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const img = document.createElement('img');
    img.src = onboardingGif;
    
    // Check if image is already cached/loaded
    if (img.complete) {
      setGifLoaded(true);
    } else {
      img.onload = () => {
        setGifLoaded(true);
      };
      img.onerror = () => {
        // If GIF fails to load, still set loaded to avoid infinite loading state
        setGifLoaded(true);
      };
    }
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

  // Removed auto-select - users will select collections in the new step

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
          setStep(STEPS_CONSTANTS.STYLE_INFO);
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
    // Ensure event type is selected
    if (!eventData.selectedOption || !eventData.selectedOption.id) {
      // Try to use first available event type
      if (eventTypes.length > 0) {
        setEventData((prev) => ({
          ...prev,
          selectedOption: {label: eventTypes[0].label, id: eventTypes[0].id},
        }));
        // Wait for state update and retry
        setTimeout(async () => {
          await handleRegistry();
        }, 100);
        return;
      } else {
        setEventDateError('Event types are loading. Please wait...');
        return;
      }
    }

    const payload = {
      name: eventData.eventName || 'My Event', // Default event name if not provided
      ...(eventData.selectedDate && {eventDate: moment(eventData.selectedDate).format('YYYY-MM-DD')}),
      eventTypeId: Number(eventData.selectedOption.id),
      ...(eventData.id && {id: eventData.id}),
    };

    // Validate eventTypeId is a valid number
    if (!payload.eventTypeId || isNaN(payload.eventTypeId)) {
      setEventDateError('Invalid event type. Please refresh the page.');
      return;
    }

    const token = localStorage.getItem('@Token');
    if (!token) {
      setEventDateError('Authentication required. Please log in again.');
      return;
    }

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
          // Show popup when province error occurs
          if (suggestions && suggestions.length > 0) {
            setShowProvincePopup(true);
          }
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

      // Handle collections and sub-collections from backend with default/empty values
      // Send empty arrays to backend if no selections were made
      if (user && user.user && user.user.id) {
        const preferredCategoryTitles = selectedCollections && selectedCollections.length > 0 
          ? selectedCollections.map((col) => col.title) 
          : [];
        const preferredSubCategoryTitles = selectedSubCollections && selectedSubCollections.length > 0
          ? selectedSubCollections.map((col) => col.title)
          : [];
        
        // Update preferred categories with empty arrays if no selections
        try {
          await Registry_Services.updatePreferredCategories(
            user.user.id,
            {
              preferredCategory: preferredCategoryTitles,
              preferredSubCategory: preferredSubCategoryTitles,
            },
            token
          );
        } catch (error) {
          // If backend doesn't require these, continue anyway
          console.log('Preferred categories update skipped or failed:', error);
        }
      }

      // Store empty sub-collections array in localStorage if no selections
      try {
        const collectionsString = JSON.stringify(selectedSubCollections || []);
        localStorage.setItem('@SelectedSubCollections', collectionsString);
      } catch (storageError) {
        // Continue even if storage fails
        console.log('Storage error:', storageError);
      }

      // Navigate after all operations are complete
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (e) {
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  // Update goNext to validate before calling handleRegistry
  async function goNext() {
    if (step === 1) {
      // Validate that a date is selected
      if (!eventData.selectedDate) {
        setEventDateError('Please select an event date');
        return;
      }
      // Ensure event type is selected - use first available if not set
      if (!eventData.selectedOption || !eventData.selectedOption.id) {
        if (eventTypes.length > 0) {
          // Auto-select first event type
          const updatedEventData = {
            ...eventData,
            selectedOption: {label: eventTypes[0].label, id: eventTypes[0].id},
          };
          setEventData(updatedEventData);
          // Use updated data for registry creation
          const payload = {
            name: updatedEventData.eventName || 'My Event',
            ...(updatedEventData.selectedDate && {eventDate: moment(updatedEventData.selectedDate).format('YYYY-MM-DD')}),
            eventTypeId: Number(eventTypes[0].id),
            ...(updatedEventData.id && {id: updatedEventData.id}),
          };
          const token = localStorage.getItem('@Token');
          if (!token) {
            setEventDateError('Authentication required. Please log in again.');
            return;
          }
          try {
            const data = updatedEventData.id 
              ? await Registry_Services.updateRegistry(payload, token)
              : await Registry_Services.createRegistry(payload, token);
            if (data) {
              const registryId = data.data.registry?.id || data.data.id || updatedEventData.id;
              const eventId = data.data.event?.id || updatedEventData.eventId;
              const event = {
                ...updatedEventData,
                id: registryId,
                eventId: eventId,
              };
              localStorage.setItem('@EventData', JSON.stringify(event));
              setEventData(event);
              setEventDateError('');
              setStep(step + 1);
            }
          } catch (e) {
            let backendMsg = e?.response?.data?.message || e?.message;
            if (Array.isArray(backendMsg)) backendMsg = backendMsg[0];
            if (backendMsg && backendMsg.toLowerCase().includes('event date must be a future date')) {
              setEventDateError('Event date must be a future date');
            } else {
              setEventDateError(backendMsg || 'An error occurred');
            }
          }
          return;
        } else {
          setEventDateError('Event types are loading. Please wait...');
          return;
        }
      }
      // Clear any previous errors
      setEventDateError('');
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
    } else if (step === STEPS_CONSTANTS.GIFT_TYPES_INFO) {
      // Validate that at least one parent collection is selected
      if (!selectedCollections || selectedCollections.length === 0) {
        alert('Please select at least one gift type to continue.');
        return;
      }
      setStep(step + 1);
    } else if (step === STEPS_CONSTANTS.STYLE_INFO) {
      // Step 5 is now STYLE_INFO (sub-collections selection)
      // Validate that at least one sub-collection is selected
      if (!selectedSubCollections || selectedSubCollections.length === 0) {
        alert('Please select at least one style to continue.');
        return;
      }
      
      // Call API to update preferred categories when finishing Step 5
      if (user && user.user && user.user.id) {
        const preferredCategoryTitles = selectedCollections.map((col) => col.title);
        const preferredSubCategoryTitles = selectedSubCollections.map((col) => col.title);
        const token = user.accessToken;
        Registry_Services.updatePreferredCategories(
          user.user.id,
          {
            preferredCategory: preferredCategoryTitles,
            preferredSubCategory: preferredSubCategoryTitles,
          },
          token
        );
      }
      setStep(6);
    } else if (step === 6) {
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
    if (currentStep === 6) {
      return (
        <div className="flex flex-col items-center justify-center text-white rounded-md">
          <div className="uppercase tracking-widest font-semibold mb-0 text-center text-xl lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw]">
            YOUR ACCOUNT IS CREATED.
          </div>
          <div className="flex flex-col items-center justify-center relative">
            {/* FPO Placeholder Image */}
            <div className="relative w-[8.49vw] h-[8.49vw] flex items-center justify-center">
              {!gifLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={onboardingGif} 
                alt="" 
                onLoad={() => setGifLoaded(true)}
                onError={() => setGifLoaded(true)}
                className={`w-[8.49vw] h-[8.49vw] transition-opacity duration-300 ${
                  gifLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
            {/* <div className="flex items-center justify-center w-16 h-12 bg-white mx-auto mb-4 absolute top-8 left-14">
              <span className="text-black font-normal text-lg">FPO GIF</span>
            </div> */}
          </div>
          <div className="font-semibold text-center mt-2 text-base lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]">
            Now it's time to set up your dashboard — your registry HQ.
          </div>
          <div className="text-center mb-[20px] lg:mb-[1.563vw] xl:mb-[1.563vw] 2xl:mb-[1.563vw] text-lg lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] w-[38.385vw] max-w-full">
            From tracking gifts and checking messages to sending thank-you notes and setting up your home page, everything you need lives here. You'll land here every time you log in.
          </div>
          <div className="uppercase font-semibold mb-2 text-center lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw]">READY?</div>
          <div className="mb-6">
            <label className="flex items-center justify-center gap-2 lg:gap-[0.833vw] xl:gap-[0.833vw] 2xl:gap-[0.833vw] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="custom-checkbox mt-1"
              />
              <span className="ivyora text-left lg:w-[22.396vw] xl:w-[22.396vw] 2xl:w-[22.396vw] font-normal text-[18px] lg:text-[0.781vw] xl:text-[0.781vw] 2xl:text-[0.781vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[768px]:text-base text-white">
                By creating your registry, you agree to our{' '}
                <a
                  href="/terms-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80 text-white"
                >
                  Terms & Conditions
                </a>
              </span>
            </label>
          </div>
          <button
            className={`font-bold px-8 py-5 shadow transition ${
              agreeToTerms
                ? 'bg-white text-black cursor-pointer hover:bg-gray-100'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
            onClick={async () => {
              if (agreeToTerms) {
                await handleOnboard();
                navigate('/dashboard');
              }
            }}
            disabled={!agreeToTerms}
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
            eventDateError={eventDateError}
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
      case STEPS_CONSTANTS.GIFT_TYPES_INFO:
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
      {step !== 6 && <Stepper step={step} totalSteps={7} />}
      <div className="container p-2  max-[768px]:p-2 bg-rounded-md w-full">
        {/* Stepper for progress */}
        <div className="mb-6">
          {/* Render the step content dynamically */}
          {renderStepContent(step)}
        </div>
        {/* Back and Next buttons, hidden on last step */}
        {step !== 6 && (
          <div className="flex justify-between mt-4">
            {/* Only show back button if not on step 1 */}
            {step !== STEPS_CONSTANTS.EVENT_DATE_INFO && (
              <button
                onClick={goBack}
                type="submit"
                text="Next"
                className="absolute cursor-pointer left-10 bottom-10 max-[768px]:bottom-5 max-[768px]:left-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]"
              >
                <img src={arrow} alt="" className="rotate-180 max-[768px]:w-4" />{' '}
                Back
              </button>
            )}
            <button
              onClick={goNext}
              type="submit"
              text="Next"
              className="absolute cursor-pointer right-10 bottom-10 max-[768px]:bottom-5 max-[768px]:right-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]"
            >
              Next{' '}
              <img src={arrow} alt="" className="max-[768px]:w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Province Suggestions Popup */}
      {showProvincePopup && step4Errors?.suggestions && step4Errors.suggestions.length > 0 && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-[#00000073] flex items-center justify-center z-50 p-4"
            onClick={() => setShowProvincePopup(false)}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowProvincePopup(false)}
                className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>

              {/* Popup Content */}
              <div className="mt-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Province/State Suggestions
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  {step4Errors?.province}
                </p>
                <div className="mb-4">
                  <p className="font-semibold mb-3 text-gray-700">Please select a valid province/state:</p>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {step4Errors.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer border border-gray-200 transition-colors"
                        onClick={() => {
                          handleInputChange({
                            target: {
                              name: 'province',
                              value: suggestion
                            }
                          });
                          setShowProvincePopup(false);
                          // Clear the error after selection
                          setStep4Errors((prev) => {
                            const newErrors = {...prev};
                            delete newErrors.province;
                            delete newErrors.suggestions;
                            return newErrors;
                          });
                        }}
                      >
                        <span className="text-gray-800">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setShowProvincePopup(false)}
                  className="w-full mt-4 px-4 py-2 bg-[#446184] text-white rounded hover:bg-[#36506d] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

const Step1 = ({selectedDate, setSelectedDate, eventDateError}) => {
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
          placeholder="Select a date *"
          inputProps={{
            className:
              'rounded-none p-8 border-[#B9B4AE] border-2 bg-white text-black customDatePicker',
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
          disabledDates={disabledDates}
        />
      </div>
      {eventDateError && (
        <div className="mt-4 text-[#B00020] text-[18px]">
          {eventDateError}
        </div>
      )}
      <div className="mt-4 text-center text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] p-8 ">
        <p>Note: Don’t have a date yet? Choose a placeholder date for now — you can update it anytime. Works for weddings, engagement parties or bridal showers.</p>
      </div>
    </div>
  );
};

const Step3 = ({value, onChange, step3Error, onSkip}) => {
  const handleSkipLater = () => {
    // Set value to 0 and skip the step
    const fakeEvent = {
      target: {
        name: 'noOfGuest',
        value: '0',
      },
    };
    onChange(fakeEvent);
    onSkip();
  };

  return (
    <div>
      <div className="text-center">
        {/* <Heading text={'How many guests are you inviting?'} /> */}
        <h2 className="font-normal  w-[80%] text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] max-[768px]:text-lg mx-auto">
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
      <div className="mt-4 text-center">
        <button
          onClick={handleSkipLater}
          className="font-normal text-[22px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] max-[768px]:text-base text-white underline hover:opacity-80"
        >
          I'LL  ADD  THIS  LATER
        </button>
      </div>
    </div>
  );
};

const Step4 = ({formData, handleInputChange, step4Errors, onSkip}) => {
  const handleSkipLater = () => {
    onSkip();
  };

  return (
    <div className="">
      <div className="text-center">
        {/* <Heading text={'Where would you like your gifts shipped?'} /> */}
        <h2 className="font-normal mb-4 mt-4 w-[80%] text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] max-[768px]:text-lg mx-auto">
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

        {/* Country */}
        <div className="flex flex-col mb-2 relative w-full">
          <div className="relative">
            <select
              name="country"
              id="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`rounded-none mt-2 p-5 border-[#B9B4AE] border-2 bg-white text-black w-full appearance-none cursor-pointer ${
                step4Errors?.country ? 'border-[#FD446F] focus:border-[#FD446F] focus:ring-[#FD446F]' : ''
              }`}
              aria-invalid={!!step4Errors?.country}
              aria-describedby={step4Errors?.country ? 'country-error' : undefined}
            >
              <option value="">Select Country *</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          {step4Errors?.country && (
            <div id="country-error" role="alert" className="mt-1 text-left">
              <span className="text-[#FD446F] font-medium text-[18px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[2.083vw] xl:leading-[2.083vw] 2xl:leading-[2.083vw] max-[1024px]:text-[17px]">
                {step4Errors.country}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={handleSkipLater}
          className="font-normal text-[22px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] max-[768px]:text-base text-white underline hover:opacity-80"
        >
          I'LL  ADD  THIS  LATER
        </button>
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
    {
      id: 4,
      label: 'Not Sure',
      image: placeholder,
      selectedImage: selected,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* <Heading text={'What is your preferred gift?'} /> */}
      <h2 className="font-normal mb-4 mt-4 w-[80%] text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] max-[768px]:text-lg mx-auto text-center">
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
              className={`p-4 max-[768px]:p-2 max-[768px]:w-28 rounded-full w-[8.021vw] h-[8.021vw] aspect-[1/1] flex items-center justify-center ${
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
            <span className="text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] max-[768px]:text-[14px] font-bold text-center mt-4 uppercase flex justify-center">
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
      // Check both metafield access patterns (with and without alias)
      const metafieldValue = collection?.parentMetafield?.value || collection?.metafield?.value;
      const isParentCollection = metafieldValue === 'true' || metafieldValue === true;
      const readyMadeValue = collection?.readyMadeMetafield?.value;
      const isReadyMade = readyMadeValue === 'true' || readyMadeValue === true;
      
      // Debug logging to help identify issues
      if (process.env.NODE_ENV === 'development') {
        console.log('Collection:', collection.title, {
          parentMetafield: collection?.parentMetafield,
          metafield: collection?.metafield,
          metafieldValue,
          isParentCollection,
          readyMadeMetafield: collection?.readyMadeMetafield,
          readyMadeValue,
          isReadyMade,
          willShow: isParentCollection && !isReadyMade
        });
      }
      
      return isParentCollection && !isReadyMade;
    }) || [];

  // Debug: Log filtered results
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Total collections received:', collections?.nodes?.length || 0);
      console.log('Parent collections filtered:', parentCollections.length);
      console.log('Parent collection titles:', parentCollections.map(c => c.title));
    }
  }, [collections, parentCollections]);

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
    if (title.includes('gift') || title.includes('present')) return Gift;
    if (title.includes('cash') || title.includes('present')) return CashFundsIcon;
    if (title.includes('travel') || title.includes('present')) return TravelFundsIcon;
    
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

  const handleFundClick = (fund) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((item) => item.id === fund.id);
      const newSelection = isSelected
        ? prev.filter((item) => item.id !== fund.id)
        : [...prev, fund];
      onCollectionsSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="flex flex-col items-center">
      <p className="font-normal uppercase mb-4 mt-4 w-[80%] text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[768px]:text-[14px] mx-auto text-center">
        Choose as many as you like
      </p>
      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {/* Render Shopify parent collections */}
        {parentCollections.length > 0 && parentCollections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => handleOptionClick(collection)}
            className={`p-3 flex items-center justify-center flex-col max-[768px]:p-2 rounded-full text-center text-white font-normal ${
              selectedOptions.some((item) => item.id === collection.id) ? '' : ''
            }`}
          >
            <div
              className={`p-3 max-[768px]:p-2 max-[768px]:w-20 rounded-full w-[5.5vw] h-[5.5vw] max-w-[100px] max-h-[100px] aspect-[1/1] flex items-center justify-center relative ${
                selectedOptions.some((item) => item.id === collection.id) 
                  ? 'bg-[#223247]' 
                  : 'bg-[#F5F2ED]'
              }`}
            >
              {selectedOptions.some((item) => item.id === collection.id) ? (
                <img
                  src={selected}
                  className="max-[768px]:w-12 w-12 h-12 object-contain"
                  alt="Selected"
                />
              ) : (
                <img
                  src={getCollectionIcon(collection.title)}
                  className="max-[768px]:w-12 w-18 h-18 object-contain"
                  alt={collection.title}
                />
              )}
            </div>
            <span className="text-[16px] lg:text-[0.833vw] xl:text-[0.833vw] 2xl:text-[0.833vw] lg:leading-[1vw] xl:leading-[1vw] 2xl:leading-[1vw] max-[768px]:text-[12px] font-bold text-center mt-3 uppercase flex justify-center">
              {collection.title}
            </span>
          </button>
        ))}
        
        {parentCollections.length === 0 && (
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
    if (swiper) {
      const timer = setTimeout(() => {
        swiper.update();
      }, 100);
      return () => clearTimeout(timer);
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

  // Calculate total slides (subCollections + "Not Sure" slide)
  const totalSlides = subCollectionsData.length > 0 
    ? subCollectionsData.length + 1 
    : 1;
  // Loop requires at least double the max slidesPerView (4 * 2 = 8)
  const shouldLoop = totalSlides > 8;

  return (
    <div className="">
      <p className="font-normal mb-10 mt-4 w-[80%] text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] max-[768px]:text-[14px] mx-auto text-center">
        Pick a style, and we'll make gift recommendations tailored to your
        taste.
      </p>
      <p className="font-normal mb-4 mt-4 w-[80%] text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] max-[768px]:text-[14px] mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </p>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="relative">
        <div className="swiper-button-prev-subcollection absolute top-[60px] -left-16  cursor-pointer text-white uppercase flex ">
          <img src={nextitem} alt="" className="rotate-90 invert-100 lg:h-[1.042vw] xl:h-[1.042vw] 2xl:h-[1.042vw] h-[20px] lg:w-[1.042vw] xl:w-[1.042vw] 2xl:w-[1.042vw] w-[20px] max-[1024px]:w-[17px] max-[1024px]:h-[17px]" />
          <span className="-rotate-90 text-white block text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>
        <Swiper
          key={subCollectionsData.length}
          spaceBetween={20}
          slidesPerView={4}
          loop={shouldLoop}
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
            1100: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
        >
          {subCollectionsData.length > 0 ? (
            <>
              {subCollectionsData.map((subCollection) => (
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
                    <span className="mt-4 block tracking-wider text-[15px] font-medium min-h-[45px]">
                      {subCollection.title}
                    </span>
                  </button>
                </SwiperSlide>
              ))}
              {/* Static "Not Sure" option */}
              <SwiperSlide key="not-sure-static">
                <button
                  onClick={() => {
                    const notSureOption = {
                      id: 'not-sure-static',
                      title: 'Not Sure',
                      image: { url: notsure },
                      handle: 'not-sure',
                      description: 'Not Sure'
                    };
                    handleOptionClick(notSureOption);
                  }}
                  className={`$${
                    selectedOptions.some((item) => item.id === 'not-sure-static')
                      ? ''
                      : ''
                  }`}
                >
                  <div
                    className={
                      selectedOptions.some(
                        (item) => item.id === 'not-sure-static',
                      )
                        ? 'tickafter'
                        : ''
                    }
                  >
                    <Image
                      alt="Not Sure"
                      aspectRatio="1/1"
                      data={{
                        url: notsure,
                        altText: 'Not Sure',
                        width: 400,
                        height: 400,
                      }}
                      loading="lazy"
                      sizes="(min-width: 45em) 400px, 100vw"
                    />
                  </div>
                  <span className="mt-4 block tracking-wider text-[15px] font-medium min-h-[45px]">
                    Not Sure
                  </span>
                </button>
              </SwiperSlide>
            </>
          ) : (
            <>
              {error ? (
                <p className="col-span-2 text-center text-gray-500">
                  Error loading sub-categories
                </p>
              ) : (
                <SwiperSlide key="not-sure-static">
                  <button
                    onClick={() => {
                      const notSureOption = {
                        id: 'not-sure-static',
                        title: 'Not Sure',
                        image: { url: notsure },
                        handle: 'not-sure',
                        description: 'Not Sure'
                      };
                      handleOptionClick(notSureOption);
                    }}
                    className={`$${
                      selectedOptions.some((item) => item.id === 'not-sure-static')
                        ? ''
                        : ''
                    }`}
                  >
                    <div
                      className={
                        selectedOptions.some(
                          (item) => item.id === 'not-sure-static',
                        )
                          ? 'tickafter'
                          : ''
                      }
                    >
                      <Image
                        alt="Not Sure"
                        aspectRatio="1/1"
                        data={{
                          url: notsure,
                          altText: 'Not Sure',
                          width: 400,
                          height: 400,
                        }}
                        loading="lazy"
                        sizes="(min-width: 45em) 400px, 100vw"
                      />
                    </div>
                    <span className="mt-4 block tracking-wider text-[15px] font-medium">
                      Not Sure
                    </span>
                  </button>
                </SwiperSlide>
              )}
            </>
          )}
        </Swiper>
        <div className="swiper-button-next-subcollection absolute top-[60px] -right-16 cursor-pointer text-white uppercase flex">
          <span className="rotate-90 text-white text-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] block tracking-wider max-[1024px]:hidden">
            more
          </span>
          <img src={nextitem} className="rotate-270 invert-100 lg:h-[1.042vw] xl:h-[1.042vw] 2xl:h-[1.042vw] h-[20px] lg:w-[1.042vw] xl:w-[1.042vw] 2xl:w-[1.042vw] w-[20px] max-[1024px]:w-[17px] max-[1024px]:h-[17px]" alt="" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingClient;
