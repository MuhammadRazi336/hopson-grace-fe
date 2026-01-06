import React from 'react';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import lineImghead from '/assets/Images/line.png';
import Heading from '~/components/Heading';
import RegistryLogo from '/assets/Images/registry-monogram.png';

const TermsConditions = () => {
  return (
    <section>
      <Header />
      <div className="w-full h-[2px] bg-black"></div>

      <div className="w-full h-fit bg-[#FAF9F6] pt-[100px]">
        <Heading
          text="t & c's"
          classes={
            'prata text-4xl lg:text-7xl font-normal text-center max-[1024px]:m-0'
          }
          image={lineImghead}
          imageClasses={'max-[1024px]:max-w-[330px]'}
        />

        <div className="w-[70%] mx-auto py-16">
          <p className="text-1xl lg:text-2xl font-normal">
            Welcome to{' '}
            <span className="font-bold">
              The Registry, a division of Hopson Grace Inc.
            </span>{' '}
            These Terms & Conditions govern your use of our registry platform
            and related services. By using our website, creating a registry, or
            purchasing a gift, you agree to the terms outlined below.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">1. WHO WE ARE</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            The Registry is a division of{' '}
            <span className="font-bold">Hopson Grace Inc.</span>, located in
            Toronto, Ontario, Canada. Our platform allows couples to create
            personalized wedding registries where guests can shop for them with
            ease.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            2. WHO THESE TERMS APPLY TO
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            These Terms apply to all users of The Registry platform, including:
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8">
            <li>
              <span className="font-bold">Registrants</span> (couples) creating
              and managing a gift registry
            </li>
            <li>
              <span className="font-bold">Guests</span> shopping from a registry
              or making contributions
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            3. PRODUCT AVAILABILITY & ORDERS
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              Items are subject to availability and may change without notice.
            </li>
            <li>
              In the rare event that an item becomes discontinued or
              unavailable, the value of the gift will remain on the couple’s
              account, and we will offer comparable replacement suggestions.
            </li>
            <li>All orders are final once processed. </li>
            <li>
              Special order items are final sale and cannot be exchanged or
              returned.
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">4. PAYMENTS</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            All prices are listed in Canadian dollars (CAD) unless otherwise
            indicated and include applicable sales taxes unless otherwise noted.
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8">
            <li>
              Gift purchases are processed securely via our payment provider
              Stripe.
            </li>
            <li>
              Registrant purchases are processed securely via Shopify Payments.
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            5. PRICING AND DISCOUNTS
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              Occasionally, we may offer exclusive promotions to registry
              holders, such as our post-wedding newlywed discount. Terms and
              expiry dates will be provided at the time of the offer.
            </li>
            <li>Prices are subject to change without notice.</li>
            <li>The Registry does not price match.</li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            6. CASH FUNDS & GROUP GIFTING
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              We offer optional features like cash funds and group gifting,
              allowing guests to contribute toward larger gifts or financial
              goals.
            </li>
            <li>
              Funds are processed securely and transferred to registry holders
              via e-transfer or bank transfer. Hopson Grace may deduct a small
              processing fee to cover transaction costs, which will be disclosed
              upfront to the purchaser.
            </li>
            <li>
              Registry holders are not eligible to receive funds on account
              which represent the value of the gift purchased, as cash. However,
              registrants may use any cash funds received toward product
              purchases.
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            7. RETURNS & EXCHANGES
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              If an item arrives damaged or defective, we’ll replace it and
              cover the return shipping at no cost For all other returns,
              shipping fees apply. Items must be returned within 60 days of
              receipt.
            </li>
            <li>
              Items must be returned in their original condition and packaging.
            </li>
            <li>
              We will issue a replacement or credit for returned items within 10
              business days of receiving the returned item.
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            8. RETURNS & EXCHANGES
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              <span className="font-bold">
                Registry holders may receive up to two complimentary shipments
                of their gifts.
              </span>{' '}
              Gifts may be consolidated and shipped once the registry is fully
              fulfilled, or split into two deliveries at the couple’s direction.
              Additional shipments beyond the first two will incur standard
              shipping fees. Furniture or oversized items may ship separately
              and are subject to additional charges.
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            9. REGISTRY STORAGE & FULFILLMENT
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              Once your registry has been fulfilled, Hopson Grace offers
              complimentary storage for 6 months from the time all gifts are
              ready to ship. After 6 months, storage fees may apply (you will be
              notified in advance).
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            10. REGISTRY STORAGE & FULFILLMENT{' '}
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-8 pt-3">
            <li>
              We take your privacy seriously and comply with Canadian privacy
              laws.
            </li>
            <li>
              Your personal information is used only to fulfill orders, manage
              your registry, or communicate relevant updates.
            </li>
            <li>
              We do not sell or share your data with third parties without your
              consent.
            </li>
          </ul>

          <p className="text-2xl lg:text-3xl font-bold pt-16">11. USER CONDUCT</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            Users agree not to:
          </p>
          <ul className="text-1xl lg:text-2xl font-normal list-disc pl-16">
            <li>Misuse the site or services</li>
            <li>Interfere with other users’ experience</li>
            <li>Post offensive, unlawful, or misleading content</li>
            <li>Attempt to reverse-engineer or disrupt our platform</li>
          </ul>
          <p className="text-1xl lg:text-2xl font-normal">
            Violation may result in suspension or termination of your account.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            12. LIMITATION OF LIABILITY
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            To the extent permitted by law, Hopson Grace is not liable for any
            indirect, incidental, or consequential damages. Our liability is
            limited to the amount paid for the product or service in question.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">
            13. CHANGES TO THESE TERMS
          </p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            We may update these Terms from time to time. If changes are
            material, we will notify users via email or on the site at least 30
            days before they take effect. Continued use of the site means you
            accept the updated terms.
          </p>

          <p className="text-2xl lg:text-3xl font-bold pt-16">14. GOVERNING LAW</p>
          <p className="text-1xl lg:text-2xl font-normal pt-3">
            These Terms are governed by the laws of the Province of Ontario and
            the federal laws of Canada. Any disputes will be resolved in the
            courts of Toronto, Ontario.
          </p>
        </div>

        <div className="w-full mx-auto text-center">
        <img
          src={RegistryLogo}
          alt=""
          className="w-[100px] object-cover mx-auto"
        />
        <img
          src={lineImghead}
          alt=""
          width={100}
          height={100}
          className="object-cover mx-auto"
        />

        <p className="text-1xl lg:text-2xl font-semibold pt-8">
            QUESTIONS?
        </p>
        <p className="text-1xl lg:text-2xl font-normal pt-8 pb-[200px]">
         We're here to help. Reach out to us at <a href='mailto:hello@hopsongrace.com' target='_blank' rel='noopener noreferrer' className='font-semibold underline hover:text-gray-600'>hello@hopsongrace.com</a> for assistance or clarification.
        </p>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default TermsConditions;
