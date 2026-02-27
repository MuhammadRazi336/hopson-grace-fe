import React from 'react'
import { Footer } from '~/components/Footer';
import WhiteThemeButton from '~/components/WhiteThemeButton';
import LiveChat from '~/components/LiveChat';
import LineCurve from '/assets/Images/line.png';

const Support = () => {

  return (
    <div className="w-full h-fit pt-[3.75vw] max-[1024px]:pt-[40px] bg-[#FFFFFF]">
        <div className="flex items-center flex-col gap-2 lg:gap-[0.833vw]">
        <h2 className="prata text-[30px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center max-[1024px]:m-0">
          need <span className="prata uppercase">support</span>
        </h2>
        <img
          src={LineCurve}
          alt="Couple"
          className="max-[1024px]:max-w-[330px] lg:w-[16.25vw] xl:w-[16.25vw] 2xl:w-[16.25vw] h-[5px]"
        />
        <p className="text-1xl px-[20px] lg:text-[1.354vw] xl:text-[1.354vw] 2xl:text-[1.354vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] font-normal text-center pt-[2.76vw] pb-[4.167vw] w-[63vw] max-w-full max-[1024px]:w-full mx-auto">
          Enjoy one-time free shipping after the wedding—just let us know when
          you're ready. Prefer to receive something sooner? You can ship gifts
          anytime; standard shipping rates will apply.
        </p>
      </div>

      <section className="lg:px-[7.24vw] xl:px-[7.24vw] 2xl:px-[7.24vw] mx-auto mb-10">
        <div className="flex justify-center flex-wrap xl:flex-nowrap">
          <div className="lg:w-[37.552vw] xl:w-[37.552vw] 2xl:w-[37.552vw] w-full">
            <img
              src="/assets/Images/need-support-img.png"
              alt="Image Banner"
              className="max-[1024px]:h-full object-cover object-[80%]"
            />
          </div>
          <div className="bg-[#446184] xl:-bottom-10 xl:-left-16 left-0 bottom-0 py-16 relative flex items-center justify-center flex-col lg:w-[52.083vw] xl:w-[52.083vw] 2xl:w-[52.083vw] w-full max-[768px]:p-10 lg:py-[3.958vw] xl:py-[3.958vw] 2xl:py-[3.958vw]">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-[20px] mt-0 text-white lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full  text-center">
                QUESTIONS, PRODUCT REQUESTS, OR ISSUES?
              </h3>
              <img
                src="/assets/Images/small-heading-line.png"
                alt="lineimg"
                className="my-[5px] lg:w-[6.25vw] xl:w-[6.25vw] 2xl:w-[6.25vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[100px] mx-auto"
              />
              <p className="text-sm lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]  max-w-[500px] mt-4 mb-0 text-center text-white">
                Email us anytime at{' '}
                <a href='mailto:support@theregistry.ca' target='_blank' rel='noopener noreferrer' className='font-semibold underline text-white'>
                  {' '}
                  support@theregistry.ca{' '}
                </a>{' '}
                <br /> We respond within one business day.
              </p>

              <h3 className="text-[20px] mt-10 text-white lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] 3xl:w-full  text-center">
                PREFER A PHONE CALL?
              </h3>
              <img
                src="/assets/Images/small-heading-line.png"
                alt="lineimg"
                className="my-[5px] lg:w-[6.25vw] xl:w-[6.25vw] 2xl:w-[6.25vw] max-[768px]:m-1 brightness-0 invert-100 max-[768px]:w-[100px] mx-auto"
              />
              <p className="text-sm lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw]  max-w-[500px] mt-4 mb-0 text-center text-white">
                We're available at: <br />
                1-866-531-8616 (TOLL FREE)  or 437-564-8656 (LOCAL) <br />
                10–6pm (Mon–Sat) | 12–5pm (Sun)
              </p>
            </div>
            <div className="mt-4">
              <LiveChat />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-fit max-[1024px]:py-[40px] pt-[10.156vw] pb-[15.365vw] bg-[#FFFFFF] px-[8.177vw] mx-auto px-4">
        <img
          src="/assets/Images/registrylogoSteps.png"
          width={100}
          alt="Image Banner"
          className="max-[1024px]:h-full object-cover object-[80%] mx-auto"
        />
        <h3 className="text-[20px] font-[500] mt-[2.969vw] text-center mb-[1.302vw] lg:text-[1.458vw] xl:text-[1.458vw] 2xl:text-[1.458vw] tracking-[2.24px] max-[1024px]:mb-[20px]">
          NEED A REFRESHER ON SETTING UP YOUR DASHBOARD?
        </h3>

        <WhiteThemeButton className="" Text="SEE OUR QUICK-START GUIDE" link="/quick-start-guide" />
      </div>

      <Footer />
    </div>
  )
}

export default Support;
