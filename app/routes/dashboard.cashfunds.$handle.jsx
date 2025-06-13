import React, {useState} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
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
  const formData = await request.formData();
  
  try {
    const response = await context.ClientPost(
      formData,
      'registryProducts/cash-fund',
      context,
      {
        headers: {
          // Don't set Content-Type header, it will be automatically set with boundary
          // when sending FormData
        },
      }
    );
    return defer({response});
  } catch (e) {
    return defer({e});
  }
}

function NewCashFund() {
  const {cashFundData, registry} = useLoaderData();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cashFundName, setCashFundName] = useState(cashFundData?.name || '');
  const [allowAnyAmount, setAllowAnyAmount] = useState(!!cashFundData?.isAnyAmount);
  const [allowFixedAmount, setAllowFixedAmount] = useState(!!cashFundData?.isFixedAmount);
  const [totalGoal, setTotalGoal] = useState(cashFundData?.amount || '');
  const [hideFromGuests, setHideFromGuests] = useState(!!cashFundData?.isAmountHide);
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [noteToFamily, setNoteToFamily] = useState(cashFundData?.note || '');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const fetcher = useFetcher();

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Show alert immediately on submit, like add gifts index
  const handleFormSubmit = (e) => {
    if (!agreeToTerms) {
      e.preventDefault();
      alert('You must agree to the terms and conditions.');
      return;
    }
    if (!cashFundName || !totalGoal || !registry?.id) {
      e.preventDefault();
      alert('Please fill in all required fields.');
      return;
    }
    setAlertMessage('Cash fund has been added to your registry!');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 shadow-md rounded-md">
      {/* Alert Component */}
      {showAlert && (
        <div className={`fixed top-4 right-4 ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}>
          <div className="flex items-center">
            {alertType === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
            )}
            {alertType === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
      <fetcher.Form
        method="post"
        encType="multipart/form-data"
        className="space-y-6"
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Upload */}
          <div className="border rounded-md p-4 flex flex-col items-center">
            <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="max-h-48 object-contain" />
              ) : cashFundData?.image?.fileUrl ? (
                <img src={cashFundData.image.fileUrl} alt="Current" className="max-h-48 object-contain" />
              ) : (
                <span className="text-gray-500">Upload New Photo (Max 5MB)</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="mt-4"
              name="file"
              onChange={handlePhotoUpload}
            />
            <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
          </div>
          {/* Form Inputs */}
          <div>
            <div className="mb-4">
              <label htmlFor="cashFundName" className="block text-sm font-medium text-gray-700">
                Cash Fund Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cashFundName"
                name="name"
                value={cashFundName}
                onChange={e => setCashFundName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Allow Gifts in</label>
              <div className="flex items-center space-x-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAnyAmount"
                    checked={allowAnyAmount}
                    onChange={e => setAllowAnyAmount(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Any Amount</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFixedAmount"
                    checked={allowFixedAmount}
                    onChange={e => setAllowFixedAmount(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Fixed Amount</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="totalGoal" className="block text-sm font-medium text-gray-700">
                Total Goal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="totalGoal"
                name="amount"
                value={totalGoal}
                onChange={e => setTotalGoal(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="hideFromGuests"
                name="isAmountHide"
                checked={hideFromGuests}
                onChange={e => setHideFromGuests(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="hideFromGuests" className="ml-2 text-sm text-gray-700">Hide From Guests</label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
              <p className="text-sm text-gray-500 mt-1">Lorem ipsum dolor sit amet consectetur. A mauris nunc vel commodo amet venenatis tincidunt id vulputate.</p>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={e => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  required
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">Agree to Terms & Conditions</label>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="noteToFamily" className="block text-sm font-medium text-gray-700">Note to Family and Friends</label>
          <textarea
            id="noteToFamily"
            name="note"
            rows="3"
            value={noteToFamily}
            onChange={e => setNoteToFamily(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <input type="hidden" name="registryId" value={registry?.id || ''} />
        <div className="mt-6">
          <button
            className={`mt-4 w-full py-2 rounded-md ${fetcher.state === 'submitting' ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} text-white`}
            type="submit"
            disabled={fetcher.state === 'submitting'}
          >
            {fetcher.state === 'submitting' ? 'Adding to Registry...' : 'Add to Registry'}
          </button>
        </div>
      </fetcher.Form>
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default NewCashFund;
