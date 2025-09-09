import React, {useState, useRef} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {defer} from '@shopify/remix-oxygen';
import Input from '~/components/Input';
import { Footer } from '~/components/Footer';

export async function loader(args) {
  const {context} = args;
  const user = await context?.session?.get('@User');
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  if (!registry || !registry.data[0].id) {
    throw new Response('Registry not found in session', {status: 404});
  }

  return {registry};
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

function CreateNewCashFund() {
  const {registry} = useLoaderData();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cashFundName, setCashFundName] = useState('');
  const [allowAnyAmount, setAllowAnyAmount] = useState(true);
  const [allowFixedAmount, setAllowFixedAmount] = useState(false);
  const [totalGoal, setTotalGoal] = useState('');
  const [hideFromGuests, setHideFromGuests] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [noteToFamily, setNoteToFamily] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const fetcher = useFetcher();
  const fileInputRef = useRef(null);

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

  // Show feedback on fetcher.data change
  React.useEffect(() => {
    if (fetcher.data?.response) {
      setAlertMessage('Cash fund has been created and added to your registry!');
      setAlertType('success');
      setShowAlert(true);
      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    } else if (fetcher.data?.e) {
      setAlertMessage('Failed to create cash fund. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
    }
  }, [fetcher.data]);

  const handleFormSubmit = (e) => {


    if (!agreedToTerms) {
      e.preventDefault();
      setAlertMessage('You must agree to the terms and conditions.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }
    // Check if required fields are filled
    const isMissingRequiredFields = !cashFundName || !registry?.data[0]?.id || (allowFixedAmount && !totalGoal);
    
    if (isMissingRequiredFields) {
      e.preventDefault();
      setAlertMessage('Please fill in all required fields.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage('');
      }, 3000);
      return;
    }
    // Otherwise, allow form to submit
  };

  return (
    <>
    <div className="py-[110px] px-[120px]">
        <div className="p-[114px] bg-[#446184]">
          <h2 className="mt-0 text-white ivyora lg:text-3xl xl:text-[40px] 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
            <span className="prata uppercase">NEW CASH</span> or{' '}
            <span className="prata uppercase">TRAVEL</span> fund
          </h2>
          <img
            src="/assets/Images/new-cash-bdr.png"
            alt="Create New Cash Fund"
            className="max-w-[630px] mt-5 h-auto mx-auto"
          />

          <p className="max-w-4xl mb-10 text-[26px] mx-auto text-center text-white mt-5 font-normal leading-relaxed">
            Create your own custom cash fund for anything you dream of - from honeymoon adventures to home improvements. 
            Design it exactly how you want it and share it with your loved ones.
          </p>

          <div className="container mx-auto">
            <fetcher.Form method="post" encType="multipart/form-data" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Photo Section */}
                <div className="space-y-4">
                  <h2 className="text-white text-[18px] font-bold tracking-wide">
                    PHOTO
                  </h2>
                  <div className="bg-[#F5F2ED] aspect-square relative flex items-center justify-center w-[670px] h-[670px]">
                    <div className="text-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Cash Fund"
                          className="w-[670px] h-[670px] object-cover"
                        />
                      ) : (
                        <img
                          src={"/assets/Images/registrylogoSteps.png"}
                        alt="Cash Fund"
                        className="w-[300px] object-cover"
                      />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      name="file"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      className="cursor-pointer"
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <img
                        src="/assets/Images/edit-icon.png"
                        alt="edit"
                        className="absolute -top-6 size-[114px] -right-4 "
                      />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6 ">
                  <h2 className="text-white text-[18px] font-bold tracking-wide">
                    DETAILS
                  </h2>

                  <div className="rounded-lg">
                    <div className="w-full">
                      <Input
                        id="cashFundName"
                        name="name"
                        value={cashFundName}
                        className="bg-white w-full p-4 h-[82px]"
                        placeholder="e.g., HONEYMOON FUND, HOME RENOVATION"
                        onChange={(e) => setCashFundName(e.target.value)}
                      />
                    </div>

                    {/* Payment Type Toggle */}
                    <div className="flex mt-12 gap-4 mb-10 items-center justify-center">
                      <span className="text-white text-[18px] font-bold tracking-wide text-center">
                        ANY <br /> AMOUNT
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setAllowAnyAmount(true);
                          setAllowFixedAmount(false);
                          setTotalGoal(''); // Clear total goal when any amount is selected
                        }}
                        className={`flex items-center gap-2 h-[80px] w-[80px] px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          allowAnyAmount
                            ? 'bg-[#223247] text-white'
                            : 'bg-gray-200 text-white  hover:bg-gray-300'
                        }`}
                      >
                        {allowAnyAmount ? (
                          <img
                            src="/assets/Images/check-icon.png"
                            alt="check"
                            className="w-[36px] h-[36px] mx-auto"
                          />
                        ) : (
                          <span className="w-[36px] h-[36px]">&nbsp;</span>
                        )}
                      </button>
                      <span className="text-white text-[18px] font-bold tracking-wide text-center">
                        FIXED <br /> AMOUNT
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setAllowAnyAmount(false);
                          setAllowFixedAmount(true);
                        }}
                        className={`flex items-center gap-2 h-[80px] w-[80px] px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          allowFixedAmount
                            ? 'bg-[#223247] text-white'
                            : 'bg-gray-200 text-white hover:bg-gray-300'
                        }`}
                      >
                        {allowFixedAmount ? (
                          <img
                            src="/assets/Images/check-icon.png"
                            alt="check"
                            className="w-[36px] h-[36px] mx-auto"
                          />
                        ) : (
                          <span className="w-[36px] h-[36px]">&nbsp;</span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Total Goal Input */}
                      <div className="w-7/12">
                        <Input
                          id="totalGoal"
                          name="amount"
                          value={totalGoal}
                          className={`bg-white w-full p-4 h-[82px] ${allowAnyAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="Total Goal*"
                          onChange={(e) => setTotalGoal(e.target.value)}
                          disabled={allowAnyAmount}
                        />
                      </div>

                      {/* Hide from Guests Toggle */}
                      <div className=" flex items-center justify-center gap-5 w-5/12 pl-2">
                        <span className="text-white text-[18px] font-bold text-center">
                          HIDE <br /> FROM <br /> GUESTS
                        </span>

                        <button
                          type="button"
                          onClick={() => setHideFromGuests(!hideFromGuests)}
                          className={`flex items-center gap-2 h-[80px] w-[80px] px-4 py-4 rounded-full text-xs font-medium tracking-colors ${
                            hideFromGuests
                              ? 'bg-[#223247] text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {hideFromGuests ? (
                            <img
                              src="/assets/Images/check-icon.png"
                              alt="check"
                              className="w-[36px] h-[36px] mx-auto"
                            />
                          ) : (
                            <span className="w-[36px] h-[36px]">&nbsp;</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-3 mt-10">
                      <h4 className="text-white font-bold text-[18px] tracking-wide">
                        TERMS & CONDITIONS
                      </h4>
                      <p className="text-white text-[18px] prata tracking-wide italic font-normal ">
                        By creating this cash fund, you agree to our terms and conditions. 
                        This fund will be added to your registry and shared with your guests.
                      </p>
                      <div className="flex items-center space-x-2 mt-8">
                        <span className="text-white text-[14px] font-bold text-center">
                          AGREE
                        </span>

                        <button
                          type="button"
                          onClick={() => setAgreedToTerms(!agreedToTerms)}
                          className={`flex items-center gap-2 h-[32px] w-[32px] rounded-full text-xs font-medium tracking-wide transition-colors ${
                            agreedToTerms
                              ? 'bg-[#223247] text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {agreedToTerms ? (
                            <img
                              src="/assets/Images/check-icon.png"
                              alt="check"
                              className="w-4 h-4 mx-auto"
                            />
                          ) : (
                            <span className="w-4 h-4 mx-auto">&nbsp;</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Section */}
              <div className="mt-8 space-y-4">
                <textarea
                  placeholder="Write a short note to friends and family — explaining what this fund is for and why it's important to you (optional)."
                  name="note"
                  value={noteToFamily}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setNoteToFamily(e.target.value);
                    }
                  }}
                  maxLength={500}
                  className="w-full h-[270px] p-[45px] text-[24px] bg-white resize-none border-none outline-none"
                />
                <p className={`ivyora text-[18px] italic tracking-wide font-extralight ${
                  (500 - noteToFamily.length) < 50 ? 'text-red-400' : 'text-[#FFFCFC]'
                }`}>
                  {500 - noteToFamily.length}/500 characters remaining
                </p>
              </div>

              <input type="hidden" name="isAnyAmount" value={allowAnyAmount ? 'true' : 'false'} />
              <input type="hidden" name="isFixedAmount" value={allowFixedAmount ? 'true' : 'false'} />
              <input type="hidden" name="isAmountHide" value={hideFromGuests ? 'true' : 'false'} />
              <input type="hidden" name="registryId" value={registry?.data[0]?.id || ''} />

              {/* Create Cash Fund Button */}
              <div className="mt-8 flex justify-end">
                <button
                  className="bg-white font-bold text-[18px] hover:bg-gray-100 text-black tracking-wide w-[360px] h-[77px] border-3 border-black"
                  disabled={!agreedToTerms || fetcher.state === 'submitting'}
                  type="submit"
                >
                  {fetcher.state === 'submitting' ? 'Adding Cash Fund...' : 'ADD TO REGISTRY'}
                </button>
              </div>
            </fetcher.Form>

            {/* Alert Component */}
            {showAlert && (
              <div
                className={`fixed top-4 right-4 ${
                  alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}
              >
                <div className="flex items-center">
                  {alertType === 'success' && (
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                  {alertType === 'error' && (
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}
                  <span>{alertMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </>
  );
}

export default CreateNewCashFund;
