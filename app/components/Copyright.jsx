import copyrightLogo from '/assets/Images/copyrightLogo.png';
import HopsonGrace from '/assets/Images/HopsonGraceTitleWhite.png';

const Copyright = () => {
  return (
    <div className="flex items-center justify-center gap-3 text-white tracking-[0.08em] mb-6 lg:mb-0">
      <img
        src={HopsonGrace}
        alt="Hopson Grace"
        className="w-[180px] lg:w-[250px]"
      />
      <p className="text-2xl lg:text-7xl">/</p>
      <img
        src={copyrightLogo}
        alt="copyright logo"
        className="w-[50px] lg:w-[60px] "
      />
    </div>
  );
};

export default Copyright;
