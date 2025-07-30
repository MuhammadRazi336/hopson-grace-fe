import {redirect} from '@remix-run/server-runtime';
import {useState, useEffect} from 'react';
import { Footer } from '~/components/Footer';
import { CoupleProfileViewHeader } from './couple.test._index';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { json } from '@shopify/remix-oxygen';

export async function loader({ context }) {
  try {
    // Get existing message and couples name from session
    const message = context.session.get('message') || '';
    const couplesName = context.session.get('couplesName') || '';
    const cart = context.session.get('cart');

    console.log('Loading session data:', { message, couplesName, cart });

    return json({
      message,
      couplesName,
      cart
    });
  } catch (error) {
    console.error('Error loading message data:', error);
    return json({ message: '', couplesName: '', cart: null });
  }
}

export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const couplesName = formData.get('couplesName');
    const action = formData.get('_action');

    console.log('Form data received:', { message, couplesName, action });

    // Validate required fields
    if (!message || !message.trim()) {
      return json({ 
        error: 'Please enter a message',
        fields: { message, couplesName }
      }, { 
        status: 400 
      });
    }

    const trimmedMessage = message.trim();
    const trimmedCouplesName = couplesName ? couplesName.trim() : '';

    // Save data to session
    context.session.set('message', trimmedMessage);
    context.session.set('couplesName', trimmedCouplesName);

    // Preserve existing cart data
    const existingCart = context.session.get('cart');
    if (existingCart) {
      context.session.set('cart', existingCart);
    }

    // If action is preview, return success response
    if (action === 'preview') {
      return json(
        { success: true },
        {
          headers: {
            'Set-Cookie': await context.session.commit()
          }
        }
      );
    }

    // If action is checkout, redirect to checkout with email and registryId
    const email = formData.get('email');
    const registryId = formData.get('registryId');
    
    const checkoutUrl = email && registryId 
      ? `/cart/checkout?email=${email}&registryId=${registryId}`
      : '/cart/checkout';
      
    return redirect(checkoutUrl, {
      headers: {
        'Set-Cookie': await context.session.commit()
      }
    });

  } catch (error) {
    console.error('Error saving message:', error);
    return json({ 
      error: 'Failed to save message',
      fields: null
    }, { 
      status: 500 
    });
  }
}

const Message = () => {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const [message, setMessage] = useState(loaderData?.message || '');
  const [couplesName, setCouplesName] = useState(loaderData?.couplesName || '');
  const [showPreview, setShowPreview] = useState(false);
  const maxLength = 500;
  const [error, setError] = useState('');

  // Reset form with loader data
  useEffect(() => {
    if (loaderData) {
      setMessage(loaderData.message || '');
      setCouplesName(loaderData.couplesName || '');
    }
  }, [loaderData]);

  // Handle action data updates
  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
      setShowPreview(false);
    } else if (actionData?.success) {
      setShowPreview(true);
      setError('');
    }
    
    // Restore fields if provided
    if (actionData?.fields) {
      setMessage(actionData.fields.message || '');
      setCouplesName(actionData.fields.couplesName || '');
    }
  }, [actionData]);

  const handlePreview = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    const form = e.target.form;
    const formData = new FormData(form);
    formData.set('_action', 'preview');
    formData.set('message', message);
    formData.set('couplesName', couplesName);
    
    submit(formData, {
      method: 'post',
    });
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    const formData = new FormData();
    formData.set('_action', 'checkout');
    formData.set('message', message);
    formData.set('couplesName', couplesName);
    
    // Get email and registryId from localStorage
    const email = typeof window !== 'undefined' ? localStorage.getItem('guestEmail') : '';
    const registryId = typeof window !== 'undefined' ? localStorage.getItem('registryId') : '';
    
    formData.set('email', email);
    formData.set('registryId', registryId);
    
    submit(formData, {
      method: 'post',
    });
  };

  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      <div className="p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5">checkout</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div>

      <div className="max-w-4xl mx-auto mt-[80px]">
        <div className="flex items-center justify-around">
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">1.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Add your messsage
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">2.</h4>
            <p className="text-lg max-w-24 mx-auto uppercase text-center">
              Billing & Payment
            </p>
          </div>
          <div className="w-4/12">
            <h4 className="text-[60px] font-bold text-center prata">3.</h4>
            <p className="text-lg max-w-32 mx-auto uppercase text-center">
              Order Confirmation
            </p>
          </div>
        </div>
      </div>

      <div className="mx-20 py-[100px]">
        <div className="container mx-auto bg-[#446184] py-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            enclose your <span className="font-italic">PERSONAL MESSAGE</span>{' '}
            here
          </h2>

          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your message and gift notification will be sent to the couple
            immediately upon completion of your order.
          </p>

          {error && (
            <div className="max-w-xl mx-auto text-center text-red-500 mb-4 bg-white p-2 rounded">
              {error}
            </div>
          )}

          <Form method="post">
            <input 
              type="hidden" 
              name="email" 
              value={typeof window !== 'undefined' ? localStorage.getItem('guestEmail') || '' : ''} 
            />
            <input 
              type="hidden" 
              name="registryId" 
              value={typeof window !== 'undefined' ? localStorage.getItem('registryId') || '' : ''} 
            />
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
                          name="couplesName"
                          placeholder="Couples Name*"
                          value={couplesName}
                          onChange={(e) => setCouplesName(e.target.value)}
                          className="w-full prata text-center text-2xl mx-auto mb-4 border border-gray-300 rounded p-2 bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <div className="w-full flex justify-center">
                          <div className="w-full">
                            <textarea
                              name="message"
                              placeholder="Your Message here...*"
                              maxLength={maxLength}
                              rows={7}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full border italic border-gray-300 prata text-center text-xl outline-none p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                            <div className="text-xs text-gray-400 mt-1 text-left">
                              {maxLength - message.length}/{maxLength} characters remaining
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative max-w-4xl mx-auto">
                        <h3 className="text-center text-3xl font-bold italic prata">{couplesName}</h3>
                        <p className="text-center prata italic leading-relaxed text-xl mt-10">
                          {message}
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
                <h4 className="text-[30px] text-white text-center">3</h4>
              </div>
              
              {showPreview && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <button 
                    type="button"
                    onClick={handleCheckout}
                    className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black w-[225px] max-[1601px]:w-[280px] text-center"
                  >
                    Proceed To Checkout
                  </button>
                </div>
              )}
            </div>
          </Form>
        </div>
      </div>

      <section className="my-12 lg:my-[240px]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="questions? "
          description="We've got answers."
          buttontext={'PHONE, EMAIL OR LIVE CHAT'}
          buttontype={'Color'}
        />
      </section>

      <Footer />
    </div>
  );
};

export default Message;
