import {Form, Link, redirect, useActionData, useLoaderData, useSubmit} from '@remix-run/react';
import {useState} from 'react';
import ButtonComponent from '~/components/Button';
import { Footer } from '~/components/Footer';
import Input from '~/components/Input';

export async function loader({context}) {
  const user = await context.session.get('@User');
  console.log(user);
  return {user};
}

export async function action({request, context}) {
  try {
    const body = await request.json();
    const {payload} = body;

    const response = await context.ClientPost(payload, `greetings`, context);

    if (response?.code === 200) {
      return redirect('/sendthanks/toguest');
    } else {
      return {error: response?.message || 'Failed to send message'};
    }
  } catch (error) {
    return {success: false, error: error.message};
  }
}

const ThankYou = () => {
  const actionData = useActionData();
  const {user} = useLoaderData();
  const submit = useSubmit();
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState('');
  const maxLength = 500;

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
    };
    submit({payload}, {method: 'post', encType: 'application/json'});
  };

  return (
    <>
    <div className="pt-[80px]">
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
        <Form method="post" onSubmit={handleSubmit}>
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
                  className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black w-[225px] max-[1601px]:w-[280px] text-center"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
      <Footer/>
    </div>
    </>
  );
};

export default ThankYou;
