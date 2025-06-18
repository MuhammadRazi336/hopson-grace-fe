import ButtonComponent from '~/components/Button';
import Input from '~/components/Input';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';
import {Footer} from '~/components/Footer';
import ImageAndText from '~/components/ImageAndText';
import teaImg from '/assets/Images/reading-image.png';
import lineImg3 from '/assets/Images/line.png';
import CheckoutSteps from '~/components/CheckoutSteps';
const cartItems = [
  {
    name: 'Coluna Fruit Bowl',
    price: 125,
    size: 'Medium',
    image: '/assets/Images/product-image.png',
  },
  {
    name: 'Marble Butter Keeper',
    price: 80,
    image: '/assets/Images/product-image.png',
  },
  {
    name: 'Belle-V Icecream Scoop',
    price: 95,
    image: '/assets/Images/product-image.png',
  },
  {
    name: 'Staub Cast Iron Q4',
    price: 430,
    image: '/assets/Images/product-image.png',
  },
];

export default function Checkout() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const taxes = subtotal * 0.13;
  const total = subtotal + taxes;

  return (
    <div className="pt-[80px]">
      <CoupleProfileViewHeader />
      <div className=" p-4">
        <h2 className="text-4xl text-center font-bold prata pt-5"> checkout</h2>
        <img
          src="/assets/Images/cart-head-bdr.png"
          alt="Hamburger"
          className="w-[150px] mx-auto -mt-4"
        />
      </div>

      <CheckoutSteps />

      <div className="container mx-auto py-[100px]">
        <div className=" bg-[#446184]  py-16 px-16">
          <h2 className="md:text-[36px] font-normal text-center text-white ivyora">
            enclose your <span className="font-italic">PERSONAL MESSAGE</span>{' '}
            here
          </h2>

          <p className="max-w-xl mx-auto text-center text-white my-5 font-normal leading-relaxed">
            Your message and gift notification will be sent to the couple
            immediately upon completion of your order.
          </p>

          <div className="flex mt-[100px]">
            <div className="w-1/2">
              <h4 className="text-xl text-white text-center ">Billing</h4>
            </div>
            <div className="w-1/2">
              <h4 className="text-xl text-white text-center ">Order Summary</h4>
            </div>
          </div>
          <div className="flex items-center gap-x-4 mt-[20px]">
            <div className="w-1/2">
              <div className="flex flex-col gap-y-4">
                <div className="grid grid-cols-2 gap-x-4">
                  {/* First Name */}
                  <Input
                    placeholder="First Name *"
                    name="firstName"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                  />
                  {/* Last Name */}
                  <Input
                    placeholder="Last Name *"
                    name="lastName"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                  />
                </div>
                {/* Address */}
                <Input
                  placeholder="Address *"
                  name="address"
                  className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                />

                <div className="grid grid-cols-2 gap-x-4">
                  {/* City */}
                  <Input
                    placeholder="City *"
                    name="city"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                  />

                  {/* Province */}
                  <Input
                    placeholder="Province/State *"
                    name="province"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  {/* Country */}
                  <Input
                    placeholder="Country *"
                    name="country"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                  />

                  {/* Province */}
                  <Input
                    placeholder="Email *"
                    name="email"
                    className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
                  />
                </div>
              </div>
            </div>
            <div className="w-1/2 bg-white p-6">
              <div className="max-h-[440px] overflow-y-auto bg-[#FAF9F6]  px-4 py-2">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center py-3 border-b border-[#ececec] last:border-b-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[99px] h-[99px] object-cover mr-8"
                    />
                    <div className="flex-1">
                      <div className="font-bold uppercase text-md leading-tight tracking-wide">
                        {item.name.split(' ').map((word, i, arr) =>
                          i % 3 === 0 && i !== 0 ? (
                            <>
                              <br />
                              {word}{' '}
                            </>
                          ) : (
                            word + ' '
                          ),
                        )}
                      </div>
                      {item.size && (
                        <div className="text-sm text-gray-600 mt-1">
                          Size, {item.size}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-600 mt-1">
                        CONTRIBUTION AMOUNT
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <div className="text-xl  text-black">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Cart Summary */}
              <div className="flex justify-end mt-8">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold tracking-wide text-sm uppercase ">
                      Subtotal
                    </span>
                    <span className="text-lg ">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold tracking-wide text-sm uppercase ">
                      Taxes <span className="font-normal">(13% HST)</span>
                    </span>
                    <span className="text-lg ">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold tracking-wide text-sm uppercase ">
                      Shipping
                    </span>
                    <span className="text-lg ">FREE</span>
                  </div>
                  <img
                    src="/assets/Images/cart-sum-bdr.png"
                    alt="Hamburger"
                    className="w-auto  mx-auto mt-4"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-2xl uppercase tracking-wide">
                      Total
                    </span>
                    <span className="font-bold text-2xl">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            {/* CTA Button */}
            <button className="py-5 px-2 text-[17px] max-[1601px]:text-[15px] max-[1601px]:py-4 bg-white hover:opacity-90 uppercase font-[800] text-black w-[225px] max-[1601px]:w-[280px] text-center">
              Pay now
            </button>
          </div>
        </div>
      </div>
      <div className="mb-16"></div>
      <section className=" my-12 lg:my-[240px]">
        <ImageAndText
          direction={'right'}
          imgBanner={teaImg}
          lineimg={lineImg3}
          title="questions? "
          description="We’ve got answers."
          buttontext={'PHONE, EMAIL OR LIVE CHAT'}
          buttontype={'Color'}
        />
      </section>
      <Footer />
    </div>
  );
}
