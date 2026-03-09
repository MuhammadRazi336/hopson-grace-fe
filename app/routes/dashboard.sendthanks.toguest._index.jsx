import {Form, Link, redirect, useActionData, useLoaderData, useSubmit, useNavigate, useFetcher, useSearchParams} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {useState, useEffect, useRef} from 'react';
import ButtonComponent from '~/components/Button';
import { Footer } from '~/components/Footer';
import Input from '~/components/Input';
import AlertPortal from '~/components/AlertPortal';

export async function loader({context, request}) {
  try {
    const user = await context.session.get('@User');
    
    // Check if user session exists
    if (!user?.user?.id) {
      const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
      return clearSessionAndRedirect(context);
    }
    
    console.log(user);
    
    // Fetch registry data to get registryId
    let registry;
    try {
      registry = await context.ClientGet(
        `registries/by-userId/${user.user.id}`,
        context,
      );
    } catch (apiError) {
      // Check if it's a session expiration error
      if (apiError.isSessionExpired || apiError.status === 401 || apiError.status === 403) {
        const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
        return clearSessionAndRedirect(context);
      }
      throw apiError;
    }

    if (!registry || !registry.data[0].id) {
      throw new Response('Registry not found', {status: 404});
    }

  // Get greetingId from URL params if available
  const url = new URL(request.url);
  const greetingId = url.searchParams.get('greetingId');
  const emailFromUrl = url.searchParams.get('email') || url.searchParams.get('guestEmail');
  let guestEmail = emailFromUrl || '';
  let guestName = '';

  // If greetingId is provided, fetch transaction detail to get guest email and name
  if (greetingId) {
    try {
      console.log('Fetching guest data for greetingId:', greetingId);
      
      // FIRST: Always fetch greeting directly since user confirmed email is there
      try {
        console.log('Fetching greeting first to get email...');
        let greetingResponse;
        try {
          greetingResponse = await context.ClientGet(
            `greetings/${greetingId}`,
            context,
          );
        } catch (apiError) {
          if (apiError.isSessionExpired || apiError.status === 401 || apiError.status === 403) {
            const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
            return clearSessionAndRedirect(context);
          }
          throw apiError;
        }
        console.log('Greeting response:', JSON.stringify(greetingResponse, null, 2));
        
        if (greetingResponse?.data) {
          const greetingData = greetingResponse.data;
          console.log('Greeting data:', JSON.stringify(greetingData, null, 2));
          console.log('All greeting keys:', Object.keys(greetingData));
          
          // Try all possible email fields in greeting - check every possible field
          const greetingEmail = greetingData.email || 
                      greetingData.guestEmail || 
                      greetingData.to ||
                      greetingData.customerEmail ||
                      greetingData.buyerEmail ||
                      greetingData.buyer?.email ||
                      greetingData.customer?.email ||
                      greetingData.user?.email ||
                      greetingData.guest?.email ||
                      greetingData.contactEmail ||
                      greetingData.contact?.email ||
                      greetingData.recipientEmail ||
                      greetingData.recipient?.email ||
                      greetingData.senderEmail ||
                      greetingData.sender?.email ||
                      greetingData.emailAddress ||
                      greetingData.email_address ||
                      '';
          
          if (greetingEmail && !emailFromUrl) {
            guestEmail = greetingEmail;
            console.log('✅ Extracted email from greeting:', guestEmail);
          } else if (greetingEmail) {
            console.log('Found email in greeting but URL email takes precedence');
          } else {
            console.log('⚠️ No email found in standard fields - scanning all values for email pattern:');
            // Recursively search for any string containing '@' (email pattern)
            const findEmailInObject = (obj, path = '') => {
              for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  const value = obj[key];
                  const currentPath = path ? `${path}.${key}` : key;
                  
                  if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
                    console.log(`  🔍 Found potential email at ${currentPath}:`, value);
                    if (!guestEmail && !emailFromUrl) {
                      guestEmail = value;
                      console.log(`  ✅ Using email from ${currentPath}:`, guestEmail);
                    }
                  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    findEmailInObject(value, currentPath);
                  } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                      if (typeof item === 'object' && item !== null) {
                        findEmailInObject(item, `${currentPath}[${index}]`);
                      }
                    });
                  }
                }
              }
            };
            
            findEmailInObject(greetingData);
            
            if (!guestEmail) {
              console.log('❌ No email found in greeting data after full scan');
            }
          }
        } else {
          console.log('⚠️ Greeting response structure:', greetingResponse);
        }
      } catch (greetingError) {
        console.error('Error fetching greeting:', greetingError);
      }
      
      // Then try to get name from transactions list
      let transactionsResponse;
      try {
        transactionsResponse = await context.ClientGet(
          `transactions/${registry.data[0].id}`,
          context,
        );
      } catch (apiError) {
        if (apiError.isSessionExpired || apiError.status === 401 || apiError.status === 403) {
          const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
          return clearSessionAndRedirect(context);
        }
        throw apiError;
      }
      
      console.log('Transactions list response:', JSON.stringify(transactionsResponse, null, 2));
      
      if (transactionsResponse?.data && Array.isArray(transactionsResponse.data)) {
        const transaction = transactionsResponse.data.find(t => 
          t.greetingId === parseInt(greetingId) || 
          t.id === parseInt(greetingId) ||
          String(t.greetingId) === String(greetingId)
        );
        
        if (transaction) {
          console.log('Found transaction in list:', JSON.stringify(transaction, null, 2));
          guestName = transaction.name || guestName || '';
          
          // Try to get email from transaction if not already found
          if (!guestEmail && !emailFromUrl) {
            const foundEmail = transaction.email || 
                             transaction.guestEmail || 
                             transaction.customerEmail ||
                             transaction.buyerEmail ||
                             transaction.buyer?.email ||
                             transaction.customer?.email ||
                             transaction.user?.email ||
                             transaction.guest?.email ||
                             transaction.contactEmail ||
                             transaction.contact?.email ||
                             transaction.shippingEmail ||
                             transaction.billingEmail ||
                             (typeof transaction.name === 'string' && transaction.name.includes('@') ? transaction.name : '') ||
                             '';
            
            // Only use transaction.to if it looks like an email
            const toAsEmail = transaction.to && typeof transaction.to === 'string' && transaction.to.includes('@') 
                            ? transaction.to 
                            : '';
            
            guestEmail = foundEmail || toAsEmail || guestEmail || '';
          }
          
          console.log('Extracted name:', guestName, 'email:', guestEmail);
          console.log('All transaction keys:', Object.keys(transaction));
        }
      }
      
      // If email not found, try transaction detail
      if (!guestEmail && !emailFromUrl) {
        console.log('Email not found in transactions list, trying transaction detail...');
        let transactionResponse;
        try {
          transactionResponse = await context.ClientGet(
            `transactions/detail/${greetingId}/${registry.data[0].id}`,
            context,
          );
        } catch (apiError) {
          if (apiError.isSessionExpired || apiError.status === 401 || apiError.status === 403) {
            const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
            return clearSessionAndRedirect(context);
          }
          throw apiError;
        }
        
        console.log('Transaction detail response:', JSON.stringify(transactionResponse, null, 2));
        
        if (transactionResponse?.data && transactionResponse.data.length > 0) {
          const transactionData = transactionResponse.data[0];
          console.log('Transaction detail data:', JSON.stringify(transactionData, null, 2));
          console.log('All transaction detail keys:', Object.keys(transactionData));
          
          guestName = transactionData.name || guestName || '';
          
          // Try all possible email fields, including nested ones and check all items in array
          guestEmail = transactionData.email || 
                      transactionData.guestEmail || 
                      transactionData.customerEmail ||
                      transactionData.buyerEmail ||
                      transactionData.to ||
                      transactionData.buyer?.email ||
                      transactionData.customer?.email ||
                      transactionData.user?.email ||
                      transactionData.guest?.email ||
                      transactionData.contactEmail ||
                      transactionData.contact?.email ||
                      guestEmail ||
                      '';
          
          // Also check if email is in any nested objects in the data array
          if (!guestEmail && transactionResponse.data.length > 0) {
            for (const item of transactionResponse.data) {
              const itemEmail = item.email || 
                               item.guestEmail || 
                               item.customerEmail ||
                               item.buyerEmail ||
                               item.to ||
                               item.buyer?.email ||
                               item.customer?.email ||
                               '';
              if (itemEmail) {
                guestEmail = itemEmail;
                console.log('Found email in data array item:', guestEmail);
                break;
              }
            }
          }
          
          console.log('Extracted from detail - name:', guestName, 'email:', guestEmail);
        }
      }
      
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    }
  }
  
    console.log('Final guestName in loader:', guestName);
    console.log('Final guestEmail in loader:', guestEmail);

    return {user, registry: registry.data[0], guestEmail, guestName};
  } catch (error) {
    // If it's a session expiration error, handle it
    if (error.isSessionExpired || error.status === 401 || error.status === 403) {
      const {clearSessionAndRedirect} = await import('~/utils/auth-guard');
      return clearSessionAndRedirect(context);
    }
    throw error;
  }
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
  const {user, registry, guestEmail: guestEmailFromLoader, guestName: guestNameFromLoader} = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [emailError, setEmailError] = useState('');
  const maxLength = 500;
  const processedResponseRef = useRef(null);
  
  // Get guest email and name from loader (from API) or URL params (fallback)
  const guestEmailFromUrl = searchParams.get('email') || searchParams.get('guestEmail') || '';
  const guestEmail = guestEmailFromLoader || guestEmailFromUrl || '';
  const guestName = guestNameFromLoader || '';
  
  // Debug logging
  console.log('Guest Name from Loader:', guestNameFromLoader);
  console.log('Guest Email from Loader:', guestEmailFromLoader);
  console.log('Guest Email from URL:', guestEmailFromUrl);
  console.log('Final Guest Name:', guestName);
  console.log('Final Guest Email:', guestEmail);

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
        
        // Reset form after successful send (but keep guest data)
        setFormData({
          to: guestName || '',
          email: guestEmail || '',
          subject: `Thank's from ${user?.user?.firstName} & ${user?.user?.fianceFirstName}`,
          message: 'Thank you for your generosity and for celebrating this milestone moment with us. It means so much!',
        });
        setEmailError('');
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
    email: '',
    subject: `Thank's from ${user?.user?.firstName} & ${user?.user?.fianceFirstName}`,
    message: '',
  });

  // Initialize and update 'to' (name) and 'email' fields when guest data is available
  useEffect(() => {
    console.log('=== Guest Data Update Effect ===');
    console.log('guestName:', guestName, '(type:', typeof guestName, ')');
    console.log('guestEmail:', guestEmail, '(type:', typeof guestEmail, ')');
    console.log('Current formData.to:', formData.to);
    console.log('Current formData.email:', formData.email);
    
    // Always update if we have guest data (even if it's an empty string, we want to set it)
    setFormData(prev => {
      const newTo = guestName || prev.to || '';
      const newEmail = guestEmail || prev.email || '';
      
      // Update if values are different
      if (prev.to !== newTo || prev.email !== newEmail) {
        const updated = {
          ...prev,
          to: newTo,
          email: newEmail,
        };
        console.log('✅ Updating formData:', updated);
        return updated;
      }
      
      console.log('⏭️ Skipping update - values unchanged');
      return prev;
    });
  }, [guestName, guestEmail]);
  
  // Force initial population on mount if data is already available
  useEffect(() => {
    console.log('=== Initial Mount Effect ===');
    console.log('guestName on mount:', guestName);
    console.log('guestEmail on mount:', guestEmail);
    
    if (guestName || guestEmail) {
      console.log('Setting initial values on mount');
      setFormData(prev => ({
        ...prev,
        to: guestName || prev.to || '',
        email: guestEmail || prev.email || '',
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
    
    // Validate email when it changes
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submitting
    if (!formData.email || !formData.email.trim()) {
      setEmailError('Email address is required');
      setAlertType('error');
      setAlertMessage('Please enter a valid email address');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      setAlertType('error');
      setAlertMessage('Please enter a valid email address');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    // Use email field for sending, fallback to 'to' if email is not set
    const emailToSend = formData.email || formData.to;

    const payload = {
      to: emailToSend,
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
        {/* Step indicator at the top */}
        <div className="flex items-center gap-x-4 justify-center mb-8">
          <h4 className="text-[60px] text-white text-center">{showPreview ? '2' : '1'}</h4>
          <h4 className="text-[30px] text-white text-center">/</h4>
          <h4 className="text-[30px] text-white text-center">2</h4>
        </div>

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
                            placeholder="Your message here..."
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
              className="text-[#ffffff] border-b border-[#ffffff] cursor-pointer font-bold text-lg mx-auto mt-5 block"
            >
              SAVE AND PREVIEW
            </button>
          ) : (
            <div className="flex justify-center gap-x-4 mt-5">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-[#ffffff] border-b border-[#ffffff] cursor-pointer font-bold text-lg"
              >
                BACK TO EDIT VIEW
              </button>
            </div>
          )}
        </fetcher.Form>
      </div>
      
      {/* Email input field, text, and send button below the blue box - only shown on step 2 */}
      {showPreview && (
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <p className="text-[#223247] text-center text-base leading-relaxed mb-4">
            Your note will be delivered to the below email. Click to change to add more addresses (for more than one email, separate by a comma).
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <input
                type="email"
                name="email"
                placeholder="Email Address*"
                value={formData.email}
                onChange={handleChange}
                className={`w-full prata text-center text-2xl border rounded p-2 bg-[#FAF9F6] focus:outline-none focus:ring-2 ${
                  emailError 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-gray-200'
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-sm text-center mt-2">{emailError}</p>
              )}
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              disabled={fetcher.state === 'submitting'}
              className="py-3 px-8 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-[#446184] hover:opacity-90 uppercase font-[800] text-white whitespace-nowrap text-center disabled:opacity-50 disabled:cursor-not-allowed border border-black"
            >
              {fetcher.state === 'submitting' ? 'Sending...' : 'SEND!'}
            </button>
          </div>
        </div>
      )}
    </div>
      <Footer/>
    </div>
    </>
  );
};

export default ThankYou;
