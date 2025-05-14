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

const OnboardingClient = ({}) => {
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
        data = await Registry_Services.updateShippingAddress(payload, token);
      } else {
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
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {/* Main content wrapper */}
      <Stepper step={step} totalSteps={8} />

      <div className="container p-6 bg-white rounded-md w-full max-w-4xl mx-4">
        {/* Stepper for progress */}

        <div className="mb-6">
          {/* Render the step content dynamically */}
          {renderStepContent(step)}
        </div>

        {/* Back and Next buttons */}
        <div className="flex justify-between mt-4">
          <Button text="Back" onClick={goBack} disabled={step === 1} />
          <Button text={step === 7 ? 'Submit' : 'Next'} onClick={goNext} />
        </div>
      </div>
    </div>
  );
};

const Step1 = ({selectedDate, setSelectedDate}) => {
  return (
    <div>
      <div className="p-4">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Choose a Date"
          inputProps={{
            className: 'border-gray-300 focus:border-gray-500',
          }}
          buttonLabels={{clear: 'Reset', apply: 'Confirm'}}
        />
      </div>
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
      <div>
        <CustomSelect
          title={'Event Type'}
          options={eventData}
          selected={selectedOption}
          setSelected={handleSelectChange}
          placeholder="Choose an option"
        />
      </div>
      {/* Event Name Input */}
      <Input
        label="Event Name"
        value={eventName}
        onChange={handleEventNameChange}
        placeholder="Enter event name"
      />
      <div>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Choose a Date"
          inputProps={{
            className: 'border-gray-300 focus:border-gray-500',
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
        <Heading text={'How many guests are you inviting?'} />
        <h2 className="text-l font-bold mb-4">
          {'(Lorem ipsum dolor sit amit.)'}
        </h2>
      </div>
      {/* Event Name Input */}
      <Input
        label="Number of Guests"
        value={value}
        onChange={onChange}
        placeholder="Enter No Of Guest"
      />
    </div>
  );
};

const Step4 = ({formData, handleInputChange}) => {
  // Submit handler to log the form data

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <div className="text-center">
        <Heading text={'Where would you like your gifts shipped?'} />
        <h2 className="text-l font-bold mb-4">
          {
            'You can update your address at any time or you can skip this step and add this later!'
          }
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Number */}
        <Input
          label="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter phone number"
        />

        {/* Address */}
        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter address"
        />

        {/* Postal Code */}
        <Input
          label="Postal Code"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          placeholder="Enter postal code"
        />

        {/* City */}
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Enter city"
        />

        {/* Province */}
        <Input
          label="Province"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          placeholder="Enter province"
        />

        {/* Country */}
        <Input
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="Enter country"
        />
      </div>
    </div>
  );
};

const Step5 = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the grid
  const options = [
    {id: 1, label: 'Cash'},
    {id: 2, label: 'Gifts & Cash'},
    {id: 3, label: 'Gifts'},
    {id: 4, label: 'Not Sure Yet'},
  ];

  return (
    <div className="flex flex-col items-center p-8">
      <Heading text={'What is your preferred gift?'} />
      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-6 border rounded-md text-center font-medium text-gray-700 ${
              selectedOption === option.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {option.label}
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


  const handleOptionClick = (collection) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((item) => item.id === collection.id);
      const newSelection = isSelected
        ? prev.filter((item) => item.id !== collection.id)
        : [...prev, collection];
      
      // Call the parent's callback with the updated selection
      onCollectionsSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="flex flex-col items-center p-8">
      <Heading text={'Help us get to know you.'} />
      <p className="text-center mb-6">
        What do you enjoy doing together? <br />
        Select as many as you would like!
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {parentCollections.length > 0 ? (
          parentCollections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => handleOptionClick(collection)}
              className={`p-6 border rounded-md text-center font-medium text-gray-700 transition-colors duration-200 ${
                selectedOptions.some((item) => item.id === collection.id)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {collection.title}
            </button>
          ))
        ) : (
          <p className="col-span-2 text-center text-gray-500">No collections available.</p>
        )}
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
            handle: subCollection.handle,
            description: subCollection.description
          }];
      
      // Call the parent's callback with the updated selection
      onSubCollectionsSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="flex flex-col items-center p-8">
      <Heading text={'Pick your Style'} />
      <p className="text-center mb-6">
        Select your preferred styles from the sub-categories
      </p>
      {error && (
        <p className="text-red-500 mb-4">
          Error: {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {subCollectionsData.length > 0 ? (
          subCollectionsData.map((subCollection) => (
            <button
              key={subCollection.id}
              onClick={() => handleOptionClick(subCollection)}
              className={`p-6 border rounded-md text-center font-medium text-gray-700 transition-colors duration-200 ${
                selectedOptions.some((item) => item.id === subCollection.id)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {subCollection.title}
            </button>
          ))
        ) : (
          <p className="col-span-2 text-center text-gray-500">
            {error ? 'Error loading sub-categories' : 'No sub-categories available. Please select parent categories in the previous step.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default OnboardingClient;
