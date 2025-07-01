import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import {useState} from 'react';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import ImageAndText from '~/components/ImageAndText';
import Input from '~/components/Input';
import CheckoutSteps from '~/components/CheckoutSteps';
export default function AddCashTravelFund() {
  const [paymentType, setPaymentType] = useState('any');
  const [hideFromGuests, setHideFromGuests] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [totalGoal, setTotalGoal] = useState('');
  const [note, setNote] = useState('');
  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      {/* <div className=" p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5"> checkout</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div> */}

      <div className="xl:mx-20 py-[100px] mx-6">
        <div className="container mx-auto bg-[#446184]  py-16">
          <h2 className="mt-0 text-white ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
            <span className="prata uppercase">NEW CASH</span> or{' '}
            <span className="prata uppercase">TRAVEL</span> fund
          </h2>
          <img
            src="/assets/Images/new-cash-bdr.png"
            alt="Couple"
            className="max-w-[630px] mt-5 h-auto mx-auto"
          />

          <p className="max-w-2xl mb-10 mx-auto text-center text-white mt-5 font-normal leading-relaxed">
            Dolorem vero aut beatae aperiam est sunt dolorem sed molestiae
            maiores. Aut doloremque libero 33 delectus perferendis eum libero
            ipsam qui minus distinctio et fuga suscipit.
          </p>

          {/* <div className="relative max-w-4xl mx-auto ">
            <img
              src="/assets/Images/checkout-bg.png"
              alt="checkout-flow"
              className="w-full object-contain"
            />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="flex items-center justify-start h-full flex-row">
                <div
                  className={`w-9/12 xl:pl-16 pl-8  pt-10
}`}
                >
                  <img
                    src="/assets/Images/greeting-flower-checkout.png"
                    alt="checkout-bg-1"
                    className="w-[15%] xl:w-auto h-auto mx-auto xl:mb-8 mb-1"
                  />

                  <MessageForm />
                </div>
              </div>
            </div>
          </div> */}

          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Photo Section */}
              <div className="space-y-4">
                <h2 className="text-white text-sm font-medium tracking-wide">
                  PHOTO
                </h2>
                <div className="bg-[#F5F2ED]  aspect-square relative flex items-center justify-center">
                  <div className="text-center">
                    <img
                      src="/assets/Images/registrylogoSteps.png"
                      alt="gift"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="cursor-pointer ">
                    <img
                      src="/assets/Images/edit-icon.png"
                      alt="edit"
                      className="absolute -top-6 size-20 -right-4 "
                    />
                  </button>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6 ">
                <h2 className="text-white text-sm font-medium tracking-wide">
                  DETAILS
                </h2>

                <div className=" rounded-lg p-4">
                  <div className="w-full">
                    <Input
                      id="address"
                      name="address"
                      value={'NEW HOME DOWN PAYMENT'}
                      className="bg-white w-full p-4"
                      placeholder="NEW HOME DOWN PAYMENT"
                      onChange={(e) => setTotalGoal(e.target.value)}
                    />
                  </div>

                  {/* Payment Type Toggle */}
                  <div className="flex mt-12 gap-4 mb-10 items-center justify-center">
                    <span className="text-white text-center">
                      ANY <br /> AMOUNT
                    </span>

                    <button
                      onClick={() => setPaymentType('any')}
                      className={`flex items-center gap-2 px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                        paymentType === 'any'
                          ? 'bg-slate-600 text-white'
                          : 'bg-gray-200 text-white  hover:bg-gray-300'
                      }`}
                    >
                      {paymentType === 'any' ? (
                        <img
                          src="/assets/Images/check-icon.png"
                          alt="check"
                          className="w-4 h-4"
                        />
                      ) : (
                        <span className="w-4 h-4">&nbsp;</span>
                      )}
                    </button>
                    <span className="text-white text-center">
                      FIXED <br /> AMOUNT
                    </span>

                    <button
                      onClick={() => setPaymentType('fixed')}
                      className={`flex items-center gap-2 px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                        paymentType === 'fixed'
                          ? 'bg-slate-600 text-white'
                          : 'bg-gray-200 text-white hover:bg-gray-300'
                      }`}
                    >
                      {paymentType === 'fixed' ? (
                        <img
                          src="/assets/Images/check-icon.png"
                          alt="check"
                          className="w-4 h-4"
                        />
                      ) : (
                        <span className="w-4 h-4">&nbsp;</span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Total Goal Input */}
                    <div className="w-7/12">
                      <Input
                        id="address"
                        name="address"
                        value={totalGoal}
                        className="bg-white w-full p-4"
                        placeholder="Total Goal*"
                        onChange={(e) => setTotalGoal(e.target.value)}
                      />
                    </div>

                    {/* Hide from Guests Toggle */}
                    <div className=" flex items-center justify-center gap-5 w-5/12 pl-2">
                      <span className="text-white text-sm text-center">
                        HIDE <br /> FROM <br /> GUESTS
                      </span>

                      <button
                        onClick={() => setHideFromGuests(!hideFromGuests)}
                        className={`flex items-center gap-2 px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          hideFromGuests
                            ? 'bg-slate-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {hideFromGuests ? (
                          <img
                            src="/assets/Images/check-icon.png"
                            alt="check"
                            className="w-4 h-4"
                          />
                        ) : (
                          <span className="w-4 h-4">&nbsp;</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-3 mt-10">
                    <h4 className="text-white font-medium text-md tracking-wide">
                      TERMS & CONDITIONS
                    </h4>
                    <p className="text-white text-md prata tracking-wide italic font-normal ">
                      Lorem ipsum dolor sit amet. Et temporibus quis et laborum
                      rem sed beatae aperiam sit fuga dolorem vel molestiae
                      beatae. Aut blanditiis libero. Ut distinctio praesentium
                      non libero ipsum qui minus distinctio et fuga suscipit.
                    </p>
                    <div className="flex items-center space-x-2 mt-8">
                      <span className="text-white text-sm text-center">
                        AGREE
                      </span>

                      <button
                        onClick={() => setAgreedToTerms(!agreedToTerms)}
                        className={`flex items-center gap-2 px-4 py-4 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          agreedToTerms
                            ? 'bg-slate-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {agreedToTerms ? (
                          <img
                            src="/assets/Images/check-icon.png"
                            alt="check"
                            className="w-4 h-4"
                          />
                        ) : (
                          <span className="w-4 h-4">&nbsp;</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="mt-8 space-y-4">
              <textarea
                placeholder="Write a short note to friends and family — explaining the experience (optional)."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-32 p-4 bg-white resize-none"
              />
              <p className="text-gray-400 text-xs">
                300-500 characters remaining
              </p>
            </div>

            {/* Add to Registry Button */}
            <div className="mt-8 flex justify-end">
              <button
                className="bg-white hover:bg-gray-400 text-gray-800 font-medium tracking-wide px-8 py-4 border-3 border-black"
                disabled={!agreedToTerms}
              >
                ADD TO REGISTRY
              </button>
            </div>
          </div>
        </div>
      </div>



      <Footer />
    </div>
  );
}

