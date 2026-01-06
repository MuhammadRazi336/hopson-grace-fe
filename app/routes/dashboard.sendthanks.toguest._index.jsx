import {Form, Link, redirect, useActionData, useLoaderData, useSubmit, useNavigate, useFetcher} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {useState, useEffect, useRef} from 'react';
import ButtonComponent from '~/components/Button';
import { Footer } from '~/components/Footer';
import Input from '~/components/Input';
import AlertPortal from '~/components/AlertPortal';

export async function loader({context}) {
  const user = await context.session.get('@User');
  console.log(user);
  
  // Fetch registry data to get registryId
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  if (!registry || !registry.data[0].id) {
    throw new Response('Registry not found', {status: 404});
  }

  return {user, registry: registry.data[0]};
}

export async function action({request, context}) {
  try {
    const body = await request.json();
    const {payload} = body;
    
    // Parse the payload if it's a string
    const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;

    const response = await context.ClientPost(parsedPayload, `greetings`, context);

    console.log('Action - API Response:', response);
    console.log('Action - Response code:', response?.code);
    console.log('Action - Response message:', response?.message);

    if (response?.code === 200) {
      // Return success with the API message or default message
      return json({
        success: true, 
        message: response?.message || 'Thank you email sent successfully!'
      });
    } else {
      // Check if the error message indicates email was already sent
      const errorMsg = response?.message || 'Failed to send message';
      const isAlreadySent = errorMsg.toLowerCase().includes('email already sent') || 
                           errorMsg.toLowerCase().includes('already sent for this registry');
      
      if (isAlreadySent) {
        // Treat "already sent" as success case
        return json({
          success: true,
          message: 'Email has already been sent for this registry.'
        });
      }
      
      return json({error: errorMsg});
    }
  } catch (error) {
    console.error('Error sending thank you message:', error);
    return json({success: false, error: error.message});
  }
}

