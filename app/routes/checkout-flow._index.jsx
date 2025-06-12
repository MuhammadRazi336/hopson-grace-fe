import {Header} from '~/components/Header';
import {CoupleProfileViewHeader} from '~/routes/couple.test._index';

export default function CheckoutFlow() {
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

      <div className="max-w-4xl mx-auto mt-[80px]">
        <div className="flex items-center justify-around">
          <div className="w-4/12">
            <h4 className="text-4xl font-bold text-center prata">1.</h4>
            <p className="text-lg text-center">Add your messsage</p>
          </div>
          <div className="w-4/12">
            <h4 className="text-4xl font-bold text-center prata">2.</h4>
            <p className="text-lg text-center">Add your messsage</p>
          </div>
          <div className="w-4/12">
            <h4 className="text-4xl font-bold text-center prata">3.</h4>
            <p className="text-lg text-center">Add your messsage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
