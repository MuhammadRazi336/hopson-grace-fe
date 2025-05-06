import kyleanderik from "../assets/Images/KYLE-ERIK-EDITS-20 1.png"
import img1 from "../assets/Images/Mask group.png"

const Items = () => {
    return ( 
        <div>
            
    <div className="grid grid-cols-[33%_22%_22%_22%] grid-rows-2 gap-6">
        {/* First item spans full width */}
        <div className="row-span-2">
            <div className="featureImage relative insetshadow registrytag">
                <img src={kyleanderik} alt="" />
                <h4
                    className="absolute top-9 left-9 text-[28px] text-white uppercase tracking-widest font-semibold z-10">
                    Kyle and Erik
                </h4>
            </div>
        </div>

        {/* Remaining items in 2-column layout */}
        <div className="item">
            <img src={img1} alt="" />
            <h3 className="mt-[21px] font-semibold text-[22px] uppercase">GINORI 1753 DINNERWARE</h3>
            <p className="text-[22px]">Assorted Sizes</p>
        </div>
        <div className="item">
            <img src={img1} alt="" />
            <h3 className="mt-[21px] font-semibold text-[22px] uppercase">ROYAL PACIFIC</h3>
            <p className="text-[22px]">5 - Piece Place Setting</p>
        </div>
        <div className="item">
            <img src={img1} alt="" />
            <h3 className="mt-[21px] font-semibold text-[22px] uppercase">TOM DIXON STONE LAMP</h3>
            <p className="text-[22px]">Portable LED</p>
        </div>
        <div className="item">
            <img src={img1} alt="" />
            <h3 className="mt-[21px] font-semibold text-[22px] uppercase">ILO HURRICANE</h3>
            <p className="text-[22px]">Medium</p>
        </div>
        <div className="item">
            <img src={img1} alt="" />
            <h3 className="mt-[21px] font-semibold text-[22px] uppercase">RICHARD BRENDAN</h3>
            <p className="text-[22px]">Double Old Fashioned Glass</p>
        </div>
        <div className="item">
            <img src={img1} alt="" />
            <h3 className="mt-[21px] font-semibold text-[22px] uppercase">ZALTO WINE GLASSES</h3>
            <p className="text-[22px]">Multiple Sizes</p>
        </div>
    </div>
        </div>
     );
}
 
export default Items;