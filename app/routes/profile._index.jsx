import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import React, {useEffect, useState} from 'react';
import ButtonComponent from '~/components/Button';
import Input from '~/components/Input';
import axiosInstance from '~/Services/interceptor';
import {requireAuth} from '~/utils/auth-guard';

export async function loader(args) {
  const {context} = args;

  const user = await requireAuth(context);
  return {user};
}

export async function action({request, context}) {
  const user = await requireAuth(context);
  const body = await request.json();
  const {payload} = body;

  try {
    const response = await context.ClientPut(
      payload,
      `users/${user?.user?.id}`,
      context,
    );

    if (response?.code === 200) {
      const getUser = await context.ClientGet(
        `users/${user?.user?.id}`,
        context,
      );
      const sessionUser = {
        accessToken: user.accessToken,
        ...getUser.data,
      };
      context.session.set('@User', sessionUser);
      const cookie = await context.session.commit();
      const updatedUser = response.data;

      return redirect('/profile', {
        headers: {
          'Set-Cookie': cookie,
        },
      });
    } else {
      return {error: response?.message || 'Failed to update profile'};
    }
  } catch (error) {
    return {error: error.message};
  }
}

const Profile = () => {
  const {user} = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const [formData, setFormData] = useState({
    firstName: user?.user?.firstName,
    lastName: user?.user?.lastName,
    fianceFirstName: user?.user?.fianceFirstName,
    fianceLastName: user?.user?.fianceLastName,
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fianceFirstName: formData.fianceFirstName,
      fianceLastName: formData.fianceLastName,
      password: formData.password,
    };

    submit({payload}, {method: 'post', encType: 'application/json'});
  };

  return (
    <>
      <div>
        <div className="px-7">
          <h1 className="uppercase">Profile:</h1>
        </div>

        <div className="flex justify-around">
          <div>
            <form onSubmit={handleSubmit}>
              <div className="flex">
                <div className="p-4">
                  <label htmlFor="" className="text-xl font-semibold">
                    You
                  </label>
                </div>
                <div className="ml-14">
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={'First Name'}
                  />
                  {actionData?.error?.firstName && (
                    <p className="text-red-600">{actionData.error.firstName}</p>
                  )}
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={'Last Name'}
                  />
                  {actionData?.error?.lastName && (
                    <p className="text-red-600">{actionData.error.lastName}</p>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="p-4">
                  <label htmlFor="" className="text-xl font-semibold">
                    Fiance
                  </label>
                </div>
                <div className="ml-8">
                  <Input
                    name="fianceFirstName"
                    value={formData.fianceFirstName}
                    onChange={handleChange}
                    placeholder={'First Name'}
                  />
                  {actionData?.error?.fianceFirstName && (
                    <p className="text-red-600">
                      {actionData.error.fianceFirstName}
                    </p>
                  )}
                  <Input
                    name="fianceLastName"
                    value={formData.fianceLastName}
                    onChange={handleChange}
                    placeholder={'Last Name'}
                  />
                  {actionData?.error?.fianceLastName && (
                    <p className="text-red-600">
                      {actionData.error.fianceLastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="p-4">
                  <label htmlFor="" className="text-xl font-semibold">
                    Change <br />
                    Password
                  </label>
                </div>
                <div className="ml-1">
                  <Input
                    name="password"
                    type="password"
                    onChange={handleChange}
                    placeholder={'Password'}
                  />
                  {actionData?.error?.fianceFirstName && (
                    <p className="text-red-600">
                      {actionData.error.fianceFirstName}
                    </p>
                  )}
                  <Input
                    name="confirmPassword"
                    type="password"
                    onChange={handleChange}
                    placeholder={'Confirm Password'}
                  />
                  {actionData?.error?.fianceLastName && (
                    <p className="text-red-600">
                      {actionData.error.fianceLastName}
                    </p>
                  )}
                  <ButtonComponent
                    type="submit"
                    text={'Submit'}
                    className="mt-4"
                  />
                </div>
              </div>
            </form>
          </div>

          <div>
            <p className="py-8 text-lg font-semibold">
              Change/Enter Shipping Address
            </p>
            <ul>
              <li className="text-lg font-semibold">Fields:</li>
              <li className="text-lg font-semibold">1-Phone#</li>
              <li className="text-lg font-semibold">2-Address</li>
              <li className="text-lg font-semibold">3-Postal Code</li>
              <li className="text-lg font-semibold">4-City</li>
              <li className="text-lg font-semibold">5-Province</li>
              <li className="text-lg font-semibold">6-Country</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
