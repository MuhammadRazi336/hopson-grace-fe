const CheckoutSteps = () => {
  return (
    <div className="max-w-4xl mx-auto mt-[80px]">
      <div className="flex items-center justify-around">
        <div className="w-4/12">
          <h4 className="text-3xl md:text-5xl lg:text-[60px] font-bold text-center prata">
            1.
          </h4>
          <p className="text-sm md:text-lg max-w-24 mx-auto uppercase text-center">
            Add your messsage
          </p>
        </div>
        <div className="w-4/12">
          <h4 className="text-3xl md:text-5xl lg:text-[60px] font-bold text-center prata">
            2.
          </h4>
          <p className="text-sm md:text-lg max-w-24 mx-auto uppercase text-center">
            Billing & Payment
          </p>
        </div>
        <div className="w-4/12">
          <h4 className="text-3xl md:text-5xl lg:text-[60px] font-bold text-center prata">
            3.
          </h4>
          <p className="text-sm md:text-lg max-w-32 mx-auto uppercase text-center">
            Order Confirmation
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