const PreviewForm = () => {
  return (
    <div className="relative max-w-4xl mx-auto max-h-[290px] overflow-y-hidden">
      <h3 className="text-center text-3xl sm:text-2xl italic font-bold prata">
        jo & jon
      </h3>

      <p className="text-center prata italic leading-relaxed text-xl sm:text-lg mt-10">
        We cannot wait to celebrate you as you embark on this most exciting next
        chapter of your lives together. We love you always and are here for you
        everyday along the way.
      </p>
      <p className="text-center prata italic text-xl sm:text-lg mt-6">
        All our love,
      </p>
      <p className="text-center prata italic text-xl sm:text-lg mt-2">
        Aunty Jess & Uncle Paul
      </p>
    </div>
  );
};

const MessageForm = () => {
  return (
    <div>
      <input
        type="text"
        placeholder="Couples Name*"
        className="w-full prata text-sm sm:text-xl md:text-2xl text-center mx-auto mb-2 sm:mb-4 border border-gray-300 rounded py-0 sm:py-2 bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
      <div className="w-full flex justify-center">
        <div className="w-full">
          <textarea
            placeholder="Your Message here...*"
            maxLength={500}
            className="w-full xl:h-40 md:h-32 h-[70px] border italic border-gray-300 prata text-sm sm:text-lg md:text-xl text-center outline-none p-1 sm:p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 text-left">
            500/500 characters remaining
          </div>
        </div>
      </div>
    </div>
  );
};
