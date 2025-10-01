import {redirect, json} from '@shopify/remix-oxygen';
import {requireAuth} from '~/utils/auth-guard.js';
import {Link, useActionData, useFetcher, useSubmit, useNavigate} from '@remix-run/react';
import {toast} from 'react-toastify';

import Input from '~/components/Input.jsx';
import {useState, useEffect} from 'react';
import ButtonComponent from '~/components/Button.jsx';
import {jsonWithError} from 'remix-toast';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import StepsAndImage from '~/components/StepsAndImage';
import Heading from '~/components/Heading.jsx';
import arrow from '/assets/Images/arrow.png';
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
    const response = await context.ClientPost(payload, 'auth/login', context);
    if (response?.code == 200) {
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
      return {...response};
    }
  } catch (e) {
    return {...e};
  }
}

const LoginIndex = () => {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();
  console.log(actionData, 'ActionData');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <StepsAndImage
          title="welcome back."
          stepNo="1"
          totalSteps="1"
          showLoginLink={false}
          showPagination={false}
          content={
            <div className="flex h-full items-center">
              <form
                className="space-y-6 max-w-full w-full mx-auto"
                onSubmit={handleLogin}
              >
                <div className="text-center mt-6">
                  <Heading
                    text="LOG IN"
                    classes="font-normal text-[22px] m-0"
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
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    error={actionData?.statusCode >= 400 && actionData?.message?.toLowerCase().includes('email') ? actionData?.message : undefined}
                  />
                  <Input
                    required={true}
                    type="password"
                    placeholder="Password *"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                    error={actionData?.statusCode >= 400 && actionData?.message?.toLowerCase().includes('password') ? actionData?.message : undefined}
                  />
                </div>
                <div className="text-left">
                  <Link to="/forgotpassword" className="text-white hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                {actionData?.statusCode >= 400 && (
                  <div className="text-center text-red-500 text-sm">
                    {Array.isArray(actionData?.message)
                      ? actionData?.message[0]
                      : actionData?.message}
                  </div>
                )}

                {/* Back and Next buttons */}
                <div className="flex justify-end mt-4 absolute bottom-6 right-6 steps-btns-hover">
                  <button
                    type="submit"
                    className="absolute right-10 bottom-2.5 flex items-center uppercase font-bold gap-2 z-10 whitespace-nowrap"
                  >
                    Log In <img src={arrow} alt="" />
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
