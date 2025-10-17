import copyrightLogo from '/assets/Images/copyrightLogo.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitleWhite.png';

const Copyright = () => {
  return (
    <div className="flex items-center lg:w-[25%] relative left-[0.3vw] justify-center gap-[0.677vw] text-white tracking-[0.08em] max-[1024px]:mb-[15px]">
      <img
        src={HopsonGrace}
        alt="Hopson Grace"
        className="w-[12.135vw] max-[1024px]:w-[123px]"
      />
      <p className="text-[3.646vw] leading-[3.646vw] max-[1024px]:text-[37.43px]">/</p>
      <img
        src={copyrightLogo}
        alt="copyright logo"
        className="w-[2.795vw] max-[1024px]:w-[35.39px]"
      />
    </div>
  );
};

export default Copyright;