const ThankYou = () => {
  const {user, registry} = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const maxLength = 500;
  const processedResponseRef = useRef(null);

  // Handle fetcher data to show alerts and redirect
  useEffect(() => {
    // Only process when fetcher is idle (request completed) and we have data
    // Also check if we've already processed this response
    if (fetcher.state === 'idle' && fetcher.data && processedResponseRef.current !== fetcher.data) {
      processedResponseRef.current = fetcher.data;
      console.log('Fetcher data received:', fetcher.data);
      console.log('Fetcher data type:', typeof fetcher.data);
      console.log('Success value:', fetcher.data.success);
      console.log('Success === true?', fetcher.data.success === true);
      console.log('Success == true?', fetcher.data.success == true);
      
      // Check both error and message fields for success indicators
      const errorMessage = fetcher.data.error || '';
      const successMessage = fetcher.data.message || '';
      const allMessages = `${errorMessage} ${successMessage}`.toLowerCase();
      
      // Check if message indicates email was already sent
      const isEmailAlreadySent = allMessages.includes('email already sent') || 
                                 allMessages.includes('already sent for this registry');
      
      // Check if message indicates success (even if in error field)
      const indicatesSuccess = allMessages.includes('sent successfully') ||
                               allMessages.includes('email sent successfully') ||
                               allMessages.includes('successfully');
      
      // Check for success flag
      const hasSuccessFlag = fetcher.data.success === true || fetcher.data.success == true;
      
      // Determine if this is a success case
      const isSuccess = hasSuccessFlag || (indicatesSuccess && fetcher.data.success !== false);
      
      // Handle both success cases: email sent successfully OR email already sent
      // Both cases should show success message and redirect to dashboard/gifttracker
      if (isSuccess || isEmailAlreadySent || indicatesSuccess) {
        console.log('SUCCESS CASE DETECTED!');
        console.log('hasSuccessFlag:', hasSuccessFlag);
        console.log('indicatesSuccess:', indicatesSuccess);
        console.log('isEmailAlreadySent:', isEmailAlreadySent);
        console.log('Setting alert and redirecting to /dashboard/gifttracker...');
        
        // Set alert type first, then message, then show
        setAlertType('success');
        
        // Determine the message to show
        let displayMessage = 'Thank you email sent successfully!';
        if (isEmailAlreadySent) {
          displayMessage = 'Email has already been sent for this registry.';
        } else if (successMessage) {
          displayMessage = successMessage;
        } else if (errorMessage && indicatesSuccess) {
          // If error message contains success indicator, use it
          displayMessage = errorMessage;
        }
        
        setAlertMessage(displayMessage);
        setShowAlert(true);
        
        // Reset form after successful send
        setFormData({
          to: '',
          subject: `Thank's from ${user?.user?.firstName} & ${user?.user?.fianceFirstName}`,
          message: 'Thank you for your generosity and for celebrating this milestone moment with us. It means so much!',
        });
        setShowPreview(false);
        
        // Redirect to dashboard/gifttracker after showing success message (2 seconds)
        // This applies to BOTH: email sent successfully AND email already sent cases
        const redirectTimer = setTimeout(() => {
          console.log('Redirecting to /dashboard/gifttracker');
          window.location.href = '/dashboard/gifttracker';
        }, 2000);
        
        // Cleanup timer on unmount
        return () => clearTimeout(redirectTimer);
      } else if (fetcher.data.error && !indicatesSuccess) {
        console.log('ERROR CASE DETECTED:', fetcher.data.error);
        setAlertType('error');
        setAlertMessage(fetcher.data.error);
        setShowAlert(true);
        const errorTimer = setTimeout(() => setShowAlert(false), 5000);
        return () => clearTimeout(errorTimer);
      } else if (fetcher.data.success === false) {
        console.log('FAILED CASE DETECTED');
        setAlertType('error');
        setAlertMessage('Failed to send email. Please try again.');
        setShowAlert(true);
        const errorTimer = setTimeout(() => setShowAlert(false), 5000);
        return () => clearTimeout(errorTimer);
      } else {
        // Fallback - if we have data but don't match any case, log it
        console.log('UNHANDLED CASE - fetcher.data:', fetcher.data);
      }
    }
  }, [fetcher.data, fetcher.state, user, navigate]);

  const handlePreview = (e) => {
    e.preventDefault();
    setShowPreview(true);
  }

  const [formData, setFormData] = useState({
    to: '',
    subject: `Thank's from ${user?.user?.firstName} & ${user?.user?.fianceFirstName}`,
    message:
      'Thank you for your generosity and for celebrating this milestone moment with us. It means so much!',
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      to: formData.to,
      subject: formData.subject,
      message: formData.message,
      registryId: Number(registry.id),
    };
    fetcher.submit({payload: JSON.stringify(payload)}, {method: 'post', encType: 'application/json'});
  };

  return (
    <>
    <div className="pt-[80px]">
      {/* Alert Component - Rendered outside app-scale via portal */}
      {showAlert && (
        <AlertPortal>
          <div
            key={`alert-${alertType}-${Date.now()}`}
            className={`fixed top-4 right-4 ${
              alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white px-6 py-3 rounded-lg shadow-lg z-50`}
            style={{animation: 'fadeInOut 3s ease-in-out'}}
          >
            <div className="flex items-center">
              {alertType === 'success' ? (
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
              ) : (
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
        </AlertPortal>
      )}
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
          animation: fadeInOut 5s ease-in-out;
        }
      `}</style>
    <div className="mx-20 py-[80px]">
    <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
          send your <span className="prata uppercase">Thank you</span> here
        </h2>
        <img
          src="/assets/Images/profile-view-page-bdr.png"
          alt="Couple"
          className="max-w-[630px] mt-5 h-auto mx-auto"
        />

      <p className="max-w-xl mx-auto text-center text-[#223247] my-5 font-normal leading-relaxed mb-16">
      Your thank you message and will be emailed to your guests immediately.
      </p>

      <div className="container mx-auto bg-[#446184] py-16">
        <fetcher.Form method="post" onSubmit={handleSubmit}>
          <div className="relative max-w-4xl mx-auto">
            <img
              src="/assets/Images/checkout-bg.png"
              alt="checkout-flow"
              className="w-full object-contain"
            />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="flex items-center justify-start h-full flex-row">
                <div className={`w-9/12 pl-16 ${!showPreview ? 'pt-16' : 'pt-10'}`}>
                  <img
                    src="/assets/Images/greeting-flower-checkout.png"
                    alt="checkout-bg-1"
                    className="w-auto h-auto mx-auto mb-8"
                  />

                  {!showPreview ? (
                    <div>
                      <input
                        type="text"
                        name="to"
                        placeholder="To*"
                        value={formData.to}
                        onChange={handleChange}
                        className="w-full prata text-center text-2xl mx-auto mb-4 border border-gray-300 rounded p-2 bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <div className="w-full flex justify-center">
                        <div className="w-full">
                          <textarea
                            name="message"
                            placeholder="Your Message here...*"
                            maxLength={maxLength}
                            rows={7}
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full border italic border-gray-300 prata text-center text-xl outline-none p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                          <div className="text-xs text-gray-400 mt-1 text-left">
                            {maxLength - formData.message.length}/{maxLength} characters remaining
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative max-w-4xl mx-auto">
                      <h3 className="text-center text-3xl font-bold italic prata">{formData.to}</h3>
                      <p className="text-center prata italic leading-relaxed text-xl mt-10">
                        {formData.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!showPreview ? (
            <button
              type="button"
              onClick={handlePreview}
              className="text-[#223247] border-b border-[#223247] cursor-pointer font-bold text-lg mx-auto mt-5 block"
            >
              Save and Preview
            </button>
          ) : (
            <div className="flex justify-center gap-x-4 mt-5">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-[#223247] border-b border-[#223247] cursor-pointer font-bold text-lg"
              >
                Edit Message
              </button>
            </div>
          )}

          <div className="relative">
            <div className="flex items-center gap-x-12 mt-8 justify-center">
              <h4 className="text-[60px] text-white text-center">{showPreview ? '2' : '1'}</h4>
              <h4 className="text-[30px] text-white text-center">/</h4>
              <h4 className="text-[30px] text-white text-center">2</h4>
            </div>
            
            {showPreview && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <button 
                  type="submit"
                  disabled={fetcher.state === 'submitting'}
                  className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black w-[225px] max-[1601px]:w-[280px] text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetcher.state === 'submitting' ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </fetcher.Form>
      </div>
    </div>
      <Footer/>
    </div>
    </>
  );
};

export default ThankYou;
