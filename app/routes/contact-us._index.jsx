import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '../assets/Images/heading-bottom-curve.png';
import lineCurve from '../assets/Images/line.png';
import RegistryLogo from '/assets/Images/about-us-monogram.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitle.png';
import smallHeadingLine from '/assets/Images/small-heading-line.png';
import HopsonGracePos from '/assets/Images/hopson-pos.png';
import {Link, json, useLoaderData} from '@remix-run/react';

export async function loader({context}) {
  try {
    // Get user session if available
    const user = context?.session?.get('@User');
    return json({user: user || null});
  } catch (error) {
    console.error('Error loading user session:', error);
    return json({user: null});
  }
}

const ContactUs = () => {
  const {user} = useLoaderData();
  return (
    <section>
      <Header />

      <div
        className={`w-full h-fit pt-[3.75vw] max-[1024px]:pt-[40px] ${
          user ? 'bg-[#FFFFFF]' : 'bg-[#FAF9F6]'
        }`}
      >
        <Heading
          text="questions?"
          classes={
            'prata text-[20px] leading-[36px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0'
          }
          image={lineCurve}
          imageClasses={'max-[1024px]:max-w-[114px] lg:w-[16.25vw] xl:w-[16.25vw] 2xl:w-[16.25vw] h-[5px]'}
        />
        <p className="text-[12px] leading-[18px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center pt-[2.76vw] pb-[4.167vw] w-[63vw] max-w-full max-[1024px]:w-[322px] mx-auto">
          {user ? 
            "Reach out if you’d like help setting up your registry, to get a second opinion on your selections or if you have questions regarding your account, shipping or fulfillment." :
            "We’re here for you. From setup to shipping, or if you’re purchasing a gift for a couple, reach us anytime for help, guidance, or just a second opinion. "
          }
        </p>

        <section className="lg:px-[7.24vw] xl:px-[7.24vw] 2xl:px-[7.24vw] mx-auto mb-10">
          <div className="flex justify-center flex-wrap xl:flex-nowrap">
            <div className="lg:w-[37.552vw] xl:w-[37.552vw] 2xl:w-[37.552vw] w-full">
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
            <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[52.083vw] xl:w-[52.083vw] 2xl:w-[52.083vw] w-full max-[768px]:p-10 lg:py-[3.958vw] xl:py-[3.958vw] 2xl:py-[3.958vw]">
              <div className="flex flex-col items-center justify-center">                
                <p className="text-[13px] leading-[36px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] max-w-[500px] mt-4 mb-4 text-center text-white">
                  Our team is on call 7 days a week from 10-6pm EST.
                </p>

                <h3 className="text-[16px] leading-[18px] mt-10 text-white lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full  text-center">
                  CALL
                </h3>
                <img
                  src={smallHeadingLine}
                  alt="lineimg"
                  className="my-[5px] lg:w-[6.25vw] xl:w-[6.25vw] 2xl:w-[6.25vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[71px] mx-auto"
                />
                <p className="text-[13px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]  max-w-[500px] mt-4 mb-0 text-center text-white">
                  <strong>1-866-531-8616 </strong> (Toll Free within North America) 
                <br /> <strong>437-564-8656 </strong> (Local Toronto Area)
                </p>
                <h3 className="text-[16px] mt-10 text-white lg:text-[1.146vw] lg:leading-[1.875vw] 3xl:w-full  text-center">
                  EMAIL
                </h3>
                <img
                  src={smallHeadingLine}
                  alt="lineimg"
                  className="my-[5px] lg:w-[6.25vw] xl:w-[6.25vw] 2xl:w-[6.25vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[71px] mx-auto"
                />
                <p className="text-[13px] underline lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]  max-w-[500px] mt-4 mb-4 text-center text-white">
                  <span className="text-white font-[500]">{user ? <a href='mailto:concierge@theregistry.ca' target='_blank' rel='noopener noreferrer' className='font-semibold underline text-white'>concierge@theregistry.ca</a> : <a href='mailto:hello@theregistry.ca' target='_blank' rel='noopener noreferrer' className='font-semibold underline text-white'>hello@theregistry.ca</a>}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="pb-[10.521vw] max-[1024px]:pb-[20px]"></div>
      </div>
      <div className={`w-full h-fit ${user ? 'bg-[#FFFFFF]' : 'bg-[#FAF9F6]'}`}>
        <Heading
          text="BOOK A VIRTUAL APPOINTMENT"
          classes={
            'prata text-[20px] leading-[36px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0 lowercase'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[283px] lg:w-[29.167vw] xl:w-[29.167vw] 2xl:w-[29.167vw] h-[5px] mb-[5.365vw]'}
        />

        <section className="px-[5.677vw] mx-auto mb-10 max-[1024px]:mb-0">
          <div className="flex flex-wrap xl:flex-nowrap justify-center max-[1024px]:flex-col-reverse">
            <div className={`${user ? "lg:w-[52.083vw] xl:w-[52.083vw] 2xl:w-[52.083vw] lg:h-[47.083vw] xl:h-[47.083vw] 2xl:h-[47.083vw]" : "lg:w-[50.521vw] xl:w-[50.521vw] 2xl:w-[50.521vw] lg:h-[27.708vw] xl:h-[27.708vw] 2xl:h-[27.708vw]"} bg-[#446184] z-10 xl:-bottom-10 lg:left-[1.563vw] xl:left-[1.563vw] 2xl:left-[1.563vw] left-0 bottom-0 py-[4.74vw] relative flex items-center justify-center flex-col w-full max-[768px]:p-10 max-[1024px]:left-[15px] max-[1024px]:bottom-[80px]`}>
              <div className="flex flex-col items-center justify-center w-[35.208vw] mx-auto max-w-full max-[1024px]:w-full">
                {user ? (
                  <>
                    <h3 className="text-[20px] font-semibold text-white lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full  text-center">
                      SETTING UP YOUR REGISTRY
                    </h3>

                    <img
                      src={lineImghead}
                      alt="lineimg"
                      className="mb-6 mt-2 lg:w-[17.708vw] xl:w-[17.708vw] 2xl:w-[17.708vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px]"
                    />
                  </>
                ) : (
                  <></>
                )}
                
                <p className="text-[12px] leading-[18px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] mb-4 text-center text-white">
                  {user ? "Need a hand getting started? Book a virtual appointment with our Registry Concierge. We’ll walk you through the process, answer your questions, and help you build a registry that reflects your style, your life, and your wishlist." : "Book a virtual appointment with a Registry Concierge to learn more about The Registry before you sign up, or for support at any stage once you’re registered. Whether you’re just getting started, refining your selections, or ready to coordinate fulfillment and delivery, we’re here to guide you through the process with thoughtful, seamless support."}
                </p>

                {user ? (
                  <>
                    <Link
                      to={
                        'https://calendly.com/concierge-theregistry/setting-up-your-registry'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="font-[800] px-2 mt-3 mb-4 py-0 text-[18px] leading-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] tracking-[1.44px] cursor-pointer transition-colors duration-200 bg-white text-black w-[361px] lg:w-[18.802vw] xl:w-[18.802vw] 2xl:w-[18.802vw] h-[78px] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] hover:bg-gray-100 max-[1024px]:w-full max-[1024px]:h-[45px] max-[1024px]:max-w-full max-[1024px]:text-[14px] max-[1024px]:leading-[14px] max-[1024px]:px-[20px]">
                        BOOK AN APPOINTMENT
                      </button>
                    </Link>

                    <h3 className="text-[20px] mt-10 font-semibold text-white lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full  text-center">
                      ADVICE & REGISTRY FULFILLMENT
                    </h3>
                    <img
                      src={lineImghead}
                      alt="lineimg"
                      className="mb-2 mt-2 lg:w-[22.135vw] xl:w-[22.135vw] 2xl:w-[22.135vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[170px] mx-auto"
                    />
                    <p className="text-sm lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] mt-4 mb-4 text-center text-white">
                      Getting close to the big day—or already married? Book a
                      session with our Concierge for help wrapping things up.
                      From choosing your final gifts to coordinating delivery
                      and fulfillment, we’re here to make the process seamless
                      and stress-free.
                    </p>
                  </>
                ) : (
                  <></>
                )}
                <Link
                  to={`${
                    user
                      ? 'https://calendly.com/concierge-theregistry/30min'
                      : 'https://calendly.com/concierge-theregistry/learn-more'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="font-[800] px-2 mt-3 py-0 text-[18px] leading-[18px] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] tracking-[1.44px] cursor-pointer transition-colors duration-200 bg-white text-black w-[361px] lg:w-[18.802vw] xl:w-[18.802vw] 2xl:w-[18.802vw] h-[78px] lg:h-[4.063vw] xl:h-[4.063vw] 2xl:h-[4.063vw] hover:bg-gray-100 max-[1024px]:w-full max-[1024px]:h-[45px] max-[1024px]:max-w-full max-[1024px]:text-[14px] max-[1024px]:leading-[14px] max-[1024px]:px-[20px]">
                    BOOK AN APPOINTMENT
                  </button>
                </Link>
              </div>
            </div>
            <div className={`max-[1024px]:right-[15px] ${user ? "lg:h-[46.719vw] xl:h-[46.719vw] 2xl:h-[46.719vw]" : "lg:h-[28.385vw] xl:h-[28.385vw] 2xl:h-[28.385vw]"} lg:w-[37.552vw] xl:w-[37.552vw] 2xl:w-[37.552vw] relative lg:right-[1.563vw] xl:right-[1.563vw] 2xl:right-[1.563vw] right-0 w-full`}>
              <img
                src="/assets/Images/appointment.png"
                alt="Image Banner"
                className="max-[1024px]:h-full object-cover object-[80%] w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* Hopson Grace Store Section */}
        <div className={`w-full h-fit max-[1024px]:py-[40px] pt-[10.156vw] pb-[15.365vw] max-[1024px]:pt-0 ${user ? 'bg-[#FFFFFF]' : 'bg-[#FAF9F6]'}`}>
          <div className="px-[8.177vw] mx-auto">
            {/* Logo */}
            <div className="text-center mb-[2.969vw]">
              <img
                src={RegistryLogo}
                alt=""
                className="w-[100px] object-cover mx-auto max-[1024px]:w-[60px]"
              />
            </div>

            {/* Main Heading */}
            <div className="text-center mb-[4.688vw]">
              <h2 className="text-[12px] leading-[18px] max-[1024px]:w-[300px] max-[1024px]:mx-auto font-[500] mb-[1.302vw] lg:text-[1.458vw] xl:text-[1.458vw] 2xl:text-[1.458vw] tracking-[2.24px] max-[1024px]:mb-[20px]">WANT TO SEE SOME OF OUR PRODUCTS IN PERSON?</h2>
              <p className="text-[12px] leading-[18px] w-[72.292vw] max-w-full mx-auto lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">
              If you’re in Toronto, visit our sister store <a href="https://www.hopsongrace.com" target="_blank" rel="noopener noreferrer" className="text-[#1F1D1B] underline font-[600]">Hopson Grace</a> for modern home essentials and timeless gifts, where you’ll be able to see some products from The Registry in person.
              </p>
            </div>

            {/* Content Grid */}
            <div className="flex justify-center max-[1024px]:flex-col-reverse">
              <div className={`p-8 lg:py-[3.698vw] xl:py-[3.698vw] 2xl:py-[3.698vw] w-[50%] flex items-center justify-center max-[1024px]:w-full ${user ? 'bg-[#FAF9F6]' : 'bg-[#FFFFFF]'}`}>
                <div className="text-center space-y-6">
                  <img src={HopsonGracePos} alt="Hopson Grace" className="max-[1024px]:w-[146px] lg:w-[15.156vw] xl:w-[15.156vw] 2xl:w-[15.156vw] object-cover block mx-auto mb-[2.5vw] max-[1024px]:mb-[20px]" />
                  <div className="space-y-4">
                    <div className='mb-[2.865vw]'>
                      <h4 className="text-[12px] leading-[36px] font-semibold mb-[9px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] tracking-[1.92px]">LOCATION</h4>
                      <p className="text-[12px] underline lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]"><a className='hover:text-gray-600' href="https://www.google.com/maps/place/Hopson+Grace/@43.6756579,-79.407044,17z/data=!3m1!4b1!4m6!3m5!1s0x882b3357e8ee4cdf:0x8b95f40a5c1da6f!8m2!3d43.675654!4d-79.4044691!16s%2Fg%2F11c0w87pyg?authuser=0&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D" target='_blank'>200 DUPONT STREET<br />TORONTO, ON M5R 2E6</a></p>
                    </div>
                    
                    <div className='mb-[2.865vw]'>
                      <h4 className="text-[12px] leading-[36px] font-semibold mb-[9px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] tracking-[1.92px]">OPENING TIMES</h4>
                      <p className="text-[12px] mb-1 lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]">MONDAY - SATURDAY: 10AM - 6PM</p>
                      <p className="text-[12px] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]">SUNDAY: 12PM - 5PM</p>
                    </div>
                    
                    <div className='mb-0'>
                      <h4 className="text-[12px] leading-[36px] font-semibold mb-[9px] lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] tracking-[1.92px]">GET IN TOUCH</h4>
                      <p className="text-[12px] mb-1 lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]">416-926-1120</p>
                      <p className="text-[12px] underline mb-1 lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]">
                        <a href="mailto:info@hopsongrace.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                          INFO@HOPSONGRACE.COM
                        </a>
                      </p>
                      <p className="text-[12px] underline lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]">
                        <a href="https://www.hopsongrace.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                          WWW.HOPSONGRACE.COM
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center w-[50%] justify-center max-[1024px]:w-full">
                <div className="w-full h-[37.396vw] bg-gray-200 overflow-hidden">
                  <img
                    src="/assets/Images/contactmap.jpg"
                    alt="Hopson Grace Store Location"
                    className="w-full h-full object-cover"
                  />
                  {/* <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.123456789!2d-79.406307!3d43.653226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34d68bf33a9b%3A0x15edd8c4de1c7581!2s200%20Dupont%20St%2C%20Toronto%2C%20ON%20M5R%202E6%2C%20Canada!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Hopson Grace Store Location"
                    className="w-full h-full object-cover"
                  ></iframe> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default ContactUs;
