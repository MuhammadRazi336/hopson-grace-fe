import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import Heading from '~/components/Heading';
import lineImghead from '/assets/Images/line.png';

const PrivacyPolicy = () => {
  return (
    <section>
      <Header />

      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="privacy policy"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />
        <div className="w-[70%] mx-auto py-16">
          <p className="text-1xl lg:text-2xl font-normal">
            At <span className="font-bold">The Registry</span> (a division of
            Hopson Grace Inc.), we respect your privacy. This policy outlines
            how we collect, use, and protect your personal information when you
            use our website and services
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            WHAT WE COLLECT
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            When you create a registry, shop with us, or browse our site, we may
            collect personal information such as your name, email address, phone
            number, mailing address, wedding date, and gift preferences. We also
            collect information related to your purchases and gift tracking
            activity. If you use our cash fund features, we may collect payment
            details through trusted platforms like PayPal or Shopify Payments.
            In addition, we gather website activity data through cookies and
            analytics tools to help us understand how our visitors use the site.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">HOW WE USE IT</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            We use your information to set up and manage your registry, process
            payments and orders, and send relevant updates, reminders, and
            thank-you note prompts. Your data also helps us provide effective
            customer support and improve our website and services. From time to
            time, and only with your consent, we may share news or promotions we
            think you'll appreciate.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            WHO WE SHARE IT WITH
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            We do not sell your data. We only share it with trusted third-party
            partners who help us operate The Registry smoothly. These include
            payment processors like PayPal, website hosting platforms like
            Shopify, delivery and customer support providers, and marketing
            tools such as Klaviyo, Google, and Meta.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">COOKIES</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            We use cookies to enhance your browsing experience and to better
            understand how our website is being used. You can adjust your cookie
            preferences or disable cookies entirely through your browser
            settings.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">YOUR RIGHTS</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            You have the right to access the personal data we hold about you, to
            update or correct your information, and to request that we delete
            your data—unless we’re required to retain it for legal reasons. To
            make a privacy-related request, please contact us at{' '}
            <a className="underline hover:text-gray-600" href="mailto:hello@theregistry.ca" target="_blank" rel="noopener noreferrer">
              hello@theregistry.ca
            </a>
            .
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            HOW WE KEEP YOUR INFO SAFE
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-3 pb-[200px]">
            We use secure systems and trusted platforms to protect your personal
            information. While we do everything we can to safeguard your data,
            no online system is entirely immune to risks. We are committed to
            keeping your information safe and using it responsibly.
          </p>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default PrivacyPolicy;
