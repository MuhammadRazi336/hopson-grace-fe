import { useEffect, useRef, useState } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";

import Heading from "~/components/Heading.jsx";
import Input from "~/components/Input.jsx";
import Button from "~/components/Button.jsx";
import Stepper from "~/components/Stepper.jsx";
import CustomSelect from "~/components/CustomSelect.jsx";
import { redirect, json } from "@shopify/remix-oxygen";
import DatePicker from "~/components/Datepicker.jsx";
import moment from "moment";
import { getHydrogenContext } from "~/lib/hydrogenManager.js";
import { getCookie } from "~/utils/helpers.js";
import Registry_Services from "~/Services/Registry.js";
import axiosInstance from "~/Services/interceptor.js";
// export async function action({ request, context }) {
//   const body = await request.json();
//   try {
//     const { payload } = body;
//     let signup = payload.signupPayload;
//     let registry = payload.registryPayload;
//     const signupRes = await context.ClientPost(signup);
//     const bearerToken = signupRes.data.accessToken;
//     context.session.set('user_token', bearerToken);
//     const cookie = await context.session.commit();
//     new Response('Set-Cookie', {
//       headers: cookie,
//     });
//     const registryRes = context.ClientPost(registry);
//     console.log(registryRes)
//     return redirect("/" );
//     // return json({ data: signupResponse.data, requestType });
//   } catch (error) {
//     return json({ data: error });
//   }
// }

// export const loader = async ({ context }) => {
//   const data = await context.ClientGet("eventTypes", context);
//   const events = data.data.map((e) => {
//     return {
//       label: e.name,
//       value: e.id
//     };
//   });
//   return json({ events });
// };
const OnboardingClient = ({}) => {
  const { user } = useLoaderData();
  console.log(user, "User");
  const [step, setStep] = useState(5);
  const [eventTypes, setEventTypes] = useState([]);
  const formDataRef = useState({
    phoneNumber: "",
    address: "",
    postalCode: "",
    city: "",
    province: "",
    country: ""
  });
  const [noOfGuest, setNoOfGuest] = useState("");

  const handleGuestNoChange = (e) => {
    setNoOfGuest(e.target.value);
  };

  // General change handler for all fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Directly modifying the ref object to store new value
    formDataRef[name] = value;
  };
  useEffect(() => {
    getEvents();
  }, []);
  useEffect(() => {
    if (user) {
      const token = user.accessToken;
      localStorage.setItem("@Token", token);
    }
  }, [user]);
  const getEvents = async () => {
    try {
      const data = await Registry_Services.getEvents();
      const events = data.data.map((e) => {
        return {
          label: e.name,
          value: e.id
        };
      });
      setEventTypes(events);
    } catch (e) {
      console.log(e, "Catch");
    }

  };

  const [selectedOption, setSelectedOption] = useState("");
  const handleSelectChange = (value) => {
    setSelectedOption(value);
  };
  const [eventName, setEventName] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date()); // Main state for selected date
  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleRegistry = async () => {
    const payload = {
      name: eventName,
      eventDate: moment(selectedDate).format("YYYY-MM-DD"),
      eventTypeId: Number(selectedOption.value)
    };
    const token = localStorage.getItem("@Token");
    try {
      const data = await Registry_Services.createRegistry(payload, token);
      if (data) setStep(step + 1);
    } catch (e) {
      console.log(e, "eee");
    }
  };

  const handleShipping = async () => {
    const payload = {
      phoneNumber: formDataRef.phoneNumber,
      address: formDataRef.address,
      postalCode: formDataRef.postalCode,
      city: formDataRef.city,
      province: formDataRef.province,
      country: formDataRef.country
    };
    const token = localStorage.getItem("@Token");
    try {
      const data = await Registry_Services.addShippingAddress(payload,token)
      console.log(data , "Shipping Data")
    } catch (e) {
      console.log(e , "Exception")
    }
  };

  // Handlers for navigation
  async function goNext() {
    if (step === 1) {
      setStep(step + 1);
    } else if (step === 2) {
      setStep(step + 1);
    } else if (step === 3) {
      await handleRegistry();
    } else if (step === 4) {
    } else if (step === 5) {
      await handleShipping();

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
      case 1:
        return (
          <Step1 />
        );
      case 2:
        return (
          <Step2
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        );
      case 3:
        return (
          <Step3
            eventData={eventTypes}
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
            handleEventNameChange={handleEventNameChange}
            eventName={eventName}
            selectedOption={selectedOption}
            handleSelectChange={handleSelectChange}
          />
        );
      case 4:
        return <Step4 value={noOfGuest} onChange={handleGuestNoChange} />;
      case 5:
        return <Step5 formData={formDataRef} handleInputChange={handleInputChange} />;
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
        <div className="flex justify-end mt-4">
          {/*<Button text="Back" onClick={goBack} disabled={step === 1} />*/}
          <Button text={step === 3 ? "Submit" : "Next"} onClick={goNext} />
        </div>
      </div>
    </div>
  );
};

