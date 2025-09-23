import Button from '~/components/Button.jsx';

function GiftAnyAmount() {
  return (
    <section className="mb-[12.865vw]">
      <div className="bg-[#446184] gap-[6.198vw] w-[81.354vw] py-[2.969vw] !pr-[5.885vw] !pl-[1.563vw] container mx-auto flex flex-col md:flex-row items-center justify-center">
        {/* Left: Image */}
        <div className="flex-shrink-0 flex items-center justify-center w-full md:w-5/12">
          <img
            src="/assets/Images/gift-any-amount.png"
            alt="Gift Any Amount Card"
            className=" w-full h-auto object-contain drop-shadow-lg"
          />
        </div>
        {/* Right: Content */}
        <div className="flex flex-col items-center justify-center w-full md:w-7/12">
          <h2 className="text-white text-3xl lg:text-[2.292vw] lg:leading-[1.875vw] prata font-normal mb-2 lg:mb-[1.1vw] text-center">
            gift any amount
          </h2>
          <img
            src="/assets/Images/gift-bdr.png"
            alt="Couple"
            className="max-w-[630px] mt-1 h-auto mx-auto"
          />
          <p className="text-white text-base lg:text-[1.25vw] lg:leading-[2.292vw] font-[500] my-[1.771vw] text-center tracking-wide">
            CONTRIBUTE TO OUR JOURNEY!
          </p>
          <textarea
            placeholder="Write a short caption to friends and family who are wanting to leave you a cash gift. (Optional)*"
            maxLength={500}
            className="w-full xl:h-40 md:h-32 h-[70px] lg:text-[1.25vw] lg:leading-[1.563vw] lg:h-[9.35vw] border border-gray-300 text-sm outline-none !p-[1.615vw] sm:p-3 bg-[#FAF9F6] resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="w-full flex justify-end items-end">
            <button className=" text-white border-b pb-[0.469vw] cursor-pointer font-medium text-lg uppercase lg:text-[0.938vw] lg:leading-[0.938vw] mx-auto mt-[1.563vw] ml-auto mr-0">
              Save and Preview
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GiftAnyAmount;
