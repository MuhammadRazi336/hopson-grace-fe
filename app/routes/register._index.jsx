import {useRef, useState} from 'react';
import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Stepper from '~/components/Stepper.jsx';
import Button from '~/components/Button.jsx';
import {useSubmit, useActionData} from '@remix-run/react';
import {redirect} from '@shopify/remix-oxygen';
import StepsAndImage from '~/components/StepsAndImage';
import arrow from '/assets/Images/arrow.png';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(payload, 'auth/signup', context);

    if (response?.code === 200) {
      const user = response.data;
      context.session.set('@User', user);
      const cookie = await context.session.commit();
      return redirect('/onboarding?step=3', {
        headers: {
          'Set-Cookie': cookie,
        },
      });
    } else {
      return {
        statusCode: 422,
        message: response.message || 'Registration failed',
      };
    }
  } catch (e) {
    return {
      statusCode: 422,
      message: e.message || 'An error occurred during signup',
    };
  }
}

const RegisterIndex = () => {
  const submit = useSubmit();
  const actionData = useActionData();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fianceFirstName: '',
    fianceLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    confirmEmail: '',
    preferTextNotifications: false,
  });
  const [errors, setErrors] = useState({});

  // Step titles
  const stepTitles = {
    1: "let's get to know each other.",
    2: "and your partner?",
    3: "who should we keep in the loop?."
  };

  // Navigation functions
  const goNext = () => {
    console.log('goNext called, currentStep:', currentStep);
    console.log('formData:', formData);
    
    if (currentStep === 1) {
      // Validate user names - check for empty strings and trim whitespace
      const firstName = formData.firstName?.trim();
      const lastName = formData.lastName?.trim();
      
      console.log('Step 1 validation - firstName:', firstName, 'lastName:', lastName);
      
      if (!firstName || !lastName) {
        console.log('Validation failed');
        setErrors({ 
          firstName: !firstName ? 'First name is required' : '', 
          lastName: !lastName ? 'Last name is required' : '' 
        });
        return;
      }
      
      console.log('Validation passed, moving to step 2');
      // Clear any existing errors
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate partner names
      const fianceFirstName = formData.fianceFirstName?.trim();
      const fianceLastName = formData.fianceLastName?.trim();
      
      if (!fianceFirstName || !fianceLastName) {
        setErrors({ 
          fianceFirstName: !fianceFirstName ? 'Fiance first name is required' : '', 
          fianceLastName: !fianceLastName ? 'Fiance last name is required' : '' 
        });
        return;
      }
      
      // Clear any existing errors
      setErrors({});
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate and submit
      if (!validate()) return;
      handleSignup();
    }
  };

  // Direct step navigation function
  const handleNextClick = () => {
    console.log('handleNextClick called');
    console.log('Current step before:', currentStep);
    
    // Test direct state change first
    if (currentStep === 1) {
      console.log('Attempting direct state change to step 2');
      setCurrentStep(2);
      console.log('State change called');
    } else {
      try {
        goNext();
      } catch (error) {
        console.error('Error in goNext:', error);
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({}); // Clear errors when going back
    }
  };

  // Parse backend errors for password fields
  const backendPasswordErrors = {};
  if (actionData?.message && typeof actionData.message === 'string') {
    if (actionData.message.toLowerCase().includes('password must be longer')) {
      backendPasswordErrors.password = 'Password must be at least 6 characters';
    }
    if (
      actionData.message
        .toLowerCase()
        .includes('confirmpassword must be longer')
    ) {
      backendPasswordErrors.confirmPassword =
        'Confirm password must be at least 6 characters';
    }
  }

  // Frontend validation for required fields
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.fianceFirstName)
      newErrors.fianceFirstName = 'Fiance first name is required';
    if (!formData.fianceLastName)
      newErrors.fianceLastName = 'Fiance last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.confirmEmail)
      newErrors.confirmEmail = 'Confirm email is required';
    else if (formData.email !== formData.confirmEmail)
      newErrors.confirmEmail = 'Emails do not match';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (
      actionData?.statusCode === 422 &&
      actionData?.message?.toLowerCase().includes('email already exists')
    ) {
      newErrors.email = 'This email is already registered';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    // For name fields, allow any case but ensure first letter is capitalized
    let processedValue = value;
    if (['firstName', 'lastName', 'fianceFirstName', 'fianceLastName'].includes(name)) {
      // Only capitalize first letter, preserve the rest as user types
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    setErrors((prev) => ({...prev, [name]: undefined}));
  };

  const handleSignup = async () => {
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fianceFirstName: formData.fianceFirstName,
      fianceLastName: formData.fianceLastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      confirmEmail: formData.confirmEmail,
    };
    submit({payload}, {method: 'post', encType: 'application/json'});
  };
  // Step 1: User Names
  const renderStep1 = () => (
    <div className="text-center">
      <div className="space-y-6">
        <div className="text-center mt-[3.01vw]">
          <Heading
            text="YOUR NAME?"
            classes="font-normal text-[12px] leading-[18px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] m-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1 max-[1024px]:gap-1">
          <Input
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First *"
            name="firstName"
            className="mt-2 p-2 border border-gray-300 rounded w-80 rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0 pr-12 "
            classNameLabel="max-[580px]:text-left"
            error={errors.firstName}
          />
          <Input
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last *"
            name="lastName"
            className="mt-2 p-2 border border-gray-300 rounded w-80 rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0 pr-12 "
            classNameLabel="max-[580px]:text-left"
            error={errors.lastName}
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Partner Names
  const renderStep2 = () => (
    <div className="text-center">
      <div className="space-y-6">
        {/* Show previously entered user name, autofilled and disabled */}
        <div className="mb-6">
          <Heading
            text="YOUR NAME?"
            classes="font-normal text-[22px] m-0"
          />
          <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1 mt-4">
            <Input
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First *"
              name="firstName"
              className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
              classNameLabel="max-[580px]:text-left"
              disabled
            />
            <Input
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last *"
              name="lastName"
              className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
              classNameLabel="max-[580px]:text-left"
              disabled
            />
          </div>
        </div>
        <div className="text-center">
          <Heading
            text="AND YOUR FIANCÉ?"
            classes="font-normal text-[22px] m-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
          <Input
            value={formData.fianceFirstName}
            onChange={handleInputChange}
            placeholder="First *"
            name="fianceFirstName"
            className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
            classNameLabel="max-[580px]:text-left"
            error={errors.fianceFirstName}
          />
          <Input
            value={formData.fianceLastName}
            onChange={handleInputChange}
            placeholder="Last *"
            name="fianceLastName"
            className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
            classNameLabel="max-[580px]:text-left"
            error={errors.fianceLastName}
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Auth Info
  const renderStep3 = () => (
    <div className="text-center">
      <div className="space-y-6">
        <div className="text-center mb-4">
        <h2 className="font-normal mb-4 mt-4 w-[80%] lg:w-[29.74vw] xl:w-[29.74vw] 2xl:w-[29.74vw] text-[24px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw] max-[768px]:text-lg mx-auto">
          We'll use this email to keep you updated on gifts notifications and all things registry.
        </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
          <Input
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email *"
            name="email"
            type="email"
            className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
            error={
              errors.email ||
              (actionData?.statusCode === 422 &&
              actionData?.message
                ?.toLowerCase()
                .includes('email already exist')
                ? 'This email is already registered'
                : undefined)
            }
          />
          <Input
            value={formData.confirmEmail}
            onChange={handleInputChange}
            placeholder="Confirm Email *"
            name="confirmEmail"
            className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
            type="email"
            error={errors.confirmEmail}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
          <Input
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password *"
            name="password"
            type="password"
            className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
            error={errors.password || backendPasswordErrors.password}
            showPasswordTooltip={true}
          />
          <Input
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password *"
            name="confirmPassword"
            type="password"
            className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
            error={
              errors.confirmPassword ||
              backendPasswordErrors.confirmPassword
            }
            showPasswordTooltip={true}
          />
        </div>
        <div className="mt-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="preferTextNotifications"
              checked={formData.preferTextNotifications}
              onChange={handleInputChange}
              className="mt-1"
            />
            <span className="font-normal text-[18px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] max-[768px]:text-base text-white">
              Click here if you'd prefer to receive your notifications by text. We'll still send the occasional email (but no spam, we promise).
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-white">
        <StepsAndImage
          title={stepTitles[currentStep]}
          stepNo={(currentStep <= 2 ? 1 : 2).toString()}
          totalSteps="8"
          showBackButton={currentStep > 1}
          onBackClick={goBack}
          content={
            <div className="flex h-full items-center">
              <div className="space-y-6 max-w-full w-full h-full mx-auto">
                {renderCurrentStep()}
                
                {/* Navigation buttons */}
                <div className="flex justify-end mt-8 absolute lg:bottom-[2.135vw] xl:bottom-[2.135vw] 2xl:bottom-[2.135vw] lg:right-[1.823vw] xl:right-[1.823vw] 2xl:right-[1.823vw] max-[1024px]:right-[28px]">
                  <button
                    onClick={handleNextClick}
                    type="button"
                    className="flex items-center uppercase font-bold gap-2 text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] bg-transparent border-none"
                    style={{ cursor: 'pointer', zIndex: 9999 }}
                  >
                    {currentStep === 3 ? 'Submit' : 'Next'} <img src={arrow} className="lg:w-[1.25vw] xl:w-[1.25vw] 2xl:w-[1.25vw] w-[24px] max-[1024px]:w-[17px]" alt="" />
                  </button>
                </div>
              </div>
            </div>
          }
        />
        {/* Main content wrapper */}
        <Stepper step={currentStep <= 2 ? 1 : 2} totalSteps={8} />
      </div>
      <Footer />
    </>
  );
};

export default RegisterIndex;
