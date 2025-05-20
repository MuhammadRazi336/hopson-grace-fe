import {useRef} from 'react';
import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Stepper from '~/components/Stepper.jsx';
import Button from '~/components/Button.jsx';

const Signup = () => {
  const formDataRef = useRef({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    confirmEmail: '',
    fianceFirstName: '',
    fianceLastName: '',
  });

  const handleSignup = async () => {
    const signupPayload = {
      firstName: formDataRef.current.firstName,
      lastName: formDataRef.current.lastName,
      email: formDataRef.current.email,
      password: formDataRef.current.password,
      confirmPassword: formDataRef.current.confirmPassword,
      confirmEmail: formDataRef.current.confirmEmail,
      fianceFirstName: formDataRef.current.fianceFirstName,
      fianceLastName: formDataRef.current.fianceLastName,
    };
    try {
      const response = await fetch('https://dev-hopsongrace.codup.io/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupPayload),
      });
      const data = await response.json();
      if (response.ok && data.data && data.data.accessToken) {
        // Store the token and user data
        localStorage.setItem('@Token', data.data.accessToken);
        localStorage.setItem('@User', JSON.stringify(data.data.User));
        // Optionally, redirect to onboarding
        window.location.href = '/onboarding';
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (e) {
      alert('Signup error: ' + e.message);
    }
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    // Directly modifying the ref object to store new value
    formDataRef.current[name] = value;
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
                value={formDataRef.current.firstName}
                onChange={handleInputChange}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formDataRef.current.lastName}
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
                value={formDataRef.current.fianceFirstName}
                onChange={handleInputChange}
              />
              <Input
                label="Fiance Last Name"
                name="fianceLastName"
                value={formDataRef.current.fianceLastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                value={formDataRef.current.email}
                onChange={handleInputChange}
              />
              <Input
                label="Confirm Email"
                name="confirmEmail"
                value={formDataRef.current.confirmEmail}
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
                value={formDataRef.current.password}
                onChange={handleInputChange}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formDataRef.current.confirmPassword}
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

export default Signup;
