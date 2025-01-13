import {useRef, useState} from 'react';
import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Stepper from '~/components/Stepper.jsx';
import Button from '~/components/Button.jsx';
import {useSubmit, useActionData} from '@remix-run/react';
import {redirect} from '@shopify/remix-oxygen';

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
      return {...response};
    }
  } catch (e) {
    return {...e};
  }
}

const RegisterIndex = () => {
  const submit = useSubmit();
  const actionData = useActionData();
  console.log(actionData, 'Action');

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

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
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
    <div className="flex justify-center items-center min-h-screen bg-white">
      {/* Main content wrapper */}
      <Stepper step={1} totalSteps={8} />
      <div className="container p-6 bg-white rounded-md w-full max-w-4xl mx-4">
        {/* Stepper for progress */}

        <form
          className="space-y-6 max-w-full w-full mx-auto"
          onSubmit={handleSignup}
        >
          {/* Render the step content dynamically */}
          <div className="text-center">
            <Heading text="Lovely to meet you" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={formData.firstName}
              onChange={handleInputChange}
              label="First Name"
              name="firstName"
              required
            />
            <Input
              value={formData.lastName}
              onChange={handleInputChange}
              label="Last Name"
              name="lastName"
              required
            />
          </div>
          <div className="text-center">
            <Heading text="And your Fiance?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={formData.fianceFirstName}
              onChange={handleInputChange}
              label="Fiance First Name"
              name="fianceFirstName"
              required
            />
            <Input
              value={formData.fianceLastName}
              onChange={handleInputChange}
              label="Fiance Last Name"
              name="fianceLastName"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={formData.email}
              onChange={handleInputChange}
              label="Email"
              name="email"
              type="email"
              required
            />
            <Input
              value={formData.confirmEmail}
              onChange={handleInputChange}
              label="Confirm Email"
              name="confirmEmail"
              type="email"
              required
            />
          </div>
          <div className="text-center">
            <Heading text="Create your account" className="text-center" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={formData.password}
              onChange={handleInputChange}
              label="Password"
              name="password"
              type="password"
              required
            />
            <Input
              value={formData.confirmPassword}
              onChange={handleInputChange}
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
            />
          </div>

          {/* Back and Next buttons */}
          <div className="flex justify-end mt-4">
            {/* Add any additional buttons if needed */}
            <Button type="submit" text="Next" />
          </div>
        </form>
        <div
          style={{
            color: actionData?.statusCode >= 400 ? 'red' : 'inherit',
          }}
        >
          {actionData?.statusCode >= 400 && actionData?.message?.length
            ? actionData?.message[0]
            : actionData?.message}
        </div>
      </div>
    </div>
  );
};

export default RegisterIndex;
