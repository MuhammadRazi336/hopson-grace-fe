import copyrightLogo from '/assets/Images/copyrightLogo.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitleWhite.png';

const Copyright = () => {
  return (
    <div className="flex items-center justify-center gap-[0.677vw] text-white tracking-[0.08em] max-md:mb-[15px]">
      <img
        src={HopsonGrace}
        alt="Hopson Grace"
        className="w-[12.135vw] max-md:w-[123px]"
      />
      <p className="text-[3.646vw] leading-[3.646vw] max-md:text-[37.43px]">/</p>
      <img
        src={copyrightLogo}
        alt="copyright logo"
        className="w-[2.795vw] max-md:w-[35.39px]"
      />
    </div>
  );
};

export default Copyright;