const Step1 = ({ formData, handleSubmit, handleInputChange }) => {
  return (
    <>
      <div className="text-center">
        <Heading text="Lovely to meet you" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
        />
      </div>
      <div className="text-center">
        <Heading text="And your Fiance?" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fiance First Name"
          name="fianceFirstName"
          value={formData.fianceFirstName}
          onChange={handleInputChange}
        />
        <Input
          label="Fiance Last Name"
          name="fianceLastName"
          value={formData.fianceLastName}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <Input
          label="Confirm Email"
          name="confirmEmail"
          value={formData.confirmEmail}
          onChange={handleInputChange}
        />
      </div>
      <div className="text-center">
        <Heading text="Create your account" className="text-center" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

const Step2 = ({ selectedDate, setSelectedDate }) => {
  return (
    <div>
      <div className="p-4">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Choose a Date"
          inputProps={{
            className: "border-gray-300 focus:border-gray-500"
          }}
          buttonLabels={{ clear: "Reset", apply: "Confirm" }}
        />
      </div>
    </div>
  );
};

const Step3 = ({
                 setSelectedDate,
                 selectedDate,
                 handleEventNameChange,
                 eventName,
                 selectedOption,
                 handleSelectChange,
                 eventData
               }) => {
  return (
    <div>
      <div className="text-center">
        <Heading text={"Do You Have Other Events where guest may buy gifts?"} />
        <h2 className="text-l font-bold mb-4">
          {"(ie. bridal shower , engagement party)"}
        </h2>
      </div>
      <div>
        <CustomSelect
          title={"Event Type"}
          options={eventData}
          value={selectedOption}
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
            className: "border-gray-300 focus:border-gray-500"
          }}
          buttonLabels={{ clear: "Reset", apply: "Confirm" }}
        />
      </div>
    </div>
  );
};
const Step4 = ({ value, onChange }) => {

  return (
    <div>
      <div className="text-center">
        <Heading text={"How many guests are you inviting?"} />
        <h2 className="text-l font-bold mb-4">
          {"(Lorem ipsum dolor sit amit.)"}
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

const Step5 = ({ formData, handleInputChange }) => {


  // Submit handler to log the form data

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <div className="text-center">
        <Heading text={"Where would you like your gifts shipped?"} />
        <h2 className="text-l font-bold mb-4">
          {
            "You can update your address at any time or you can skip this step and add this later!"
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

const Step6 = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the grid
  const options = [
    { id: 1, label: "Cash" },
    { id: 2, label: "Gifts & Cash" },
    { id: 3, label: "Gifts" },
    { id: 4, label: "Not Sure Yet" }
  ];

  return (
    <div className="flex flex-col items-center p-8">
      <Heading text={"What is your preferred gift?"} />
      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-6 border rounded-md text-center font-medium text-gray-700 ${
              selectedOption === option.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-100 hover:bg-gray-200"
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
    { id: 1, label: "Kitchen Essentials" },
    { id: 2, label: "Tableware + Entertaining" },
    { id: 3, label: "Home Decor + Furniture" },
    { id: 4, label: "Bed + Bath" },
    { id: 5, label: "Travel/Outdoors" },
    { id: 6, label: "Music + Tech" }
  ];

  return (
    <div className="flex flex-col items-center p-8">
      <Heading text={"What is your preferred gift?"} />
      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-6 border rounded-md text-center font-medium text-gray-700 ${
              selectedOption === option.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const Step8 = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Options for the grid
  const options = [
    { id: 1, label: "Minimalist", imgSrc: "https://via.placeholder.com/150" },
    { id: 2, label: "Maximalist", imgSrc: "https://via.placeholder.com/150" },
    { id: 3, label: "Transitional", imgSrc: "https://via.placeholder.com/150" },
    {
      id: 4,
      label: "Modern Farmhouse",
      imgSrc: "https://via.placeholder.com/150"
    },
    { id: 5, label: "Boho Chic", imgSrc: "https://via.placeholder.com/150" },
    {
      id: 6,
      label: "Mid-Century Modern",
      imgSrc: "https://via.placeholder.com/150"
    }
  ];

  return (
    <div className="flex flex-col items-center p-8">
      {/* Heading */}
      <Heading text={"Pick your Style"} />

      {/* Grid */}
      <div className="flex flex-row gap-4">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-4 border rounded-lg text-center font-medium cursor-pointer ${
              selectedOption === option.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {/* Image */}
            <div className="flex justify-center items-center mb-4 h-28 w-28 bg-gray-200 rounded-md">
              <img src={option.imgSrc} />
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
