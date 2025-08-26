import kyleanderik from '/assets/Images/KYLE-ERIK-EDITS-20 1.png';
import kyleanderikmobile from '/assets/Images/kyleerikmobile.png';
import img1 from '/assets/Images/Mask group.png';

const Items = ({ featuredRegistryData = null }) => {
  // Default fallback data if no dynamic data is provided
  const fallbackData = {
    parentCollection: {
      title: "Kyle and Erik",
      image: { url: kyleanderik }
    },
    subCollection: {
      products: {
        edges: [
          { node: { title: "GINORI 1753 DINNERWARE", images: { edges: [{ node: { url: img1 } }] } } },
          { node: { title: "ROYAL PACIFIC", images: { edges: [{ node: { url: img1 } }] } } },
          { node: { title: "TOM DIXON STONE LAMP", images: { edges: [{ node: { url: img1 } }] } } },
          { node: { title: "ILO HURRICANE", images: { edges: [{ node: { url: img1 } }] } } },
          { node: { title: "RICHARD BRENDAN", images: { edges: [{ node: { url: img1 } }] } } },
          { node: { title: "ZALTO WINE GLASSES", images: { edges: [{ node: { url: img1 } }] } } }
        ]
      }
    }
  };

  // Use dynamic data if available, otherwise use fallback
  const data = featuredRegistryData || fallbackData;
  const products = data.subCollection?.products?.edges || [];
  
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-[30%_23%_23%_23%] lg:grid-rows-2 gap-6 max-[1024px]:gap-y-5 max-[1024px]:gap-x-2">
        {/* First item spans full width */}
        <div className="lg:row-span-2 max-[768px]:col-span-2">
          <div className="featureImage relative insetshadow registrytag h-full">
            <img 
              src={data.subCollection?.image?.url || data.parentCollection?.image?.url || kyleanderik} 
              alt={data.subCollection?.title || data.parentCollection?.title || "Kyle and Erik"} 
              className="max-[1024px]:hidden h-full w-full object-cover" 
            />
            <img
              src={data.subCollection?.image?.url || data.parentCollection?.image?.url || kyleanderikmobile}
              alt={data.subCollection?.title || data.parentCollection?.title || "Kyle and Erik"}
              className="hidden max-[1024px]:block w-full h-full object-cover"
            />
            <h4 className="max-[1024px]:hidden absolute top-9 left-9 text-[28px] text-white uppercase tracking-widest font-semibold z-10">
              {data.subCollection?.title || data.parentCollection?.title || "Kyle and Erik"}
            </h4>
            
            {/* Mobile title */}
            <h4 className="max-[1024px]:block hidden absolute top-4 left-4 text-lg text-white uppercase tracking-widest font-semibold z-10 px-2">
              {data.subCollection?.title || data.parentCollection?.title || "Kyle and Erik"}
            </h4>
          </div>
        </div>

        {/* Dynamic products from the first 6 products */}
        {products.slice(0, 6).map((product, index) => (
          <div key={product.node.id || index} className="item flex-1">
            <img 
              src={product.node.images?.edges?.[0]?.node?.url || img1} 
              alt={product.node.title || `Product ${index + 1}`} 
              className="w-full rounded-none" 
            />
            <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
              {product.node.title || `Product ${index + 1}`}
            </h3>
            <p className="text-sm lg:text-[22px]">
              {product.node.description ? 
                product.node.description.slice(0, 20) + (product.node.description.length > 20 ? '...' : '') : 
                'Product Description'
              }
            </p>
          </div>
        ))}

        {/* Fallback items if no dynamic products */}
        {products.length === 0 && (
          <>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                GINORI 1753 DINNERWARE
              </h3>
              <p className="text-sm lg:text-[22px]">Assorted Sizes</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                ROYAL PACIFIC
              </h3>
              <p className="text-sm lg:text-[22px]">5 - Piece Place Setting</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                TOM DIXON STONE LAMP
              </h3>
              <p className="text-sm lg:text-[22px]">Portable LED</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                ILO HURRICANE
              </h3>
              <p className="text-sm lg:text-[22px]">Medium</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                RICHARD BRENDAN
              </h3>
              <p className="text-sm lg:text-[22px]">Double Old Fashioned Glass</p>
            </div>
            <div className="item flex-1">
              <img src={img1} alt="" className="w-full rounded-none" />
              <h3 className="mt-2 lg:mt-[21px] font-semibold text-sm lg:text-[22px] uppercase">
                ZALTO WINE GLASSES
              </h3>
              <p className="text-sm lg:text-[22px]">Multiple Sizes</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Items;