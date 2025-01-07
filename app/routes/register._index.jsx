import {useRef, useState} from 'react';
import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Stepper from '~/components/Stepper.jsx';
import Button from '~/components/Button.jsx';
import {useFetcher} from '@remix-run/react';
import {redirect} from '@shopify/remix-oxygen';

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(payload, 'auth/signup', context);
    const user = response.data;
    context.session.set('@User', user);
    const cookie = await context.session.commit();
    return redirect('/onboarding', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (e) {
    console.log(e);
    return null;
  }
}
const RegisterIndex = () => {
  const fetcher = useFetcher(); // For triggering server actions
  const formDataRef = useState({
    firstName: '',
    lastName: '',
    fianceFirstName: '',
    fianceLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    confirmEmail: '',
  });
  const handleSignup = async () => {
    const payload = {
      firstName: formDataRef.firstName,
      lastName: formDataRef.lastName,
      fianceFirstName: formDataRef.fianceFirstName,
      fianceLastName: formDataRef.fianceLastName,
      email: formDataRef.email,
      password: formDataRef.password,
      confirmPassword: formDataRef.confirmPassword,
      confirmEmail: formDataRef.confirmEmail,
    };
    fetcher.submit(
      {payload}, // Send data as key-value pairs
      {
        method: 'post',
        encType: 'application/json',
      },
    );
  };
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    // Directly modifying the ref object to store new value
    formDataRef[name] = value;
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {/* Main content wrapper */}
      <Stepper step={1} totalSteps={8} />

      <div className="container p-6 bg-white rounded-md w-full max-w-4xl mx-4">
        {/* Stepper for progress */}

        <div className="mb-6">
          {/* Render the step content dynamically */}
          <>
            <div className="text-center">
              <Heading text="Lovely to meet you" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formDataRef.firstName}
                onChange={handleInputChange}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formDataRef.lastName}
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
                value={formDataRef.fianceFirstName}
                onChange={handleInputChange}
              />
              <Input
                label="Fiance Last Name"
                name="fianceLastName"
                value={formDataRef.fianceLastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                value={formDataRef.email}
                onChange={handleInputChange}
              />
              <Input
                label="Confirm Email"
                name="confirmEmail"
                value={formDataRef.confirmEmail}
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
                value={formDataRef.password}
                onChange={handleInputChange}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formDataRef.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </>
        </div>

        {/* Back and Next buttons */}
        <div className="flex justify-end mt-4">
          {/*<Button text="Back" onClick={goBack} disabled={step === 1} />*/}
          <Button text={'Next'} onClick={handleSignup} />
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;
