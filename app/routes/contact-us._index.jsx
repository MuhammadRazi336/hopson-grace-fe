import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitle.png';
import {Link, json, useLoaderData} from '@remix-run/react';

export async function loader({ context }) {
  try {
    // Get user session if available
    const user = context?.session?.get('@User');
    return json({ user: user || null });
  } catch (error) {
    console.error('Error loading user session:', error);
    return json({ user: null });
  }
}

const ContactUs = () => {
  const { user } = useLoaderData();
  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="questions?"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-1xl lg:text-2xl font-normal text-center py-16 w-[40%] lg:w-[60%]  mx-auto">
          {user ? 
            "Reach out if you'd like help setting up your registry, to get a second opinion on your selections or if you have questions regarding your account, shipping or fulfillment." :
            "We're here for you. From setup to shipping, or if you're purchasing a gift for a couple, you can reach us anytime for help, guidance, or just a second opinion."
          }
        </p>

        <section className="container mx-auto mb-10">
          <div className="flex lg:gap-8 gap-2 flex-wrap xl:flex-nowrap items-stretch">
            <div className="lg:w-[41.56%] w-full">
              <img
                src="/assets/Images/newspapertea.jpg"
                alt="Image Banner"
                className="max-[1024px]:h-full object-cover object-[80%]"
              />
            </div>
            {/* <div>
                <h3 className="text-lg font-bold mb-2">EMAIL</h3>
                <p className="text-sm">Email us anytime at hello@theregistry.ca We respond within one business day.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">CALL</h3>
                <p className="text-sm">We're available at 1-800-555-5555 10am-6pm (Mon-Sat) | 12pm-5pm (Sun).</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">CHAT</h3>
                <p className="text-sm">Chat with us live between 10am-6pm (Mon-Sat) or 12pm-5pm (Sun) EST. Offline? Leave a message we'll reply by email.</p>
              </div> */}
            <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[57%] w-full max-[768px]:p-10">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-2xl text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  EMAIL
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[7.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px]"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw] max-w-[500px] mt-4 mb-4 text-center text-white">
                Email us anytime at <a href="mailto:hello@theregistry.ca" className="text-white">hello@theregistry.ca</a> We respond within one business day.
                </p>

                <h3 className="text-2xl mt-10 text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  CALL
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[7.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px] mx-auto"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw]  max-w-[500px] mt-4 mb-4 text-center text-white">
                We’re available at 1-800-555-5555 <br /> 10am–6pm (Mon–Sat) | 12pm–5pm (Sun).
                </p>
                <h3 className="text-2xl mt-10 text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  CHAT
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[7.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px] mx-auto"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw]  max-w-[500px] mt-4 mb-4 text-center text-white">
                Chat with us live between 10am–6pm (Mon–Sat) or 12pm–5pm (Sun) EST. Offline? Leave a message we'll reply by email.
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="pb-[200px]"></div>
      </div>
      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="BOOK A VIRTUAL APPOINTMENT"
          classes={
            'prata text-4xl lg:text-[2.5vw] lg:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <p className="text-1xl lg:text-2xl font-normal text-center py-16 w-[40%] lg:w-[60%]  mx-auto">
          {user ? 
            "Reach out if you'd like help setting up your registry, to get a second opinion on your selections or if you have questions regarding your account, shipping or fulfillment." :
            "We're here for you. From setup to shipping, or if you're purchasing a gift for a couple, you can reach us anytime for help, guidance, or just a second opinion."
          }
        </p>

        <section className="container mx-auto mb-10">
          <div className="flex lg:gap-8 gap-2 flex-wrap xl:flex-nowrap items-stretch">
            <div className="bg-[#446184] xl:-bottom-10 xl:-right-16 right-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[57%] w-full max-[768px]:p-10">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-2xl text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  SETTING UP YOUR REGISTRY
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[15.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px]"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw] max-w-[500px] mt-4 mb-4 text-center text-white">
                  Need a hand getting started? Let our concierge help set up, manage or fulfill your registry. with
                  our Registry Concierge. We’ll walk you through the process,
                  answer your questions, and help you build a registry that
                  reflects your style, your life, and your wishlist.
                </p>

                <h3 className="text-2xl mt-10 text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  ADVICE & REGISTRY FULFILLMENT
                </h3>
                <img
                  src={lineImghead}
                  alt="lineimg"
                  className="mb-2 mt-2 lg:w-[19.365vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px] mx-auto"
                />
                <p className="text-sm lg:text-[1.146vw] lg:leading-[1.667vw]  max-w-[500px] mt-4 mb-4 text-center text-white">
                  Getting close to the big day—or already married? Book a
                  session with our Concierge for help wrapping things up. From
                  choosing your final gifts to coordinating delivery and
                  fulfillment, we’re here to make the process seamless and
                  stress-free.
                </p>
              </div>
              <Link to={"https://calendly.com/concierge-theregistry/30min"}>
                <button className="font-[500] px-2 mt-3 py-0 text-[18px] leading-[18px] transition-colors duration-200 bg-white text-black w-[361px] h-[78px] hover:bg-gray-100">
                  BOOK AN APPOINTMENT
                </button>
              </Link>
            </div>
            <div className="lg:w-[41.56%] w-full">
              <img
                src="/assets/Images/appointment.png"
                alt="Image Banner"
                className="max-[1024px]:h-full object-cover object-[80%]"
              />
            </div>
          </div>
        </section>

        {/* Hopson Grace Store Section */}
        <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
          <div className="container mx-auto px-4">
            {/* Logo */}
            <div className="text-center mb-8">
              <img
                src={RegistryLogo}
                alt="Registry Logo"
                className="mx-auto mb-6 w-16 h-16"
              />
            </div>
            
            {/* Main Heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">WANT TO SEE SOME OF OUR PRODUCTS IN PERSON?</h2>
              <p className="text-base max-w-4xl mx-auto">
                If you're in Toronto, visit our sister store <strong>Hopson Grace</strong> for modern home essentials and timeless gifts, where you'll be able to see some products from The Registry in person.
              </p>
            </div>
            
            {/* Content Grid */}
            <div className="grid  grid-cols-1 lg:grid-cols-2  items-stretch">
              <div className=" p-8 bg-[#FAF8F6] flex items-center justify-center">
                <div className="text-center space-y-6">
                  <h3 className="text-lg font-bold uppercase mb-4">HOPSON GRACE</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold mb-2">LOCATION</h4>
                      <p className="text-base">200 DUPONT STREET<br />TORONTO, ON M5R 2E6</p>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold mb-2">OPENING TIMES</h4>
                      <p className="text-base mb-1">MONDAY - SATURDAY: 10AM - 6PM</p>
                      <p className="text-base">SUNDAY: 12PM - 5PM</p>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-semibold mb-2">GET IN TOUCH</h4>
                      <p className="text-base mb-1">416-926-1120</p>
                      <p className="text-base mb-1">
                        <a href="mailto:INFO@HOPSONGRACE.COM" className="hover:text-gray-600">
                          INFO@HOPSONGRACE.COM
                        </a>
                      </p>
                      <p className="text-base">
                        <a href="https://www.hopsongrace.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                          WWW.HOPSONGRACE.COM
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.123456789!2d-79.406307!3d43.653226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34d68bf33a9b%3A0x15edd8c4de1c7581!2s200%20Dupont%20St%2C%20Toronto%2C%20ON%20M5R%202E6%2C%20Canada!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Hopson Grace Store Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-[200px]"></div>
      </div>

      <Footer />
    </section>
  );
};

export default ContactUs;
