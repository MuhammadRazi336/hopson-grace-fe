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
      return redirect('/onboarding', {
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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fianceFirstName: '',
    fianceLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    confirmEmail: '',
  });
  const [errors, setErrors] = useState({});

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
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({...prev, [name]: undefined}));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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
  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-white">
        <StepsAndImage
          title="let's get to know each other."
          stepNo="1"
          totalSteps="9"
          content={
            <div className="flex h-full items-center">
              {/* Stepper for progress */}

              <form
                className="space-y-6 max-w-full w-full mx-auto"
                onSubmit={handleSignup}
              >
                {/* Render the step content dynamically */}
                <div className="text-center mt-6">
                  <Heading
                    text="YOUR NAME?"
                    classes="font-normal text-[22px]  m-0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
                  <Input
                    value={formData.firstName}
                    onChange={handleInputChange}
                    label="First *"
                    name="firstName"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    classNameLabel="max-[580px]:text-left"
                    error={errors.firstName}
                  />
                  <Input
                    value={formData.lastName}
                    onChange={handleInputChange}
                    label="Last *"
                    name="lastName"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    classNameLabel="max-[580px]:text-left"
                    error={errors.lastName}
                  />
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
                    label="First *"
                    name="fianceFirstName"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    classNameLabel="max-[580px]:text-left"
                    error={errors.fianceFirstName}
                  />
                  <Input
                    value={formData.fianceLastName}
                    onChange={handleInputChange}
                    label="Last *"
                    name="fianceLastName"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    classNameLabel="max-[580px]:text-left"
                    error={errors.fianceLastName}
                  />
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
                {/* <div className="text-center">
        <Heading text="Create your account" className="text-center" />
      </div> */}
                <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
                  <Input
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password *"
                    name="password"
                    type="password"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    error={errors.password || backendPasswordErrors.password}
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
                  />
                </div>

                {/* Back and Next buttons */}
                <div className="flex justify-end mt-4 absolute bottom-6 right-6">
                  {/* Add any additional buttons if needed */}
                  <button
                    type="submit"
                    text="Next"
                    className="absolute right-10 bottom-2.5 flex items-center uppercase font-bold gap-2 z-10"
                  >
                    Next <img src={arrow} alt="" />
                  </button>
                </div>
              </form>
            </div>
          }
        />
        {/* Main content wrapper */}
        <Stepper step={1} totalSteps={8} />
      </div>
      <Footer />
    </>
  );
};

export default RegisterIndex;
