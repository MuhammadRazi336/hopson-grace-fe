import {useEffect, useState} from 'react';
import {useLoaderData} from '@remix-run/react';

import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Button from '~/components/Button.jsx';
import Stepper from '~/components/Stepper.jsx';
import CustomSelect from '~/components/CustomSelect.jsx';
import DatePicker from '~/components/Datepicker.jsx';
import moment from 'moment';
import Registry_Services from '~/Services/Registry.js';
import {STEPS_CONSTANTS} from '../constants/UiConstants';
const OnboardingClient = ({}) => {
  const {user} = useLoaderData();
  const [step, setStep] = useState(STEPS_CONSTANTS.EVENT_DATE_INFO);
  const [eventTypes, setEventTypes] = useState([]);
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
        setStep(
          user.StepNumber === 1
            ? STEPS_CONSTANTS.GUEST_INFO
            : user.StepNumber === 2
            ? STEPS_CONSTANTS.SHIPPING_INFO
            : user.stepNumber === 3
            ? STEPS_CONSTANTS.PREFER_GIFT_INFO
            : STEPS_CONSTANTS.EVENT_DATE_INFO,
        );
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
    } catch (e) {}
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
    }
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Form submission logic
  function handleSubmit(e) {
    e.preventDefault();
  }

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
        return <Step6 />;
      case STEPS_CONSTANTS.STYLE_INFO:
        return <Step7 />;
      default:
        return null;
    }
  };

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
          <Button text={step === 3 ? 'Submit' : 'Next'} onClick={goNext} />
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

const Step6 = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the grid
  const options = [
    {id: 1, label: 'Kitchen Essentials'},
    {id: 2, label: 'Tableware + Entertaining'},
    {id: 3, label: 'Home Decor + Furniture'},
    {id: 4, label: 'Bed + Bath'},
    {id: 5, label: 'Travel/Outdoors'},
    {id: 6, label: 'Music + Tech'},
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

const Step7 = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the grid
  const options = [
    {id: 1, label: 'Minimalist', imgSrc: 'https://via.placeholder.com/150'},
    {id: 2, label: 'Maximalist', imgSrc: 'https://via.placeholder.com/150'},
    {id: 3, label: 'Transitional', imgSrc: 'https://via.placeholder.com/150'},
    {
      id: 4,
      label: 'Modern Farmhouse',
      imgSrc: 'https://via.placeholder.com/150',
    },
    {id: 5, label: 'Boho Chic', imgSrc: 'https://via.placeholder.com/150'},
    {
      id: 6,
      label: 'Mid-Century Modern',
      imgSrc: 'https://via.placeholder.com/150',
    },
  ];

  return (
    <div className="flex flex-col items-center p-8">
      {/* Heading */}
      <Heading text={'Pick your Style'} />

      {/* Grid */}
      <div className="flex flex-row gap-4">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-4 border rounded-lg text-center font-medium cursor-pointer ${
              selectedOption === option.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {/* Image */}
            <div className="flex justify-center items-center mb-4 h-28 w-28 bg-gray-200 rounded-md">
              <img alt="option" src={option.imgSrc} />
            </div>
            {/* Label */}
            <p className="text-sm font-medium">{option.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingClient;
