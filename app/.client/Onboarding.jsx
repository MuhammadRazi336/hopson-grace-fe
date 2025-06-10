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
import {STEPS_CONSTANTS} from '../constants/UiConstants';
import arrow from '/assets/Images/arrow.png';
import collectionitems from '/assets/Images/collectionitems.png';
import selected from '/assets/Images/selected.png';
import {Image} from '@shopify/hydrogen';

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
  const [step2Errors, setStep2Errors] = useState({});
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
  // Main state for selected date
  const handleEventNameChange = (e) => {
    setEventData((prev) => ({
      ...prev,
      eventName: e.target.value,
    }));
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
    } catch (e) {}
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
  // Add frontend validation for Step 2
  const validateStep2 = () => {
    const errors = {};
    if (!eventData.eventName || eventData.eventName.trim() === '') {
      errors.eventName = 'Event name is required';
    }
    if (!eventData.selectedDate) {
      errors.selectedDate = 'Event date is required';
    }
    if (!eventData.selectedOption || !eventData.selectedOption.id) {
      errors.selectedOption = 'Event type is required';
    }
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update goNext to validate before calling handleRegistry
  async function goNext() {
    if (step === 1) {
      setStep(step + 1);
    } else if (step === 2) {
      if (!validateStep2()) return;
      await handleRegistry();
    } else if (step === 3) {
      if (!eventData.noOfGuest || eventData.noOfGuest.trim() === '') {
        setStep3Error('Number of guests is required');
        return;
      } else {
        setStep3Error('');
      }
      await handleNoOfGuest();
    } else if (step === 4) {
      // Step 4 validation
      const errors = {};
      if (!addressData.phoneNumber || addressData.phoneNumber.trim() === '') {
        errors.phoneNumber = 'Phone number is required';
      }
      if (!addressData.address || addressData.address.trim() === '') {
        errors.address = 'Address is required';
      }
      if (!addressData.postalCode || addressData.postalCode.trim() === '') {
        errors.postalCode = 'Postal code is required';
      }
      if (!addressData.city || addressData.city.trim() === '') {
        errors.city = 'City is required';
      }
      if (!addressData.province || addressData.province.trim() === '') {
        errors.province = 'Province/State is required';
      }
      if (!addressData.country || addressData.country.trim() === '') {
        errors.country = 'Country is required';
      }
      setStep4Errors(errors);
      if (Object.keys(errors).length > 0) return;
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
      const newStep = step - 1;
      setStep(newStep);
      // If going back to step 4 (shipping address), remove shipping data from localStorage
      // if (newStep === STEPS_CONSTANTS.SHIPPING_INFO) {
      //   localStorage.removeItem('@ShippingData');
      // }
    }
  };
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
            eventDateError={eventDateError}
            step2Errors={step2Errors}
          />
        );
      case STEPS_CONSTANTS.GUEST_INFO:
        return (
          <Step3
            value={eventData.noOfGuest}
            onChange={handleGuestNoChange}
            step3Error={step3Error}
          />
        );
      case STEPS_CONSTANTS.SHIPPING_INFO:
        return (
          <Step4
            formData={addressData}
            handleInputChange={handleInputChange}
            step4Errors={step4Errors}
          />
        );
      case STEPS_CONSTANTS.PREFER_GIFT_INFO:
        return <Step5 />;
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
          <button
            onClick={goBack}
            disabled={step === 1}
            type="submit"
            text="Next"
            className="absolute left-10 bottom-10 max-[768px]:bottom-5 max-[768px]:left-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]"
          >
            <img src={arrow} alt="" className="rotate-180 max-[768px]:w-4" />{' '}
            Back
          </button>
          <button
            onClick={goNext}
            type="submit"
            text="Next"
            className="absolute right-10 bottom-10 max-[768px]:bottom-5 max-[768px]:right-5 flex items-center uppercase font-bold gap-2 z-10 max-[768px]:text-[14px]"
          >
            {step === 7 ? 'Submit' : 'Next'}{' '}
            <img src={arrow} alt="" className="max-[768px]:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Step1 = ({selectedDate, setSelectedDate}) => {
  return (
    <div className="text-center">
      <div className="p-4 w-[300px] mx-auto customdatepicker">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          placeholder="Choose a Date"
          inputProps={{
            className:
              'rounded-none p-8 border-[#B9B4AE] border-2 bg-white text-black customDatePicker',
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
        />
      </div>
      <button className="border-b-2 border-b-white text-center mt-10">
        I'LL ADD THIS LATER
      </button>
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
  eventDateError,
  step2Errors,
}) => {
  return (
    <div>
      <div className="text-center">
        <Heading text={'Do You Have Other Events where guest may buy gifts?'} />
        <h2 className="text-l font-bold mb-4">
          {'(ie. bridal shower , engagement party)'}
        </h2>
      </div>
      <div className="customselect mb-6">
        <CustomSelect
          title={'Event Type'}
          options={eventData}
          selected={selectedOption}
          setSelected={handleSelectChange}
          placeholder="Choose an option"
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black"
        />
        {step2Errors?.selectedOption && (
          <div className="input-error-message">
            {step2Errors.selectedOption}
          </div>
        )}
      </div>
      {/* Event Name Input */}
      <Input
        label="Event Name"
        value={eventName}
        onChange={handleEventNameChange}
        placeholder="Enter event name"
        className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
        error={step2Errors?.eventName}
      />
      <div className="mt-6 customdatepicker">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Choose a Date"
          inputProps={{
            className:
              'rounded-none p-8 border-[#B9B4AE] border-2 bg-white text-black h-[68px] customDatePicker',
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
        />
        {step2Errors?.selectedDate && (
          <div className="input-error-message">{step2Errors.selectedDate}</div>
        )}
        {eventDateError && (
          <div className="input-error-message">{eventDateError}</div>
        )}
      </div>
    </div>
  );
};
const Step3 = ({value, onChange, step3Error}) => {
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
      <div className="text-center">
        <button type="button" className="mt-10 border-b-2 border-b-white">
          I'LL ADD THIS LATER
        </button>
      </div>
    </div>
  );
};

const Step4 = ({formData, handleInputChange, step4Errors}) => {
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
        <Input
          placeholder="Country *"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          error={step4Errors?.country}
        />
      </div>
      <div className="text-center">
        <button className="mt-10 border-b-2 border-b-white">
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
      selectedImage: selected,
    },
    {
      id: 2,
      label: 'Gifts & Cash',
      image: collectionitems,
      selectedImage: selected,
    },
    {id: 3, label: 'Gifts', image: collectionitems, selectedImage: selected},
    {
      id: 4,
      label: 'Not Sure Yet',
      image: collectionitems,
      selectedImage: selected,
    },
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
      <div className="grid grid-cols-2 max-[768px]:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
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

  // Filter collections to only show parent collections
  const parentCollections =
    collections?.nodes?.filter((collection) => {
      return collection?.metafield?.value === 'true';
    }) || [];

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
        Pick a style, and we'll make gift recommendations tailored to your
        taste.
      </p>
      <p className="font-normal mb-4 mt-4 w-[80%] text-2xl mx-auto text-center">
        CHOOSE AS MANY AS YOU'D LIKE:
      </p>
      <div className="">
        {/* <Swiper
          spaceBetween={0}
          slidesPerView={4}
          loop={true}
          className=""
        >
          {parentCollections.length > 0 ? (
            parentCollections.map((collection) => (
              <SwiperSlide key={collection.id}>
                <button
                  key={collection.id}
                  onClick={() => handleOptionClick(collection)}
                  className={`p-6 border rounded-md text-center font-medium text-gray-700 transition-colors duration-200 ${
                    selectedOptions.some((item) => item.id === collection.id)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {collection.image && (
                    <Image
                      alt={collection.image.altText || collection.title}
                      aspectRatio="1/1"
                      data={collection.image}
                      loading="lazy"
                      sizes="(min-width: 45em) 400px, 100vw"
                    />
                  )}
                  {collection.title}
                </button>
              </SwiperSlide>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500">No collections available.</p>
          )}
        </Swiper> */}
        <div className="relative">
          <div className="swiper-button-prev-collection absolute top-[90px] -left-16  cursor-pointer text-white uppercase flex ">
            <img src={nextitem} alt="" className="rotate-180 invert-100" />
            <span className="-rotate-90 text-white block tracking-wider max-[1024px]:hidden">
              more
            </span>
          </div>
          <Swiper
            spaceBetween={20}
            slidesPerView={4}
            loop={true}
            className=""
            modules={[Navigation]}
            navigation={{
              nextEl: '.swiper-button-next-collection',
              prevEl: '.swiper-button-prev-collection',
            }}
          >
            {parentCollections.length > 0 ? (
              parentCollections.map((collection) => {
                // Add this console.log to check each collection

                return (
                  <SwiperSlide key={collection.id}>
                    <button
                      key={collection.id}
                      onClick={() => handleOptionClick(collection)}
                      className={` ${
                        selectedOptions.some(
                          (item) => item.id === collection.id,
                        )
                          ? ''
                          : ''
                      }`}
                    >
                      {collection.image && (
                        <div
                          className={
                            selectedOptions.some(
                              (item) => item.id === collection.id,
                            )
                              ? 'tickafter'
                              : ''
                          }
                        >
                          <Image
                            alt={collection.image.altText || collection.title}
                            aspectRatio="1/1"
                            data={collection.image}
                            loading="lazy"
                            sizes="(min-width: 45em) 400px, 100vw"
                          />
                        </div>
                      )}
                      <span className="mt-4 block tracking-wider text-[15px] font-medium">
                        {collection.title}
                      </span>
                    </button>
                  </SwiperSlide>
                );
              })
            ) : (
              <p className="col-span-2 text-center text-gray-500">
                No collections available.
              </p>
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
    </div>
  );
};

const Step7 = ({selectedCollections, storefront, onSubCollectionsSelect}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [subCollectionsData, setSubCollectionsData] = useState([]);
  const [error, setError] = useState(null);

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
        <div className="swiper-button-prev-subcollection absolute top-[90px] -left-16  cursor-pointer text-white uppercase flex ">
          <img src={nextitem} alt="" className="rotate-180 invert-100" />
          <span className="-rotate-90 text-white block tracking-wider max-[1024px]:hidden">
            more
          </span>
        </div>
        <Swiper
          spaceBetween={20}
          slidesPerView={4}
          loop={true}
          className=""
          modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next-subcollection',
            prevEl: '.swiper-button-prev-subcollection',
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
                          width: subCollection.image.width,
                          height: subCollection.image.height,
                        }}
                        loading="lazy"
                        sizes="(min-width: 45em) 400px, 100vw"
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
