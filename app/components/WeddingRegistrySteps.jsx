import UnderwaterImg from '/assets/Images/UnderwaterImg.png';
import UnderwaterImgMobile from '/assets/Images/underwatermobile.png';
import RegistryLogo from '/assets/Images/about-us-monogram.png';
import lineImghead from '/assets/Images/line.png';
import WhiteLine from '/assets/Images/WhiteLine.png';

export default function WeddingRegistrySteps() {
  const CONNECT_URL = 'https://calendly.com/concierge-theregistry/learn-more';
  const CONNECT_MARKER = 'click here';
  const CONNECT_MARKER_DISPLAY = 'click here';
  const CONSULTATION_MARKER = 'Book a consultation';
  const CONSULTATION_MARKER_DISPLAY = 'Book a consultation';

  const steps = [
    {
      number: '1.',
      title: "LET'S CONNECT",
      description:
        "Enter your names and wedding details and start adding gifts and funds - it's that easy. Want to talk to us first or set up a virtual appointment? just click here to connect.",
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
        "Finalize your selections, and we’ll take care of the rest. Enjoy 15% off anything left on your list. Want to talk to someone first? Book a consultation or start building now—we’re here to help, either way.",
    },
  ];

  return (
    <div className="bg-white overflow-visible">
      <div className="flex flex-col lg:flex-row max-[1024px]:relative overflow-visible">
        {/* Left side - Image */}
        <div className="lg:w-[37.552vw] h-[90vw] relative mb-12 z-0 max-[1024px]:w-9/10 max-[1024px]:mb-0 overflow-visible">
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
            className="w-full h-full object-cover min-[1024px]:block hidden"
          />
          <img
            src={UnderwaterImgMobile}
            alt="Underwater"
            className="w-full h-full object-cover max-[1024px]:block hidden"
          />
          {/* Overlay for better text contrast if needed */}
          <div className="absolute inset-0"></div>

          {/* Logo: centered on left/right edge — half on image, half outside (horizontal), not split from top */}
          <div className="absolute top-8 z-20 min-[1025px]:left-0 min-[1025px]:right-auto min-[1025px]:-translate-x-1/2 max-[1024px]:left-auto max-[1024px]:right-0 max-[1024px]:translate-x-1/2">
            <img
              src={RegistryLogo}
              alt="The Registry"
              className="w-[120px] object-cover max-[1024px]:w-[90px]"
            />
          </div>
        </div>
        {/* </div> */}

        {/* Right side - Steps */}
        <div className="lg:w-[52.083vw] flex flex-col items-center justify-center bg-[#446184] text-white p-8 lg:p-12 mt-16 relative z-10 lg:-ml-12 max-[1024px]:w-9/10 max-[1024px]:ml-auto max-[1024px]:-mt-[80px]">
          <div className="w-full  mx-auto lg:mx-0 space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="space-y-3 text-center">
                <div className="text-5xl lg:text-7xl font-light text-white/90 font-prata">
                  {step.number}
                </div>
                <h3 className="text-[1.146vw] leading-[1.875vw] font-normal tracking-wider uppercase text-white">
                  {step.title}
                  <img src={WhiteLine} width={250} alt="" className='mx-auto pt-2'/>
                </h3>
                <p className="text-md leading-relaxed text-white/90 py-4 lg:text-2xl">
                  {(() => {
                    const desc = step.description || '';

                    const linkDefs = [
                      {marker: CONNECT_MARKER, display: CONNECT_MARKER_DISPLAY},
                      {
                        marker: CONSULTATION_MARKER,
                        display: CONSULTATION_MARKER_DISPLAY,
                      },
                    ];

                    for (const {marker, display} of linkDefs) {
                      const markerIndex = desc.indexOf(marker);
                      if (markerIndex === -1) continue;

                      const before = desc.slice(0, markerIndex);
                      const after = desc.slice(markerIndex + marker.length);

                      return (
                        <>
                          {before}
                          <a
                            href={CONNECT_URL}
                            className="text-white underline hover:opacity-90"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {display}
                          </a>
                          {after}
                        </>
                      );
                    }

                    return desc;
                  })()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
