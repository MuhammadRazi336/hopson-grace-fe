import { useActionData, useSubmit, useSearchParams } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { useState, useEffect } from "react";
import Input from "~/components/Input";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import StepsAndImage from '~/components/StepsAndImage';
import Heading from '~/components/Heading.jsx';
import arrow from '/assets/Images/arrow.png';

export async function loader(args) {
    const {context} = args;
    return {context};
}

export async function action({request, context}) {
    const body = await request.json();
    const {payload} = body;

    try{
        const response = await context.ClientPost(payload, 'auth/change-password', context);
        if(response?.code == 200){
            return redirect('/login');
        }
        else{
            return {...response};
        }
    } catch (error) {
    }
    return null;
}

const ChangePassword = () => {
    const submit = useSubmit();
    const actionData = useActionData();
    const [searchParams] = useSearchParams();
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    })
    
    // Extract token from URL on mount
    const token = searchParams.get('token');

    useEffect(() => {
        // If no token in URL, redirect to forgot password page
        if (!token) {
            window.location.href = '/forgotpassword';
        }
    }, [token]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            passwordToken: token,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        }
        submit({payload}, {method: 'post', encType: 'application/json'})
    }

    return(
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-white max-[1024px]:min-h-[70vh]">
          <StepsAndImage
            title="create new password."
            stepNo="1"
            totalSteps="1"
            showLoginLink={false}
            showPagination={false}
            content={
              <div className="flex h-full items-center">
                <form
                  className="space-y-6 max-w-full w-full mx-auto"
                  onSubmit={handleSubmit}
                >
                  <div className="text-center lg:pt-[3.646vw] xl:pt-[3.646vw] 2xl:pt-[3.646vw] m-0">
                    <Heading
                      text="RESET PASSWORD"
                      classes="font-normal text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] m-0 lg:mb-[1vw] xl:mb-[1vw] 2xl:mb-[1vw] max-[1024px]:text-[12px] max-[1024px]:leading-[18px]"
                    />
                  </div>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      required={true}
                      placeholder="New Password *"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0"
                    />
                    <Input
                      type="password"
                      required={true}
                      placeholder="Confirm Password *"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0"
                    />
                  </div>
                  
                  {actionData?.message && (
                    <div role={actionData?.statusCode >= 400 ? 'alert' : 'status'} className="mt-3 text-left">
                      <span className={`font-medium text-[18px] ${actionData?.statusCode >= 400 ? 'text-[#FD446F]' : 'text-green-600'}`}>
                        {Array.isArray(actionData?.message) ? actionData?.message[0] : actionData?.message}
                      </span>
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="flex justify-end mt-4 absolute bottom-6 right-6 steps-btns-hover">
                    <button
                      type="submit"
                      className="absolute right-10 bottom-2.5 flex items-center uppercase font-bold gap-2 z-10 whitespace-nowrap text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:right-[24px]"
                    >
                      SAVE & LOGIN <img src={arrow} className="lg:w-[1.25vw] xl:w-[1.25vw] 2xl:w-[1.25vw] w-[24px] max-[1024px]:w-[17px]" alt="" />
                    </button>
                  </div>
                </form>
              </div>
            }
          />
        </div>
        <Footer />
      </>
    )
}

export default ChangePassword;