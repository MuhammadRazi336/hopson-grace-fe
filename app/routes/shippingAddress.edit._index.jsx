import {
  redirect,
  useActionData,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import React, {useState, useEffect} from 'react';
import ButtonComponent from '~/components/Button';
import Input from '~/components/Input';
import {requireAuth} from '~/utils/auth-guard';

export async function loader(args) {
  const {context} = args;

  const user = await requireAuth(context);

  try {
    const response = await context.ClientGet(
      `users/shippingAddress/${user?.user?.id}`,
      context,
    );
    if (response?.code === 200) {
      return {shippingAddress: response.data, user};
    } else {
      throw new Response(
        response?.message || 'Failed to fetch shipping address',
        {
          status: response?.code || 500,
        },
      );
    }
  } catch (error) {
    throw new Response(error.message || 'An unexpected error occurred', {
      status: 500,
    });
  }
}

export async function action({request, context}) {
  const user = await requireAuth(context);
  const body = await request.json();
  const {payload} = body;
  console.log('🚀 ~ action ~ payload:', payload.id);

  try {
    const response = await context.ClientPut(
      payload,
      `users/shippingAddress/${payload.id}`,
      context,
    );

    if (response?.code === 200) {
      return redirect('/shippingAddress/edit');
    } else {
      return {error: response?.message || 'Failed to update profile'};
    }
  } catch (error) {
    return {error: error.message};
  }
}

const ShippingAddress = () => {
  const {shippingAddress} = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const [formData, setFormData] = useState({
    id: shippingAddress?.id,
    phoneNumber: shippingAddress?.phoneNumber,
    address: shippingAddress?.address,
    postalCode: shippingAddress?.postalCode,
    city: shippingAddress?.city,
    province: shippingAddress?.province,
    country: shippingAddress?.country,
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      postalCode: formData.postalCode,
      city: formData.city,
      province: formData.province,
      country: formData.country,
    };

    submit({payload}, {method: 'post', encType: 'application/json'});
  };

  return (
    <>
      <div>
        <div className="px-7">
          <h1 className="uppercase">Change Shipping Address</h1>
        </div>

        <div className="mx-8">
          <form onSubmit={handleSubmit}>
            <div className="flex">
              <div className="p-4">
                <label htmlFor="" className="text-xl font-semibold">
                  Phone
                </label>
              </div>
              <div className="ml-5">
                <Input
                  name="phoneNumber"
                  value={formData?.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex">
              <div className="p-4">
                <label htmlFor="" className="text-xl font-semibold">
                  Address
                </label>
              </div>
              <div className="ml-1">
                <Input
                  name="address"
                  value={formData?.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex">
              <div className="p-4">
                <label htmlFor="" className="text-xl font-semibold">
                  Postal Code
                </label>
              </div>
              <div className="ml-6">
                <Input
                  name="postalCode"
                  value={formData?.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex">
              <div className="p-4">
                <label htmlFor="" className="text-xl font-semibold">
                  City
                </label>
              </div>
              <div className="ml-11">
                <Input
                  name="city"
                  value={formData?.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex">
              <div className="p-4">
                <label htmlFor="" className="text-xl font-semibold">
                  Province
                </label>
              </div>
              <div>
                <Input
                  name="province"
                  value={formData?.province}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex">
              <div className="p-4">
                <label htmlFor="" className="text-xl font-semibold">
                  Country
                </label>
              </div>
              <div className="ml-1">
                <Input
                  name="country"
                  value={formData?.country}
                  onChange={handleChange}
                />
                <ButtonComponent
                  text={'Submit'}
                  type="submit"
                  className="mt-4"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ShippingAddress;
