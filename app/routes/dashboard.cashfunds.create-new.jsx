import React, {useState, useRef} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import Input from '~/components/Input';
import { Footer } from '~/components/Footer';

export async function loader(args) {
  const {context} = args;
  const user = await context?.session?.get('@User');

  // Check if user is logged in - redirect to login if not
  if (!user || !user.user || !user.user.id) {
    return redirect('/login');
  }

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
    <div className="py-[8.385vw] px-[7.083vw]">
        <div className="pt-[5.938vw] pb-[4.115vw] px-[5.833vw] bg-[#446184]">
          <h2 className="mt-0 text-white ivyora lg:text-[2.083vw] text-[24px] prata text-center lg:leading-[1.875vw] font-normal mb-[1.667vw]">
            <span className="prata uppercase">NEW CASH</span> or{' '}
            <span className="prata uppercase">TRAVEL</span> fund
          </h2>
          <img
            src="/assets/Images/new-cash-bdr.png"
            alt="Create New Cash Fund"
            className="max-w-[630px] lg:w-[39.219vw] lg:h-[0.417vw] mt-0 h-auto mx-auto"
          />

          <p className="w-[46.927vw] max-w-full mb-[5.26vw] text-[26px] lg:text-[1.354vw] lg:leading-[1.875vw] mx-auto text-center text-white mt-5 font-normal leading-relaxed">
            Create your own custom cash fund for anything you dream of - from honeymoon adventures to home improvements. 
            Design it exactly how you want it and share it with your loved ones.
          </p>

          <div className="w-full mx-auto">
            <fetcher.Form method="post" encType="multipart/form-data" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[3.49vw]">
                {/* Photo Section */}
                <div className="space-y-4">
                  <h2 className="text-white text-[18px] mb-[1.042vw] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold tracking-wide">
                    PHOTO
                  </h2>
                  <div className="bg-[#F5F2ED] aspect-square relative flex items-center justify-center w-[35.313vw] h-[35.313vw]">
                    <div className="text-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Cash Fund"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={"/assets/Images/registrylogoSteps.png"}
                        alt="Cash Fund"
                        className="w-[16.042vw] object-cover"
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
                        className="absolute -top-6 size-[5.938vw] -right-4 "
                      />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6 ">
                  <h2 className="text-white text-[18px] mb-[1.042vw] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold tracking-wide">
                    DETAILS
                  </h2>

                  <div className="rounded-lg">
                    <div className="w-full">
                      <Input
                        id="cashFundName"
                        name="name"
                        value={cashFundName}
                        className="bg-white lg:text-[0.938vw] font-bold uppercase w-full p-4 !m-0 h-[4.271vw]"
                        placeholder="e.g., HONEYMOON FUND, HOME RENOVATION"
                        onChange={(e) => setCashFundName(e.target.value)}
                      />
                    </div>

                    {/* Payment Type Toggle */}
                    <div className="flex mt-[1.7vw] gap-4 lg:gap-[1.042vw] mb-[6.354vw] items-center justify-center">
                      <span className="text-white text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold tracking-wide text-center">
                        ANY <br /> AMOUNT
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setAllowAnyAmount(true);
                          setAllowFixedAmount(false);
                          setTotalGoal(''); // Clear total goal when any amount is selected
                        }}
                        className={`flex items-center gap-2 h-[4.167vw] w-[4.167vw] px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          allowAnyAmount
                            ? 'bg-[#223247] text-white'
                            : 'bg-gray-200 text-white  hover:bg-gray-300'
                        }`}
                      >
                        {allowAnyAmount ? (
                          <img
                            src="/assets/Images/check-icon.png"
                            alt="check"
                            className="w-[1.875vw] h-[1.875vw] mx-auto"
                          />
                        ) : (
                          <span className="w-[1.875vw] h-[1.875vw]">&nbsp;</span>
                        )}
                      </button>
                      <span className="text-white text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold tracking-wide text-center">
                        FIXED <br /> AMOUNT
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setAllowAnyAmount(false);
                          setAllowFixedAmount(true);
                        }}
                        className={`flex items-center gap-2 h-[4.167vw] w-[4.167vw] px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          allowFixedAmount
                            ? 'bg-[#223247] text-white'
                            : 'bg-gray-200 text-white hover:bg-gray-300'
                        }`}
                      >
                        {allowFixedAmount ? (
                          <img
                            src="/assets/Images/check-icon.png"
                            alt="check"
                            className="w-[1.875vw] h-[1.875vw] mx-auto"
                          />
                        ) : (
                          <span className="w-[1.875vw] h-[1.875vw]">&nbsp;</span>
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
                          className={`bg-white w-full !m-0 p-4 h-[4.271vw] ${allowAnyAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="Total Goal*"
                          onChange={(e) => setTotalGoal(e.target.value)}
                          disabled={allowAnyAmount}
                        />
                      </div>

                      {/* Hide from Guests Toggle */}
                      <div className=" flex items-center justify-center gap-5 lg:gap-[1.042vw] w-5/12 pl-2">
                        <span className="text-white text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] font-bold text-center">
                          HIDE <br /> FROM <br /> GUESTS
                        </span>

                        <button
                          type="button"
                          onClick={() => setHideFromGuests(!hideFromGuests)}
                          className={`flex items-center gap-2 h-[4.167vw] w-[4.167vw] px-4 py-4 rounded-full text-xs font-medium tracking-colors ${
                            hideFromGuests
                              ? 'bg-[#223247] text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {hideFromGuests ? (
                            <img
                              src="/assets/Images/check-icon.png"
                              alt="check"
                              className="w-[1.875vw] h-[1.875vw] mx-auto"
                            />
                          ) : (
                            <span className="w-[1.875vw] h-[1.875vw]">&nbsp;</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-3 mt-[4.531vw]">
                      <h4 className="text-white mt-0 mb-[1.094vw] font-bold text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] tracking-wide">
                        TERMS & CONDITIONS
                      </h4>
                      <p className="text-white text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] ivyora tracking-wide italic font-[400]">
                        By creating this cash fund, you agree to our terms and conditions. 
                        This fund will be added to your registry and shared with your guests.
                      </p>
                      <div className="flex items-center space-x-2 mt-[15px]">
                        <span className="text-white text-[14px] lg:text-[0.729vw] lg:leading-[0.938vw] mr-[0.8vw] font-bold text-center">
                          AGREE
                        </span>

                        <button
                          type="button"
                          onClick={() => setAgreedToTerms(!agreedToTerms)}
                          className={`flex items-center gap-2 h-[32px] w-[32px] lg:h-[1.667vw] lg:w-[1.667vw] rounded-full text-xs font-medium tracking-wide transition-colors ${
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
              <div className="mt-[3.542vw] space-y-4">
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
                  className="w-full h-[14.375vw] mb-[0.938vw] p-[2.344vw] text-[24px] lg:text-[1.25vw] lg:leading-[1.563vw] bg-white resize-none border-none outline-none"
                />
                <p className={`ivyora text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] m-0 italic tracking-wide font-[400] ${
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
              <div className="mt-[1.875vw] flex justify-end">
                <button
                  className="bg-white font-bold text-[18px] lg:text-[0.938vw] lg:leading-[0.938vw] cursor-pointer hover:bg-gray-100 text-black tracking-wide w-[360px] h-[77px] lg:w-[18.75vw] lg:h-[4.01vw] border-3 border-black"
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
