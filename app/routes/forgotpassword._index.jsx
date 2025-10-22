import { useActionData, useSubmit, Link } from "@remix-run/react";
import { useState } from "react";
import Input from "~/components/Input";
import { redirect, json } from "@remix-run/server-runtime";
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
        const response = await context.ClientPost(payload, 'auth/forget-password', context);        
        if(response?.code == 200){
            return json({
                success: true,
                message: 'Email sent successfully'
            });
        }
        else{
            // Return error response with proper structure
            return json({
                statusCode: response?.code || response?.statusCode || 400,
                message: response?.message || response?.data?.message || 'Failed to send reset email',
                ...response
            });
        }
    } catch (error) {
        console.log('Forgot password error:', error);
        // Return error response with proper structure
        return json({
            statusCode: error?.statusCode || error?.code || 500,
            message: error?.message || 'An error occurred while sending reset email',
            ...error
        });
    }
}

const ForgotPassword = () => {
    const submit = useSubmit();
    const actionData = useActionData();
    console.log(actionData, 'ActionData');
    
    // Debug all actionData properties
    if (actionData) {
        console.log('ActionData details:', {
            keys: Object.keys(actionData),
            statusCode: actionData.statusCode,
            code: actionData.code,
            message: actionData.message,
            success: actionData.success
        });
    }
    
    const [formData, setFormData] = useState({
        email: '',
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            email: formData.email,
        };
        submit({payload}, {method: 'post', encType: 'application/json'});
    }

    return(
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-white">
          <StepsAndImage
            title="forgot password?"
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
                      type="email"
                      required={true}
                      placeholder="Email *"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] lg:h-[4.271vw] xl:h-[4.271vw] 2xl:h-[4.271vw] max-[1024px]:h-[47px] max-[1024px]:py-0"
                      error={
                        // Email validation errors (check message content)
                        (Array.isArray(actionData?.message) && 
                         actionData?.message.some(msg => msg.toLowerCase().includes('email')))
                          ? actionData?.message.find(msg => msg.toLowerCase().includes('email'))
                          // User not found error (check message content)
                          : (actionData?.message === 'user not found' || actionData?.message === 'email not found')
                          ? 'Email not found'
                          : undefined
                      }
                    />
                  </div>
                  <div className="text-left">
                    <Link to="/login" className="text-white hover:underline text-[20px] lg:text-[1.042vw] xl:text-[1.042vw] 2xl:text-[1.042vw] max-[1024px]:text-[12px] max-[1024px]:leading-[18px]">
                      Back to Login
                    </Link>
                  </div>
                  
                  {/* Success message */}
                  {actionData?.success && (
                    <div className="text-center text-green-500 text-sm">
                      {actionData?.message}
                    </div>
                  )}
                  
                  {/* Error message */}
                  {actionData?.statusCode >= 400 && 
                   !(Array.isArray(actionData?.message) && actionData?.message.some(msg => msg.toLowerCase().includes('email'))) &&
                   !(actionData?.message === 'user not found' || actionData?.message === 'email not found') && (
                    <div className="text-center text-red-500 text-sm">
                      {actionData?.statusCode === 500 
                        ? 'Server error. Please try again later.'
                        : Array.isArray(actionData?.message)
                          ? actionData?.message[0]
                          : actionData?.message}
                    </div>
                  )}

                  {/* Back and Next buttons */}
                  <div className="flex justify-end mt-4 absolute bottom-6 right-6 steps-btns-hover">
                    <button
                      type="submit"
                      className="absolute right-10 bottom-2.5 flex items-center uppercase font-bold gap-2 z-10 whitespace-nowrap text-[22px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] max-[1024px]:text-[14px] max-[1024px]:leading-[18px] max-[1024px]:right-[24px]"
                    >
                      Send Reset Email <img src={arrow} className="lg:w-[1.25vw] xl:w-[1.25vw] 2xl:w-[1.25vw] w-[24px] max-[1024px]:w-[17px]" alt="" />
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

export default ForgotPassword;