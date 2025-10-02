import UnderwaterImg from '/assets/Images/UnderwaterImg.png';
import RegistryLogo from '/assets/Images/registry-monogram.png';
import lineImghead from '/assets/Images/line.png';
import WhiteLine from '/assets/Images/WhiteLine.png';

export default function WeddingRegistrySteps() {
  const steps = [
    {
      number: '1.',
      title: "LET'S CONNECT",
      description:
        "Enter your names and wedding details and start adding gifts and funds - it's that easy. Want to talk to us first or set up a virtual appointment? just click here to connect",
    },
    {
      number: '2.',
      title: 'PERSONALIZE YOUR REGISTRY PAGE',
      description:
        'Upload a photo, choose a background (or pick one of ours), and add a personal message for your guests.',
    },
    {
      number: '3.',
      title: 'ADD GIFTS',
      description:
        'Add products, gift cards, cash funds, or travel experiences. Then publish your registry, link it to your wedding website, and share it with your guests.',
    },
    {
      number: '4.',
      title: 'ALONG THE WAY',
      description:
        'Receive a notification every time a gift is purchased. Track gifts, manage your list, and send thank you notes from your private dashboard.',
    },
    {
      number: '5.',
      title: 'AFTER THE WEDDING',
      description:
        "Finalize your selections, and we'll take care of the rest. Enjoy 15% off anything left on your list. Want to talk to someone about your registry? We're here to help—now we're here to help, either way.",
    },
  ];

  return (
    <div className="bg-white">
      <div className="flex flex-col lg:flex-row">
        {/* Left side - Image */}
        <div className="lg:w[37.552vw] relative mb-12 z-0">
          {/* <div
              className="h-64 lg:h-screen bg-cover bg-center bg-teal-400"
              style={{
                backgroundImage: "url('/images/underwater-scene.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            > */}
          <img
            src={UnderwaterImg}
            alt="Underwater"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text contrast if needed */}
          <div className="absolute inset-0"></div>

          {/* Logo/Brand mark */}
          <div className="absolute top-8 -left-16">
            <img
              src={RegistryLogo}
              alt=""
              className="w-[130px] object-cover mx-auto"
            />
            <img
              src={lineImghead}
              alt=""
              width={150}
              height={100}
              className="object-cover mx-auto"
            />
          </div>
        </div>
        {/* </div> */}

        {/* Right side - Steps */}
        <div className="lg:w-[52.083vw] flex flex-col items-center justify-center bg-[#446184] text-white p-8 lg:p-12 mt-16 relative z-10 lg:-ml-12">
          <div className="w-full  mx-auto lg:mx-0 space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="space-y-3 text-center">
                <div className="text-6xl lg:text-8xl font-light text-white/90">
                  {step.number}
                </div>
                <h3 className="text-[1.146vw] leading-[1.875vw] font-normal tracking-wider uppercase text-white">
                  {step.title}
                  <img src={WhiteLine} width={250} alt="" className='mx-auto pt-2'/>
                </h3>
                <p className="text-2xl leading-relaxed text-white/90 py-4">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
