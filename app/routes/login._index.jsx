import {redirect, json} from '@shopify/remix-oxygen';
import {requireAuth} from '~/utils/auth-guard.js';
import {Link, useActionData, useSubmit, useNavigate, useLocation} from '@remix-run/react';

import Input from '~/components/Input.jsx';
import {useState, useEffect} from 'react';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import StepsAndImage from '~/components/StepsAndImage';
import Heading from '~/components/Heading.jsx';
import arrow from '/assets/Images/arrow.png';

const MINI_TUTORIAL_STORAGE_KEY_PREFIX = '@DashboardMiniTutorialDismissed';

export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const {context} = args;

  const user = await requireAuth(context, true);
  return {context};
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const apiBase = context?.env?.API_BASE_URL || process.env.API_BASE_URL;
    const endpoint = `${String(apiBase).replace(/\/$/, '')}/api/auth/login`;

    const loginRes = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    const contentType = loginRes.headers.get('content-type') || '';
    const response = contentType.includes('application/json')
      ? await loginRes.json()
      : {message: await loginRes.text()};

    if (loginRes.ok && response?.code == 200) {
      const user = response.data;
      context.session.set('@User', user);
      const cookie = await context.session.commit();

      if(user?.user?.isOnboard === false){
        return redirect('/onboarding', {
          headers: {
            'Set-Cookie': cookie,
          },
        });
      }
      
      // Return the user data so it can be saved to localStorage before redirect
      return json({ 
        success: true, 
        user: user,
        redirect: '/dashboard'
      }, {
        headers: {
          'Set-Cookie': cookie,
        },
      });
    } else {
      // Return error response with proper structure
      const responseStatusCode =
        loginRes.status || response?.statusCode || response?.status || response?.code || 400;
      const responseMessage =
        response?.message ||
        response?.data?.message ||
        response?.error ||
        'Login failed';
      return json({
        ...response,
        statusCode: responseStatusCode,
        message: responseMessage,
      });
    }
  } catch (e) {
    console.log('Login error:', e);
    // Prefer transport-layer HTTP status first.
    const backendStatusCode =
      e?.response?.status ||
      e?.response?.data?.statusCode ||
      e?.statusCode ||
      e?.code ||
      500;
    const backendMessage =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'An error occurred during login';

    // Return error response with proper structure
    return json({
      ...e,
      statusCode: backendStatusCode,
      message: backendMessage,
    });
  }
}

const LoginIndex = () => {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(actionData, 'ActionData');

  // When redirected after session expiry: clear all client storage and cookies, then clean URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session_expired') === '1' && typeof window !== 'undefined') {
      try {
        const preservedMiniTutorialEntries = Object.entries(localStorage).filter(
          ([key]) => key.startsWith(MINI_TUTORIAL_STORAGE_KEY_PREFIX),
        );
        localStorage.clear();
        sessionStorage.clear();
        preservedMiniTutorialEntries.forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        // Clear all cookies accessible to JS (non-HttpOnly)
        document.cookie.split(';').forEach((c) => {
          const name = c.replace(/^\s*|\s*$/g, '').split('=')[0];
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        });
      } catch (e) {
        console.warn('Error clearing storage on session expiry:', e);
      }
      navigate('/login', {replace: true});
    }
  }, [location.search, navigate]);

  const statusCode = Number(actionData?.statusCode || 0);
  const rawMessage = actionData?.message;
  const normalizedMessage = Array.isArray(rawMessage)
    ? rawMessage.join(' | ')
    : String(rawMessage || '');
  const lowerMessage = normalizedMessage.toLowerCase();

  const isInvalidEmailFormat =
    statusCode === 400 &&
    (lowerMessage.includes('please enter valid email format') ||
      lowerMessage.includes('valid email format'));
  const isEmailNotFound =
    statusCode === 404 && lowerMessage.includes('user not found');
  const isInvalidPassword =
    statusCode === 401 && lowerMessage.includes('invalid password');

  const emailError = isInvalidEmailFormat
    ? 'Please enter valid email format'
    : isEmailNotFound
      ? (
        <>
          User doesn&apos;t exist.{' '}
          <Link to="/register" className="text-white underline">
            CREATE AN ACCOUNT.
          </Link>
        </>
      )
      : undefined;

  const passwordError = isInvalidPassword ? 'Password Not Recognized' : undefined;

  const genericError =
    statusCode >= 400 && !emailError && !passwordError
      ? statusCode === 500
        ? 'Server error. Please try again later.'
        : Array.isArray(rawMessage)
          ? rawMessage[0]
          : normalizedMessage || 'Login failed'
      : null;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const payload = {
      email: formData.email,
      password: formData.password,
    };
    submit({payload}, {method: 'post', encType: 'application/json'});
  };

  // Save token to localStorage when login is successful and redirect
  useEffect(() => {
    if (actionData?.success && actionData?.user) {
      const user = actionData.user;
      localStorage.setItem('@token', user.accessToken);
      console.log('Token saved to localStorage:', user.accessToken);
      
      // Redirect to dashboard after saving token
      if (actionData.redirect) {
        navigate(actionData.redirect);
      }
    }
  }, [actionData, navigate]);

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-white max-[1024px]:min-h-[70vh]">
        <StepsAndImage
          title="welcome back."
          stepNo="1"
          totalSteps="1"
          showLoginLink={false}
          showPagination={false}
          customImageFooter={
            <h5 className="text-black lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw]">
              Not you? <Link to="/register" className="font-bold underline">CREATE AN ACCOUNT</Link>
            </h5>
          }
          content={
            <div className="flex h-full items-center">
              <form
                className="space-y-6 max-w-full w-full mx-auto"
                onSubmit={handleLogin}
              >
                <div className="text-center lg:pt-[3.646vw] xl:pt-[3.646vw] 2xl:pt-[3.646vw] m-0">
                  <Heading
                    text="LOG IN"
                    classes="font-normal text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] m-0 lg:mb-[1vw] xl:mb-[1vw] 2xl:mb-[1vw] max-[1024px]:text-[12px] max-[1024px]:leading-[18px]"
                  />
                </div>
                <div className="space-y-4">
                  <Input
                    type="email"
                    required={true}
                    placeholder="Email *"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0"
                    error={emailError}
                  />
                  <div className="relative">
                    <Input
                      required={true}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password *"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0 pr-12"
                      error={passwordError}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[50%] transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 z-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-left max-[1024px]:mb-[5px] max-[1024px]:underline">
                  <Link to="/forgotpassword" className="text-white hover:underline text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px]">
                    Forgot Password?
                  </Link>
                </div>
                {genericError && (
                  <div className="text-center text-white text-sm">
                    {genericError}
                  </div>
                )}

                {/* Back and Next buttons */}
                <div className="flex justify-end mt-4 absolute bottom-6 right-6 steps-btns-hover">
                  <button
                    type="submit"
                    className="absolute cursor-pointer right-10 bottom-2.5 flex items-center uppercase font-bold gap-2 z-10 whitespace-nowrap text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:right-[24px]"
                  >
                    Log In <img src={arrow} className="lg:w-[1.25vw] xl:w-[1.25vw] 2xl:w-[1.25vw] w-[24px] max-[1024px]:w-[17px]" alt="" />
                  </button>
                </div>
              </form>
            </div>
          }
        />
      </div>
      <Footer />
    </>
  );
};

export default LoginIndex;
