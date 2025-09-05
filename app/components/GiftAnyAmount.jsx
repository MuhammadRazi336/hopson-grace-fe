import Button from '~/components/Button.jsx';

function GiftAnyAmount() {
  return (
    <section className="mb-12">
      <div className="bg-[#446184] w-[1560px] py-12 px-2 container mx-auto flex flex-col md:flex-row items-center justify-center">
        {/* Left: Image */}
        <div className="flex-shrink-0 flex items-center justify-center w-full md:w-5/12 p-6">
          <img
            src="/assets/Images/gift-any-amount.png"
            alt="Gift Any Amount Card"
            className=" w-full h-auto object-contain drop-shadow-lg"
          />
        </div>
        {/* Right: Content */}
        <div className="flex flex-col items-center justify-center w-full md:w-7/12 py-10 px-16">
          <h2 className="text-white text-3xl md:text-[44px] prata font-normal mb-2 text-center">
            gift any amount
          </h2>
          <img
            src="/assets/Images/gift-bdr.png"
            alt="Couple"
            className="max-w-[630px] mt-1 h-auto mx-auto"
          />
          <p className="text-white text-base md:text-[24px] font-semibold my-8 text-center tracking-wide">
            CONTRIBUTE TO OUR JOURNEY!
          </p>
          <textarea
            placeholder="Write a short caption to friends and family who are wanting to leave you a cash gift. (Optional)*"
            maxLength={500}
            className="w-[690px] xl:h-40 md:h-32 h-[70px] border  border-gray-300  text-sm sm:text-lg md:text-xl  outline-none p-1 sm:p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="w-full flex justify-end items-end">
            <button className=" text-white border-b cursor-pointer font-bold text-lg  mx-auto mt-5 ml-auto mr-10">
              Save and Preview
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GiftAnyAmount;
