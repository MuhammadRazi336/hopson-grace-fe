import React, {useState} from 'react';
import {useActionData, useFetcher, useLoaderData} from '@remix-run/react';
import {defer} from '@shopify/remix-oxygen';

export async function loader(args) {
  const {context, params} = args;
  const registry = context?.session?.get('@Registry');

  // Await the critical data required to render initial state of the page
  const data = await context.ClientGet(
    `registryProducts/cash-fund/view/${params.handle}`,
    context,
  );
  return {cashFundData: data?.data || {}, registry};
}
export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(
      payload,
      'registryProducts/cash-fund',
      context,
    );
    return defer({response});
  } catch (e) {
    return defer({e});
  }
}
function NewCashFund() {
  const {cashFundData, registry} = useLoaderData();
  const [photo, setPhoto] = useState(null);
  const [cashFundName, setCashFundName] = useState(cashFundData?.name);
  const [allowAnyAmount, setAllowAnyAmount] = useState(
    cashFundData?.isAnyAmount,
  );
  const [allowFixedAmount, setAllowFixedAmount] = useState(
    cashFundData?.isFixedAmount,
  );
  const [totalGoal, setTotalGoal] = useState(cashFundData?.amount);
  const [hideFromGuests, setHideFromGuests] = useState(
    cashFundData?.isAmountHide,
  );
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [noteToFamily, setNoteToFamily] = useState(cashFundData?.note);
  const fetcher = useFetcher();
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!agreeToTerms) {
      alert('You must agree to the terms and conditions.');
      return;
    }

    // Handle form submission (e.g., send data to a server)
    const payload = {
      name: cashFundName,
      isAnyAmount: allowAnyAmount,
      isFixedAmount: allowFixedAmount,
      amount: Number(totalGoal),
      isAmountHide: hideFromGuests,
      note: noteToFamily,
      registryId: Number(registry[0].id),
    };
    fetcher.submit(
      {payload}, // Send data as key-value pairs
      {
        method: 'post',
        encType: 'application/json',
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-6">New Cash Fund</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Upload */}
        <div className="border rounded-md p-4 flex flex-col items-center">
          <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
            {photo ? (
              <img
                src={photo}
                alt="Uploaded"
                className="max-h-48 object-contain"
              />
            ) : (
              <span className="text-gray-500">Upload New Photo</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="mt-4"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Form Inputs */}
        <div>
          <div className="mb-4">
            <label
              htmlFor="cashFundName"
              className="block text-sm font-medium text-gray-700"
            >
              Cash Fund Name
            </label>
            <input
              type="text"
              id="cashFundName"
              value={cashFundName}
              onChange={(e) => setCashFundName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Allow Gifts in
            </label>
            <div className="flex items-center space-x-4 mt-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowAnyAmount}
                  onChange={(e) => setAllowAnyAmount(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Any Amount</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowFixedAmount}
                  onChange={(e) => setAllowFixedAmount(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Fixed Amount</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="totalGoal"
              className="block text-sm font-medium text-gray-700"
            >
              Total Goal
            </label>
            <input
              id="totalGoal"
              value={totalGoal}
              onChange={(e) => setTotalGoal(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="hideFromGuests"
              checked={hideFromGuests}
              onChange={(e) => setHideFromGuests(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="hideFromGuests"
              className="ml-2 text-sm text-gray-700"
            >
              Hide From Guests
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Lorem ipsum dolor sit amet consectetur. A mauris nunc vel commodo
              amet venenatis tincidunt id vulputate.
            </p>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 text-sm text-gray-700"
              >
                Agree to Terms & Conditions
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="noteToFamily"
          className="block text-sm font-medium text-gray-700"
        >
          Note to Family and Friends
        </label>
        <textarea
          id="noteToFamily"
          rows="3"
          value={noteToFamily}
          onChange={(e) => setNoteToFamily(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="mt-6">
        <button
          className="mt-4 w-full bg-black text-white py-2 rounded-md"
          onClick={handleSubmit}
        >
          Add to Registry{' '}
        </button>
      </div>
    </div>
  );
}

export default NewCashFund;
